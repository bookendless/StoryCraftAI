# AIストーリービルダー EXEファイル作成手順

## 概要
このアプリケーションは、Windows用のEXEファイルとして配布可能なように完全に設定されています。Electronフレームワークを使用してデスクトップアプリケーションとして動作します。

## 前提条件
- Node.js (v18以上)
- Windows環境（EXEファイル作成時）
- Git Bash または WSL（build-electron.shスクリプト実行時）

## 重要な注意事項
**Replit環境ではEXEファイルのビルドができません。** ローカル環境（Windows PC）で以下の手順を実行してください。

## ローカル環境でのセットアップ

### 1. プロジェクトをローカルにダウンロード
```bash
# Replitからプロジェクトをダウンロードまたはクローン
git clone [your-replit-project-url]
cd [project-folder]
```

### 2. package.jsonの修正が必要
ローカル環境で以下の修正を行ってください：

**package.jsonに追加する内容：**
```json
{
  "name": "ai-story-builder",
  "version": "1.0.0",
  "description": "AIと共創するストーリービルダー - AI-powered collaborative story building application",
  "author": "Story Builder Team",
  "main": "electron/main.js",
  "homepage": "./",
  "devDependencies": {
    "electron": "^37.2.5",
    "electron-builder": "^26.0.12"
  }
}
```

**dependencies から devDependencies に移動が必要なパッケージ：**
- electron
- electron-builder

## ビルド手順

### ローカル環境でのビルド手順

#### ステップ1: 依存関係のインストール
```bash
npm install
```

#### ステップ2: フロントエンドビルド
```bash
npm run build
```

#### ステップ3: EXEファイル作成
```bash
# Windows EXE作成
npx electron-builder --config electron-builder.json --win --publish=never
```

#### 代替方法: 手動ビルドスクリプト
package.jsonを修正後：
```bash
# 実行権限を付与（Mac/Linux）
chmod +x build-electron.sh

# ビルド実行
./build-electron.sh
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
1. **"Package electron is only allowed in devDependencies"エラー**:
   - package.jsonで `electron` と `electron-builder` を `dependencies` から `devDependencies` に移動

2. **"description is missed"エラー**:
   - package.jsonに `description` と `author` フィールドを追加

3. **ビルドエラー**: 
   - `npm install` でパッケージを再インストール
   - Node.jsバージョンを確認（v18以上推奨）

4. **権限エラー**: 
   - Windows: 管理者権限でコマンドプロンプトを実行
   - Mac/Linux: `sudo` を使用

### Replit環境での制限
- Replit環境ではElectronのビルドができません
- プロジェクトをローカル環境にダウンロードしてビルドを実行してください

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