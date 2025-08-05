@echo off
echo 直接起動モードでサーバーを開始します...
echo.
echo このウィンドウを閉じないでください
echo サーバーが起動したら別のコマンドプロンプトで Electron を起動してください:
echo npx electron electron/main-simple.js
echo.
node --loader tsx/esm server/index.ts
pause