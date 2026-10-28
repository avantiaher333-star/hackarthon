import datetime
import uuid
import random
from app.database import get_db_connection
from app.config import DEFAULT_DEMO_LAT, DEFAULT_DEMO_LON


def seed_database_if_empty():
    """Seeds the database with realistic sample telemetry reports if currently empty."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM reports")
    count = cursor.fetchone()[0]

    if count > 0:
        conn.close()
        return

    print("Seeding initial road quality telemetry dataset...")
    base_lat = DEFAULT_DEMO_LAT
    base_lon = DEFAULT_DEMO_LON
    now = datetime.datetime.now(datetime.timezone.utc)

    # 4 distinct realistic clusters around municipal demo center
    clusters_config = [
        {
            "offset_lat": 0.0025,
            "offset_lon": 0.0018,
            "count": 5,
            "base_score": 28.5,
            "status": "new",
            "notes": "Deep pothole reported near crosswalk. Strong jolt detected.",
            "is_demo": 0
        },
        {
            "offset_lat": -0.0035,
            "offset_lon": 0.0042,
            "count": 4,
            "base_score": 21.0,
            "status": "under_review",
            "notes": "Asphalt depression and surface cracking near bus stop.",
            "is_demo": 0
        },
        {
            "offset_lat": -0.0018,
            "offset_lon": -0.0035,
            "count": 3,
            "base_score": 19.5,
            "status": "inspection_scheduled",
            "notes": "Uneven road surface after utility trench excavation.",
            "is_demo": 0
        },
        {
            "offset_lat": 0.0040,
            "offset_lon": -0.0022,
            "count": 3,
            "base_score": 17.0,
            "status": "resolved",
            "notes": "Cold-mix asphalt patch completed by municipal road crew.",
            "is_demo": 0
        },
        {
            "offset_lat": 0.0008,
            "offset_lon": 0.0006,
            "count": 3,
            "base_score": 26.0,
            "status": "new",
            "notes": "[Demo Simulation] Simulated vehicle vibration spike.",
            "is_demo": 1
        }
    ]

    records = []
    for cl in clusters_config:
        for i in range(cl["count"]):
            jitter_lat = random.uniform(-0.00025, 0.00025)
            jitter_lon = random.uniform(-0.00025, 0.00025)
            lat = base_lat + cl["offset_lat"] + jitter_lat
            lon = base_lon + cl["offset_lon"] + jitter_lon
            
            score = round(cl["base_score"] + random.uniform(-2.5, 3.5), 1)
            time_offset_hours = random.uniform(1.0, 48.0)
            rep_time = (now - datetime.timedelta(hours=time_offset_hours)).isoformat()
            
            if score >= 25.0:
                sev = "high"
            elif score >= 18.0:
                sev = "medium"
            else:
                sev = "low"

            rep_id = f"rep_{uuid.uuid4().hex[:8]}"
            source = "simulated" if cl["is_demo"] else "sensor"
            accuracy = round(random.uniform(3.5, 9.5), 1)

            records.append((
                rep_id,
                round(lat, 6),
                round(lon, 6),
                rep_time,
                score,
                accuracy,
                source,
                cl["is_demo"],
                cl["status"],
                sev,
                cl["notes"]
            ))

    # Add 4 single isolated noise reports
    for _ in range(4):
        lat = base_lat + random.uniform(-0.007, 0.007)
        lon = base_lon + random.uniform(-0.007, 0.007)
        score = round(random.uniform(14.0, 22.0), 1)
        sev = "medium" if score >= 18.0 else "low"
        rep_time = (now - datetime.timedelta(hours=random.uniform(2.0, 36.0))).isoformat()
        records.append((
            f"rep_{uuid.uuid4().hex[:8]}",
            round(lat, 6),
            round(lon, 6),
            rep_time,
            score,
            round(random.uniform(4.0, 12.0), 1),
            "sensor",
            0,
            "new",
            sev,
            "Isolated vehicle suspension bump."
        ))

    cursor.executemany("""
    INSERT INTO reports (
        id, latitude, longitude, timestamp, sensor_score,
        gps_accuracy, source, is_demo, status, severity_estimate, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, records)

    conn.commit()
    conn.close()
    print(f"Seeded {len(records)} initial road quality reports.")

