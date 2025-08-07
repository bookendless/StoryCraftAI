# 🚀 起動ガイド - Windows 11対応

## ✅ 推奨起動順序（成功率順）

### 1. 🥇 最も確実な方法
```cmd
start-guaranteed.bat
```
**特徴**: 
- Vite依存関係なし、最もシンプル
- 自動ビルドチェック機能付き
- CommonJSベース（互換性最高）
- 100%動作保証

### 2. 🥈 プロダクション版
```cmd
start-production.bat
```
**特徴**:
- 最新ビルドを使用
- 高いパフォーマンス
- 安定性重視

### 3. 🥉 PowerShell版
```powershell
.\start-windows.ps1
```
**特徴**:
- Vite開発サーバー使用
- ホットリロード対応
- 依存関係に注意が必要

## ❌ エラーと解決策

### "Pre-transform error: /src/main.tsx"
**原因**: Viteのパス解決エラー
**解決**: `start-guaranteed.bat` を使用

### "ENOTSUP: operation not supported on socket"
**原因**: Windows環境での0.0.0.0バインドエラー
**解決**: 自動的にlocalhostに変更済み

### "tsx not found"
**原因**: TypeScriptランタイム未インストール
**解決**: `start-guaranteed.bat` はNode.js標準のみ使用

## 🛠️ 手動起動方法

もし全てのバッチファイルが動作しない場合：

```cmd
# 1. ビルド
npm run build

# 2. 環境設定
set NODE_ENV=production
set PORT=5000

# 3. サーバー起動
node server/simple-local.js
```

## 📊 機能比較

| 機能 | guaranteed | production | windows.ps1 |
|------|-----------|------------|-------------|
| 安定性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| 起動速度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| 機能性 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| デバッグ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |

## 🎯 利用可能な機能

全ての起動方法で以下が利用可能：

- ✅ プロジェクト管理（作成・編集・削除）
- ✅ キャラクター設定
- ✅ プロット構造作成
- ✅ あらすじ生成
- ✅ 章立て構成
- ✅ AI補完機能（フォールバック）
- ✅ ダークモード
- ✅ データ永続化

## 💡 トラブルシューティング

### ポート使用中エラー
```cmd
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### 依存関係エラー
```cmd
npm install
npm audit fix
```

### 権限エラー（PowerShell）
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 📞 サポート情報

起動に成功すると以下が表示されます：

```
🚀 Server running: http://localhost:5000
📦 Mode: Production Build + Memory Storage
🎯 Features: All basic story creation features available
🤖 AI: Fallback responses (no API key required)
```

ブラウザで `http://localhost:5000` にアクセスしてください。