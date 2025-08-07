@echo off
echo Testing built server...
set NODE_ENV=production
set PORT=5000
set DATABASE_URL=
set GEMINI_API_KEY=
timeout 10 node dist/index.js
echo Test completed.