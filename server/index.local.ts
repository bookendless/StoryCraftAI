import express from "express";
import { createServer } from "http";
import { join, dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";
import { localStorage } from "./storage.local.js";
import { checkOllamaConnection, getAvailableModels } from "./services/ollama.js";

// Windows互換のパス設定
const getAppPaths = () => {
  let __filename: string;
  let __dirname: string;

  if (import.meta.url) {
    __filename = fileURLToPath(import.meta.url);
    __dirname = dirname(__filename);
  } else {
    // CommonJSフォールバック
    __filename = __filename || '';
    __dirname = __dirname || process.cwd();
  }

  return { __filename, __dirname };
};

const { __filename, __dirname } = getAppPaths();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files - serve the built client
const clientDistPath = existsSync(join(__dirname, '../client/dist')) 
  ? join(__dirname, '../client/dist')
  : join(__dirname, '../dist/public');

console.log('静的ファイルパス:', clientDistPath);
app.use(express.static(clientDistPath));

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const ollamaConnected = await checkOllamaConnection();
  const models = ollamaConnected ? await getAvailableModels() : [];
  
  res.json({
    status: 'ok',
    environment: 'local',
    database: 'sqlite',
    ollama: {
      connected: ollamaConnected,
      models: models
    }
  });
});

// Register API routes with local storage
const { registerLocalRoutes } = await import("./routes.local.js");
registerLocalRoutes(app);

// Serve React app for all other routes
app.get('*', (req, res) => {
  const indexPath = existsSync(join(__dirname, '../client/dist/index.html'))
    ? join(__dirname, '../client/dist/index.html')
    : join(__dirname, '../dist/public/index.html');
  
  res.sendFile(resolve(indexPath));
});

const server = createServer(app);

server.listen(port, '0.0.0.0', () => {
  console.log(`🚀 AIストーリービルダー（ローカル版）がポート ${port} で起動しました`);
  console.log(`📱 アプリケーション: http://localhost:${port}`);
  console.log(`💾 データベース: SQLite (${process.platform === 'win32' ? 'AppData内' : 'local.db'})`);
  console.log(`🤖 AI: Ollama (http://localhost:11434)`);
  console.log(`🖥️ プラットフォーム: ${process.platform}`);
});

// エラーハンドリング
server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`ポート ${port} は既に使用されています。他のポートを試します...`);
    server.listen(port + 1, '0.0.0.0');
  } else {
    console.error('サーバーエラー:', err);
  }
});

export { server };