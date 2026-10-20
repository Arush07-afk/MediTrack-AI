"""
Bed occupancy prediction API — Random Forest models trained on synthetic hospital patterns.
"""
from __future__ import annotations

import json
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from config import (
    ALERT_MODEL_FILE,
    CRITICAL_OCCUPANCY_RATIO,
    MODEL_DIR,
    OCCUPANCY_MODEL_FILE,
    TOTAL_BEDS,
)
from train import FEATURES, train_and_save

BACKEND_ROOT = Path(__file__).resolve().parent
MODEL_PATH = BACKEND_ROOT / MODEL_DIR

regressor = None
classifier = None
model_meta: dict[str, Any] = {}


def _load_models() -> None:
    global regressor, classifier, model_meta
    occ_path = MODEL_PATH / OCCUPANCY_MODEL_FILE
    alert_path = MODEL_PATH / ALERT_MODEL_FILE
    metrics_path = MODEL_PATH / "metrics.json"

    if not occ_path.exists() or not alert_path.exists():
        model_meta = train_and_save(MODEL_PATH)
    else:
        # Try to load persisted metrics; fall back to minimal note if missing
        if metrics_path.exists():
            with open(metrics_path) as fh:
                model_meta = json.load(fh)
        else:
            model_meta = {"training_rows": 3240, "note": "loaded existing artifacts"}

    regressor = joblib.load(occ_path)
    classifier = joblib.load(alert_path)


def _feature_frame(hour: int, day: int, is_weekend: int, is_festival: int) -> pd.DataFrame:
    return pd.DataFrame(
        [[hour, day, is_weekend, is_festival]],
        columns=FEATURES,
    )


def _predict_row(hour: int, day: int, is_weekend: int, is_festival: int) -> dict[str, Any]:
    x = _feature_frame(hour, day, is_weekend, is_festival)
    occupied = int(np.clip(np.round(regressor.predict(x)[0]), 0, TOTAL_BEDS))
    available = TOTAL_BEDS - occupied

    # 90% forecast band: spread of the 100 individual tree predictions (1.645 × std)
    tree_preds = np.array([t.predict(x.values)[0] for t in regressor.estimators_])
    range_beds = int(round(1.645 * float(tree_preds.std())))

    proba = classifier.predict_proba(x)[0]
    classes = list(classifier.classes_)
    critical_idx = classes.index(1) if 1 in classes else 0
    critical_prob = float(proba[critical_idx]) * 100.0

    # Occupancy rule is a safety net: flag CRITICAL even if classifier disagrees
    alert = (
        "CRITICAL"
        if critical_prob >= 50.0 or occupied >= int(CRITICAL_OCCUPANCY_RATIO * TOTAL_BEDS)
        else "NORMAL"
    )

    return {
        "hour": hour,
        "occupied": occupied,
        "available": available,
        "alert": alert,
        "alert_probability": round(critical_prob, 1),
        "range_beds": range_beds,
    }


@asynccontextmanager
async def lifespan(_app: FastAPI):
    _load_models()
    yield


app = FastAPI(
    title="Hospital Bed Occupancy AI",
    description="Random Forest occupancy forecast for the bed tracking dashboard",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictResponse(BaseModel):
    occupied: int
    available: int
    alert: str
    alert_probability: float
    range_beds: int
    total_beds: int = TOTAL_BEDS


class ForecastHour(BaseModel):
    hour: int
    occupied: int
    available: int
    alert_probability: float
    range_beds: int


class ForecastResponse(BaseModel):
    forecast: list[ForecastHour]
    day: int
    is_weekend: int
    is_festival: int


class HealthResponse(BaseModel):
    status: str
    models_loaded: bool
    total_beds: int = TOTAL_BEDS
    meta: dict[str, Any] = Field(default_factory=dict)


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        models_loaded=regressor is not None and classifier is not None,
        total_beds=TOTAL_BEDS,
        meta=model_meta,
    )


@app.get("/predict", response_model=PredictResponse)
def predict(
    hour: int = Query(..., ge=0, le=23),
    day: int = Query(..., ge=0, le=6, description="0=Monday … 6=Sunday"),
    is_weekend: int = Query(0, ge=0, le=1, description="Ignored — derived server-side from day"),
    is_festival: int = Query(0, ge=0, le=1),
) -> PredictResponse:
    # Derive is_weekend from day; accept but ignore the query parameter
    derived_weekend = 1 if day >= 5 else 0
    row = _predict_row(hour, day, derived_weekend, is_festival)
    return PredictResponse(
        occupied=row["occupied"],
        available=row["available"],
        alert=row["alert"],
        alert_probability=row["alert_probability"],
        range_beds=row["range_beds"],
    )


@app.get("/forecast", response_model=ForecastResponse)
def forecast(
    day: int = Query(..., ge=0, le=6),
    is_weekend: int = Query(0, ge=0, le=1, description="Ignored — derived server-side from day"),
    is_festival: int = Query(0, ge=0, le=1),
    start_hour: int | None = Query(
        None,
        ge=0,
        le=23,
        description="If omitted, returns hours 0–23. If set, returns 24 slots from this hour.",
    ),
) -> ForecastResponse:
    # Derive is_weekend from day; accept but ignore the query parameter
    hours_order = (
        [(start_hour + i) % 24 for i in range(24)]
        if start_hour is not None
        else list(range(24))
    )
    forecast_rows = []
    for slot_index, h in enumerate(hours_order):
        # Fix day rollover: hours that pass midnight belong to the next day
        if start_hour is not None and (start_hour + slot_index) >= 24:
            slot_day = (day + 1) % 7
        else:
            slot_day = day
        slot_weekend = 1 if slot_day >= 5 else 0
        row = _predict_row(h, slot_day, slot_weekend, is_festival)
        forecast_rows.append(
            ForecastHour(
                hour=row["hour"],
                occupied=row["occupied"],
                available=row["available"],
                alert_probability=row["alert_probability"],
                range_beds=row["range_beds"],
            )
        )
    return ForecastResponse(
        forecast=forecast_rows,
        day=day,
        is_weekend=1 if day >= 5 else 0,
        is_festival=is_festival,
    )
