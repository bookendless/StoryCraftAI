@echo off
chcp 65001 >nul
echo Starting AI Story Builder with Environment...
echo.
echo Setting up environment variables...
set NODE_ENV=development
set DATABASE_URL=sqlite:./local.db
echo.
echo Keep this window open
echo Server will start on http://localhost:5000
echo.
node server-simple.js
echo.
echo Server stopped. Press any key to close...
pause