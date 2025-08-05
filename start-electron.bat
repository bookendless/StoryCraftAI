@echo off
chcp 65001 >nul
echo Starting Electron Application...
echo.
echo Make sure the server is running at http://localhost:5000
echo.
echo Debug mode - Console logs will be visible
echo.
npx electron electron/main-debug.js
echo.
echo Electron stopped. Press any key to close...
pause