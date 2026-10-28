Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "              Starting RoadSense AI" -ForegroundColor Green
Write-Host "   Crowdsourced Road Quality & Pothole Telemetry" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan

$env:PATH = "C:\Program Files\nodejs;" + $env:PATH

Write-Host "`n[1/2] Starting FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; .\.venv\Scripts\python backend\run.py"

Write-Host "[2/2] Starting React + Vite Frontend on http://localhost:5173..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PATH = 'C:\Program Files\nodejs;' + `$env:PATH; cd '$PSScriptRoot\frontend'; & 'C:\Program Files\nodejs\npm.cmd' run dev"

Write-Host "`nReady!" -ForegroundColor Green
Write-Host "📱 Frontend Web App:  http://localhost:5173" -ForegroundColor White
Write-Host "⚡ Backend API:       http://localhost:8000" -ForegroundColor White
Write-Host "📖 Interactive Docs:  http://localhost:8000/docs`n" -ForegroundColor White

