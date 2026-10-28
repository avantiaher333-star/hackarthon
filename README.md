# RoadSense AI 🛣️⚡

> **Tagline:** *Every Ride Detects. Every Report Improves Roads.*  
> **Project:** Crowdsourced Road Quality & Pothole Telemetry Platform

RoadSense AI is a mobile-first, smart-city application that detects sudden vehicle vibrations using smartphone motion sensors, captures high-accuracy GPS coordinates, creates geotagged road-defect reports, and clusters reports into **priority road repair hotspots** using scikit-learn **DBSCAN** geospatial clustering.

---

## 🏗️ Architecture & Technology Stack

- **Frontend:**
  - **Framework:** React 18, TypeScript, Vite
  - **Styling:** Tailwind CSS (Dark Navy Smart-City theme `#0B1220`, `#151F30`, `#10B981`)
  - **Mapping:** React Leaflet & OpenStreetMap (with custom SVG status pins & DBSCAN cluster overlays)
  - **Icons:** Lucide React
  - **Mobile / PWA:** DeviceMotion API, Geolocation API, Service Worker (`sw.js`), Web App Manifest
- **Backend:**
  - **API Framework:** Python 3.12, FastAPI, Uvicorn
  - **Database:** SQLite (`roadsense.db`) with automatic table & index migration
  - **Machine Learning:** `scikit-learn` DBSCAN (using `haversine` geographic metric converted to radians)
  - **Validation:** Pydantic v2 schemas
- **Testing:** Pytest backend test suite

---

## 🚀 Quick Start (Running the Application)

### Option A: One-Click Launcher (Windows)
Double-click `start.bat` or run:
```powershell
.\start.ps1
```
This automatically boots both the FastAPI backend (`http://localhost:8000`) and the Vite React frontend (`http://localhost:5173`).

---

### Option B: Manual Startup

#### 1. Backend Server
```powershell
# In the project root directory
.\.venv\Scripts\python backend\run.py
```
Backend will be live at:
- **API Base:** `http://127.0.0.1:8000`
- **Interactive Swagger Docs:** `http://127.0.0.1:8000/docs`

#### 2. Frontend Web App
```powershell
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
cd frontend
& "C:\Program Files\nodejs\npm.cmd" run dev
```
Frontend will be live at:
- **Web App:** `http://localhost:5173`

---

## 📱 Live Demonstration Guide (Hackathon Demo Script)

You can present the complete end-to-end functionality right from a desktop browser or mobile phone:

1. **Open the App:** Navigate to `http://localhost:5173`.
2. **Review Initial Pre-Seeded Dataset:**
   - Observe the live KPI metrics on the **Monitor** screen (Total Reports, 24h reports, DBSCAN hotspots).
   - Check the interactive map preview showing pre-seeded defect clusters.
3. **Simulate Impact Event:**
   - Click the purple **"Simulate Pothole Hit"** button on the top navbar or hero card.
   - An instant audio synthesized chime will play.
   - A success notification confirms a high-impact vibration was recorded.
   - The report appears immediately on the map and updates total and session counters.
4. **Demonstrate DBSCAN Hotspot Formation:**
   - Click **"Simulate Pothole Hit"** 2 or 3 more times.
   - Notice the **DBSCAN Hotspots** counter update in real-time as nearby reports form an algorithmic cluster.
5. **Inspect Live Map:**
   - Switch to the **Live Map** tab.
   - Toggle **Hotspots** to display the semi-transparent cluster radius rings.
   - Click on any marker to inspect its impact score, severity estimate, and status.
6. **Municipal Operations Dashboard:**
   - Navigate to **Municipal Ops**.
   - Review the incident resolution progress bar.
   - View the prioritized DBSCAN hotspot table.
   - In the **Incident Triage** table, change a report status from `Suspected (New)` to `Inspection Scheduled` or `Resolved`.
   - Refresh the page to demonstrate immediate **SQLite persistence**.
7. **Demo Data Isolation & Purge:**
   - Head to **Settings**.
   - Review the **Demonstration Data Management** section.
   - Click **Purge Demo Records** and confirm in the safety modal. All synthetic demo records are cleared, while real sensor telemetry is permanently preserved.

---

## 📡 Hardware Telemetry & Sensor Logic

### Accelerometer Detection (`useMotionDetection`)
- Listens to the browser `DeviceMotionEvent` on supported hardware.
- Computes 3D acceleration vector magnitude:
  $$\text{Magnitude} = \sqrt{a_x^2 + a_y^2 + a_z^2} - 9.8$$
- Triggers when magnitude exceeds the calibrated threshold (default: $19.5\text{ m/s}^2$).
- Implements a configurable cooldown interval (default: $3000\text{ ms}$) to prevent spamming duplicate reports for a single bump.
- **Transparency Notice:** A sudden acceleration spike is only a *suspected defect*, not proof of a pothole until verified by multiple detections or human inspection.

### Geolocation (`useGeolocation`)
- Uses `navigator.geolocation.watchPosition` with `enableHighAccuracy: true`.
- Captures latitude, longitude, and accuracy radius.
- **Strict Honesty:** Never fabricates fake coordinates for real sensor detections; if GPS is unavailable, detections are held pending a location fix.

### Testing on a Smartphone on the Same Wi-Fi
1. Find your computer's local IP address (e.g. `192.168.1.15`).
2. Open `http://192.168.1.15:5173` in your smartphone browser.
3. *Note on Browser Security:* Modern mobile browsers (iOS Safari and Android Chrome) require a **Secure Context** (`localhost` or `HTTPS`) to access the physical accelerometer and GPS. Over local HTTP, use the **Simulate Pothole Hit** button to test the entire application flow on your phone.

---

## 🗄️ Backend API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check & UTC timestamp |
| `GET` | `/api/reports` | List reports (supports `is_demo`, `status`, `severity`, `search`, `limit`, `offset`) |
| `POST` | `/api/reports` | Create new defect report (Pydantic validation, auto severity) |
| `GET` | `/api/reports/{id}` | Retrieve individual incident report |
| `PATCH` | `/api/reports/{id}` | Update status (`new`, `under_review`, `inspection_scheduled`, `resolved`) |
| `DELETE` | `/api/reports/demo` | Purge ONLY demo simulation records (`is_demo = 1`) |
| `GET` | `/api/stats` | Aggregated system metrics (supports `include_demo`) |
| `GET` | `/api/hotspots` | Run DBSCAN clustering with `haversine` metric on reports |

---

## 🧪 Testing

To run the backend test suite:
```powershell
$env:PYTHONPATH = "backend"
.\.venv\Scripts\pytest backend\app\tests -v
```

---

## 👥 Hackathon Team
- **Project:** RoadSense AI
- **Repository:** `https://github.com/avantiaher333-star/hackathon-.git`

