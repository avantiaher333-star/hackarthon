import uvicorn
from app.config import HOST, PORT

if __name__ == "__main__":
    print("=" * 60)
    print("  RoadSense AI — Production Server")
    print("  Crowdsourced Road Quality & Pothole Telemetry")
    print("=" * 60)
    print(f"  🌐 App:    http://localhost:{PORT}")
    print(f"  📡 API:    http://localhost:{PORT}/api/health")
    print(f"  📖 Docs:   http://localhost:{PORT}/docs")
    print("=" * 60)
    uvicorn.run(
        "app.main:app",
        host=HOST,
        port=PORT,
        reload=False,
        log_level="info",
    )
