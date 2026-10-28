import sqlite3
from typing import Generator
from app.config import DB_PATH


def get_db_connection() -> sqlite3.Connection:
    """Creates a connection with row factory enabled."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initializes SQLite database tables and indices."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        timestamp TEXT NOT NULL,
        sensor_score REAL NOT NULL,
        gps_accuracy REAL,
        source TEXT NOT NULL,
        is_demo INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'new',
        severity_estimate TEXT NOT NULL DEFAULT 'low',
        notes TEXT
    )
    """)

    cursor.execute("CREATE INDEX IF NOT EXISTS idx_reports_timestamp ON reports(timestamp DESC)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_reports_is_demo ON reports(is_demo)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status)")

    conn.commit()
    conn.close()


def get_db() -> Generator[sqlite3.Connection, None, None]:
    """Dependency for FastAPI endpoints."""
    conn = get_db_connection()
    try:
        yield conn
    finally:
        conn.close()

