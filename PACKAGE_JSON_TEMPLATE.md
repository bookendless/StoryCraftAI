# EXEビルド用 package.json 修正テンプレート

ローカル環境でEXEファイルを作成するために、package.jsonを以下のように修正してください：

## 修正が必要な箇所

### 1. 基本情報の追加
```json
{
  "name": "ai-story-builder",
  "version": "1.0.0",
  "description": "AIと共創するストーリービルダー - AI-powered collaborative story building application",
  "author": "Story Builder Team",
  "main": "electron/main.js",
  "homepage": "./"
}
```

### 2. Electronパッケージの移動
以下のパッケージを `dependencies` から `devDependencies` に移動：

**devDependencies に追加：**
```json
"devDependencies": {
  "electron": "^37.2.5",
  "electron-builder": "^26.0.12",
  "@types/electron": "^1.6.10"
}
```

**dependencies から削除：**
- electron
- electron-builder

### 3. スクリプトの追加
```json
"scripts": {
  "electron": "electron electron/main.js",
  "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:5000 && electron electron/main.js\"",
  "build:electron": "npm run build && electron-builder --config electron-builder.json",
  "build:exe": "npm run build && electron-builder --config electron-builder.json --win",
  "dist": "npm run build && electron-builder --config electron-builder.json --publish=never"
}
```

## 完全なpackage.json例
```json
{
  "name": "ai-story-builder",
  "version": "1.0.0",
  "description": "AIと共創するストーリービルダー - AI-powered collaborative story building application", 
  "author": "Story Builder Team",
  "main": "electron/main.js",
  "homepage": "./",
  "type": "module",
  "license": "MIT",
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js",
    "check": "tsc",
    "db:push": "drizzle-kit push",
    "electron": "electron electron/main.js",
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:5000 && electron electron/main.js\"",
    "build:electron": "npm run build && electron-builder --config electron-builder.json",
    "build:exe": "npm run build && electron-builder --config electron-builder.json --win",
    "dist": "npm run build && electron-builder --config electron-builder.json --publish=never"
  },
  "dependencies": {
    // 既存の依存関係（electronとelectron-builderを除く）
  },
  "devDependencies": {
    "electron": "^37.2.5",
    "electron-builder": "^26.0.12",
    "@types/electron": "^1.6.10"
    // 他の開発依存関係
  }
}
```

## 修正後のビルドコマンド
```bash
npm run build:exe
```