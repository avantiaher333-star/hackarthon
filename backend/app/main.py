import datetime
import uuid
from typing import Optional, List

from fastapi import FastAPI, HTTPException, Query, Depends, status
from fastapi.middleware.cors import CORSMiddleware
import sqlite3

from app.database import init_db, get_db
from app.seed import seed_database_if_empty
from app.models import (
    ReportCreate,
    ReportUpdate,
    ReportResponse,
    HotspotResponse,
    StatsResponse,
    DemoDeleteResponse,
)
from app.clustering import find_hotspots

app = FastAPI(
    title="RoadSense AI API",
    description="Crowdsourced Road Quality & Pothole Telemetry Backend",
    version="1.0.0",
)

# Startup initialization
init_db()
seed_database_if_empty()

# CORS for local and mobile testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def row_to_dict(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "latitude": row["latitude"],
        "longitude": row["longitude"],
        "timestamp": row["timestamp"],
        "sensor_score": row["sensor_score"],
        "gps_accuracy": row["gps_accuracy"],
        "source": row["source"],
        "is_demo": bool(row["is_demo"]),
        "status": row["status"],
        "severity_estimate": row["severity_estimate"],
        "notes": row["notes"],
    }


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "app": "RoadSense AI",
        "version": "1.0.0",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    }


@app.get("/api/reports", response_model=List[ReportResponse])
async def list_reports(
    is_demo: Optional[bool] = Query(None, description="Filter demo vs real reports"),
    status: Optional[str] = Query(None, description="Filter by status"),
    severity: Optional[str] = Query(None, description="Filter by severity estimate"),
    search: Optional[str] = Query(None, description="Search in notes or ID"),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: sqlite3.Connection = Depends(get_db),
):
    query = "SELECT * FROM reports WHERE 1=1"
    params = []

    if is_demo is not None:
        query += " AND is_demo = ?"
        params.append(1 if is_demo else 0)

    if status:
        query += " AND status = ?"
        params.append(status.lower())

    if severity:
        query += " AND severity_estimate = ?"
        params.append(severity.lower())

    if search:
        query += " AND (notes LIKE ? OR id LIKE ?)"
        wildcard = f"%{search.strip()}%"
        params.extend([wildcard, wildcard])

    query += " ORDER BY timestamp DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    cursor = db.cursor()
    cursor.execute(query, params)
    rows = cursor.fetchall()
    return [row_to_dict(r) for r in rows]


@app.post("/api/reports", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def create_report(
    payload: ReportCreate,
    db: sqlite3.Connection = Depends(get_db),
):
    rep_id = f"rep_{uuid.uuid4().hex[:8]}"
    utc_now = datetime.datetime.now(datetime.timezone.utc).isoformat()

    if payload.severity_estimate:
        severity = payload.severity_estimate.lower()
    elif payload.sensor_score >= 25.0:
        severity = "high"
    elif payload.sensor_score >= 18.0:
        severity = "medium"
    else:
        severity = "low"

    default_status = "new"

    cursor = db.cursor()
    cursor.execute(
        """
        INSERT INTO reports (
            id, latitude, longitude, timestamp, sensor_score,
            gps_accuracy, source, is_demo, status, severity_estimate, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            rep_id,
            round(payload.latitude, 6),
            round(payload.longitude, 6),
            utc_now,
            round(payload.sensor_score, 2),
            round(payload.gps_accuracy, 1) if payload.gps_accuracy is not None else None,
            payload.source.lower(),
            1 if payload.is_demo else 0,
            default_status,
            severity,
            payload.notes,
        ),
    )
    db.commit()

    cursor.execute("SELECT * FROM reports WHERE id = ?", (rep_id,))
    row = cursor.fetchone()
    return row_to_dict(row)


@app.get("/api/reports/{report_id}", response_model=ReportResponse)
async def get_report(
    report_id: str,
    db: sqlite3.Connection = Depends(get_db),
):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM reports WHERE id = ?", (report_id,))
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail=f"Report with id '{report_id}' not found")
    return row_to_dict(row)


@app.patch("/api/reports/{report_id}", response_model=ReportResponse)
async def update_report(
    report_id: str,
    payload: ReportUpdate,
    db: sqlite3.Connection = Depends(get_db),
):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM reports WHERE id = ?", (report_id,))
    existing = cursor.fetchone()
    if not existing:
        raise HTTPException(status_code=404, detail=f"Report with id '{report_id}' not found")

    updates = []
    params = []

    if payload.status is not None:
        updates.append("status = ?")
        params.append(payload.status)

    if payload.notes is not None:
        updates.append("notes = ?")
        params.append(payload.notes)

    if payload.severity_estimate is not None:
        updates.append("severity_estimate = ?")
        params.append(payload.severity_estimate)

    if not updates:
        return row_to_dict(existing)

    query = f"UPDATE reports SET {', '.join(updates)} WHERE id = ?"
    params.append(report_id)

    cursor.execute(query, params)
    db.commit()

    cursor.execute("SELECT * FROM reports WHERE id = ?", (report_id,))
    updated = cursor.fetchone()
    return row_to_dict(updated)


@app.delete("/api/reports/demo", response_model=DemoDeleteResponse)
async def delete_demo_reports(
    db: sqlite3.Connection = Depends(get_db),
):
    cursor = db.cursor()
    cursor.execute("SELECT COUNT(*) FROM reports WHERE is_demo = 1")
    count_to_delete = cursor.fetchone()[0]

    cursor.execute("DELETE FROM reports WHERE is_demo = 1")
    db.commit()

    return DemoDeleteResponse(
        message=f"Successfully deleted {count_to_delete} demo report(s).",
        deleted_count=count_to_delete,
    )


@app.get("/api/stats", response_model=StatsResponse)
async def get_stats(
    include_demo: bool = Query(False, description="Include demo reports in statistics"),
    db: sqlite3.Connection = Depends(get_db),
):
    cursor = db.cursor()

    demo_filter = "" if include_demo else "WHERE is_demo = 0"
    and_demo_filter = "" if include_demo else "AND is_demo = 0"

    cursor.execute(f"SELECT COUNT(*) FROM reports {demo_filter}")
    total_reports = cursor.fetchone()[0]

    cutoff_24h = (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=24)).isoformat()
    if include_demo:
        cursor.execute("SELECT COUNT(*) FROM reports WHERE timestamp >= ?", (cutoff_24h,))
    else:
        cursor.execute("SELECT COUNT(*) FROM reports WHERE timestamp >= ? AND is_demo = 0", (cutoff_24h,))
    reports_24h = cursor.fetchone()[0]

    cursor.execute(
        f"SELECT COUNT(*) FROM reports WHERE status != 'resolved' AND severity_estimate = 'high' {and_demo_filter}"
    )
    high_priority_count = cursor.fetchone()[0]

    cursor.execute(f"SELECT COUNT(*) FROM reports WHERE status = 'resolved' {and_demo_filter}")
    resolved_count = cursor.fetchone()[0]

    cursor.execute(
        f"SELECT status, COUNT(*) FROM reports {demo_filter} GROUP BY status"
    )
    status_counts = {row[0]: row[1] for row in cursor.fetchall()}

    cursor.execute(
        f"SELECT severity_estimate, COUNT(*) FROM reports {demo_filter} GROUP BY severity_estimate"
    )
    severity_counts = {row[0]: row[1] for row in cursor.fetchall()}

    cursor.execute("SELECT COUNT(*) FROM reports WHERE is_demo = 1")
    demo_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM reports WHERE is_demo = 0")
    real_count = cursor.fetchone()[0]

    cursor.execute(f"SELECT * FROM reports {demo_filter}")
    rows = cursor.fetchall()
    dict_reports = [row_to_dict(r) for r in rows]
    hotspots = find_hotspots(dict_reports)
    hotspot_count = len(hotspots)

    return StatsResponse(
        total_reports=total_reports,
        reports_24h=reports_24h,
        high_priority_count=high_priority_count,
        resolved_count=resolved_count,
        hotspot_count=hotspot_count,
        status_counts=status_counts,
        severity_counts=severity_counts,
        demo_count=demo_count,
        real_count=real_count,
    )


@app.get("/api/hotspots", response_model=List[HotspotResponse])
async def get_hotspots(
    include_demo: bool = Query(False, description="Include demo reports in hotspot detection"),
    eps_meters: float = Query(65.0, ge=10.0, le=500.0, description="DBSCAN radius in meters"),
    min_samples: int = Query(2, ge=2, le=50, description="Minimum reports to form a cluster"),
    db: sqlite3.Connection = Depends(get_db),
):
    cursor = db.cursor()
    if include_demo:
        cursor.execute("SELECT * FROM reports")
    else:
        cursor.execute("SELECT * FROM reports WHERE is_demo = 0")
    rows = cursor.fetchall()
    reports = [row_to_dict(r) for r in rows]

    return find_hotspots(reports, eps_meters=eps_meters, min_samples=min_samples)

