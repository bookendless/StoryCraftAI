# AIストーリービルダー - ローカル起動ガイド

ローカルPC上でAIストーリービルダーを起動し、OllamaローカルLLMを使用する手順です。

## 📋 前提条件

### 1. Node.js（推奨版：18.x以上）
```bash
# Node.jsのバージョン確認
node --version
npm --version
```

### 2. Ollama（ローカルLLM）
1. [Ollama公式サイト](https://ollama.ai/)からダウンロード・インストール
2. 推奨モデルをダウンロード：
```bash
# 軽量モデル（3B）- 推奨
ollama pull llama3.2:3b

# 中程度モデル（7B）- より高性能
ollama pull llama3.2:7b

# 他の利用可能モデル確認
ollama list
```

## 🚀 セットアップ手順

### 1. プロジェクトのダウンロード
配布用ZIPファイルを任意のフォルダに展開してください。

### 2. Node.js のインストール（必須）
1. [Node.js公式サイト](https://nodejs.org/)からダウンロード
2. **推奨版（LTS）** をインストール（18.x以上）
3. インストール確認：
```bash
# コマンドプロンプト／PowerShellで確認
node --version
npm --version
```

### 3. Ollama のインストール（AI機能用）
1. [Ollama公式サイト](https://ollama.ai/)からダウンロード
2. Windowsインストーラーを実行
3. 推奨モデルをダウンロード：
```bash
# コマンドプロンプトで実行
ollama pull llama3.2:3b
```

### 4. アプリケーションの起動
**Windows**: `start-local.bat` をダブルクリック
**その他**: ターミナルで `./start-local.sh` を実行

初回起動時は自動的に：
- 依存関係のインストール
- アプリケーションのビルド
- データベースの初期化
が実行されます。

## 🖥️ 起動方法

### 方法1: 開発モード（推奨）
```bash
# ローカル環境でWebアプリとして起動
npm run dev:local
```
→ ブラウザで `http://localhost:5000` にアクセス

### 方法2: Electronアプリ（デスクトップ版）
```bash
# Electronデスクトップアプリとして起動
npm run electron:dev
```
→ デスクトップアプリが自動的に起動

### 方法3: 実行ファイル作成（配布用）
```bash
# ビルド実行
npm run build
npm run build:electron

# dist-electronフォルダに実行ファイルが生成される
```

## 🔧 設定項目

### ローカル環境設定ファイル
プロジェクトルートに `.env.local` を作成（オプション）：
```bash
# ポート番号変更（デフォルト：5000）
PORT=5000

# Ollama サーバーURL（デフォルト：localhost:11434）
OLLAMA_HOST=http://localhost:11434

# 使用モデル指定（デフォルト：llama3.2:3b）
DEFAULT_MODEL=llama3.2:3b
```

### Ollamaモデル管理
```bash
# モデルのダウンロード
ollama pull [model-name]

# インストール済みモデル一覧
ollama list

# モデルの削除
ollama rm [model-name]

# Ollamaサービス停止/起動
ollama serve  # サービス開始
```

## 📊 動作確認

### 1. アプリケーションの起動確認
- アプリが正常に起動する
- プロジェクト作成画面が表示される

### 2. データベース接続確認
- プロジェクトの作成・保存ができる
- キャラクター設定が保存される

### 3. AI機能確認
- ヘルスチェックAPI: `http://localhost:5000/api/health`
- キャラクター補完ボタンが動作する
- プロット生成ボタンが動作する

レスポンス例：
```json
{
  "status": "ok",
  "environment": "local",
  "database": "sqlite",
  "ollama": {
    "connected": true,
    "models": ["llama3.2:3b"]
  }
}
```

## 🔍 トラブルシューティング

### Ollamaに接続できない
```bash
# Ollamaサービス状態確認
ps aux | grep ollama

# Ollamaの再起動
ollama serve

# ポート確認
netstat -an | grep 11434
```

### データベースエラー
```bash
# データベースファイルの権限確認
ls -la local.db

# データベース再初期化
rm local.db
npm run db:push:local
```

### ポート競合エラー
```bash
# ポート使用状況確認
lsof -i :5000

# 別のポートを指定
PORT=3000 npm run dev:local
```

### メモリ不足（大きなモデル使用時）
- より軽量なモデルに変更：`llama3.2:3b` → `llama3.2:1b`
- システムメモリを増やす
- 不要なアプリケーションを終了

## 📚 追加情報

### ディレクトリ構成
```
ai-story-builder/
├── client/          # フロントエンド（React）
├── server/          # バックエンド（Express）
│   ├── index.local.ts      # ローカル版サーバー
│   ├── db.local.ts         # SQLite設定
│   ├── storage.local.ts    # ローカルストレージ
│   └── services/ollama.ts  # Ollama統合
├── electron/        # Electronアプリ
├── local.db         # SQLiteデータベース（自動生成）
└── dist-electron/   # ビルド済み実行ファイル
```

### データの保存場所
- **プロジェクトデータ**: `local.db`（SQLite）
- **アップロード画像**: 現在は非対応（将来対応予定）
- **設定ファイル**: `.env.local`

### 推奨スペック
- **メモリ**: 8GB以上（16GB推奨）
- **ストレージ**: 10GB以上の空き容量
- **プロセッサ**: Intel i5/AMD Ryzen 5以上

### セキュリティ注意事項
- ローカル環境のため外部ネットワーク接続不要
- データは全てPC内に保存される
- Ollamaモデルは初回ダウンロード時のみインターネット接続必要

## 📞 サポート

問題が発生した場合：
1. このガイドのトラブルシューティングを確認
2. ログファイルを確認（コンソール出力）
3. Ollama公式ドキュメントを参照
4. 必要に応じて開発者に連絡

---

**AIストーリービルダー v1.0.0**  
ローカルAI搭載の小説創作支援アプリケーション