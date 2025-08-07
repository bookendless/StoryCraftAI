@echo off
REM Simple Windows startup script without Japanese characters
echo Starting AI Story Builder...
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
    npm install --production
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Build if needed
if not exist "dist\public\index.html" (
    echo Building application...
    npm run build
    if errorlevel 1 (
        echo ERROR: Build failed
        pause
        exit /b 1
    )
)

REM Start server
echo Starting server...
set NODE_ENV=local
node server\index.local.cjs

pause