@echo off
chcp 65001 >nul
echo Local Development Server (No Build Required)
echo.
echo Starting Vite dev server...
echo Frontend will be available at http://localhost:3000
echo API calls will be proxied to http://localhost:5000
echo.
echo Make sure to start the backend server first with start-nodejs.bat
echo.
cd client
npx vite --config ../vite.config.local.ts
pause