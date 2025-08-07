@echo off
chcp 65001 > nul

echo ====================================
echo  Debug Mode - Local Vite Server
echo ====================================

echo Node.js version: %NODE_VERSION%
node --version

echo.
echo Setting up debug environment...

set NODE_ENV=development
set VITE_LOCAL=true
set DATABASE_URL=
set GEMINI_API_KEY=
set PORT=5000

echo.
echo Installing dependencies...
call npm install

echo.
echo Starting debug server...
echo URL: http://localhost:5000
echo Environment: Debug with Vite

npx tsx server/index.local.debug.ts

echo.
echo Server stopped.
pause