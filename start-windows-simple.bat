@echo off
echo AIストーリービルダーサーバーを起動中...
echo.
echo 注意: このウィンドウは開いたままにしてください
echo サーバーを停止する場合は Ctrl+C を押してください
echo.
set NODE_ENV=development
node -r esbuild-register server/index.ts
pause