# Windows クイックスタートガイド

## 🎯 最も確実な起動方法

### 方法1: PowerShellスクリプト（推奨）

```powershell
# PowerShellで実行
cd "C:\Users\Uniso\Desktop\StoryCraftAI20"
.\start-windows.ps1
```

### 方法2: 完全セットアップ

```cmd
# コマンドプロンプトで実行
cd "C:\Users\Uniso\Desktop\StoryCraftAI20"  
install-and-start.cmd
```

### 方法3: 手動起動（確実）

```cmd
# Step 1: プロジェクトフォルダに移動
cd "C:\Users\Uniso\Desktop\StoryCraftAI20"

# Step 2: 依存関係をインストール
npm install

# Step 3: tsx をグローバルインストール
npm install -g tsx

# Step 4: 環境変数を設定して起動
set NODE_ENV=development
set VITE_LOCAL=true
set DATABASE_URL=
tsx server/index.ts
```

## ⚡ PowerShell実行ポリシーエラーの解決

PowerShellで実行ポリシーエラーが出る場合：

```powershell
# 管理者権限でPowerShellを開く
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# その後、通常のPowerShellで実行
.\start-windows.ps1
```

## 🔧 トラブルシューティング

### エラー: バッチファイルが認識されない
**原因**: PowerShellは現在ディレクトリのバッチファイルを自動実行しない
**解決**: `.\ファイル名` を使用

### エラー: tsx が見つからない
**解決**: 
```cmd
npm install -g tsx
```

### エラー:権限不足
**解決**: 
- コマンドプロンプトを管理者として実行
- またはPowerShellを管理者として実行

### エラー: ポート5000が使用中
**解決**:
```cmd
netstat -ano | findstr :5000
taskkill /PID <プロセスID> /F
```

## ✅ 成功時の表示

正常起動時は以下が表示されます：

```
[express] serving on port 5000
```

その後、ブラウザで http://localhost:5000 にアクセスできます。

## 🎮 アプリケーション機能

起動成功後は以下の機能が利用可能です：
- プロジェクト作成・管理
- キャラクター設定
- プロット構築  
- あらすじ作成
- 章立て・エピソード作成
- 下書き生成
- AI補完機能（基本 + Ollama対応）