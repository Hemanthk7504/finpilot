@echo off
echo ===============================================================
echo Starting FinPilot MAX: AI Intelligent Personal Finance Advisor
echo ===============================================================

echo.
echo [1/2] Launching FastAPI Backend on http://localhost:8000 ...
start "FinPilot MAX - Backend" cmd /k "python backend/run.py"

echo.
echo [2/2] Launching React Frontend on http://localhost:5173 ...
cd frontend
start "FinPilot MAX - Frontend" cmd /k "npm run dev"

echo.
echo FinPilot MAX is now running!
echo Backend API & Swagger: http://localhost:8000/docs
echo Frontend Portal:       http://localhost:5173
echo ===============================================================
pause
