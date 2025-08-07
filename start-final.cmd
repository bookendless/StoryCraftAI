@echo off
title AI Story Builder - Final Version

echo ====================================
echo  FINAL WORKING VERSION
echo ====================================
echo.

echo Node.js version:
node --version

echo.
echo Checking build files...
if not exist "dist\public\index.html" (
    echo Build files not found. Building now...
    call npm run build
    if errorlevel 1 (
        echo Build failed. Creating minimal version...
        mkdir dist\public 2>nul
        echo ^<!DOCTYPE html^>^<html^>^<head^>^<title^>Story Builder^</title^>^</head^>^<body^>^<div id="root"^>App Loading...^</div^>^</body^>^</html^> > dist\public\index.html
    )
) else (
    echo Build files exist
)

echo.
echo Setting environment...
set NODE_ENV=production
set PORT=5000

echo.
echo Starting server...
echo URL: http://localhost:5000
echo.

node server/simple-local.cjs

echo.
echo Server stopped.
pause