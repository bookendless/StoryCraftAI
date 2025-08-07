@echo off
REM Complete installation and startup script
title AI Story Builder - Complete Setup

echo =====================================
echo  AI Story Builder - Complete Setup
echo =====================================
echo.

REM Change to script directory
pushd "%~dp0"

REM Check Node.js
echo Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not installed
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Choose LTS version for best compatibility
    echo.
    pause
    exit /b 1
)

node --version
echo Node.js found successfully.
echo.

REM Clean install
echo Cleaning previous installation...
if exist "node_modules" rmdir /s /q "node_modules" >nul 2>&1
if exist "dist" rmdir /s /q "dist" >nul 2>&1
echo.

REM Install dependencies
echo Installing dependencies...
npm install
if errorlevel 1 (
    echo Failed to install dependencies
    echo Trying with --force flag...
    npm install --force
    if errorlevel 1 (
        echo Installation failed completely
        pause
        exit /b 1
    )
)
echo Dependencies installed successfully.
echo.

REM Install tsx globally for TypeScript support
echo Installing TypeScript runtime (tsx)...
npm install -g tsx
if errorlevel 1 (
    echo Warning: Failed to install tsx globally
    echo Will try build method instead...
    goto :build_method
)
echo tsx installed successfully.
echo.

REM Direct tsx method
echo Starting with tsx (TypeScript method)...
set NODE_ENV=development
set VITE_LOCAL=true
set DATABASE_URL=
set PORT=5000

echo.
echo Server starting at: http://localhost:5000
echo Environment: Development with Memory Storage
echo.
echo Press Ctrl+C to stop server
echo.

tsx server/index.ts
goto :end

:build_method
echo.
echo Using build method...
echo Building project...
npm run build
if errorlevel 1 (
    echo Build failed
    pause
    exit /b 1
)

set NODE_ENV=development
set VITE_LOCAL=true
set DATABASE_URL=
set PORT=5000

echo.
echo Server starting at: http://localhost:5000
echo Environment: Development with Memory Storage  
echo.
echo Press Ctrl+C to stop server
echo.

node dist/index.js

:end
echo.
echo Server stopped.
pause