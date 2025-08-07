# PowerShell版起動スクリプト - Windows環境専用
param()

Write-Host "====================================" -ForegroundColor Blue
Write-Host " AI Story Builder - PowerShell Mode" -ForegroundColor Blue  
Write-Host "====================================" -ForegroundColor Blue
Write-Host ""

# Node.jsバージョン確認
Write-Host "Node.js version:" -ForegroundColor Green
node --version
Write-Host ""

# 環境変数設定
$env:NODE_ENV = "development"
$env:VITE_LOCAL = "true"
$env:DATABASE_URL = ""
$env:GEMINI_API_KEY = ""
$env:PORT = "5000"

Write-Host "Environment set to LOCAL mode" -ForegroundColor Yellow
Write-Host ""

# 起動方法の選択
Write-Host "Starting server with tsx..." -ForegroundColor Green
Write-Host "URL: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""

# つづりの確認
if (Get-Command tsx -ErrorAction SilentlyContinue) {
    Write-Host "tsx found, starting server..." -ForegroundColor Green
    try {
        tsx server/index.ts
    }
    catch {
        Write-Host "tsx failed, trying alternative..." -ForegroundColor Red
        Write-Host "Building and starting with node..." -ForegroundColor Yellow
        npm run build
        if ($LASTEXITCODE -eq 0) {
            node dist/index.js
        } else {
            Write-Host "Build failed. Please check dependencies." -ForegroundColor Red
        }
    }
} else {
    Write-Host "tsx not found, installing..." -ForegroundColor Yellow
    npm install -g tsx
    if ($LASTEXITCODE -eq 0) {
        Write-Host "tsx installed, starting server..." -ForegroundColor Green
        tsx server/index.ts
    } else {
        Write-Host "Failed to install tsx, using build approach..." -ForegroundColor Red
        npm run build
        if ($LASTEXITCODE -eq 0) {
            node dist/index.js
        }
    }
}

Write-Host ""
Write-Host "Server stopped." -ForegroundColor Red
Read-Host "Press Enter to exit"