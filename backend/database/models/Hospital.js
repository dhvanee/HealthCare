const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Counter name is required'],
        trim: true
    },
    type: {
        type: String,
        required: [true, 'Counter type is required'],
        enum: ['OPD', 'General', 'Emergency', 'Specialist', 'Pharmacy', 'Lab', 'Radiology', 'Billing'],
        trim: true
    },
    department: {
        type: String,
        required: [true, 'Department is required'],
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    currentQueueLength: {
        type: Number,
        default: 0,
        min: 0
    },
    averageServiceTime: {
        type: Number, // in minutes
        default: 15,
        min: 1
    },
    workingHours: {
        start: {
            type: String,
            required: true,
            match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
        },
        end: {
            type: String,
            required: true,
            match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
        }
    },
    maxCapacityPerHour: {
        type: Number,
        default: 30,
        min: 1
    },
    specialization: {
        type: String,
        trim: true
    }
}, {
    _id: true,
    timestamps: true
});

const hospitalSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Hospital name is required'],
        trim: true,
        maxlength: [100, 'Hospital name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please enter a valid email address'
        ]
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        match: [
            /^\+?[\d\s\-\(\)]+$/,
            'Please enter a valid phone number'
        ]
    },
    address: {
        street: {
            type: String,
            required: [true, 'Street address is required'],
            trim: true
        },
        city: {
            type: String,
            required: [true, 'City is required'],
            trim: true
        },
        state: {
            type: String,
            required: [true, 'State is required'],
            trim: true
        },
        zipCode: {
            type: String,
            required: [true, 'ZIP code is required'],
            trim: true
        },
        country: {
            type: String,
            default: 'India',
            trim: true
        }
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: [true, 'Coordinates are required'],
            validate: {
                validator: function(coords) {
                    return coords.length === 2 &&
                           coords[0] >= -180 && coords[0] <= 180 && // longitude
                           coords[1] >= -90 && coords[1] <= 90;    // latitude
                },
                message: 'Invalid coordinates format'
            }
        }
    },
    type: {
        type: String,
        required: [true, 'Hospital type is required'],
        enum: ['Government', 'Private', 'Semi-Government', 'Charitable'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Hospital category is required'],
        enum: ['Primary', 'Secondary', 'Tertiary', 'Specialty'],
        trim: true
    },
    specialties: [{
        type: String,
        trim: true
    }],
    facilities: [{
        type: String,
        trim: true
    }],
    counters: [counterSchema],
    operatingHours: {
        monday: {
            open: String,
            close: String,
            isOpen: { type: Boolean, default: true }
        },
        tuesday: {
            open: String,
            close: String,
            isOpen: { type: Boolean, default: true }
        },
        wednesday: {
            open: String,
            close: String,
            isOpen: { type: Boolean, default: true }
        },
        thursday: {
            open: String,
            close: String,
            isOpen: { type: Boolean, default: true }
        },
        friday: {
            open: String,
            close: String,
            isOpen: { type: Boolean, default: true }
        },
        saturday: {
            open: String,
            close: String,
            isOpen: { type: Boolean, default: true }
        },
        sunday: {
            open: String,
            close: String,
            isOpen: { type: Boolean, default: false }
        }
    },
    emergencyServices: {
        type: Boolean,
        default: false
    },
    bedCapacity: {
        total: {
            type: Number,
            default: 0,
            min: 0
        },
        available: {
            type: Number,
            default: 0,
            min: 0
        },
        icu: {
            type: Number,
            default: 0,
            min: 0
        },
        general: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        totalReviews: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    images: [{
        url: String,
        caption: String,
        isMain: {
            type: Boolean,
            default: false
        }
    }],
    website: {
        type: String,
        trim: true
    },
    socialMedia: {
        facebook: String,
        twitter: String,
        instagram: String,
        linkedin: String
    },
    accreditation: [{
        name: String,
        issuedBy: String,
        validUntil: Date
    }],
    insurance: [{
        provider: String,
        type: String
    }],
    ambulanceService: {
        available: {
            type: Boolean,
            default: false
        },
        phone: String,
        count: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    registrationNumber: {
        type: String,
        required: [true, 'Registration number is required'],
        unique: true,
        trim: true
    },
    establishedYear: {
        type: Number,
        min: 1800,
        max: new Date().getFullYear()
    },
    doctorsCount: {
        type: Number,
        default: 0,
        min: 0
    },
    nursesCount: {
        type: Number,
        default: 0,
        min: 0
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function(doc, ret) {
            delete ret.__v;
            return ret;
        }
    }
});

// Create geospatial index for location-based queries
hospitalSchema.index({ location: '2dsphere' });

// Index commonly queried fields
hospitalSchema.index({ name: 1 });
hospitalSchema.index({ type: 1 });
hospitalSchema.index({ category: 1 });
hospitalSchema.index({ isActive: 1 });
hospitalSchema.index({ isVerified: 1 });
hospitalSchema.index({ 'rating.average': -1 });

// Virtual for full address
hospitalSchema.virtual('fullAddress').get(function() {
    if (!this.address) return '';

    const { street, city, state, zipCode, country } = this.address;
    return [street, city, state, zipCode, country].filter(Boolean).join(', ');
});

// Virtual for current status (open/closed)
hospitalSchema.virtual('currentStatus').get(function() {
    const now = new Date();
    const currentDay = now.toLocaleLowerCase().slice(0, 3) +
                      now.toLocaleLowerCase().slice(3);
    const daySchedule = this.operatingHours[currentDay];

    if (!daySchedule || !daySchedule.isOpen) {
        return 'closed';
    }

    const currentTime = now.toTimeString().slice(0, 5);
    const isOpen = currentTime >= daySchedule.open && currentTime <= daySchedule.close;

    return isOpen ? 'open' : 'closed';
});

// Static method to find nearby hospitals
hospitalSchema.statics.findNearby = function(coordinates, maxDistance = 10000, options = {}) {
    const query = {
        location: {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: coordinates
                },
                $maxDistance: maxDistance
            }
        },
        isActive: true,
        isVerified: true
    };

    // Add additional filters if provided
    if (options.type) query.type = options.type;
    if (options.category) query.category = options.category;
    if (options.emergencyServices) query.emergencyServices = true;
    if (options.specialties) query.specialties = { $in: options.specialties };

    return this.find(query)
        .select('-__v')
        .limit(parseInt(process.env.MAX_HOSPITALS_RETURN) || 20)
        .sort({ 'rating.average': -1 });
};

// Instance method to get active counters
hospitalSchema.methods.getActiveCounters = function() {
    return this.counters.filter(counter => counter.isActive);
};

// Instance method to calculate distance from a point
hospitalSchema.methods.calculateDistance = function(coordinates) {
    const [lon1, lat1] = this.location.coordinates;
    const [lon2, lat2] = coordinates;

    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

// Pre-save middleware to validate bed capacity
hospitalSchema.pre('save', function(next) {
    if (this.bedCapacity.available > this.bedCapacity.total) {
        return next(new Error('Available beds cannot exceed total bed capacity'));
    }

    if (this.bedCapacity.icu + this.bedCapacity.general > this.bedCapacity.total) {
        return next(new Error('Sum of ICU and general beds cannot exceed total capacity'));
    }

    next();
});

module.exports = mongoose.model('Hospital', hospitalSchema);
