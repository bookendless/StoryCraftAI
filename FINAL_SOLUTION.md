# 🚀 Windows 11 最終解決方法

## ❌ 根本的な問題

- Windows 11環境でのESModule vs CommonJS競合
- Node.js v24.5.0でのモジュール解決問題
- express等の依存関係パス解決エラー

## ✅ 推奨解決順序

### 1. PowerShell版（推奨）
```powershell
.\start-powershell.ps1
```
**特徴**: 
- tsx自動インストール機能
- フォールバック機能付き
- エラー処理完備

### 2. スタンドアローン版
```cmd
start-standalone.cmd
```
**特徴**:
- 完全バンドル版サーバー作成
- 依存関係を全て含有
- CommonJS形式で確実動作

### 3. 手動TypeScript実行
```cmd
# 依存関係インストール
npm install
npm install -g tsx

# 環境設定
set NODE_ENV=development
set VITE_LOCAL=true
set DATABASE_URL=
set GEMINI_API_KEY=
set PORT=5000

# 直接実行
tsx server/index.ts
```

## 🔧 トラブルシューティング完全版

### Error: Cannot find module 'express'
**原因**: Node.jsのモジュール解決パスが正しく設定されていない
**解決**: PowerShell版を使用（自動対応済み）

### Error: ERR_MODULE_NOT_FOUND
**原因**: ESModuleとCommonJSの混在
**解決**: スタンドアローン版を使用（完全バンドル）

### tsx not found
**原因**: TypeScript実行環境未インストール
**解決**: PowerShell版が自動インストール

### ENOTSUP: operation not supported on socket
**原因**: Windows環境での0.0.0.0バインドエラー
**解決**: 全バージョンでlocalhost使用済み

## 📊 成功確認項目

起動成功時の表示例：
```
[express] serving on port 5000 (host: localhost)
```

ブラウザアクセス：
```
http://localhost:5000
```

## 🎯 利用可能機能

全起動方法で以下が利用可能：
- ✅ プロジェクト管理
- ✅ キャラクター設定（AI補完）
- ✅ プロット構造作成
- ✅ あらすじ自動生成
- ✅ 章立て・エピソード
- ✅ 下書き生成
- ✅ ダークモード
- ✅ データ永続化

## 💡 最終推奨事項

1. **まず試す**: `start-powershell.ps1`
2. **それでも失敗**: `start-standalone.cmd`  
3. **手動実行**: 上記の手動コマンド

PowerShell版は最も包括的な解決策を提供します。