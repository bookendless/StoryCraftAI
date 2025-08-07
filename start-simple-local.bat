@echo off
chcp 65001 > nul

echo ====================================
echo  Simple Local Server - No Vite
echo ====================================

echo Node.js version:
node --version

echo.
echo Building client...
call npm run build

echo.
echo Starting simple server on localhost...

set NODE_ENV=production
set DATABASE_URL=
set GEMINI_API_KEY=
set PORT=5000

echo URL: http://localhost:5000
echo Environment: Production build + Memory storage

node dist/index.js

echo.
echo Server stopped.
pause