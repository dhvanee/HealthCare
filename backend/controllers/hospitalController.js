const Hospital = require('../database/models/Hospital');
const mlService = require('../services/mlService');
const { sanitize } = require('../utils/validation');

/**
 * Get Nearby Hospitals Controller
 * GET /api/hospitals/nearby
 */
const getNearbyHospitals = async (req, res) => {
    try {
        const {
            latitude,
            longitude,
            radius = 10,
            type,
            category,
            specialties,
            emergencyServices,
            limit = 20
        } = req.query;

        // Validate coordinates
        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }

        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            return res.status(400).json({
                success: false,
                message: 'Invalid coordinates'
            });
        }

        // Build search options
        const searchOptions = {};
        if (type) searchOptions.type = type;
        if (category) searchOptions.category = category;
        if (emergencyServices) searchOptions.emergencyServices = emergencyServices === 'true';
        if (specialties) {
            searchOptions.specialties = Array.isArray(specialties)
                ? specialties
                : specialties.split(',').map(s => s.trim());
        }

        // Find nearby hospitals
        const hospitals = await Hospital.findNearby(
            [lng, lat], // MongoDB expects [longitude, latitude]
            radius * 1000, // Convert km to meters
            searchOptions
        );

        // Add distance to each hospital
        const hospitalsWithDistance = hospitals.map(hospital => {
            const hospitalObj = hospital.toObject();
            hospitalObj.distance = hospital.calculateDistance([lng, lat]);
            hospitalObj.distanceUnit = 'km';
            return hospitalObj;
        });

        res.json({
            success: true,
            message: 'Nearby hospitals retrieved successfully',
            data: {
                hospitals: hospitalsWithDistance.slice(0, parseInt(limit)),
                total: hospitalsWithDistance.length,
                searchCenter: {
                    latitude: lat,
                    longitude: lng
                },
                searchRadius: radius,
                filters: searchOptions
            }
        });

    } catch (error) {
        console.error('Get nearby hospitals error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve nearby hospitals'
        });
    }
};

/**
 * Get Hospital Details Controller
 * GET /api/hospitals/:id
 */
const getHospitalDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const hospital = await Hospital.findById(id)
            .populate('counters')
            .lean();

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: 'Hospital not found'
            });
        }

        if (!hospital.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Hospital is currently inactive'
            });
        }

        // Add computed fields
        hospital.activeCounters = hospital.counters.filter(counter => counter.isActive);
        hospital.totalCounters = hospital.counters.length;
        hospital.currentStatus = getCurrentHospitalStatus(hospital);

        res.json({
            success: true,
            message: 'Hospital details retrieved successfully',
            data: { hospital }
        });

    } catch (error) {
        console.error('Get hospital details error:', error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid hospital ID'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to retrieve hospital details'
        });
    }
};

/**
 * Get Hospital Counters Controller
 * GET /api/hospitals/:id/counters
 */
const getHospitalCounters = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, department, isActive = true } = req.query;

        const hospital = await Hospital.findById(id).select('counters name');

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: 'Hospital not found'
            });
        }

        let counters = hospital.counters;

        // Apply filters
        if (type) {
            counters = counters.filter(counter => counter.type === type);
        }

        if (department) {
            counters = counters.filter(counter =>
                counter.department.toLowerCase().includes(department.toLowerCase())
            );
        }

        if (isActive !== undefined) {
            const activeFilter = isActive === 'true' || isActive === true;
            counters = counters.filter(counter => counter.isActive === activeFilter);
        }

        // Add current queue information and wait time predictions
        const countersWithPredictions = await Promise.all(
            counters.map(async (counter) => {
                const counterObj = counter.toObject();

                try {
                    // Get wait time prediction for this counter
                    const now = new Date();
                    const waitTimePrediction = await mlService.predictWaitTime({
                        hospitalId: id,
                        counterId: counter._id,
                        currentQueueLength: counter.currentQueueLength,
                        timeOfDay: now.getHours(),
                        dayOfWeek: now.getDay(),
                        counterType: counter.type,
                        doctorAvailable: true, // This would come from real data
                        weatherCondition: 'clear', // This would come from weather API
                        isHoliday: isHoliday(now)
                    });

                    counterObj.predictedWaitTime = waitTimePrediction.success
                        ? waitTimePrediction.waitTime
                        : counter.currentQueueLength * counter.averageServiceTime;

                    counterObj.queueStatus = getQueueStatus(counter.currentQueueLength);
                    counterObj.availability = getCounterAvailability(counter);

                } catch (predictionError) {
                    console.error('Prediction error for counter:', counter._id, predictionError);
                    counterObj.predictedWaitTime = counter.currentQueueLength * counter.averageServiceTime;
                    counterObj.queueStatus = 'unknown';
                    counterObj.availability = 'unknown';
                }

                return counterObj;
            })
        );

        res.json({
            success: true,
            message: 'Hospital counters retrieved successfully',
            data: {
                counters: countersWithPredictions,
                totalCounters: countersWithPredictions.length,
                hospitalName: hospital.name,
                filters: { type, department, isActive }
            }
        });

    } catch (error) {
        console.error('Get hospital counters error:', error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid hospital ID'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to retrieve hospital counters'
        });
    }
};

/**
 * Search Hospitals Controller
 * GET /api/hospitals/search
 */
const searchHospitals = async (req, res) => {
    try {
        const {
            q,
            type,
            category,
            city,
            state,
            specialties,
            emergencyServices,
            minRating = 0,
            page = 1,
            limit = 20
        } = req.query;

        const query = {
            isActive: true,
            isVerified: true
        };

        // Text search
        if (q) {
            query.$text = { $search: q };
        }

        // Filters
        if (type) query.type = type;
        if (category) query.category = category;
        if (city) query['address.city'] = new RegExp(city, 'i');
        if (state) query['address.state'] = new RegExp(state, 'i');
        if (emergencyServices) query.emergencyServices = emergencyServices === 'true';
        if (specialties) {
            const specialtiesArray = Array.isArray(specialties)
                ? specialties
                : specialties.split(',').map(s => s.trim());
            query.specialties = { $in: specialtiesArray };
        }
        if (minRating) query['rating.average'] = { $gte: parseFloat(minRating) };

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [hospitals, total] = await Promise.all([
            Hospital.find(query)
                .select('-counters') // Don't include counters in search results
                .skip(skip)
                .limit(parseInt(limit))
                .sort({ 'rating.average': -1, name: 1 })
                .lean(),
            Hospital.countDocuments(query)
        ]);

        res.json({
            success: true,
            message: 'Hospitals search completed successfully',
            data: {
                hospitals,
                pagination: {
                    current: parseInt(page),
                    total: Math.ceil(total / parseInt(limit)),
                    count: hospitals.length,
                    totalRecords: total
                },
                filters: { q, type, category, city, state, specialties, emergencyServices, minRating }
            }
        });

    } catch (error) {
        console.error('Search hospitals error:', error);
        res.status(500).json({
            success: false,
            message: 'Hospital search failed'
        });
    }
};

/**
 * Get Wait Time Prediction for Counter
 * GET /api/hospitals/:id/counters/:counterId/wait-time
 */
const getWaitTimePrediction = async (req, res) => {
    try {
        const { id, counterId } = req.params;

        // Verify hospital and counter exist
        const hospital = await Hospital.findById(id).select('counters name');
        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: 'Hospital not found'
            });
        }

        const counter = hospital.counters.id(counterId);
        if (!counter) {
            return res.status(404).json({
                success: false,
                message: 'Counter not found'
            });
        }

        // Get wait time prediction
        const now = new Date();
        const prediction = await mlService.predictWaitTime({
            hospitalId: id,
            counterId: counterId,
            currentQueueLength: counter.currentQueueLength,
            timeOfDay: now.getHours(),
            dayOfWeek: now.getDay(),
            counterType: counter.type,
            doctorAvailable: true, // This would come from real-time data
            weatherCondition: 'clear', // This would come from weather API
            isHoliday: isHoliday(now)
        });

        res.json({
            success: true,
            message: 'Wait time prediction retrieved successfully',
            data: {
                prediction,
                counter: {
                    id: counter._id,
                    name: counter.name,
                    type: counter.type,
                    currentQueueLength: counter.currentQueueLength,
                    averageServiceTime: counter.averageServiceTime
                },
                hospital: {
                    id: hospital._id,
                    name: hospital.name
                },
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Get wait time prediction error:', error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid hospital or counter ID'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to get wait time prediction'
        });
    }
};

/**
 * Get Best Time Slots Recommendation
 * GET /api/hospitals/:id/counters/:counterId/recommended-slots
 */
const getRecommendedTimeSlots = async (req, res) => {
    try {
        const { id, counterId } = req.params;
        const { date, urgency = 'normal' } = req.query;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Date is required'
            });
        }

        // Verify hospital and counter exist
        const hospital = await Hospital.findById(id).select('counters name');
        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: 'Hospital not found'
            });
        }

        const counter = hospital.counters.id(counterId);
        if (!counter) {
            return res.status(404).json({
                success: false,
                message: 'Counter not found'
            });
        }

        // Get time slot recommendations
        const recommendations = await mlService.recommendTimeSlots({
            hospitalId: id,
            counterId: counterId,
            preferredDate: date,
            patientPreferences: {
                urgency: urgency
            },
            counterType: counter.type
        });

        res.json({
            success: true,
            message: 'Time slot recommendations retrieved successfully',
            data: {
                recommendations: recommendations.success
                    ? recommendations.recommendations
                    : recommendations.fallbackRecommendations,
                counter: {
                    id: counter._id,
                    name: counter.name,
                    type: counter.type,
                    workingHours: counter.workingHours
                },
                hospital: {
                    id: hospital._id,
                    name: hospital.name
                },
                requestedDate: date,
                urgency: urgency,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Get recommended time slots error:', error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid hospital or counter ID'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to get recommended time slots'
        });
    }
};

/**
 * Helper Functions
 */

// Get current hospital status (open/closed)
function getCurrentHospitalStatus(hospital) {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentTime = now.toTimeString().slice(0, 5);

    const daySchedule = hospital.operatingHours[currentDay];

    if (!daySchedule || !daySchedule.isOpen) {
        return 'closed';
    }

    const isOpen = currentTime >= daySchedule.open && currentTime <= daySchedule.close;
    return isOpen ? 'open' : 'closed';
}

// Get queue status based on length
function getQueueStatus(queueLength) {
    if (queueLength <= 5) return 'low';
    if (queueLength <= 15) return 'medium';
    if (queueLength <= 25) return 'high';
    return 'very_high';
}

// Get counter availability
function getCounterAvailability(counter) {
    if (!counter.isActive) return 'closed';

    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);

    const isWithinHours = currentTime >= counter.workingHours.start &&
                         currentTime <= counter.workingHours.end;

    if (!isWithinHours) return 'closed';

    const utilizationRate = counter.currentQueueLength / counter.maxCapacityPerHour;

    if (utilizationRate <= 0.5) return 'available';
    if (utilizationRate <= 0.8) return 'limited';
    return 'busy';
}

// Check if a date is a holiday (simplified implementation)
function isHoliday(date) {
    // This is a simplified implementation
    // In production, you'd have a proper holiday calendar
    const holidays = [
        '01-01', // New Year's Day
        '01-26', // Republic Day
        '08-15', // Independence Day
        '10-02', // Gandhi Jayanti
    ];

    const monthDay = (date.getMonth() + 1).toString().padStart(2, '0') + '-' +
                    date.getDate().toString().padStart(2, '0');

    return holidays.includes(monthDay);
}

module.exports = {
    getNearbyHospitals,
    getHospitalDetails,
    getHospitalCounters,
    searchHospitals,
    getWaitTimePrediction,
    getRecommendedTimeSlots
};
