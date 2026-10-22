@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0"
echo ========================================================
echo        Starting AdmitBridge Unified Ecosystem
echo ========================================================

REM Sync .env to subdirectories if missing
if exist ".env" (
    if not exist "project\.env" copy /y ".env" "project\.env" >nul
    if not exist "student\frontend\.env" copy /y ".env" "student\frontend\.env" >nul
    if not exist "consultancy\frontend\.env" copy /y ".env" "consultancy\frontend\.env" >nul
    if not exist "admin\frontend\.env" copy /y ".env" "admin\frontend\.env" >nul
    if not exist "admitbridge-chatbot\.env" copy /y ".env" "admitbridge-chatbot\.env" >nul
)

REM Detect installed Python executable
set "PYTHON_CMD=python"
if exist "%LOCALAPPDATA%\Programs\Python\Python311\python.exe" (
    set "PYTHON_CMD=%LOCALAPPDATA%\Programs\Python\Python311\python.exe"
) else if exist "C:\Python311\python.exe" (
    set "PYTHON_CMD=C:\Python311\python.exe"
)

echo [1/5] Starting Flask ML Backend (Port 5000)...
start "AdmitBridge - Flask ML Backend (5000)" cmd /k "cd /d "%~dp0project" && "%PYTHON_CMD%" app.py"

echo [2/5] Starting Student Frontend (Port 5173)...
start "AdmitBridge - Student Portal (5173)" cmd /k "cd /d "%~dp0student\frontend" && npm run dev"

echo [3/5] Starting Consultancy Frontend (Port 5174)...
start "AdmitBridge - Consultancy Portal (5174)" cmd /k "cd /d "%~dp0consultancy\frontend" && npm run dev -- --port 5174"

echo [4/5] Starting Admin Frontend (Port 5175)...
start "AdmitBridge - Admin Portal (5175)" cmd /k "cd /d "%~dp0admin\frontend" && npm run dev -- --port 5175"

echo [5/5] Starting AI Chatbot Backend (Port 3000)...
start "AdmitBridge - Chatbot Backend (3000)" cmd /k "cd /d "%~dp0admitbridge-chatbot" && node server.js"

echo.
echo ========================================================
echo        All AdmitBridge Services Successfully Launched!
echo ========================================================
echo  Student Portal:        http://localhost:5173
echo  Consultancy Portal:    http://localhost:5174
echo  Admin Portal:          http://localhost:5175
echo  Flask ML Backend:      http://localhost:5000
echo  AI Chatbot API:        http://localhost:3000
echo ========================================================
echo.
