import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = os.getenv("ROADSENSE_DB_PATH", str(BASE_DIR / "roadsense.db"))
CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000"
).split(",")
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))
DEFAULT_DEMO_LAT = float(os.getenv("DEFAULT_DEMO_LAT", "37.7749"))
DEFAULT_DEMO_LON = float(os.getenv("DEFAULT_DEMO_LON", "-122.4194"))

