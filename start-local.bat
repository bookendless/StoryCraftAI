@echo off
echo AIストーリービルダー（ローカル版）を起動しています...
echo.

REM Node.jsがインストールされているかチェック
node --version >nul 2>&1
if errorlevel 1 (
    echo エラー: Node.jsがインストールされていません。
    echo Node.js 18.x以上をインストールしてください。
    echo https://nodejs.org/
    pause
    exit /b 1
)

REM カレントディレクトリに移動
cd /d "%~dp0"

REM 依存関係がインストールされているかチェック
if not exist "node_modules" (
    echo 依存関係をインストールしています...
    npm install
    if errorlevel 1 (
        echo エラー: 依存関係のインストールに失敗しました。
        pause
        exit /b 1
    )
)

REM ビルドファイルが存在するかチェック
if not exist "dist" (
    echo アプリケーションをビルドしています...
    npm run build
    if errorlevel 1 (
        echo エラー: ビルドに失敗しました。
        pause
        exit /b 1
    )
)

REM データベースの初期化は不要（メモリストレージ使用）
echo データベース: メモリストレージを使用（データは一時保存）

echo.
echo ================================
echo  AIストーリービルダー 起動中...
echo ================================
echo.
echo Ollamaが起動していることを確認してください:
echo - Ollama をインストール: https://ollama.ai/
echo - モデルをダウンロード: ollama pull llama3.2:3b
echo.
echo サーバー起動後、ブラウザで http://localhost:5000 にアクセス
echo または、このウィンドウを最小化してください。
echo.
echo 起動完了後、このウィンドウは最小化しても構いません。
echo 終了するには このウィンドウで Ctrl+C を押してください。
echo.

REM ローカルサーバーを起動
set NODE_ENV=local
node server/index.local.cjs

echo.
echo AIストーリービルダーが終了しました。
pause