@echo off
echo ===============================================================
echo Starting FinPilot MAX: AI Intelligent Personal Finance Advisor
echo ===============================================================

echo.
echo [1/2] Launching FastAPI Backend on http://localhost:8005 ...
start "FinPilot MAX - Backend" cmd /k "python backend/run.py"

echo.
echo [2/2] Launching React Frontend on http://localhost:9000 ...
cd frontend
start "FinPilot MAX - Frontend" cmd /k "npm run dev -- --port 9000"

echo.
echo FinPilot MAX is now running!
echo Frontend Portal:       http://localhost:9000
echo Backend API & Swagger: http://localhost:8005/docs
echo ===============================================================
pause
