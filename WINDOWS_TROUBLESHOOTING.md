# Windows トラブルシューティング

## ❌ 一般的なエラーと解決方法

### Error: listen ENOTSUP: operation not supported on socket 0.0.0.0:5000

**原因**: Windows環境で `0.0.0.0` ホストバインドがサポートされていない

**解決策**: サーバーコードで自動的に `localhost` に変更済み

**確認方法**:
- `start-windows.ps1` または `install-and-start.cmd` を使用
- ログに `serving on port 5000 (host: localhost)` と表示される

### Error: tsx not found

**原因**: TypeScriptランタイムがインストールされていない

**解決策**:
```cmd
npm install -g tsx
```

または

```cmd
# ビルド版を使用
npm run build
node dist/index.js
```

### Error: PowerShell execution policy

**原因**: PowerShellの実行ポリシー制限

**解決策**:
```powershell
# 管理者権限で実行
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Error: Port 5000 already in use

**原因**: 他のプロセスがポート5000を使用中

**解決策**:
```cmd
# 使用プロセスを確認
netstat -ano | findstr :5000

# プロセスを終了
taskkill /PID <プロセスID> /F
```

### Error: GEMINI_API_KEY required

**解決済み**: API キーなしでもローカル環境で動作するように修正済み

**フォールバック機能**:
- 基本的なキャラクター生成
- プロット構造作成
- あらすじ生成
- 章構成作成

## ✅ 推奨起動手順

### 1. PowerShell方式（推奨）
```powershell
cd "C:\Users\Uniso\Desktop\StoryCraftAI20"
.\start-windows.ps1
```

### 2. コマンドプロンプト方式
```cmd
cd "C:\Users\Uniso\Desktop\StoryCraftAI20"
install-and-start.cmd
```

### 3. 手動起動方式
```cmd
cd "C:\Users\Uniso\Desktop\StoryCraftAI20"
npm install
npm install -g tsx
set NODE_ENV=development
set VITE_LOCAL=true
set DATABASE_URL=
set GEMINI_API_KEY=
tsx server/index.ts
```

## 🔧 追加の最適化

### Windows 11特有の問題

1. **文字エンコーディング**
   - すべてのバッチファイルはUTF-8で保存
   - 日本語メッセージは英語に統一済み

2. **ネットワーク設定**
   - `localhost` バインドで安定性向上
   - `reusePort` オプションをWindows環境で無効化

3. **Node.js最適化**
   - Node.js v24.5.0対応
   - ESModules完全サポート

## 📊 動作確認チェックリスト

- [ ] Node.js v20以上がインストール済み
- [ ] プロジェクトフォルダに移動済み  
- [ ] バッチファイルが `.\` プレフィックスで実行可能
- [ ] ポート5000が空いている
- [ ] `[express] serving on port 5000 (host: localhost)` と表示される
- [ ] ブラウザで `http://localhost:5000` にアクセス可能
- [ ] Vite開発サーバーが接続済み（`[vite] connected.`）

## 🎯 成功時の表示例

```
====================================
 AI Story Builder - Windows Startup
====================================

Node.js version: v24.5.0
Building project...
Starting Server
====================================

URL: http://localhost:5000
Environment: Development with Memory Storage

[express] serving on port 5000 (host: localhost)
[vite] connecting...
[vite] connected.
```