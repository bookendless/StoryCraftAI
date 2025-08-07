# AIストーリービルダー - ローカル版

Windows 11完全対応のローカル実行版AIストーリー作成アプリケーション

## クイックスタート

### 1. 必要なソフトウェア
- **Node.js 18.x以上** - [nodejs.org](https://nodejs.org/) からダウンロード

### 2. 起動方法

**推奨: PowerShellから起動**
```powershell
npm install
npm run build
node server/index.local.cjs
```

**Windows バッチファイル**
- `start-local-simple.bat` をダブルクリック（英語メッセージ版）

**Unix/Linux**
```bash
./start-local.sh
```

### 3. アプリにアクセス
- ブラウザで http://localhost:5000 を開く
- または自動でブラウザが起動

## 特徴

- **完全ローカル実行**: インターネット不要（AI機能は除く）
- **メモリストレージ**: データベース不要の軽量設計
- **Windows 11対応**: 文字エンコーディング問題を解決
- **AIサポート**: 基本補完機能 + Ollama連携
- **日本語対応**: 完全日本語インターフェース

## アプリ機能

### 🎯 6段階の物語作成プロセス
1. **プロジェクト設定** - ジャンル・テーマ選択
2. **キャラクター開発** - 登場人物の詳細設定
3. **プロット構成** - 物語構造の設計
4. **あらすじ作成** - 物語の要約
5. **章立て** - 章構成の計画
6. **エピソード展開** - 詳細な場面設定

### 🤖 AI機能
- **キャラクター補完**: 性格・背景の自動生成
- **プロット提案**: 構造的な物語展開の提案
- **あらすじ生成**: キャラクター・プロット情報から自動作成
- **Ollama連携**: ローカルLLMでより高度な補完（オプション）

## データについて

⚠️ **重要**: 現在はメモリストレージのため、アプリ終了時にデータは消失します
- 重要な内容は別途保存してください
- 将来のアップデートで永続保存機能を追加予定

## トラブルシューティング

### Windows 11でバッチファイルが文字化けする
→ [MANUAL_STARTUP.md](MANUAL_STARTUP.md) の手動起動方法を参照

### 「Node.jsが見つかりません」
→ Node.jsをインストール後、コマンドプロンプトを再起動

### サイドバーにアクセスできない
→ プロジェクトを作成し、キャラクター設定完了後に表示されます

### AI機能が動作しない
- **基本機能**: すぐに利用可能（簡易的な補完）
- **Ollama機能**: 別途Ollamaのインストールが必要

## Ollama設定（上級者向け）

高度なAI機能を使用する場合：

1. [Ollama](https://ollama.ai/)をダウンロード・インストール
2. モデルをダウンロード：
```bash
ollama pull llama3.2:3b
```
3. アプリを再起動

## システム要件

- **OS**: Windows 11/10, macOS, Linux
- **Node.js**: v18.0.0以上
- **メモリ**: 4GB以上
- **ストレージ**: 2GB以上の空き容量

## ファイル構成

```
├── server/
│   ├── index.local.cjs    # ローカルサーバー（CommonJS版）
│   └── services/          # AI・データベースサービス
├── client/                # Reactフロントエンド
├── shared/                # 共有型定義
├── start-local.sh         # Unix/Linux起動スクリプト
├── start-local-simple.bat # Windows起動スクリプト（英語版）
└── MANUAL_STARTUP.md      # 手動起動ガイド
```

## 開発・技術情報

- **フロントエンド**: React 18 + TypeScript + Tailwind CSS
- **バックエンド**: Node.js + Express (CommonJS)
- **AI**: Gemini API + Ollama連携
- **ストレージ**: メモリストレージ（一時保存）

## 更新履歴

### v1.0.0 (2025年1月)
- Windows 11完全対応
- 文字エンコーディング問題修正
- メモリストレージ実装
- AI補完機能追加
- 手動起動方法整備

## サポート

問題が発生した場合：
1. [WINDOWS_TROUBLESHOOTING.md](WINDOWS_TROUBLESHOOTING.md) を確認
2. [MANUAL_STARTUP.md](MANUAL_STARTUP.md) の手動起動を試行
3. Node.js v18以上がインストールされていることを確認

---

© 2025 AIストーリービルダー