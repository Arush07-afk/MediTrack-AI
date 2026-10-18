"""
Train occupancy (Random Forest regressor) and surge alert (Random Forest classifier)
on synthetic hospital admission patterns. Run manually: python train.py
"""
from __future__ import annotations

import os
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, accuracy_score

from config import (
    ALERT_MODEL_FILE,
    CRITICAL_OCCUPANCY_RATIO,
    MODEL_DIR,
    OCCUPANCY_MODEL_FILE,
    TOTAL_BEDS,
    TRAINING_ROWS,
)

RNG = np.random.default_rng(42)
FEATURES = ["hour", "day", "is_weekend", "is_festival"]


def _expected_occupancy(hour: int, day: int, is_weekend: int, is_festival: int) -> float:
    """Deterministic baseline with daily / weekly seasonality."""
    morning_peak = np.exp(-0.5 * ((hour - 10) / 2.5) ** 2)
    evening_peak = np.exp(-0.5 * ((hour - 18) / 3.0) ** 2)
    night_lull = 0.15 if hour < 6 or hour >= 22 else 0.0
    weekday_boost = 0.08 if day < 5 else -0.05
    weekend_adj = -0.06 if is_weekend else 0.0
    festival_adj = 0.12 if is_festival else 0.0

    ratio = (
        0.42
        + 0.22 * morning_peak
        + 0.18 * evening_peak
        - night_lull
        + weekday_boost
        + weekend_adj
        + festival_adj
    )
    return float(np.clip(ratio, 0.12, 0.92) * TOTAL_BEDS)


def build_dataset(n_rows: int = TRAINING_ROWS) -> pd.DataFrame:
    hours = RNG.integers(0, 24, size=n_rows)
    days = RNG.integers(0, 7, size=n_rows)
    is_weekend = (days >= 5).astype(int)
    is_festival = RNG.binomial(1, 0.08, size=n_rows)

    occupied = np.array(
        [
            _expected_occupancy(int(h), int(d), int(w), int(f))
            + RNG.normal(0, 6.5)
            for h, d, w, f in zip(hours, days, is_weekend, is_festival)
        ]
    )
    occupied = np.clip(np.round(occupied), 0, TOTAL_BEDS).astype(int)
    alert = (occupied >= CRITICAL_OCCUPANCY_RATIO * TOTAL_BEDS).astype(int)

    return pd.DataFrame(
        {
            "hour": hours,
            "day": days,
            "is_weekend": is_weekend,
            "is_festival": is_festival,
            "occupied": occupied,
            "alert_critical": alert,
        }
    )


def train_and_save(model_root: Path | None = None) -> dict:
    model_root = model_root or Path(__file__).resolve().parent / MODEL_DIR
    model_root.mkdir(parents=True, exist_ok=True)

    df = build_dataset()
    x = df[FEATURES]
    y_occ = df["occupied"]
    y_alert = df["alert_critical"]

    x_train, x_test, y_occ_train, y_occ_test, y_alert_train, y_alert_test = train_test_split(
        x, y_occ, y_alert, test_size=0.2, random_state=42, stratify=y_alert
    )

    reg = RandomForestRegressor(
        n_estimators=100,
        max_depth=12,
        min_samples_leaf=4,
        random_state=42,
        n_jobs=-1,
    )
    reg.fit(x_train, y_occ_train)
    occ_pred = reg.predict(x_test)
    mae = mean_absolute_error(y_occ_test, occ_pred)

    clf = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        min_samples_leaf=6,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )
    clf.fit(x_train, y_alert_train)
    alert_pred = clf.predict(x_test)
    acc = accuracy_score(y_alert_test, alert_pred)

    joblib.dump(reg, model_root / OCCUPANCY_MODEL_FILE)
    joblib.dump(clf, model_root / ALERT_MODEL_FILE)

    return {
        "training_rows": len(df),
        "mae": round(float(mae), 2),
        "alert_accuracy": round(float(acc) * 100, 1),
        "model_dir": str(model_root),
    }


if __name__ == "__main__":
    stats = train_and_save()
    print("Training complete:")
    for k, v in stats.items():
        print(f"  {k}: {v}")
