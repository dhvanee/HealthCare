"""
Feature engineering utilities for ML model predictions
Transforms user inputs into model-ready features
"""
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

# Weather condition encoding mapping
WEATHER_ENCODING = {
    'sunny': 0,
    'cloudy': 1,
    'rainy': 2,
    'storm': 3,
    'clear': 0,
    'partly_cloudy': 1,
    'overcast': 1,
    'rain': 2,
    'thunderstorm': 3,
    'snow': 4,
    'fog': 5
}

def get_day_of_week(date_str):
    """
    Extract day of week from date string (YYYY-MM-DD)
    Returns: 0 (Monday) to 6 (Sunday)
    """
    try:
        date_obj = datetime.strptime(date_str, '%Y-%m-%d')
        day_of_week = date_obj.weekday()  # 0 = Monday, 6 = Sunday
        return day_of_week
    except Exception as e:
        logger.error(f"Error parsing date {date_str}: {str(e)}")
        # Default to today's day of week
        return datetime.now().weekday()

def is_weekend(date_str):
    """
    Check if date is a weekend (Saturday or Sunday)
    Returns: 1 if weekend, 0 if weekday
    """
    try:
        day_of_week = get_day_of_week(date_str)
        # Saturday = 5, Sunday = 6
        return 1 if day_of_week >= 5 else 0
    except Exception as e:
        logger.error(f"Error checking weekend for {date_str}: {str(e)}")
        return 0

def extract_hour(time_str):
    """
    Extract hour from time string (HH:MM format)
    Returns: hour as integer (0-23)
    """
    try:
        # Handle both "HH:MM" and "HH:MM:SS" formats
        time_parts = time_str.split(':')
        hour = int(time_parts[0])
        
        # Validate hour range
        if hour < 0 or hour > 23:
            logger.warning(f"Invalid hour {hour}, defaulting to current hour")
            return datetime.now().hour
        
        return hour
    except Exception as e:
        logger.error(f"Error extracting hour from {time_str}: {str(e)}")
        # Default to current hour
        return datetime.now().hour

def encode_weather_condition(weather_str):
    """
    Encode weather condition string to integer
    Returns: encoded integer (0-5)
    """
    if not weather_str:
        return 0  # Default to sunny/clear
    
    # Normalize input
    weather_lower = weather_str.lower().strip()
    
    # Check direct mapping
    if weather_lower in WEATHER_ENCODING:
        return WEATHER_ENCODING[weather_lower]
    
    # Check partial matches
    for key, value in WEATHER_ENCODING.items():
        if key in weather_lower or weather_lower in key:
            return value
    
    # Default to sunny if no match
    logger.warning(f"Unknown weather condition: {weather_str}, defaulting to sunny (0)")
    return 0

def prepare_wait_time_features(input_data):
    """
    Prepare features for wait time prediction model
    
    Expected input_data:
    {
        "date": "2024-11-16",
        "time": "10:00",
        "current_queue_length": 12,
        "staff_count": 3,
        "historical_throughput": 6.2,
        "is_holiday": 0
    }
    
    Returns: list of features in exact order expected by model (6 features):
    [current_queue_length, staff_count, historical_throughput, 
     is_holiday, hour, day_of_week]
    """
    try:
        # Extract and validate required fields
        date = input_data.get('date')
        time = input_data.get('time')
        current_queue_length = int(input_data.get('current_queue_length', 0))
        staff_count = int(input_data.get('staff_count', 1))
        historical_throughput = float(input_data.get('historical_throughput', 5.0))
        is_holiday = int(input_data.get('is_holiday', 0))
        
        # Derive features from date and time
        hour = extract_hour(time)
        day_of_week = get_day_of_week(date)
        
        # Prepare feature array in exact order expected by model (6 features)
        features = [
            current_queue_length,
            staff_count,
            historical_throughput,
            is_holiday,
            hour,
            day_of_week
        ]
        
        logger.info(f"Prepared features (6 total): {features}")
        return features
        
    except Exception as e:
        logger.error(f"Error preparing wait time features: {str(e)}")
        raise ValueError(f"Failed to prepare features: {str(e)}")

def get_day_name_from_date(date_str):
    """
    Get day name from date string
    Returns: "Monday", "Tuesday", etc.
    """
    try:
        date_obj = datetime.strptime(date_str, '%Y-%m-%d')
        day_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        return day_names[date_obj.weekday()]
    except Exception as e:
        logger.error(f"Error getting day name from {date_str}: {str(e)}")
        # Default to today
        day_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        return day_names[datetime.now().weekday()]

def prepare_timeslot_features(day_name, hour_of_day=None, month=None):
    """
    Prepare features for timeslot prediction model
    
    Expected feature columns:
    ['hour_of_day', 'month', 'is_weekend', 'day_of_week_Friday', 
     'day_of_week_Monday', 'day_of_week_Saturday', 'day_of_week_Sunday', 
     'day_of_week_Thursday', 'day_of_week_Tuesday', 'day_of_week_Wednesday']
    
    Args:
        day_name: Day name (e.g., "Wednesday")
        hour_of_day: Hour (0-23), if None will predict for all hours
        month: Month (1-12), if None uses current month
    
    Returns:
        List of feature arrays (one for each hour if hour_of_day is None)
    """
    try:
        # Normalize day name
        day_name = day_name.capitalize()
        day_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        
        if day_name not in day_names:
            raise ValueError(f"Invalid day name: {day_name}")
        
        # Get day index (0=Monday, 6=Sunday)
        day_index = day_names.index(day_name)
        
        # Determine if weekend
        is_weekend_flag = 1 if day_index >= 5 else 0  # Saturday=5, Sunday=6
        
        # Get month (default to current month)
        if month is None:
            month = datetime.now().month
        
        # One-hot encode day of week
        day_one_hot = {f'day_of_week_{day}': 0 for day in day_names}
        day_one_hot[f'day_of_week_{day_name}'] = 1
        
        # Prepare features for each hour (0-23) if hour_of_day is None
        if hour_of_day is None:
            features_list = []
            for hour in range(24):
                features = [
                    hour,  # hour_of_day
                    month,  # month
                    is_weekend_flag,  # is_weekend
                    day_one_hot['day_of_week_Friday'],
                    day_one_hot['day_of_week_Monday'],
                    day_one_hot['day_of_week_Saturday'],
                    day_one_hot['day_of_week_Sunday'],
                    day_one_hot['day_of_week_Thursday'],
                    day_one_hot['day_of_week_Tuesday'],
                    day_one_hot['day_of_week_Wednesday']
                ]
                features_list.append(features)
            return features_list
        else:
            # Single hour prediction
            features = [
                hour_of_day,
                month,
                is_weekend_flag,
                day_one_hot['day_of_week_Friday'],
                day_one_hot['day_of_week_Monday'],
                day_one_hot['day_of_week_Saturday'],
                day_one_hot['day_of_week_Sunday'],
                day_one_hot['day_of_week_Thursday'],
                day_one_hot['day_of_week_Tuesday'],
                day_one_hot['day_of_week_Wednesday']
            ]
            return [features]
        
    except Exception as e:
        logger.error(f"Error preparing timeslot features: {str(e)}")
        raise ValueError(f"Failed to prepare timeslot features: {str(e)}")

