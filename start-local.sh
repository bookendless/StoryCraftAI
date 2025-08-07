#!/bin/bash

echo "======================================================"
echo "  AIストーリービルダー ローカル版 - Unix/Linux起動"
echo "======================================================"
echo ""

# Node.jsがインストールされているかチェック
echo "[1/4] Node.js環境を確認中..."
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.jsがインストールされていません。"
    echo "        Node.js 18.x以上をインストールしてください。"
    echo "        https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
echo "[OK] Node.js $NODE_VERSION が見つかりました"
echo "[OK] npm $NPM_VERSION が利用可能です"

# スクリプトのディレクトリに移動
cd "$(dirname "$0")"
echo "[INFO] 作業ディレクトリ: $(pwd)"

# 依存関係がインストールされているかチェック
echo ""
echo "[2/4] 依存関係を確認中..."
if [ ! -d "node_modules" ]; then
    echo "[INFO] 初回起動: 依存関係をインストールします"
    echo "[EXEC] npm install --production"
    npm install --production
    if [ $? -ne 0 ]; then
        echo "[ERROR] 依存関係のインストールに失敗しました。"
        exit 1
    fi
    echo "[OK] 依存関係のインストール完了"
else
    echo "[OK] 依存関係は既にインストール済み"
fi

# ビルドファイルが存在するかチェック
echo ""
echo "[3/4] アプリケーションファイルを確認中..."
if [ ! -f "dist/public/index.html" ]; then
    echo "[INFO] ビルドファイルが見つかりません。ビルドを実行します..."
    echo "[EXEC] npm run build"
    npm run build
    if [ $? -ne 0 ]; then
        echo "[ERROR] ビルドに失敗しました。"
        exit 1
    fi
    echo "[OK] ビルド完了"
else
    echo "[OK] アプリケーションファイルを確認しました"
fi

# Ollama接続確認（オプション）
echo ""
echo "[4/4] Ollama接続を確認中（オプション）..."
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "[OK] Ollama接続成功 - AI機能が利用可能です"
else
    echo "[WARN] Ollama接続失敗 - 基本機能のみ利用可能"
    echo "[INFO] AI機能を使用する場合:"
    echo "       1. https://ollama.ai/ からOllamaをダウンロード"
    echo "       2. ollama pull llama3.2:3b でモデルをダウンロード"
fi

echo ""
echo "======================================================"
echo "               サーバー起動中..."
echo "======================================================"
echo ""
echo "[INFO] データ保存: メモリストレージ（一時保存）"
echo "[INFO] サーバー起動後、ブラウザで http://localhost:5000 にアクセス"
echo "[INFO] 終了するには Ctrl+C を押してください"
echo ""

# ローカルサーバーを起動
echo "[EXEC] node server/index.local.cjs"
export NODE_ENV=local
node server/index.local.cjs

echo ""
echo "======================================================"
echo "         AIストーリービルダーが終了しました"
echo "======================================================"