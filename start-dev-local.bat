@echo off
REM Development mode startup with Vite for full functionality
echo Starting AI Story Builder in Development Mode...
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

REM Set environment for development mode
set NODE_ENV=development
set PORT=5000
set VITE_LOCAL=true
set DATABASE_URL=

REM Start development server with Vite
echo Starting development server with Vite...
echo This will enable full functionality like the preview version
echo.
echo URL: http://localhost:5000
echo.
npx cross-env NODE_ENV=development VITE_LOCAL=true tsx server/index.ts

pause