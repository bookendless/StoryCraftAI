@echo off
chcp 65001 >nul
echo AI Story Builder - Build and Start
echo.
echo Step 1: Installing dependencies...
call npm install
if errorlevel 1 (
    echo Failed to install dependencies
    pause
    exit /b 1
)
echo.
echo Step 2: Building frontend...
call npm run build
if errorlevel 1 (
    echo Failed to build frontend
    pause
    exit /b 1
)
echo.
echo Step 3: Starting server...
echo Server will be available at http://localhost:5000
echo Keep this window open!
echo.
node server-simple.js
pause