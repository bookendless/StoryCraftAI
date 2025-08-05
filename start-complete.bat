@echo off
chcp 65001 >nul
echo AI Story Builder - Complete Setup
echo.
echo Step 1: Installing dependencies...
call npm install
echo.
echo Step 2: Building frontend...
call npm run build:frontend
echo.
echo Step 3: Starting server...
echo Keep this window open!
echo.
node server-simple.js
pause