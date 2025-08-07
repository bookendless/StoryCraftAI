@echo off
REM Simplified startup with error detection
title AI Story Builder - Development Mode

echo ====================================
echo  AI Story Builder - Development Mode
echo ====================================
echo.

REM Kill any existing Node processes to avoid conflicts
echo Checking for existing Node processes...
tasklist /FI "IMAGENAME eq node.exe" 2>nul | find /I "tsx" >nul
if %ERRORLEVEL%==0 (
    echo Stopping existing Node processes...
    taskkill /F /IM node.exe /T >nul 2>&1
    timeout /t 2 >nul
)

REM Change to script directory
cd /d "%~dp0"

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not installed
    pause
    exit /b 1
)

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

REM Start server
echo Starting development server...
echo URL will be: http://localhost:5000
echo.
echo To stop server: Press Ctrl+C
echo.

npx cross-env NODE_ENV=development VITE_LOCAL=true tsx server/index.ts

REM This should not execute unless server stops
echo.
echo Server stopped.
pause