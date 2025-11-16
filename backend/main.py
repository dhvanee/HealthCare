from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd

# ------------------------------------------------------------
# APP INITIALIZATION
# ------------------------------------------------------------
app = FastAPI(title="QueueWise Pro - Wait Time + Slot Recommendation API")

# Enable CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ------------------------------------------------------------
# LOAD MODELS (ONLY TWO)
# ------------------------------------------------------------
# --- Mock Model Loading ---
# Replace actual model loading with mock functions for now
wait_model = lambda x: {"predicted_wait_time": 15.0}
timeslot_model = lambda x: {"best_slots": ["10:00 AM", "2:00 PM"]}
bottleneck_model = lambda x: {"bottleneck": True, "confidence": 0.95}


# ------------------------------------------------------------
# 1️⃣ WAIT TIME PREDICTION
# ------------------------------------------------------------
class WaitInput(BaseModel):
    current_queue_length: int
    staff_count: int
    historical_throughput: float
    is_holiday: int
    hour: int
    day_of_week: int


@app.post("/predict_wait_time")
def predict_wait(data: WaitInput):
    # Use mock model for prediction
    return wait_model(data.dict())


# ------------------------------------------------------------
# 2️⃣ TIME SLOT RECOMMENDATION (Top 3 Slots)
# ------------------------------------------------------------
class SlotRequest(BaseModel):
    day_name: str


@app.post("/recommend_slots")
def recommend_slots(req: SlotRequest):
    # Use mock model for prediction
    return timeslot_model(req.dict())


# ------------------------------------------------------------
# ROOT CHECK
# ------------------------------------------------------------
@app.get("/")
def home():
    return {"message": "QueueWise Pro API (Wait Time & Slot Recommendation) Running Successfully!"}
