const Joi = require('joi');

/**
 * Common validation schemas
 */
const commonSchemas = {
    objectId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).message('Invalid ID format'),
    email: Joi.string().email().lowercase().trim(),
    phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).message('Invalid phone number format'),
    password: Joi.string().min(6).max(128),
    coordinates: Joi.array().items(Joi.number()).length(2),
    date: Joi.date().iso(),
    name: Joi.string().trim().min(2).max(50),
    bloodGroup: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    gender: Joi.string().valid('male', 'female', 'other')
};

/**
 * User validation schemas
 */
const userValidation = {
    // User registration validation
    register: Joi.object({
        name: commonSchemas.name.required(),
        email: commonSchemas.email.required(),
        password: commonSchemas.password.required(),
        phone: commonSchemas.phone.required(),
        dateOfBirth: commonSchemas.date.required(),
        gender: commonSchemas.gender.required(),
        address: Joi.object({
            street: Joi.string().trim().max(200),
            city: Joi.string().trim().max(50),
            state: Joi.string().trim().max(50),
            zipCode: Joi.string().trim().max(10),
            country: Joi.string().trim().max(50).default('India')
        }),
        location: Joi.object({
            type: Joi.string().valid('Point').default('Point'),
            coordinates: commonSchemas.coordinates
        }),
        emergencyContact: Joi.object({
            name: commonSchemas.name,
            phone: commonSchemas.phone,
            relationship: Joi.string().trim().max(50)
        }),
        medicalHistory: Joi.object({
            allergies: Joi.array().items(Joi.string().trim()),
            chronicConditions: Joi.array().items(Joi.string().trim()),
            medications: Joi.array().items(Joi.string().trim()),
            bloodGroup: commonSchemas.bloodGroup
        }),
        preferences: Joi.object({
            preferredLanguage: Joi.string().default('English'),
            notifications: Joi.object({
                email: Joi.boolean().default(true),
                sms: Joi.boolean().default(true),
                push: Joi.boolean().default(true)
            })
        })
    }),

    // User login validation
    login: Joi.object({
        email: commonSchemas.email.required(),
        password: Joi.string().required()
    }),

    // Update user profile validation
    updateProfile: Joi.object({
        name: commonSchemas.name,
        phone: commonSchemas.phone,
        dateOfBirth: commonSchemas.date,
        gender: commonSchemas.gender,
        address: Joi.object({
            street: Joi.string().trim().max(200),
            city: Joi.string().trim().max(50),
            state: Joi.string().trim().max(50),
            zipCode: Joi.string().trim().max(10),
            country: Joi.string().trim().max(50)
        }),
        location: Joi.object({
            type: Joi.string().valid('Point').default('Point'),
            coordinates: commonSchemas.coordinates
        }),
        emergencyContact: Joi.object({
            name: commonSchemas.name,
            phone: commonSchemas.phone,
            relationship: Joi.string().trim().max(50)
        }),
        medicalHistory: Joi.object({
            allergies: Joi.array().items(Joi.string().trim()),
            chronicConditions: Joi.array().items(Joi.string().trim()),
            medications: Joi.array().items(Joi.string().trim()),
            bloodGroup: commonSchemas.bloodGroup
        }),
        preferences: Joi.object({
            preferredLanguage: Joi.string(),
            notifications: Joi.object({
                email: Joi.boolean(),
                sms: Joi.boolean(),
                push: Joi.boolean()
            })
        })
    }),

    // Change password validation
    changePassword: Joi.object({
        currentPassword: Joi.string().required(),
        newPassword: commonSchemas.password.required(),
        confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
    })
};

/**
 * Hospital validation schemas
 */
const hospitalValidation = {
    // Search nearby hospitals validation
    searchNearby: Joi.object({
        latitude: Joi.number().min(-90).max(90).required(),
        longitude: Joi.number().min(-180).max(180).required(),
        radius: Joi.number().min(1).max(100).default(10),
        type: Joi.string().valid('Government', 'Private', 'Semi-Government', 'Charitable'),
        category: Joi.string().valid('Primary', 'Secondary', 'Tertiary', 'Specialty'),
        specialties: Joi.array().items(Joi.string().trim()),
        emergencyServices: Joi.boolean(),
        limit: Joi.number().min(1).max(50).default(20)
    }),

    // Get hospital details validation
    getHospital: Joi.object({
        id: commonSchemas.objectId.required()
    }),

    // Get counters validation
    getCounters: Joi.object({
        id: commonSchemas.objectId.required(),
        type: Joi.string().valid('OPD', 'General', 'Emergency', 'Specialist', 'Pharmacy', 'Lab', 'Radiology', 'Billing'),
        department: Joi.string().trim(),
        isActive: Joi.boolean().default(true)
    })
};

/**
 * Ticket validation schemas
 */
const ticketValidation = {
    // Book ticket validation
    bookTicket: Joi.object({
        hospitalId: commonSchemas.objectId.required(),
        counterId: commonSchemas.objectId.required(),
        appointmentDateTime: commonSchemas.date.required(),
        reasonForVisit: Joi.string().trim().max(500),
        symptoms: Joi.array().items(Joi.string().trim()),
        patientType: Joi.string().valid('new', 'follow_up', 'emergency').default('new'),
        priority: Joi.string().valid('low', 'normal', 'high', 'emergency').default('normal'),
        insurance: Joi.object({
            hasInsurance: Joi.boolean().default(false),
            provider: Joi.string().trim(),
            policyNumber: Joi.string().trim()
        })
    }),

    // Get user tickets validation
    getUserTickets: Joi.object({
        userId: commonSchemas.objectId.required(),
        status: Joi.alternatives().try(
            Joi.string().valid('booked', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'),
            Joi.array().items(Joi.string().valid('booked', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'))
        ),
        hospital: commonSchemas.objectId,
        startDate: commonSchemas.date,
        endDate: commonSchemas.date,
        limit: Joi.number().min(1).max(100).default(50)
    }),

    // Update ticket status validation
    updateTicketStatus: Joi.object({
        ticketId: commonSchemas.objectId.required(),
        status: Joi.string().valid('confirmed', 'in_progress', 'completed', 'cancelled', 'no_show').required(),
        cancellationReason: Joi.string().trim().when('status', {
            is: 'cancelled',
            then: Joi.required(),
            otherwise: Joi.optional()
        }),
        notes: Joi.object({
            patient: Joi.string().trim(),
            staff: Joi.string().trim(),
            doctor: Joi.string().trim()
        })
    }),

    // Check-in validation
    checkIn: Joi.object({
        ticketId: commonSchemas.objectId.required()
    }),

    // Rate service validation
    rateService: Joi.object({
        ticketId: commonSchemas.objectId.required(),
        serviceRating: Joi.number().min(1).max(5),
        doctorRating: Joi.number().min(1).max(5),
        facilityRating: Joi.number().min(1).max(5),
        overallRating: Joi.number().min(1).max(5).required(),
        feedback: Joi.string().trim().max(1000)
    })
};

/**
 * ML prediction validation schemas
 */
const mlValidation = {
    // Predict wait time validation
    predictWaitTime: Joi.object({
        hospitalId: commonSchemas.objectId.required(),
        counterId: commonSchemas.objectId.required(),
        currentQueueLength: Joi.number().min(0).default(0),
        timeOfDay: Joi.number().min(0).max(23),
        dayOfWeek: Joi.number().min(0).max(6),
        counterType: Joi.string().valid('OPD', 'General', 'Emergency', 'Specialist', 'Pharmacy', 'Lab', 'Radiology', 'Billing').default('OPD'),
        doctorAvailable: Joi.boolean().default(true),
        weatherCondition: Joi.string().valid('clear', 'cloudy', 'rain', 'storm').default('clear'),
        isHoliday: Joi.boolean().default(false)
    }),

    // Recommend time slots validation
    recommendTimeSlots: Joi.object({
        hospitalId: commonSchemas.objectId.required(),
        counterId: commonSchemas.objectId.required(),
        preferredDate: commonSchemas.date.required(),
        patientPreferences: Joi.object({
            preferredTime: Joi.string().valid('morning', 'afternoon', 'evening'),
            urgency: Joi.string().valid('low', 'normal', 'high', 'emergency').default('normal')
        }).default({}),
        counterType: Joi.string().valid('OPD', 'General', 'Emergency', 'Specialist', 'Pharmacy', 'Lab', 'Radiology', 'Billing').default('OPD')
    })
};

/**
 * Query parameter validation schemas
 */
const queryValidation = {
    // Pagination validation
    pagination: Joi.object({
        page: Joi.number().min(1).default(1),
        limit: Joi.number().min(1).max(100).default(10),
        sort: Joi.string().default('createdAt'),
        order: Joi.string().valid('asc', 'desc').default('desc')
    }),

    // Date range validation
    dateRange: Joi.object({
        startDate: commonSchemas.date,
        endDate: commonSchemas.date.min(Joi.ref('startDate'))
    }),

    // Search validation
    search: Joi.object({
        q: Joi.string().trim().min(1).max(100),
        fields: Joi.array().items(Joi.string())
    })
};

/**
 * Validation middleware factory
 */
const validate = (schema, property = 'body') => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false,
            allowUnknown: false,
            stripUnknown: true
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors
            });
        }

        req[property] = value;
        next();
    };
};

/**
 * Sanitize input data
 */
const sanitize = {
    // Remove HTML tags and scripts
    html: (str) => {
        if (typeof str !== 'string') return str;
        return str.replace(/<[^>]*>/g, '').replace(/javascript:/gi, '');
    },

    // Normalize phone number
    phone: (phone) => {
        if (typeof phone !== 'string') return phone;
        return phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
    },

    // Normalize email
    email: (email) => {
        if (typeof email !== 'string') return email;
        return email.toLowerCase().trim();
    },

    // Sanitize object recursively
    object: (obj) => {
        if (typeof obj !== 'object' || obj === null) return obj;

        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'string') {
                sanitized[key] = sanitize.html(value);
            } else if (typeof value === 'object') {
                sanitized[key] = sanitize.object(value);
            } else {
                sanitized[key] = value;
            }
        }
        return sanitized;
    }
};

/**
 * Custom validation functions
 */
const customValidators = {
    // Check if appointment time is in the future
    futureAppointment: (value) => {
        const appointmentTime = new Date(value);
        const now = new Date();
        const minTime = new Date(now.getTime() + 30 * 60000); // 30 minutes from now

        if (appointmentTime < minTime) {
            throw new Error('Appointment time must be at least 30 minutes from now');
        }
        return value;
    },

    // Check if appointment is within business hours
    businessHours: (value) => {
        const appointmentTime = new Date(value);
        const hour = appointmentTime.getHours();

        if (hour < 8 || hour > 20) {
            throw new Error('Appointment must be between 8 AM and 8 PM');
        }
        return value;
    },

    // Validate Indian phone number
    indianPhone: (value) => {
        const phoneRegex = /^(\+91|91|0)?[6-9]\d{9}$/;
        if (!phoneRegex.test(value.replace(/\s+/g, ''))) {
            throw new Error('Invalid Indian phone number');
        }
        return value;
    },

    // Validate coordinates are within India (approximately)
    indianCoordinates: (value) => {
        const [longitude, latitude] = value;

        // Rough bounds for India
        const bounds = {
            minLat: 6.4,
            maxLat: 37.6,
            minLng: 68.7,
            maxLng: 97.25
        };

        if (latitude < bounds.minLat || latitude > bounds.maxLat ||
            longitude < bounds.minLng || longitude > bounds.maxLng) {
            throw new Error('Coordinates must be within India');
        }
        return value;
    }
};

module.exports = {
    commonSchemas,
    userValidation,
    hospitalValidation,
    ticketValidation,
    mlValidation,
    queryValidation,
    validate,
    sanitize,
    customValidators
};
