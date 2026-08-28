"""
test_prediction.py — Tests for inference endpoints.
Run with:  pytest tests/ -v
"""

import json
import urllib.error
import urllib.request

BASE = "http://localhost:8001"

VALID_REQUEST = {
    "state": "Bihar",
    "district": "Gaya",
    "crop": "Rice",
    "season": "Kharif",
    "crop_year": 2019,
    "area": 1200.0,
    "yield_lag_1": 2100.5,
    "yield_lag_2": 1980.2,
    "yield_lag_3": 2050.8,
    "historical_mean_yield": 2043.83,
    "historical_median_yield": 2050.8,
    "historical_std_yield": 61.34,
    "yield_change_1": 120.3,
    "yield_change_2": -70.6,
    "yield_growth_rate": 0.0242,
    "historical_cv": 0.0300,
}


def post(path, payload):
    data = json.dumps(payload).encode()
    req = urllib.request.Request(
        BASE + path, data=data,
        headers={"Content-Type": "application/json"}, method="POST"
    )
    with urllib.request.urlopen(req, timeout=10) as r:
        return json.loads(r.read()), r.status


def post_expect_error(path, payload):
    data = json.dumps(payload).encode()
    req = urllib.request.Request(
        BASE + path, data=data,
        headers={"Content-Type": "application/json"}, method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            return json.loads(r.read()), r.status
    except urllib.error.HTTPError as e:
        return json.loads(e.read()), e.code


def test_predict_yield_valid():
    data, status = post("/api/v1/predict-yield", VALID_REQUEST)
    assert status == 200
    assert "prediction" in data
    assert data["prediction"]["value"] >= 0          # non-negative enforced
    assert data["prediction"]["target"] == "yield"
    assert "request_id" in data
    assert data["model"]["id"] == "model_2a"


def test_predict_yield_non_negative_output():
    """All predictions must be >= 0 regardless of raw model output."""
    data, status = post("/api/v1/predict-yield", VALID_REQUEST)
    assert status == 200
    assert data["prediction"]["value"] >= 0


def test_predict_yield_extrapolation_warning():
    """Requesting a future year beyond training should trigger a warning."""
    req = {**VALID_REQUEST, "crop_year": 2026}
    data, status = post("/api/v1/predict-yield", req)
    assert status == 200
    assert len(data["warnings"]) > 0
    assert "2017" in data["warnings"][0]   # mentions training end year


def test_predict_yield_missing_field():
    """Omitting a required field should return 422."""
    req = {k: v for k, v in VALID_REQUEST.items() if k != "yield_lag_1"}
    data, status = post_expect_error("/api/v1/predict-yield", req)
    assert status == 422


def test_predict_yield_negative_area():
    """area must be > 0."""
    req = {**VALID_REQUEST, "area": -100.0}
    data, status = post_expect_error("/api/v1/predict-yield", req)
    assert status == 422


def test_predict_yield_from_history_valid():
    """From-history endpoint with 5 historical yields."""
    req = {
        "state": "Bihar",
        "district": "Gaya",
        "crop": "Rice",
        "season": "Kharif",
        "crop_year": 2021,
        "area": 1200.0,
        "historical_yields": [1850.0, 1920.0, 2050.0, 1980.0, 2100.5],
    }
    data, status = post("/api/v1/predict-yield/from-history", req)
    assert status == 200
    assert data["prediction"]["value"] >= 0


def test_predict_yield_from_history_insufficient():
    """Fewer than 3 historical yields should return 422."""
    req = {
        "state": "Bihar", "district": "Gaya", "crop": "Rice",
        "season": "Kharif", "crop_year": 2021, "area": 1200.0,
        "historical_yields": [2050.0, 2100.5],
    }
    data, status = post_expect_error("/api/v1/predict-yield/from-history", req)
    assert status == 422


def test_predict_yield_batch():
    """Batch endpoint with 3 records."""
    batch = {
        "records": [
            VALID_REQUEST,
            {**VALID_REQUEST, "crop": "Wheat", "season": "Rabi"},
            {**VALID_REQUEST, "crop": "Maize"},
        ]
    }
    data, status = post("/api/v1/predict-yield/batch", batch)
    assert status == 200
    assert data["count"] == 3
    for result in data["results"]:
        if result.get("error") is None:
            assert result["prediction"]["value"] >= 0


def test_predict_yield_batch_too_many():
    """More than 100 records should return 422."""
    batch = {"records": [VALID_REQUEST] * 101}
    data, status = post_expect_error("/api/v1/predict-yield/batch", batch)
    assert status == 422
