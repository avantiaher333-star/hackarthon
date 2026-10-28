@echo off
echo ========================================================
echo               Starting RoadSense AI
echo    Crowdsourced Road Quality ^& Pothole Telemetry
echo ========================================================

set "PATH=C:\Program Files\nodejs;%PATH%"

echo [1/2] Launching FastAPI Backend on http://127.0.0.1:8000 ...
start "RoadSense Backend" cmd /k "cd /d %~dp0 && .\.venv\Scripts\python backend\run.py"

echo [2/2] Launching Vite Frontend on http://localhost:5173 ...
start "RoadSense Frontend" cmd /k "cd /d %~dp0\frontend && npm run dev"

echo.
echo Application started!
echo - Web App: http://localhost:5173
echo - Backend API: http://localhost:8000
echo - Swagger Docs: http://localhost:8000/docs
echo ========================================================
pause

