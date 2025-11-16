"""
Routes for best slot prediction
"""
from flask import Blueprint, request, jsonify
import logging
import numpy as np
from utils.feature_engineering import prepare_timeslot_features

# Will import model from app module after initialization
def get_timeslot_model():
    """Get timeslot model from app module"""
    # Use sys.modules to get the already-loaded app module
    import sys
    if 'app' in sys.modules:
        return sys.modules['app'].timeslot_model
    # Fallback: import app module
    import app
    return app.timeslot_model

logger = logging.getLogger(__name__)

best_slot_bp = Blueprint('best_slot', __name__)

@best_slot_bp.route('/best-slots', methods=['POST'])
def get_best_slots():
    """
    Get best time slots for a given day
    
    Expected POST body:
    {
        "day_name": "Wednesday"
    }
    
    Returns:
    {
        "best_slots": [
            {
                "hour_of_day": 10,
                "predicted_wait": 15.5,
                "time": "10:00"
            },
            ...
        ]
    }
    """
    try:
        # Get model (lazy import to avoid circular dependency)
        timeslot_model = get_timeslot_model()
        
        # Check if model is loaded
        if timeslot_model is None:
            logger.error("Timeslot model not loaded")
            return jsonify({
                'success': False,
                'error': 'Best slot prediction model is not available'
            }), 503
        
        # Get request data
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'Request body is required'
            }), 400
        
        # Validate required fields
        day_name = data.get('day_name')
        if not day_name:
            return jsonify({
                'success': False,
                'error': 'day_name is required'
            }), 400
        
        # Normalize day name (capitalize first letter)
        day_name = day_name.capitalize()
        
        # Validate day name
        valid_days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        if day_name not in valid_days:
            return jsonify({
                'success': False,
                'error': f'Invalid day_name. Must be one of: {", ".join(valid_days)}'
            }), 400
        
        # Make prediction using model
        try:
            # Handle if model is a dict (contains 'model' and 'feature_cols')
            if isinstance(timeslot_model, dict):
                # Extract the actual model from the dict
                actual_model = timeslot_model.get('model')
                feature_cols = timeslot_model.get('feature_cols', [])
                
                if actual_model is None:
                    raise ValueError("Model dict does not contain 'model' key")
                
                # Prepare features for all hours (0-23) for the given day
                features_list = prepare_timeslot_features(day_name)
                
                # Convert to numpy array
                features_array = np.array(features_list)
                
                # Call model prediction for all hours
                if hasattr(actual_model, 'predict'):
                    predictions = actual_model.predict(features_array)
                    # predictions is an array of wait times for each hour (0-23)
                    prediction_result = predictions
                else:
                    raise ValueError("Model object has no predict method")
            else:
                # Model is a sklearn model object directly
                # Prepare features for all hours
                features_list = prepare_timeslot_features(day_name)
                features_array = np.array(features_list)
                
                # Call model prediction
                if hasattr(timeslot_model, 'predict'):
                    prediction_result = timeslot_model.predict(features_array)
                else:
                    prediction_result = []
            
            # Format response
            # prediction_result is a numpy array of wait times for each hour (0-23)
            best_slots = []
            
            if isinstance(prediction_result, (list, tuple, np.ndarray)):
                # Convert to list if numpy array
                if isinstance(prediction_result, np.ndarray):
                    predictions = prediction_result.tolist()
                else:
                    predictions = list(prediction_result)
                
                # Create slots for each hour with its predicted wait time
                for hour, predicted_wait in enumerate(predictions):
                    best_slots.append({
                        'hour_of_day': hour,
                        'predicted_wait': round(float(predicted_wait), 1),
                        'time': f"{hour:02d}:00"
                    })
            elif isinstance(prediction_result, dict):
                # If model returns a dict
                if 'best_slots' in prediction_result:
                    best_slots = prediction_result['best_slots']
                else:
                    # Fallback: generate default slots
                    best_slots = generate_default_slots(day_name)
            else:
                # Fallback: generate default slots if model format is unexpected
                logger.warning(f"Unexpected model output format: {type(prediction_result)}")
                best_slots = generate_default_slots(day_name)
            
            # Ensure slots are sorted by predicted wait time (ascending - lower is better)
            best_slots.sort(key=lambda x: x.get('predicted_wait', 999))
            
            # Limit to top 5 slots with lowest wait times
            best_slots = best_slots[:5]
            
            logger.info(f"Returning {len(best_slots)} best slots for {day_name}")
            
            return jsonify({
                'success': True,
                'best_slots': best_slots
            }), 200
            
        except Exception as e:
            logger.error(f"Error during model prediction: {str(e)}")
            # Fallback to default slots
            best_slots = generate_default_slots(day_name)
            return jsonify({
                'success': True,
                'best_slots': best_slots,
                'warning': 'Using fallback slots due to model error'
            }), 200
        
    except Exception as e:
        logger.error(f"Unexpected error in best slot prediction: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

def generate_default_slots(day_name):
    """
    Generate default best slots as fallback
    """
    # Default best hours (morning slots typically have lower wait times)
    default_hours = [9, 10, 11, 14, 15]
    default_waits = [12, 15, 18, 20, 22]
    
    slots = []
    for hour, wait in zip(default_hours, default_waits):
        slots.append({
            'hour_of_day': hour,
            'predicted_wait': float(wait),
            'time': f"{hour:02d}:00"
        })
    
    return slots

