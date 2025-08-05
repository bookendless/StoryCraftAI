@echo off
chcp 65001 >nul
echo AI Story Builder starting...
echo.
echo Keep this window open
echo Press Ctrl+C to stop the server
echo.
set NODE_ENV=development
node --import tsx/esm server/index.ts
echo.
echo Server stopped. Press any key to close...
pause