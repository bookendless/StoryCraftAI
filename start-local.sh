#!/bin/bash

echo "AIストーリービルダー（ローカル版）を起動しています..."
echo ""

# Node.jsがインストールされているかチェック
if ! command -v node &> /dev/null; then
    echo "エラー: Node.jsがインストールされていません。"
    echo "Node.js 18.x以上をインストールしてください。"
    echo "https://nodejs.org/"
    exit 1
fi

# スクリプトのディレクトリに移動
cd "$(dirname "$0")"

# 依存関係がインストールされているかチェック
if [ ! -d "node_modules" ]; then
    echo "依存関係をインストールしています..."
    npm install
    if [ $? -ne 0 ]; then
        echo "エラー: 依存関係のインストールに失敗しました。"
        exit 1
    fi
fi

# ビルドファイルが存在するかチェック
if [ ! -d "dist" ]; then
    echo "アプリケーションをビルドしています..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "エラー: ビルドに失敗しました。"
        exit 1
    fi
fi

# データベースの初期化は不要（メモリストレージ使用）
echo "データベース: メモリストレージを使用（データは一時保存）"

echo ""
echo "================================"
echo " AIストーリービルダー 起動中..."
echo "================================"
echo ""
echo "Ollamaが起動していることを確認してください:"
echo "- Ollama をインストール: https://ollama.ai/"
echo "- モデルをダウンロード: ollama pull llama3.2:3b"
echo ""
echo "サーバー起動後、ブラウザで http://localhost:5000 にアクセス"
echo ""
echo "終了するには Ctrl+C を押してください。"
echo ""

# ローカルサーバーを起動
export NODE_ENV=local
node server/index.local.cjs