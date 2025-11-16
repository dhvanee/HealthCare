"""
Flask application for ML model predictions
Handles wait time prediction and best slot recommendations
"""
from flask import Flask
from flask_cors import CORS
import os
import pickle
import logging
import joblib

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for all routes
CORS(app, resources={
    r"/predict/*": {
        "origins": ["http://localhost:5173", "http://localhost:3000", "http://localhost:5004"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Global variables to store loaded models
wait_time_model = None
timeslot_model = None

def load_models():
    """Load pickle models at startup"""
    global wait_time_model, timeslot_model
    
    # Get model paths
    base_dir = os.path.dirname(os.path.abspath(__file__))
    wait_time_model_path = os.path.join(base_dir, 'wait_time_model.pkl')
    # Try new timeslot model first, fallback to old one
    timeslot_model_path = os.path.join(base_dir, 'timeslot_model_1.pkl')
    if not os.path.exists(timeslot_model_path):
        timeslot_model_path = os.path.join(base_dir, 'timeslot_model.pkl')
    
    # Load wait time model (handle errors independently)
    if os.path.exists(wait_time_model_path):
        try:
            logger.info(f"Loading wait time model from: {wait_time_model_path}")
            with open(wait_time_model_path, 'rb') as f:
                wait_time_model = pickle.load(f)
            logger.info("✅ Wait time model loaded successfully")
        except Exception as e:
            logger.error(f"❌ Error loading wait time model: {str(e)}")
            wait_time_model = None
    else:
        logger.warning(f"⚠️  Wait time model not found at: {wait_time_model_path}")
        wait_time_model = None
    
    # Load timeslot model (handle errors independently)
    if os.path.exists(timeslot_model_path):
        try:
            logger.info(f"Loading timeslot model from: {timeslot_model_path}")
            # Try joblib first (recommended for sklearn models), then pickle
            try:
                timeslot_model = joblib.load(timeslot_model_path)
                logger.info("✅ Timeslot model loaded successfully with joblib")
            except Exception as e1:
                logger.warning(f"Failed with joblib, trying pickle: {str(e1)}")
                # Ensure sklearn imports are available for unpickling
                from sklearn.ensemble import RandomForestRegressor
                from sklearn.tree import DecisionTreeRegressor
                
                with open(timeslot_model_path, 'rb') as f:
                    # Try loading with different methods for compatibility
                    try:
                        timeslot_model = pickle.load(f)
                        logger.info("✅ Timeslot model loaded successfully with pickle")
                    except (ModuleNotFoundError, AttributeError) as e2:
                        logger.warning(f"Failed with default pickle, trying with fix_imports: {str(e2)}")
                        f.seek(0)
                        try:
                            timeslot_model = pickle.load(f, fix_imports=True)
                            logger.info("✅ Timeslot model loaded successfully with pickle (fix_imports)")
                        except Exception as e3:
                            logger.warning(f"Failed with fix_imports, trying latin1: {str(e3)}")
                            f.seek(0)
                            try:
                                timeslot_model = pickle.load(f, encoding='latin1', fix_imports=True)
                                logger.info("✅ Timeslot model loaded successfully with pickle (latin1)")
                            except Exception as e4:
                                logger.warning(f"Failed with latin1, trying bytes: {str(e4)}")
                                f.seek(0)
                                timeslot_model = pickle.load(f, encoding='bytes', fix_imports=True)
                                logger.info("✅ Timeslot model loaded successfully with pickle (bytes)")
        except Exception as e:
            logger.error(f"❌ Error loading timeslot model: {str(e)}")
            logger.warning("⚠️  Timeslot model will not be available. Best slots endpoint will return errors.")
            timeslot_model = None
    else:
        logger.warning(f"⚠️  Timeslot model not found at: {timeslot_model_path}")
        timeslot_model = None

# Import routes first (before loading models to avoid circular import)
from routes.waitTimeRoutes import wait_time_bp
from routes.bestSlotRoutes import best_slot_bp

# Load models at startup (after routes are imported)
load_models()

# Register blueprints
app.register_blueprint(wait_time_bp, url_prefix='/predict')
app.register_blueprint(best_slot_bp, url_prefix='/predict')

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return {
        'status': 'OK',
        'message': 'ML Prediction Service is running',
        'models_loaded': {
            'wait_time_model': wait_time_model is not None,
            'timeslot_model': timeslot_model is not None
        }
    }, 200

@app.route('/', methods=['GET'])
def index():
    """Root endpoint"""
    return {
        'service': 'ML Prediction Service',
        'version': '1.0.0',
        'endpoints': {
            'wait_time': '/predict/wait-time',
            'best_slots': '/predict/best-slots',
            'health': '/health'
        }
    }, 200

if __name__ == '__main__':
    port = int(os.environ.get('FLASK_PORT', 5008))
    debug = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    
    logger.info(f"🚀 Starting ML Prediction Service on port {port}")
    logger.info(f"📊 Debug mode: {debug}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)

