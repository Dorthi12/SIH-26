"""
test_health.py — Tests for health, readiness, metadata, schema endpoints.
Run with:  pytest tests/ -v
"""

import urllib.request
import urllib.error
import json

BASE = "http://localhost:8001"


def get(path):
    with urllib.request.urlopen(BASE + path, timeout=5) as r:
        return json.loads(r.read()), r.status


def test_root():
    data, status = get("/")
    assert status == 200
    assert data["status"] == "running"


def test_health():
    data, status = get("/health")
    assert status == 200
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True


def test_ready():
    data, status = get("/ready")
    assert status == 200
    assert data["ready"] is True


def test_metadata():
    data, status = get("/metadata")
    assert status == 200
    assert data["model_id"] == "model_2a"
    assert data["training_year_start"] == 1997
    assert data["training_year_end"] == 2017
    assert "MAE" in data["test_metrics"]
    assert "R2" in data["test_metrics"]


def test_schema():
    data, status = get("/schema")
    assert status == 200
    assert "state" in data["features"]
    assert "yield_lag_1" in data["features"]
    assert "production" in data["forbidden_features"]
    assert "yield" in data["forbidden_features"]
    assert len(data["features"]) == 16
