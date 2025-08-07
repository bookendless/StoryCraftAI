@echo off
title AI Story Builder - Standalone

echo ====================================
echo  STANDALONE VERSION
echo ====================================
echo.

echo Node.js version:
node --version

echo.
echo Creating standalone server...
npx esbuild server/index.ts --platform=node --bundle --format=cjs --outfile=dist/server-standalone.cjs --packages=bundle --external:better-sqlite3 --external:@neondatabase/serverless --external:@google-cloud/storage

if not exist "dist\server-standalone.cjs" (
    echo Failed to create standalone server
    pause
    exit /b 1
)

echo Standalone server created successfully

echo.
echo Setting environment...
set NODE_ENV=production
set PORT=5000
set DATABASE_URL=
set GEMINI_API_KEY=

echo.
echo Starting standalone server...
echo URL: http://localhost:5000
echo Mode: Standalone Bundle
echo.

node dist/server-standalone.cjs

echo.
echo Server stopped.
pause