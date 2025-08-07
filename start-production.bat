@echo off
chcp 65001 > nul

echo ====================================
echo  Production Build - Most Stable
echo ====================================

echo Node.js version:
node --version

echo.
echo Setting environment...
set NODE_ENV=production
set DATABASE_URL=
set GEMINI_API_KEY=
set PORT=5000

echo.
echo Building application (this may take a moment)...
call npm run build

echo.
echo Starting production server...
echo URL: http://localhost:5000
echo Environment: Production + Memory Storage

node dist/index.js

echo.
echo Server stopped.
pause