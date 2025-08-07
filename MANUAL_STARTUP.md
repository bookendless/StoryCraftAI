# 手動起動ガイド - Windows 11対応

## バッチファイルが閉じてしまう場合の解決方法

### 方法1: ビルド版バッチファイル（推奨）

```cmd
# 最も確実な方法
start-build.bat
```

### 方法1-2: 簡易バッチファイル

```cmd
# 自動フォールバック付き
start-simple.bat
```

### 方法2: ビルド版を使用

```cmd
# プロジェクトフォルダで実行
cd "C:\Users\Uniso\Desktop\StoryCraftAI20"
npm run build
set NODE_ENV=development
set VITE_LOCAL=true
set DATABASE_URL=
node dist/index.js
```

### 方法3: バッチファイル使用

```cmd
start-dev-local-nodejs.bat
```

### 方法4: PowerShell（tsx不要）

```powershell
cd "C:\Users\Uniso\Desktop\StoryCraftAI20"
npm run build
$env:NODE_ENV="development"
$env:VITE_LOCAL="true"
$env:DATABASE_URL=""
node dist/index.js
```

### 方法3: デバッグ版バッチファイル

```
start-dev-local-debug.bat
```
このファイルは詳細なログを出力し、問題の原因を特定できます。

### 方法4: 簡易版バッチファイル

```
start-dev-local-simple.bat
```
最小限の処理で起動します。

## トラブルシューティング

### 問題: tsxが見つからない
**原因**: 
- TypeScriptランタイム（tsx）がグローバルにインストールされていない
- ローカルのnode_modulesにtsxがない

### 問題: バッチファイルが瞬間的に閉じる
**原因**: 
- 既存のNodeプロセスとの競合
- 環境変数の問題
- npmの依存関係の問題
- tsxの不足

**解決策**:
1. タスクマネージャーでNode.jsプロセスを確認・終了
2. PowerShellまたはコマンドプロンプトで手動実行
3. `startup.log`ファイルでエラーログを確認

### 問題: ポート5000が使用中
```cmd
netstat -ano | findstr :5000
taskkill /PID <プロセスID> /F
```

### 問題: npm install失敗
```cmd
npm cache clean --force
npm install
```

## 確実な起動手順

1. **既存プロセス確認**
   ```cmd
   tasklist | findstr node
   ```

2. **プロジェクトフォルダに移動**
   ```cmd
   cd /d "プロジェクトのパス"
   ```

3. **依存関係インストール**
   ```cmd
   npm install
   ```

4. **開発サーバー起動**
   ```cmd
   npx cross-env NODE_ENV=development VITE_LOCAL=true tsx server/index.ts
   ```

5. **ブラウザでアクセス**
   http://localhost:5000

## 成功時の表示例

```
8:48:37 AM [express] serving on port 5000
```

この表示が出れば正常に起動しています。