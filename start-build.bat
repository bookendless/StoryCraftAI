@echo off
REM Build and run approach - most reliable
title AI Story Builder - Build Mode

echo ====================================
echo  Building AI Story Builder
echo ====================================
echo.

cd /d "%~dp0"

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found
    pause
    exit /b 1
)

REM Install if needed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if errorlevel 1 (
        echo Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Build project
echo Building project...
npm run build
if errorlevel 1 (
    echo Build failed
    pause  
    exit /b 1
)

REM Environment setup
set NODE_ENV=development
set VITE_LOCAL=true
set DATABASE_URL=
set PORT=5000

echo.
echo ====================================
echo  Starting Server
echo ====================================
echo.
echo URL: http://localhost:5000
echo Environment: Development with Memory Storage
echo.
echo Press Ctrl+C to stop server
echo.

REM Start built version
node dist/index.js

echo.
echo Server stopped.
pause