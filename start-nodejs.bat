@echo off
chcp 65001 >nul
echo Starting Simple Node.js Server...
echo.
echo Keep this window open
echo Server will start on http://localhost:5000
echo.
node server-simple.js
echo.
echo Server stopped. Press any key to close...
pause