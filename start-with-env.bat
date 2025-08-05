@echo off
chcp 65001 >nul
echo Complete AI Story Builder Setup and Start
echo.
echo Step 1: Installing dependencies...
call npm install
if errorlevel 1 (
    echo Failed to install dependencies
    pause
    exit /b 1
)
echo.
echo Step 2: Building frontend with local config...
call npx vite build --config vite.config.local.ts
if errorlevel 1 (
    echo Failed to build frontend
    pause
    exit /b 1
)
echo.
echo Step 3: Setting up environment variables...
set NODE_ENV=development
set DATABASE_URL=sqlite:./local.db
echo.
echo Step 4: Starting server with full functionality...
echo Server will be available at http://localhost:5000
echo Keep this window open!
echo.
node server-simple.js
pause