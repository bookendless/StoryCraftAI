# AIストーリービルダー EXEファイル作成手順

## 概要
このアプリケーションは、Windows用のEXEファイルとして配布可能なように完全に設定されています。Electronフレームワークを使用してデスクトップアプリケーションとして動作します。

## 前提条件
- Node.js (v18以上)
- Windows環境（EXEファイル作成時）
- Git Bash または WSL（build-electron.shスクリプト実行時）

## ビルド手順

### 方法1: 自動ビルドスクリプト使用
```bash
# 実行権限を付与
chmod +x build-electron.sh

# ビルド実行
./build-electron.sh
```

### 方法2: 手動ビルド
```bash
# 1. フロントエンドビルド
npm run build

# 2. Windows EXE作成
npx electron-builder --config electron-builder.json --win
```

## 出力ファイル
- ビルド完了後、`dist-electron/` フォルダに以下が作成されます：
  - `AIストーリービルダー Setup 1.0.0.exe` - インストーラー
  - `win-unpacked/` - アンパック版アプリケーション

## アプリケーション機能
- 完全日本語対応
- AIを活用したストーリー作成支援
- ローカルデータベース（PostgreSQL）対応
- ネイティブメニューシステム
- キーボードショートカット対応

## 設定ファイル

### electron-builder.json の主要設定
- **appId**: `com.storybuilder.aiwriter`
- **productName**: `AIストーリービルダー`
- **出力ディレクトリ**: `dist-electron`
- **対象プラットフォーム**: Windows (x64)
- **インストーラー形式**: NSIS

### 含まれるファイル
- フロントエンド（React + Vite）
- バックエンドサーバー（Express.js）
- 共有スキーマ
- アセット（アイコンなど）

## トラブルシューティング

### よくある問題
1. **ビルドエラー**: `npm install` でパッケージを再インストール
2. **権限エラー**: 管理者権限でコマンドプロンプトを実行
3. **依存関係エラー**: Node.jsバージョンを確認（v18以上推奨）

### デバッグモード
開発時はElectronアプリを直接実行可能：
```bash
# 開発モード（サーバーとElectronを同時起動）
npm run dev &
electron electron/main.js
```

## 配布
- 作成されたEXEファイルは他のWindowsマシンで実行可能
- インストーラーはデスクトップショートカットとスタートメニューエントリを作成
- アンインストールも標準的なWindows手順で可能

## セキュリティ
- nodeIntegration: false
- contextIsolation: true  
- enableRemoteModule: false
- 新しいウィンドウ作成を制限

## アイコン設定
- Windows: `assets/icon.ico`
- macOS: `assets/icon.icns`
- Linux: `assets/icon.png`

現在SVGアイコンが用意されており、必要に応じてICO/ICNS形式に変換可能です。