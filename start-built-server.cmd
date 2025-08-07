@echo off
title AI Story Builder - Built Server

echo ====================================
echo  BUILT SERVER VERSION
echo ====================================
echo.

echo Node.js version:
node --version

echo.
echo Checking built server...
if not exist "dist\index.js" (
    echo Built server not found. Building now...
    call npm run build
    if errorlevel 1 (
        echo Build failed!
        pause
        exit /b 1
    )
) else (
    echo Built server exists
)

echo.
echo Setting environment...
set NODE_ENV=production
set PORT=5000
set DATABASE_URL=
set GEMINI_API_KEY=

echo.
echo Starting built server...
echo URL: http://localhost:5000
echo Mode: Production Built Server
echo.

node dist/index.js

echo.
echo Server stopped.
pause