# AIストーリービルダー - 配布用ビルドガイド

個人PC配布用の実行ファイル作成手順です。

## 🎯 配布形式

### 1. Electronデスクトップアプリ（推奨）
- **Windows**: `.exe` インストーラー
- **macOS**: `.dmg` ディスクイメージ  
- **Linux**: `.AppImage` ポータブル実行ファイル

### 2. ポータブル版
- 圧縮ファイル（ZIP）でフォルダ配布
- Node.js環境必要

## 🔨 ビルド手順

### 前提条件の確認
```bash
# Node.js 18.x以上
node --version

# 依存関係インストール済み
npm install
```

### 1. フロントエンド＋バックエンドビルド
```bash
# 本体アプリケーションのビルド
npm run build
```

### 2. Electronアプリビルド
```bash
# 全プラットフォーム用（時間がかかります）
npm run build:electron

# Windows専用（速い）
npx electron-builder --win

# macOS専用
npx electron-builder --mac

# Linux専用  
npx electron-builder --linux
```

### 3. ビルド結果の確認
```bash
# 生成された実行ファイルを確認
ls -la dist-electron/
```

出力例：
```
dist-electron/
├── AIストーリービルダー Setup 1.0.0.exe    # Windowsインストーラー
├── AIストーリービルダー-1.0.0.dmg           # macOSディスクイメージ
└── AIストーリービルダー-1.0.0.AppImage       # Linux実行ファイル
```

## 📦 配布ファイル構成

### Electronアプリ配布（推奨）
```
配布用パッケージ/
├── AIストーリービルダー Setup 1.0.0.exe
├── LOCAL_SETUP_GUIDE.md
└── README_配布版.txt
```

### ポータブル版配布
```
AIストーリービルダー_ポータブル/
├── client/dist/          # ビルド済みフロントエンド
├── server/               # バックエンドファイル  
├── electron/             # Electronファイル
├── node_modules/         # 必要な依存関係のみ
├── package.json
├── local.db              # 空のデータベース
├── LOCAL_SETUP_GUIDE.md
└── start.bat            # Windows起動スクリプト
```

## 📋 配布用README作成

### README_配布版.txt
```txt
=== AIストーリービルダー v1.0.0 ===

【必要な準備】
1. Ollamaのインストール（AI機能用）
   - https://ollama.ai/ からダウンロード
   - llama3.2:3b モデルを推奨
   
2. このアプリの起動
   - EXEファイルをダブルクリック
   - 初回起動時は少し時間がかかります

【使い方】
- 新しいプロジェクト作成から開始
- キャラクター設定でAI補完を活用
- プロット構成でAI提案を参考に

【トラブル時】
- LOCAL_SETUP_GUIDE.md を参照
- Ollamaが起動しているか確認
- ウイルス対策ソフトの除外設定

【データ保存場所】
- プロジェクトデータは同じフォルダの local.db に保存
- バックアップ推奨

サポート: [連絡先情報]
```

## 🚀 自動配布スクリプト

### build-and-package.sh（macOS/Linux）
```bash
#!/bin/bash
echo "AIストーリービルダー配布パッケージ作成中..."

# 1. クリーンビルド
rm -rf dist/ dist-electron/
npm run build
npm run build:electron

# 2. 配布フォルダ作成
mkdir -p release/
cp dist-electron/*.exe release/ 2>/dev/null || true
cp dist-electron/*.dmg release/ 2>/dev/null || true  
cp dist-electron/*.AppImage release/ 2>/dev/null || true
cp LOCAL_SETUP_GUIDE.md release/
cp DEPLOYMENT_INSTRUCTIONS.md release/

echo "配布ファイルがreleaseフォルダに作成されました"
ls -la release/
```

### build-and-package.bat（Windows）
```batch
@echo off
echo AIストーリービルダー配布パッケージ作成中...

REM 1. クリーンビルド
if exist dist rmdir /s /q dist
if exist dist-electron rmdir /s /q dist-electron
call npm run build
call npm run build:electron

REM 2. 配布フォルダ作成
if not exist release mkdir release
copy dist-electron\*.exe release\ >nul 2>&1
copy LOCAL_SETUP_GUIDE.md release\
copy DEPLOYMENT_INSTRUCTIONS.md release\

echo 配布ファイルがreleaseフォルダに作成されました
dir release\
pause
```

## 🔒 セキュリティ考慮事項

### コード署名（オプション）
```bash
# Windows用証明書での署名（有料証明書必要）
npx electron-builder --win --publish=never --config.win.certificateFile=cert.p12

# macOS用証明書での署名（Apple Developer必要）
npx electron-builder --mac --publish=never --config.mac.identity="Developer ID Application: Your Name"
```

### ウイルス対策ソフト対応
- **問題**: 実行ファイルが誤検知される場合
- **対策**: 主要ウイルス対策ソフトへのホワイトリスト申請
- **配布時**: README_配布版.txtに除外設定手順を記載

## 📊 配布後のサポート

### ログ収集方法
```bash
# アプリログの場所（Windows）
%APPDATA%\AIストーリービルダー\logs\

# アプリログの場所（macOS）  
~/Library/Logs/AIストーリービルダー/

# アプリログの場所（Linux）
~/.config/AIストーリービルダー/logs/
```

### よくある問題と解決策
1. **「Ollamaに接続できません」**
   - Ollamaサービスの起動確認
   - ポート11434の確認
   
2. **「データベースエラー」**
   - local.dbファイルの権限確認
   - アプリ再起動で自動修復
   
3. **「起動しない」**
   - ウイルス対策ソフトの確認
   - 管理者権限での実行

## 📈 アップデート配布

### バージョン管理
```bash
# package.jsonのバージョン更新
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.0 → 1.1.0  
npm version major  # 1.0.0 → 2.0.0
```

### 差分アップデート
- **完全版**: 新規インストーラー配布
- **差分版**: アプリ内アップデート機能（将来対応予定）

---

**配布用パッケージ作成完了後**  
ユーザーテストを実施し、LOCAL_SETUP_GUIDE.mdの手順が正しく機能することを確認してください。