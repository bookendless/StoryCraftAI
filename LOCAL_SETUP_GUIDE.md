# ローカル環境でのアプリケーション起動ガイド

## 問題の解決方法

### ESModule エラーの修正

現在発生している問題：
- `require is not defined in ES module scope` エラー
- Electron が ES Module として扱われているため

### 解決手順

#### 1. package.json の修正
ローカル環境のpackage.jsonから `"type": "module"` を削除してください：

**修正前:**
```json
{
  "type": "module"
}
```

**修正後:**
```json
{
  // "type": "module" を削除または無効化
}
```

#### 2. 代替案: Electronファイルの拡張子変更
もしくは、electron/main.js を electron/main.cjs にリネームし、package.jsonのmainフィールドを更新：

```json
{
  "main": "electron/main.cjs"
}
```

## ローカル環境での起動方法

### 最も簡単な方法（推奨）- Windows版
ES Moduleの問題を完全に回避する方法：

```bash
# 1. 依存関係のインストール
npm install

# 2. Windows用起動スクリプトを使用
start-windows.bat

# 3. サーバーが起動したら、別のコマンドプロンプトでElectronを起動
npx electron electron/main-simple.js
```

**代替方法（PowerShell使用）:**
```powershell
# PowerShellの場合
$env:NODE_ENV="development"; npm run dev
```

**代替方法（cross-env使用）:**
```bash
# cross-envをインストール
npm install -g cross-env

# cross-envを使用してサーバー起動
cross-env NODE_ENV=development tsx server/index.ts
```

`main-simple.js` は CommonJS 形式で、ES Module の問題がありません。

### 方法1: 開発モードで起動
```bash
# 1. 依存関係のインストール
npm install

# 2. 最初のターミナル: サーバーを起動
npm run dev

# 3. 2つ目のターミナル: Electronを起動
npx electron electron/main.js
```

**重要:** サーバーが完全に起動してから（"serving on port 5000"が表示されてから）Electronを起動してください。

### 方法2: コンカレント起動（推奨）
```bash
# package.jsonにスクリプトを追加後
npm run electron:dev
```

**追加するスクリプト:**
```json
{
  "scripts": {
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:5000 && npx electron electron/main.js\""
  }
}
```

### 方法3: 手動起動
```bash
# 1. サーバー起動
npm run dev

# 2. ブラウザで確認
# http://localhost:5000 でアプリが動作することを確認

# 3. 別のターミナルでElectron起動
npx electron electron/main.js
```

## 必要な修正済みファイル

### 修正されたelectron/main.js（ES Module対応版）
ローカル環境で以下に置き換えてください：

```javascript
import { app, BrowserWindow, Menu, dialog } from 'electron';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let serverProcess;

function createWindow() {
  // メインウィンドウを作成
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    show: false,
  });

  // 省略（メニュー設定など）

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5000');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../client/dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
}

app.whenReady().then(createWindow);
```

## トラブルシューティング

### よくある問題と解決法

1. **Windows環境変数エラー（'NODE_ENV' は...認識されていません）**
   ```bash
   # 解決方法1: 用意されたバッチファイルを使用
   start-windows.bat
   
   # 解決方法2: PowerShellを使用
   $env:NODE_ENV="development"; tsx server/index.ts
   
   # 解決方法3: cross-envをインストール
   npm install -g cross-env
   cross-env NODE_ENV=development tsx server/index.ts
   ```

2. **`vite` コマンドが見つからない**
   ```bash
   npm install
   # または
   npm install -g vite
   ```

2. **ポート5000が使用中**
   ```bash
   # Windowsの場合
   netstat -ano | findstr :5000
   taskkill /PID [プロセスID] /F
   
   # 別のポートを使用
   PORT=3000 npm run dev
   ```

3. **Electronが起動しない**
   ```bash
   # Electronを個別にインストール
   npm install electron --save-dev
   
   # 直接実行
   npx electron --version
   npx electron electron/main.js
   ```

4. **データベース接続エラー**
   - 環境変数DATABASE_URLが設定されているか確認
   - PostgreSQLサービスが起動しているか確認

## 推奨開発環境

### エディタ
- VS Code with Electron extension
- WebStorm

### デバッグ
```bash
# Electronのデバッグモード
npx electron --inspect electron/main.js

# Chrome DevToolsでデバッグ可能
```

### ホットリロード
アプリケーションはViteのホットリロードに対応しており、コード変更時に自動でブラウザが更新されます。

## 次のステップ: ローカルLLM統合

ローカルLLM統合の準備として：
1. Ollama または LM Studio のインストール
2. ローカルモデル（Llama 2, CodeLlama等）のダウンロード
3. OpenAI APIエンドポイントをローカルに変更
4. モデル選択機能の実装

現在のOpenAI統合は簡単にローカルLLMに切り替え可能な設計になっています。