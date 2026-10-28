import os
import tempfile
import pytest

temp_db = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
temp_db_path = temp_db.name
temp_db.close()

os.environ["ROADSENSE_DB_PATH"] = temp_db_path

from fastapi.testclient import TestClient
from app.main import app
from app.database import init_db

client = TestClient(app)


@pytest.fixture(scope="session", autouse=True)
def run_around_tests():
    init_db()
    yield
    try:
        if os.path.exists(temp_db_path):
            os.remove(temp_db_path)
    except Exception:
        pass


def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["app"] == "RoadSense AI"


def test_create_real_report():
    payload = {
        "latitude": 37.7749,
        "longitude": -122.4194,
        "sensor_score": 26.5,
        "gps_accuracy": 5.2,
        "source": "sensor",
        "is_demo": False,
        "notes": "Test severe pothole detection"
    }
    response = client.post("/api/reports", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["id"].startswith("rep_")
    assert data["latitude"] == 37.7749
    assert data["longitude"] == -122.4194
    assert data["sensor_score"] == 26.5
    assert data["gps_accuracy"] == 5.2
    assert data["source"] == "sensor"
    assert data["is_demo"] is False
    assert data["status"] == "new"
    assert data["severity_estimate"] == "high"


def test_create_demo_report():
    payload = {
        "latitude": 37.7750,
        "longitude": -122.4195,
        "sensor_score": 19.0,
        "source": "simulated",
        "is_demo": True,
        "notes": "Simulated pothole hit"
    }
    response = client.post("/api/reports", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["is_demo"] is True
    assert data["source"] == "simulated"
    assert data["severity_estimate"] == "medium"


def test_invalid_coordinates_rejected():
    invalid_lat_payload = {
        "latitude": 120.0,
        "longitude": -122.4194,
        "sensor_score": 15.0,
        "source": "sensor",
        "is_demo": False
    }
    res = client.post("/api/reports", json=invalid_lat_payload)
    assert res.status_code == 422

    invalid_lon_payload = {
        "latitude": 37.7749,
        "longitude": -200.0,
        "sensor_score": 15.0,
        "source": "sensor",
        "is_demo": False
    }
    res = client.post("/api/reports", json=invalid_lon_payload)
    assert res.status_code == 422


def test_update_report_status():
    create_res = client.post("/api/reports", json={
        "latitude": 37.7760,
        "longitude": -122.4180,
        "sensor_score": 22.0,
        "source": "sensor",
        "is_demo": False
    })
    rep_id = create_res.json()["id"]

    patch_res = client.patch(f"/api/reports/{rep_id}", json={
        "status": "inspection_scheduled",
        "notes": "Assigned to North District Road Inspection Team."
    })
    assert patch_res.status_code == 200
    updated = patch_res.json()
    assert updated["status"] == "inspection_scheduled"
    assert "North District" in updated["notes"]


def test_hotspot_clustering():
    base_lat = 37.7800
    base_lon = -122.4100
    for i in range(3):
        client.post("/api/reports", json={
            "latitude": base_lat + (i * 0.00005),
            "longitude": base_lon + (i * 0.00005),
            "sensor_score": 27.0,
            "source": "sensor",
            "is_demo": False,
            "notes": f"Clustered pothole hit #{i}"
        })

    hotspot_res = client.get("/api/hotspots?include_demo=true&eps_meters=65&min_samples=2")
    assert hotspot_res.status_code == 200
    hotspots = hotspot_res.json()
    assert len(hotspots) >= 1
    first_hs = hotspots[0]
    assert first_hs["report_count"] >= 3
    assert len(first_hs["report_ids"]) >= 3
    assert first_hs["severity_estimate"] == "high"


def test_stats_and_demo_exclusion():
    client.post("/api/reports", json={
        "latitude": 37.7820,
        "longitude": -122.4120,
        "sensor_score": 20.0,
        "source": "simulated",
        "is_demo": True
    })
    client.post("/api/reports", json={
        "latitude": 37.7830,
        "longitude": -122.4130,
        "sensor_score": 20.0,
        "source": "sensor",
        "is_demo": False
    })

    stats_real = client.get("/api/stats?include_demo=false").json()
    stats_all = client.get("/api/stats?include_demo=true").json()

    assert stats_all["total_reports"] >= stats_real["total_reports"]
    assert stats_all["demo_count"] >= 1
    assert stats_real["real_count"] >= 1


def test_delete_demo_reports():
    client.post("/api/reports", json={
        "latitude": 37.7850,
        "longitude": -122.4150,
        "sensor_score": 25.0,
        "source": "simulated",
        "is_demo": True
    })

    del_res = client.delete("/api/reports/demo")
    assert del_res.status_code == 200
    del_data = del_res.json()
    assert del_data["deleted_count"] >= 1

    demo_reports = client.get("/api/reports?is_demo=true").json()
    assert len(demo_reports) == 0

