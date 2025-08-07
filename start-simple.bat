@echo off
REM Simplest possible startup method
echo Starting AI Story Builder...
echo.

REM Change to project directory
cd /d "%~dp0"

REM Check if Node.js is available
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

REM Build the project
echo Building project...
npm run build
if errorlevel 1 (
    echo Build failed. Trying alternative method...
    goto :alternative
)

REM Set environment and start
echo Starting server...
set NODE_ENV=development
set VITE_LOCAL=true
set DATABASE_URL=
set PORT=5000

echo Server will be available at: http://localhost:5000
echo Press Ctrl+C to stop
echo.

node dist/index.js
goto :end

:alternative
echo Trying alternative startup...
set NODE_ENV=development
set VITE_LOCAL=true
set DATABASE_URL=
set PORT=5000

echo Installing tsx globally...
npm install -g tsx
if errorlevel 1 (
    echo Failed to install tsx. Please install manually: npm install -g tsx
    pause
    exit /b 1
)

echo Starting with tsx...
tsx server/index.ts

:end
pause