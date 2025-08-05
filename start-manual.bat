@echo off
chcp 65001 >nul
echo Manual Server Start
echo.
echo Step 1: Install dependencies
npm install
echo.
echo Step 2: Starting server with Node.js directly
echo Keep this window open!
echo.
set NODE_ENV=development
node -r tsx/register server/index.ts
pause