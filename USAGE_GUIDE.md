# ストーリービルダー使用ガイド

## 機能を完全に利用するための起動方法

### プレビュー版と同等の機能を使うには

**start-dev-local.bat** を使用してください：

```batch
# Windows
start-dev-local.bat

# コマンドライン
npm run dev:local
```

### 各起動方法の違い

| 起動方法 | 機能レベル | 説明 |
|---------|-----------|------|
| **start-dev-local.bat** | 🟢 完全 | Vite開発サーバー使用。プレビュー版と同等 |
| start-local-simple.bat | 🟡 制限あり | 静的ファイル提供。基本機能のみ |
| npm run dev | 🟢 完全 | Replit環境用（データベース必要） |

### 必要なシステム要件

- Node.js 18以上
- npm
- Windows 10/11（推奨）

### トラブルシューティング

#### プロジェクトが表示されない
→ start-dev-local.batを使用してください

#### サイドバーナビゲーションが動かない  
→ start-dev-local.batを使用してください

#### AI機能が動作しない
→ start-dev-local.batを使用してください

#### Ollamaを使用する場合
1. Ollamaをインストール
2. `ollama pull llama3.2:3b`
3. start-dev-local.batで起動

### 開発モードの利点

- ホットリロード（コードが自動更新）
- フル機能AI補完
- リアルタイムデバッグ
- プレビュー版と同じ体験