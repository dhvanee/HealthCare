const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters long'],
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please enter a valid email address'
        ]
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false // Don't include password in queries by default
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        match: [
            /^\+?[\d\s\-\(\)]+$/,
            'Please enter a valid phone number'
        ]
    },
    dateOfBirth: {
        type: Date,
        required: [true, 'Date of birth is required']
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        required: [true, 'Gender is required']
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: {
            type: String,
            default: 'India'
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
            default: [0, 0]
        }
    },
    emergencyContact: {
        name: String,
        phone: String,
        relationship: String
    },
    medicalHistory: {
        allergies: [String],
        chronicConditions: [String],
        medications: [String],
        bloodGroup: {
            type: String,
            enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
        }
    },
    preferences: {
        preferredLanguage: {
            type: String,
            default: 'English'
        },
        notifications: {
            email: {
                type: Boolean,
                default: true
            },
            sms: {
                type: Boolean,
                default: true
            },
            push: {
                type: Boolean,
                default: true
            }
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
    lastLogin: {
        type: Date,
        default: null
    },
    role: {
        type: String,
        enum: ['patient', 'admin'],
        default: 'patient'
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function(doc, ret) {
            delete ret.password;
            delete ret.__v;
            return ret;
        }
    }
});

// Create geospatial index for location-based queries
userSchema.index({ location: '2dsphere' });

// Index commonly queried fields
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ isActive: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();

    try {
        // Hash password with cost of 12
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
        this.password = await bcrypt.hash(this.password, saltRounds);
        next();
    } catch (error) {
        next(error);
    }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Password comparison failed');
    }
};

// Instance method to update last login
userSchema.methods.updateLastLogin = function() {
    this.lastLogin = new Date();
    return this.save({ validateBeforeSave: false });
};

// Static method to find nearby users
userSchema.statics.findNearby = function(coordinates, maxDistance = 10000) {
    return this.find({
        location: {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: coordinates
                },
                $maxDistance: maxDistance
            }
        },
        isActive: true
    });
};

// Virtual for age calculation
userSchema.virtual('age').get(function() {
    if (!this.dateOfBirth) return null;

    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
});

// Virtual for full address
userSchema.virtual('fullAddress').get(function() {
    if (!this.address) return '';

    const { street, city, state, zipCode, country } = this.address;
    return [street, city, state, zipCode, country].filter(Boolean).join(', ');
});

module.exports = mongoose.model('User', userSchema);
