"""
test_validation.py — Edge-case validation tests.
Run with:  pytest tests/ -v
"""

import json
import urllib.error
import urllib.request

BASE = "http://localhost:8001"

VALID = {
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


def test_empty_state():
    data, status = post_expect_error("/api/v1/predict-yield", {**VALID, "state": ""})
    assert status == 422


def test_empty_district():
    data, status = post_expect_error("/api/v1/predict-yield", {**VALID, "district": ""})
    assert status == 422


def test_empty_crop():
    data, status = post_expect_error("/api/v1/predict-yield", {**VALID, "crop": ""})
    assert status == 422


def test_zero_area():
    data, status = post_expect_error("/api/v1/predict-yield", {**VALID, "area": 0})
    assert status == 422


def test_negative_lag():
    data, status = post_expect_error("/api/v1/predict-yield", {**VALID, "yield_lag_1": -10.0})
    assert status == 422


def test_negative_historical_std():
    data, status = post_expect_error("/api/v1/predict-yield", {**VALID, "historical_std_yield": -5.0})
    assert status == 422


def test_negative_cv():
    data, status = post_expect_error("/api/v1/predict-yield", {**VALID, "historical_cv": -0.1})
    assert status == 422


def test_zero_crop_year():
    data, status = post_expect_error("/api/v1/predict-yield", {**VALID, "crop_year": 0})
    assert status == 422


def test_batch_empty_records():
    data, status = post_expect_error("/api/v1/predict-yield/batch", {"records": []})
    assert status == 422
