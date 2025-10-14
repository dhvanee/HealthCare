const fs = require('fs');
const path = require('path');

class MLService {
    constructor() {
        this.lightGBMModel = null;
        this.randomForestModel = null;
        this.isInitialized = false;
        this.modelLoadError = null;
    }

    /**
     * Initialize ML models at startup
     */
    async initializeModels() {
        try {
            console.log('🤖 Initializing ML models...');

            // For now, we'll use dummy models until real model files are available
            // In production, you would load actual pickle files here
            await this.loadLightGBMModel();
            await this.loadRandomForestModel();

            this.isInitialized = true;
            console.log('✅ ML models initialized successfully');
        } catch (error) {
            this.modelLoadError = error;
            console.error('❌ Failed to initialize ML models:', error.message);
            console.log('⚠️  Using fallback prediction methods');
        }
    }

    /**
     * Load LightGBM model for wait time prediction
     */
    async loadLightGBMModel() {
        const modelPath = process.env.MODEL_PATH_LIGHTGBM;

        try {
            if (modelPath && fs.existsSync(modelPath)) {
                // In a real implementation, you would use a library like node-pickle
                // or call a Python script to load the model
                console.log(`Loading LightGBM model from: ${modelPath}`);

                // For now, simulate model loading
                this.lightGBMModel = {
                    type: 'lightgbm',
                    loaded: true,
                    features: [
                        'hour_of_day',
                        'day_of_week',
                        'counter_type',
                        'current_queue_length',
                        'historical_avg_wait_time',
                        'doctor_availability',
                        'weather_condition',
                        'holiday_indicator'
                    ]
                };
            } else {
                console.log('⚠️  LightGBM model file not found, using dummy model');
                this.lightGBMModel = { type: 'dummy', loaded: true };
            }
        } catch (error) {
            console.error('Error loading LightGBM model:', error);
            throw error;
        }
    }

    /**
     * Load RandomForest model for time slot recommendation
     */
    async loadRandomForestModel() {
        const modelPath = process.env.MODEL_PATH_RANDOMFOREST;

        try {
            if (modelPath && fs.existsSync(modelPath)) {
                console.log(`Loading RandomForest model from: ${modelPath}`);

                // For now, simulate model loading
                this.randomForestModel = {
                    type: 'randomforest',
                    loaded: true,
                    features: [
                        'time_slot',
                        'day_of_week',
                        'counter_type',
                        'historical_queue_length',
                        'average_service_time',
                        'doctor_schedule',
                        'patient_preference'
                    ]
                };
            } else {
                console.log('⚠️  RandomForest model file not found, using dummy model');
                this.randomForestModel = { type: 'dummy', loaded: true };
            }
        } catch (error) {
            console.error('Error loading RandomForest model:', error);
            throw error;
        }
    }

    /**
     * Predict waiting time using LightGBM model
     * @param {Object} features - Input features for prediction
     * @returns {Promise<Object>} Prediction result
     */
    async predictWaitTime(features) {
        try {
            if (!this.isInitialized) {
                throw new Error('ML models not initialized');
            }

            const {
                hospitalId,
                counterId,
                currentQueueLength = 0,
                timeOfDay,
                dayOfWeek,
                counterType = 'OPD',
                doctorAvailable = true,
                weatherCondition = 'clear',
                isHoliday = false
            } = features;

            // Validate required features
            if (!hospitalId || !counterId || timeOfDay === undefined || dayOfWeek === undefined) {
                throw new Error('Missing required features for wait time prediction');
            }

            let waitTime;

            if (this.lightGBMModel.type === 'dummy') {
                // Dummy prediction logic
                waitTime = this.calculateDummyWaitTime({
                    currentQueueLength,
                    timeOfDay,
                    dayOfWeek,
                    counterType,
                    doctorAvailable,
                    weatherCondition,
                    isHoliday
                });
            } else {
                // Real model prediction would go here
                // This is where you'd call your actual LightGBM model
                waitTime = await this.callLightGBMModel(features);
            }

            return {
                success: true,
                waitTime: Math.round(waitTime),
                confidence: this.calculateConfidence(features),
                factors: this.getWaitTimeFactors(features),
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('Error predicting wait time:', error);
            return {
                success: false,
                error: error.message,
                fallbackWaitTime: this.getFallbackWaitTime(features.currentQueueLength),
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Recommend best time slots using RandomForest model
     * @param {Object} parameters - Input parameters for recommendation
     * @returns {Promise<Object>} Recommendation result
     */
    async recommendTimeSlots(parameters) {
        try {
            if (!this.isInitialized) {
                throw new Error('ML models not initialized');
            }

            const {
                hospitalId,
                counterId,
                preferredDate,
                patientPreferences = {},
                counterType = 'OPD',
                urgency = 'normal'
            } = parameters;

            // Validate required parameters
            if (!hospitalId || !counterId || !preferredDate) {
                throw new Error('Missing required parameters for time slot recommendation');
            }

            let recommendations;

            if (this.randomForestModel.type === 'dummy') {
                // Dummy recommendation logic
                recommendations = this.calculateDummyRecommendations({
                    preferredDate,
                    counterType,
                    patientPreferences,
                    urgency
                });
            } else {
                // Real model prediction would go here
                recommendations = await this.callRandomForestModel(parameters);
            }

            return {
                success: true,
                recommendations: recommendations.map(slot => ({
                    ...slot,
                    score: Math.round(slot.score * 100) / 100
                })),
                totalSlots: recommendations.length,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('Error recommending time slots:', error);
            return {
                success: false,
                error: error.message,
                fallbackRecommendations: this.getFallbackTimeSlots(parameters),
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Calculate dummy wait time (fallback method)
     */
    calculateDummyWaitTime(features) {
        const {
            currentQueueLength,
            timeOfDay,
            dayOfWeek,
            counterType,
            doctorAvailable,
            weatherCondition,
            isHoliday
        } = features;

        let baseWaitTime = currentQueueLength * 15; // 15 minutes per person

        // Time of day factor
        if (timeOfDay >= 9 && timeOfDay <= 12) {
            baseWaitTime *= 1.3; // Morning rush
        } else if (timeOfDay >= 16 && timeOfDay <= 19) {
            baseWaitTime *= 1.2; // Evening rush
        }

        // Day of week factor
        if (dayOfWeek === 1 || dayOfWeek === 6) { // Monday or Saturday
            baseWaitTime *= 1.15;
        }

        // Counter type factor
        const counterFactors = {
            'Emergency': 0.8,
            'OPD': 1.0,
            'Specialist': 1.4,
            'Lab': 0.6,
            'Pharmacy': 0.5
        };
        baseWaitTime *= (counterFactors[counterType] || 1.0);

        // Doctor availability factor
        if (!doctorAvailable) {
            baseWaitTime *= 2.0;
        }

        // Weather factor
        if (weatherCondition === 'rain' || weatherCondition === 'storm') {
            baseWaitTime *= 1.1;
        }

        // Holiday factor
        if (isHoliday) {
            baseWaitTime *= 0.7; // Less crowded on holidays
        }

        // Add some randomness to make it more realistic
        const randomFactor = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2
        baseWaitTime *= randomFactor;

        return Math.max(5, Math.min(180, baseWaitTime)); // Between 5 and 180 minutes
    }

    /**
     * Calculate dummy time slot recommendations (fallback method)
     */
    calculateDummyRecommendations(parameters) {
        const { preferredDate, counterType, patientPreferences, urgency } = parameters;
        const date = new Date(preferredDate);
        const timeSlots = [];

        // Generate time slots from 9 AM to 6 PM
        for (let hour = 9; hour <= 18; hour++) {
            for (let minute of [0, 30]) {
                if (hour === 18 && minute === 30) break; // Don't go past 6 PM

                const slotTime = new Date(date);
                slotTime.setHours(hour, minute, 0, 0);

                let score = Math.random() * 0.4 + 0.6; // Base score between 0.6-1.0

                // Morning slots are generally better
                if (hour >= 9 && hour <= 11) {
                    score += 0.1;
                }

                // Avoid lunch time rush
                if (hour >= 12 && hour <= 14) {
                    score -= 0.15;
                }

                // Evening slots are moderate
                if (hour >= 16 && hour <= 18) {
                    score -= 0.05;
                }

                // Counter type adjustments
                if (counterType === 'Emergency') {
                    score = Math.random() * 0.3 + 0.7; // Emergency is always high priority
                }

                // Urgency adjustments
                if (urgency === 'high' || urgency === 'emergency') {
                    // Prefer earlier slots for urgent cases
                    if (hour <= 12) {
                        score += 0.2;
                    }
                }

                const estimatedWaitTime = Math.round(Math.random() * 45 + 10); // 10-55 minutes

                timeSlots.push({
                    time: slotTime.toISOString(),
                    score: Math.min(1.0, score),
                    estimatedWaitTime,
                    availability: Math.random() > 0.3 ? 'available' : 'limited',
                    factors: {
                        crowdLevel: Math.random() > 0.5 ? 'low' : 'medium',
                        doctorAvailability: Math.random() > 0.2 ? 'available' : 'limited',
                        recommendationReason: this.getRecommendationReason(score, hour)
                    }
                });
            }
        }

        // Sort by score (highest first) and return top 10
        return timeSlots
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);
    }

    /**
     * Get recommendation reason based on score and time
     */
    getRecommendationReason(score, hour) {
        if (score >= 0.8) {
            return 'Optimal time with low wait times';
        } else if (score >= 0.6) {
            if (hour <= 11) {
                return 'Good morning slot with moderate wait times';
            } else if (hour >= 16) {
                return 'Decent evening slot';
            } else {
                return 'Average slot with moderate crowd';
            }
        } else {
            return 'Busy period with longer wait times';
        }
    }

    /**
     * Calculate confidence level for predictions
     */
    calculateConfidence(features) {
        let confidence = 0.7; // Base confidence

        // More data points increase confidence
        const featureCount = Object.keys(features).filter(key =>
            features[key] !== undefined && features[key] !== null
        ).length;

        confidence += (featureCount / 10) * 0.2; // Max 0.2 boost

        // Historical data availability (simulated)
        confidence += Math.random() * 0.1; // Simulate historical data impact

        return Math.min(0.95, Math.max(0.5, confidence));
    }

    /**
     * Get factors affecting wait time
     */
    getWaitTimeFactors(features) {
        const factors = [];

        if (features.currentQueueLength > 10) {
            factors.push('High current queue length');
        }

        if (features.timeOfDay >= 9 && features.timeOfDay <= 12) {
            factors.push('Morning rush hour');
        }

        if (features.dayOfWeek === 1) {
            factors.push('Monday rush');
        }

        if (!features.doctorAvailable) {
            factors.push('Limited doctor availability');
        }

        if (features.weatherCondition === 'rain') {
            factors.push('Rainy weather may increase footfall');
        }

        return factors;
    }

    /**
     * Get fallback wait time when model fails
     */
    getFallbackWaitTime(queueLength) {
        return Math.max(5, (queueLength || 0) * 12 + Math.random() * 20);
    }

    /**
     * Get fallback time slots when model fails
     */
    getFallbackTimeSlots(parameters) {
        return [
            {
                time: new Date().toISOString(),
                score: 0.6,
                estimatedWaitTime: 30,
                availability: 'limited',
                factors: {
                    crowdLevel: 'unknown',
                    doctorAvailability: 'unknown',
                    recommendationReason: 'Fallback recommendation due to model unavailability'
                }
            }
        ];
    }

    /**
     * Call actual LightGBM model (placeholder for real implementation)
     */
    async callLightGBMModel(features) {
        // This would call your actual Python script or model API
        // For now, return dummy prediction
        return this.calculateDummyWaitTime(features);
    }

    /**
     * Call actual RandomForest model (placeholder for real implementation)
     */
    async callRandomForestModel(parameters) {
        // This would call your actual Python script or model API
        // For now, return dummy recommendations
        return this.calculateDummyRecommendations(parameters);
    }

    /**
     * Get model status and health
     */
    getModelStatus() {
        return {
            isInitialized: this.isInitialized,
            lightGBMStatus: this.lightGBMModel ? 'loaded' : 'not_loaded',
            randomForestStatus: this.randomForestModel ? 'loaded' : 'not_loaded',
            lastError: this.modelLoadError ? this.modelLoadError.message : null,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Retrain models (placeholder for future implementation)
     */
    async retrainModels(newData) {
        console.log('🔄 Model retraining requested - feature not yet implemented');
        return {
            success: false,
            message: 'Model retraining is not yet implemented'
        };
    }
}

// Create singleton instance
const mlService = new MLService();

module.exports = mlService;
