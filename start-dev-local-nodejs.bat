@echo off
REM Direct Node.js startup without tsx dependency
echo Starting AI Story Builder with Node.js...
echo.

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Set working directory
cd /d "%~dp0"

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Build the application first
echo Building application...
npm run build

REM Set environment for development mode
set NODE_ENV=development
set PORT=5000
set VITE_LOCAL=true
set DATABASE_URL=

REM Start server using built JavaScript
echo Starting development server...
echo URL: http://localhost:5000
echo.
echo Press Ctrl+C to stop server
echo.

node dist/index.js

pause