"""
Routes for wait time prediction
"""
from flask import Blueprint, request, jsonify
import logging
import numpy as np
from utils.feature_engineering import prepare_wait_time_features

# Will import model from app module after initialization
def get_wait_time_model():
    """Get wait time model from app module"""
    # Use sys.modules to get the already-loaded app module
    import sys
    if 'app' in sys.modules:
        return sys.modules['app'].wait_time_model
    # Fallback: import app module
    import app
    return app.wait_time_model

logger = logging.getLogger(__name__)

wait_time_bp = Blueprint('wait_time', __name__)

@wait_time_bp.route('/wait-time', methods=['POST'])
def predict_wait_time():
    """
    Predict wait time based on input features
    
    Expected POST body:
    {
        "date": "2024-11-16",
        "time": "10:00",
        "current_queue_length": 12,
        "staff_count": 3,
        "historical_throughput": 6.2,
        "is_holiday": 0
    }
    
    Returns:
    {
        "predicted_wait_time_minutes": 25.5,
        "confidence_interval": {
            "lower_bound": 20.0,
            "upper_bound": 31.0
        }
    }
    """
    try:
        # Get model (lazy import to avoid circular dependency)
        wait_time_model = get_wait_time_model()
        
        # Check if model is loaded
        if wait_time_model is None:
            logger.error("Wait time model not loaded")
            return jsonify({
                'success': False,
                'error': 'Wait time prediction model is not available'
            }), 503
        
        # Get request data
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'Request body is required'
            }), 400
        
        # Validate required fields
        required_fields = ['date', 'time', 'current_queue_length', 'staff_count', 
                          'historical_throughput', 'is_holiday']
        
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({
                'success': False,
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400
        
        # Prepare features
        try:
            features = prepare_wait_time_features(data)
        except ValueError as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 400
        
        # Convert to numpy array for model prediction
        features_array = np.array(features).reshape(1, -1)
        
        # Make prediction
        try:
            predicted_wait_time = wait_time_model.predict(features_array)[0]
            
            # Ensure prediction is non-negative
            predicted_wait_time = max(0, float(predicted_wait_time))
            
            # Calculate confidence interval (assuming ±20% for now)
            # In production, you might want to use model's prediction intervals if available
            margin = predicted_wait_time * 0.2
            lower_bound = max(0, predicted_wait_time - margin)
            upper_bound = predicted_wait_time + margin
            
            # Round to 1 decimal place
            predicted_wait_time = round(predicted_wait_time, 1)
            lower_bound = round(lower_bound, 1)
            upper_bound = round(upper_bound, 1)
            
            logger.info(f"Predicted wait time: {predicted_wait_time} minutes")
            
            return jsonify({
                'success': True,
                'predicted_wait_time_minutes': predicted_wait_time,
                'confidence_interval': {
                    'lower_bound': lower_bound,
                    'upper_bound': upper_bound
                }
            }), 200
            
        except Exception as e:
            logger.error(f"Error during model prediction: {str(e)}")
            return jsonify({
                'success': False,
                'error': f'Prediction failed: {str(e)}'
            }), 500
        
    except Exception as e:
        logger.error(f"Unexpected error in wait time prediction: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

