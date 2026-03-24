@echo off
echo ==========================================
echo 🚀 Starting Diabetes Detection System...
echo ==========================================

:: 1. Start ML Service (Flask)
echo [1/3] Starting ML Service (Python/Flask) on port 5001...
start "ML Service" cmd /k "cd ml-service && venv\Scripts\activate && python app.py"

:: 2. Start Backend Service (Node)
echo [2/3] Starting Backend Service (Node/Express) on port 5000...
start "Backend Service" cmd /k "cd backend && npm run dev"

:: 3. Start Frontend Service (React)
echo [3/3] Starting Frontend Service (React/Vite) on port 5173...
start "Frontend Service" cmd /k "cd frontend && npm run dev"

echo ==========================================
echo ✅ All services are launching!
echo 🌐 Frontend: http://localhost:5173
echo 📂 Backend API: http://localhost:5000
echo 🧠 ML Service: http://localhost:5001
echo ==========================================
pause
