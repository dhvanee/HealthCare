const express = require('express');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { validate } = require('../utils/validation');
const { hospitalValidation, mlValidation } = require('../utils/validation');
const {
    getNearbyHospitals,
    getHospitalDetails,
    getHospitalCounters,
    searchHospitals,
    getWaitTimePrediction,
    getRecommendedTimeSlots
} = require('../controllers/hospitalController');

const router = express.Router();

/**
 * @route   GET /api/hospitals/nearby
 * @desc    Get nearby hospitals based on location
 * @access  Public
 * @params  latitude, longitude, radius, type, category, specialties, emergencyServices, limit
 */
router.get('/nearby',
    validate(hospitalValidation.searchNearby, 'query'),
    optionalAuth,
    getNearbyHospitals
);

/**
 * @route   GET /api/hospitals/search
 * @desc    Search hospitals by text and filters
 * @access  Public
 * @params  q, type, category, city, state, specialties, emergencyServices, minRating, page, limit
 */
router.get('/search', optionalAuth, searchHospitals);

/**
 * @route   GET /api/hospitals/:id
 * @desc    Get hospital details by ID
 * @access  Public
 */
router.get('/:id',
    validate(hospitalValidation.getHospital, 'params'),
    optionalAuth,
    getHospitalDetails
);

/**
 * @route   GET /api/hospitals/:id/counters
 * @desc    Get all counters for a hospital
 * @access  Public
 * @params  type, department, isActive
 */
router.get('/:id/counters',
    validate(hospitalValidation.getCounters, 'params'),
    optionalAuth,
    getHospitalCounters
);

/**
 * @route   GET /api/hospitals/:id/counters/:counterId/wait-time
 * @desc    Get wait time prediction for a specific counter
 * @access  Public
 */
router.get('/:id/counters/:counterId/wait-time',
    optionalAuth,
    getWaitTimePrediction
);

/**
 * @route   GET /api/hospitals/:id/counters/:counterId/recommended-slots
 * @desc    Get recommended time slots for a counter
 * @access  Private (requires authentication for personalized recommendations)
 * @params  date, urgency
 */
router.get('/:id/counters/:counterId/recommended-slots',
    authenticate,
    getRecommendedTimeSlots
);

module.exports = router;
