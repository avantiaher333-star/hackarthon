import math
from typing import List, Dict, Any
import numpy as np
from sklearn.cluster import DBSCAN
from app.models import HotspotResponse

EARTH_RADIUS_METERS = 6371000.0


def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates great-circle distance between two points in meters."""
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2))
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return EARTH_RADIUS_METERS * c


def find_hotspots(
    reports: List[Dict[str, Any]],
    eps_meters: float = 65.0,
    min_samples: int = 2
) -> List[HotspotResponse]:
    """
    Applies DBSCAN clustering using haversine metric on geographic coordinates.
    Returns detected road-defect hotspots with cluster center and contributing reports.
    """
    if len(reports) < min_samples:
        return []

    # Coordinates in radians: [lat, lon]
    coords = np.array([[r["latitude"], r["longitude"]] for r in reports])
    coords_rad = np.radians(coords)

    # Convert epsilon to radians for haversine
    eps_rad = eps_meters / EARTH_RADIUS_METERS

    db = DBSCAN(eps=eps_rad, min_samples=min_samples, metric="haversine")
    labels = db.fit_predict(coords_rad)

    unique_labels = set(labels)
    hotspots: List[HotspotResponse] = []

    for label in unique_labels:
        if label == -1:
            # Noise point - does not form a hotspot
            continue

        cluster_indices = np.where(labels == label)[0]
        cluster_reports = [reports[i] for i in cluster_indices]

        # Calculate cluster center
        lats = [r["latitude"] for r in cluster_reports]
        lons = [r["longitude"] for r in cluster_reports]
        center_lat = float(np.mean(lats))
        center_lon = float(np.mean(lons))

        # Calculate max distance from center to any report in cluster (cluster radius)
        distances = [
            haversine_distance_meters(center_lat, center_lon, r["latitude"], r["longitude"])
            for r in cluster_reports
        ]
        max_distance = max(distances) if distances else 0.0
        radius_meters = max(round(max_distance + 15.0, 1), 35.0)

        # Average sensor score and severity
        scores = [float(r["sensor_score"]) for r in cluster_reports]
        avg_score = round(float(np.mean(scores)), 2)

        if avg_score >= 25.0:
            severity = "high"
        elif avg_score >= 18.0:
            severity = "medium"
        else:
            severity = "low"

        # Status summary
        status_summary: Dict[str, int] = {}
        for r in cluster_reports:
            st = r["status"]
            status_summary[st] = status_summary.get(st, 0) + 1

        is_cluster_demo = any(r["is_demo"] for r in cluster_reports)
        report_ids = [r["id"] for r in cluster_reports]

        hotspots.append(
            HotspotResponse(
                id=f"hotspot_{label}_{int(center_lat * 1000)}_{int(center_lon * 1000)}",
                center_latitude=round(center_lat, 6),
                center_longitude=round(center_lon, 6),
                report_count=len(cluster_reports),
                radius_meters=radius_meters,
                avg_sensor_score=avg_score,
                severity_estimate=severity,
                report_ids=report_ids,
                status_summary=status_summary,
                is_demo=is_cluster_demo
            )
        )

    hotspots.sort(key=lambda h: h.report_count, reverse=True)
    return hotspots

