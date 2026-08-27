"""
smoke_test.py — Basic sanity checks for the Crop Recommendation API.
Run this after starting the server to verify all endpoints work.

Usage:
    python smoke_test.py
    python smoke_test.py --host http://192.168.1.10:8000
"""

import sys
import argparse
import json
import urllib.request
import urllib.error

BASE_URL = "http://localhost:8000"

PASS = "[PASS]"
FAIL = "[FAIL]"


def get(path: str) -> dict:
    url = BASE_URL + path
    with urllib.request.urlopen(url, timeout=5) as r:
        return json.loads(r.read())


def post(path: str, payload: dict) -> dict:
    data = json.dumps(payload).encode()
    req = urllib.request.Request(BASE_URL + path, data=data, headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req, timeout=5) as r:
        return json.loads(r.read())


def check(label: str, fn):
    try:
        result = fn()
        print(f"  {PASS} — {label}")
        return result
    except Exception as e:
        print(f"  {FAIL} — {label} | Error: {e}")
        return None


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="http://localhost:8000")
    args = parser.parse_args()
    global BASE_URL
    BASE_URL = args.host.rstrip("/")

    print(f"\n[CROP API] Smoke Tests ({BASE_URL})\n")

    print("[ 1 ] Root")
    check("GET /", lambda: get("/"))

    print("\n[ 2 ] Health")
    health = check("GET /health", lambda: get("/health"))
    if health:
        assert health["status"] == "healthy", "Status not healthy"
        print(f"       records_loaded = {health.get('records_loaded')}")

    print("\n[ 3 ] Metadata")
    meta = check("GET /metadata", lambda: get("/metadata"))
    if meta:
        print(f"       model = {meta.get('model_name')} v{meta.get('model_version')}")
        print(f"       weights = {meta.get('score_weights')}")

    print("\n[ 4 ] Options — states list")
    opts = check("GET /options", lambda: get("/options"))
    if opts:
        print(f"       states = {len(opts.get('states', []))} | seasons = {opts.get('seasons')}")

    print("\n[ 5 ] Options — districts for Bihar")
    check("GET /options?state=Bihar", lambda: get("/options?state=Bihar"))

    print("\n[ 6 ] Options — crops for Bihar / Gaya")
    check("GET /options?state=Bihar&district=Gaya", lambda: get("/options?state=Bihar&district=Gaya"))

    print("\n[ 7 ] Recommend — Bihar / Gaya / Kharif")
    rec = check(
        "POST /recommend",
        lambda: post("/recommend", {"state": "Bihar", "district": "Gaya", "season": "Kharif", "top_k": 5}),
    )
    if rec:
        recs = rec.get("recommendations", [])
        print(f"       total_candidates = {rec.get('total_candidates')} | returned = {len(recs)}")
        for r in recs:
            print(f"       #{r['rank']} {r['crop']:20s} score={r['historical_score']:.4f}  stability={r['stability_label']}")

    print("\n[ 8 ] Score specific crop — Rice in Bihar / Gaya / Kharif")
    sc = check(
        "POST /score-crop",
        lambda: post("/score-crop", {"state": "Bihar", "district": "Gaya", "season": "Kharif", "crop": "Rice"}),
    )
    if sc and sc.get("found"):
        cs = sc["crop_score"]
        print(f"       Rice: rank={cs['rank']} score={cs['historical_score']:.4f}")

    print("\n[ 9 ] Validation — invalid top_k")
    try:
        post("/recommend", {"state": "Bihar", "district": "Gaya", "season": "Kharif", "top_k": -5})
        print(f"  {FAIL} — Should have rejected top_k=-5")
    except urllib.error.HTTPError as e:
        if e.code == 422:
            print(f"  {PASS} — top_k=-5 correctly rejected with 422")
        else:
            print(f"  {FAIL} — Unexpected status code {e.code}")

    print("\n[ 10 ] 404 — unknown district")
    try:
        post("/recommend", {"state": "Bihar", "district": "DOES_NOT_EXIST", "season": "Kharif", "top_k": 3})
        print(f"  {FAIL} — Should have returned 404")
    except urllib.error.HTTPError as e:
        if e.code == 404:
            print(f"  {PASS} — Unknown district correctly returns 404")
        else:
            print(f"  {FAIL} — Unexpected status code {e.code}")

    print("\n[DONE] Smoke tests complete.\n")


if __name__ == "__main__":
    main()
