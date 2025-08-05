@echo off
echo AIストーリービルダーを起動中...
echo 依存関係を確認中...
if not exist node_modules (
    echo node_modulesが見つかりません。npm installを実行してください。
    pause
    exit /b 1
)

echo サーバーを起動中...
set NODE_ENV=development
npx tsx server/index.ts
pause