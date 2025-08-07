@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo.
echo ======================================================
echo   AIストーリービルダー ローカル版 - Windows起動
echo ======================================================
echo.

REM 管理者権限チェック（必要に応じて）
net session >nul 2>&1
if %errorLevel% == 0 (
    echo [INFO] 管理者権限で実行中
) else (
    echo [INFO] 通常ユーザーで実行中
)

REM カレントディレクトリを実行ファイルの場所に設定
cd /d "%~dp0"
echo [INFO] 作業ディレクトリ: %CD%

REM Node.jsバージョン確認
echo.
echo [1/5] Node.js環境を確認中...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.jsがインストールされていません
    echo          https://nodejs.org/ から最新版をダウンロードしてください
    echo.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo [OK] Node.js !NODE_VERSION! が見つかりました
)

REM NPMバージョン確認
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo [OK] npm !NPM_VERSION! が利用可能です

REM 依存関係確認とインストール
echo.
echo [2/5] 依存関係を確認中...
if not exist "node_modules" (
    echo [INFO] 初回起動: 依存関係をインストールします（数分かかる場合があります）
    echo [EXEC] npm install --production --silent
    npm install --production --silent
    if errorlevel 1 (
        echo [ERROR] 依存関係のインストールに失敗しました
        echo [FIX] 以下を試してください:
        echo        1. このフォルダをウイルス対策ソフトの除外に追加
        echo        2. 右クリック → 管理者として実行
        echo        3. インターネット接続を確認
        pause
        exit /b 1
    )
    echo [OK] 依存関係のインストール完了
) else (
    echo [OK] 依存関係は既にインストール済み
)

REM ビルドファイル確認
echo.
echo [3/5] アプリケーションファイルを確認中...
if not exist "dist\public\index.html" (
    echo [INFO] ビルドファイルが見つかりません。ビルドを実行します...
    echo [EXEC] npm run build
    npm run build
    if errorlevel 1 (
        echo [ERROR] ビルドに失敗しました
        pause
        exit /b 1
    )
    echo [OK] ビルド完了
) else (
    echo [OK] アプリケーションファイルを確認しました
)

REM サーバーファイル確認
echo.
echo [4/5] サーバーファイルを確認中...
if not exist "server\index.local.cjs" (
    echo [ERROR] server\index.local.cjs が見つかりません
    echo [FIX] ファイルが破損している可能性があります
    pause
    exit /b 1
) else (
    echo [OK] server\index.local.cjs を確認しました
)

REM Ollama接続確認（オプション）
echo.
echo [5/5] Ollama接続を確認中（オプション）...
curl -s http://localhost:11434/api/tags >nul 2>&1
if errorlevel 1 (
    echo [WARN] Ollama接続失敗 - 基本機能のみ利用可能
    echo [INFO] AI機能を使用する場合:
    echo         1. https://ollama.ai/ からOllamaをダウンロード
    echo         2. ollama pull llama3.2:3b でモデルをダウンロード
) else (
    echo [OK] Ollama接続成功 - AI機能が利用可能です
)

echo.
echo ======================================================
echo                サーバー起動中...
echo ======================================================
echo.
echo [INFO] データ保存: メモリストレージ（一時保存）
echo [INFO] 起動後にブラウザが自動で開きます
echo [INFO] 黒いウィンドウ（このコンソール）は最小化可能
echo [INFO] 終了するには Ctrl+C を押してください
echo.

REM 環境変数設定
set NODE_ENV=local
set DEBUG=*

REM サーバー起動
echo [EXEC] node server\index.local.cjs
node server\index.local.cjs

REM 終了処理
echo.
echo ======================================================
echo            AIストーリービルダーが終了しました
echo ======================================================
echo.
pause