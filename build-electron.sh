#!/bin/bash

echo "AIストーリービルダーをelectronアプリとしてビルドしています..."

# 1. クライアントビルド
echo "1. フロントエンドをビルド中..."
npm run build

# 2. electronビルド準備
echo "2. Electronビルドを準備中..."
mkdir -p dist-electron

# 3. electron-builderでexe作成
echo "3. Windows実行ファイルを作成中..."
npx electron-builder --config electron-builder.json --win

echo "ビルド完了！dist-electronフォルダにexeファイルが作成されました。"