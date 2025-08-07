# PowerShell startup script for Windows
Write-Host "=====================================" -ForegroundColor Green
Write-Host " AI Story Builder - Windows Startup" -ForegroundColor Green  
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

# Set location to script directory
Set-Location $PSScriptRoot

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js not found" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Install dependencies if needed
if (!(Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to install dependencies" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Build project
Write-Host "Building project..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed, trying alternative method..." -ForegroundColor Yellow
    
    # Try installing tsx globally
    Write-Host "Installing tsx globally..." -ForegroundColor Yellow
    npm install -g tsx
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to install tsx" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    
    # Set environment and start with tsx
    $env:NODE_ENV = "development"
    $env:VITE_LOCAL = "true"
    $env:DATABASE_URL = ""
    $env:PORT = "5000"
    
    Write-Host ""
    Write-Host "Starting with tsx..." -ForegroundColor Green
    Write-Host "URL: http://localhost:5000" -ForegroundColor Cyan
    Write-Host ""
    
    tsx server/index.ts
    exit
}

# Set environment variables
$env:NODE_ENV = "development"
$env:VITE_LOCAL = "true"
$env:DATABASE_URL = ""
$env:PORT = "5000"

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host " Starting Server" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "URL: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Environment: Development with Memory Storage" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop server" -ForegroundColor Yellow
Write-Host ""

# Start server
node dist/index.js

Write-Host ""
Write-Host "Server stopped." -ForegroundColor Yellow
Read-Host "Press Enter to exit"