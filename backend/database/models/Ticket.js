const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    ticketNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
    hospital: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        required: [true, 'Hospital is required']
    },
    counter: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Counter is required']
    },
    appointmentDateTime: {
        type: Date,
        required: [true, 'Appointment date and time is required']
    },
    bookingDateTime: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['booked', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'],
        default: 'booked'
    },
    priority: {
        type: String,
        enum: ['low', 'normal', 'high', 'emergency'],
        default: 'normal'
    },
    queuePosition: {
        type: Number,
        min: 1
    },
    estimatedWaitTime: {
        type: Number, // in minutes
        min: 0
    },
    actualWaitTime: {
        type: Number, // in minutes
        min: 0
    },
    serviceStartTime: {
        type: Date
    },
    serviceEndTime: {
        type: Date
    },
    reasonForVisit: {
        type: String,
        trim: true,
        maxlength: [500, 'Reason cannot exceed 500 characters']
    },
    symptoms: [{
        type: String,
        trim: true
    }],
    patientType: {
        type: String,
        enum: ['new', 'follow_up', 'emergency'],
        default: 'new'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'partially_paid', 'refunded'],
        default: 'pending'
    },
    consultationFee: {
        amount: {
            type: Number,
            min: 0,
            default: 0
        },
        currency: {
            type: String,
            default: 'INR'
        }
    },
    insurance: {
        hasInsurance: {
            type: Boolean,
            default: false
        },
        provider: String,
        policyNumber: String,
        claimAmount: {
            type: Number,
            min: 0
        }
    },
    notifications: {
        sms: {
            sent: {
                type: Boolean,
                default: false
            },
            sentAt: Date
        },
        email: {
            sent: {
                type: Boolean,
                default: false
            },
            sentAt: Date
        },
        push: {
            sent: {
                type: Boolean,
                default: false
            },
            sentAt: Date
        }
    },
    checkInTime: {
        type: Date
    },
    isCheckedIn: {
        type: Boolean,
        default: false
    },
    cancellationReason: {
        type: String,
        trim: true
    },
    cancelledAt: {
        type: Date
    },
    cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    notes: {
        patient: String,
        staff: String,
        doctor: String
    },
    prescriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Prescription'
    },
    labReports: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LabReport'
    }],
    followUpRequired: {
        type: Boolean,
        default: false
    },
    followUpDate: {
        type: Date
    },
    rating: {
        serviceRating: {
            type: Number,
            min: 1,
            max: 5
        },
        doctorRating: {
            type: Number,
            min: 1,
            max: 5
        },
        facilityRating: {
            type: Number,
            min: 1,
            max: 5
        },
        overallRating: {
            type: Number,
            min: 1,
            max: 5
        },
        feedback: String,
        ratedAt: Date
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

// Create indexes for better query performance
ticketSchema.index({ ticketNumber: 1 });
ticketSchema.index({ user: 1 });
ticketSchema.index({ hospital: 1 });
ticketSchema.index({ counter: 1 });
ticketSchema.index({ status: 1 });
ticketSchema.index({ appointmentDateTime: 1 });
ticketSchema.index({ bookingDateTime: -1 });
ticketSchema.index({ queuePosition: 1 });
ticketSchema.index({ priority: -1 });

// Compound indexes
ticketSchema.index({ hospital: 1, counter: 1, appointmentDateTime: 1 });
ticketSchema.index({ user: 1, status: 1 });
ticketSchema.index({ hospital: 1, status: 1 });

// Virtual for total service time
ticketSchema.virtual('totalServiceTime').get(function() {
    if (!this.serviceStartTime || !this.serviceEndTime) return null;
    return Math.round((this.serviceEndTime - this.serviceStartTime) / (1000 * 60)); // in minutes
});

// Virtual for appointment status
ticketSchema.virtual('appointmentStatus').get(function() {
    const now = new Date();
    const appointmentTime = new Date(this.appointmentDateTime);

    if (this.status === 'cancelled') return 'cancelled';
    if (this.status === 'completed') return 'completed';
    if (this.status === 'no_show') return 'no_show';

    if (appointmentTime < now) {
        if (this.status === 'booked' || this.status === 'confirmed') {
            return 'overdue';
        }
    }

    return this.status;
});

// Virtual for time until appointment
ticketSchema.virtual('timeUntilAppointment').get(function() {
    const now = new Date();
    const appointmentTime = new Date(this.appointmentDateTime);
    const diffMs = appointmentTime - now;

    if (diffMs <= 0) return 0;

    return Math.round(diffMs / (1000 * 60)); // in minutes
});

// Virtual for formatted appointment time
ticketSchema.virtual('formattedAppointmentTime').get(function() {
    return this.appointmentDateTime.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
});

// Pre-save middleware to generate ticket number
ticketSchema.pre('save', async function(next) {
    if (this.isNew && !this.ticketNumber) {
        try {
            const date = new Date();
            const year = date.getFullYear().toString().slice(-2);
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');

            // Find the last ticket number for today
            const todayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const todayEnd = new Date(todayStart);
            todayEnd.setDate(todayEnd.getDate() + 1);

            const lastTicket = await this.constructor
                .findOne({
                    bookingDateTime: {
                        $gte: todayStart,
                        $lt: todayEnd
                    }
                })
                .sort({ ticketNumber: -1 })
                .select('ticketNumber');

            let sequenceNumber = 1;
            if (lastTicket && lastTicket.ticketNumber) {
                const lastSequence = parseInt(lastTicket.ticketNumber.slice(-4));
                sequenceNumber = lastSequence + 1;
            }

            this.ticketNumber = `TK${year}${month}${day}${sequenceNumber.toString().padStart(4, '0')}`;
        } catch (error) {
            return next(error);
        }
    }
    next();
});

// Pre-save middleware to calculate queue position
ticketSchema.pre('save', async function(next) {
    if (this.isNew) {
        try {
            // Get the current queue position for this counter on the appointment date
            const appointmentDate = new Date(this.appointmentDateTime);
            const startOfDay = new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate());
            const endOfDay = new Date(startOfDay);
            endOfDay.setDate(endOfDay.getDate() + 1);

            const queueCount = await this.constructor.countDocuments({
                hospital: this.hospital,
                counter: this.counter,
                appointmentDateTime: {
                    $gte: startOfDay,
                    $lt: endOfDay
                },
                status: { $in: ['booked', 'confirmed', 'in_progress'] }
            });

            this.queuePosition = queueCount + 1;
        } catch (error) {
            return next(error);
        }
    }
    next();
});

// Static method to find tickets by user
ticketSchema.statics.findByUser = function(userId, options = {}) {
    const query = { user: userId };

    if (options.status) {
        query.status = Array.isArray(options.status)
            ? { $in: options.status }
            : options.status;
    }

    if (options.hospital) {
        query.hospital = options.hospital;
    }

    if (options.dateRange) {
        query.appointmentDateTime = {
            $gte: options.dateRange.start,
            $lte: options.dateRange.end
        };
    }

    return this.find(query)
        .populate('hospital', 'name address phone')
        .sort({ appointmentDateTime: -1 })
        .limit(options.limit || 50);
};

// Static method to find tickets by hospital
ticketSchema.statics.findByHospital = function(hospitalId, options = {}) {
    const query = { hospital: hospitalId };

    if (options.status) {
        query.status = Array.isArray(options.status)
            ? { $in: options.status }
            : options.status;
    }

    if (options.counter) {
        query.counter = options.counter;
    }

    if (options.date) {
        const startOfDay = new Date(options.date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(options.date);
        endOfDay.setHours(23, 59, 59, 999);

        query.appointmentDateTime = {
            $gte: startOfDay,
            $lte: endOfDay
        };
    }

    return this.find(query)
        .populate('user', 'name phone email')
        .sort({ appointmentDateTime: 1, queuePosition: 1 })
        .limit(options.limit || 100);
};

// Instance method to check if ticket can be cancelled
ticketSchema.methods.canBeCancelled = function() {
    if (this.status === 'cancelled' || this.status === 'completed') {
        return false;
    }

    const now = new Date();
    const appointmentTime = new Date(this.appointmentDateTime);
    const timeDiff = appointmentTime - now;

    // Allow cancellation up to 30 minutes before appointment
    return timeDiff > (30 * 60 * 1000);
};

// Instance method to check if patient can check in
ticketSchema.methods.canCheckIn = function() {
    if (this.isCheckedIn || this.status !== 'confirmed') {
        return false;
    }

    const now = new Date();
    const appointmentTime = new Date(this.appointmentDateTime);
    const timeDiff = appointmentTime - now;

    // Allow check-in 30 minutes before and 15 minutes after appointment time
    return timeDiff >= -(15 * 60 * 1000) && timeDiff <= (30 * 60 * 1000);
};

module.exports = mongoose.model('Ticket', ticketSchema);
