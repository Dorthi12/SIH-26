import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
OPENWEATHER_KEY = os.getenv("OPENWEATHER_KEY", "")
WEATHERBIT_KEY = os.getenv("WEATHERBIT_KEY", "")