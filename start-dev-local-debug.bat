@echo off
REM Debug version with error logging
echo Starting AI Story Builder in Development Mode...
echo.

REM Log startup attempts
echo %date% %time% - Starting development server >> startup.log

REM Check if already running
tasklist /FI "IMAGENAME eq node.exe" /FI "WINDOWTITLE eq tsx*" 2>nul | find /I "node.exe" >nul
if %ERRORLEVEL%==0 (
    echo ERROR: Development server is already running
    echo Please close the existing server first
    echo Checking for running Node processes...
    tasklist /FI "IMAGENAME eq node.exe"
    echo.
    echo To stop existing server, press Ctrl+C in the other window
    pause
    exit /b 1
)

REM Check Node.js
echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js version:
node --version

REM Set working directory
echo Setting working directory...
cd /d "%~dp0"
echo Current directory: %CD%

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Set environment variables
echo Setting environment variables...
set NODE_ENV=development
set PORT=5000
set VITE_LOCAL=true

REM Start development server
echo Starting development server with Vite...
echo Environment: %NODE_ENV%
echo Port: %PORT%
echo Vite Local: %VITE_LOCAL%
echo.
echo URL: http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo.

REM Log before starting
echo %date% %time% - Starting tsx server >> startup.log

REM Start server with explicit error handling
npx cross-env NODE_ENV=development VITE_LOCAL=true tsx server/index.ts
set EXIT_CODE=%ERRORLEVEL%

REM Log exit
echo %date% %time% - Server exited with code %EXIT_CODE% >> startup.log

if %EXIT_CODE% NEQ 0 (
    echo.
    echo ERROR: Server exited with error code %EXIT_CODE%
    echo Check startup.log for details
)

echo.
echo Server has stopped. Press any key to exit...
pause >nul