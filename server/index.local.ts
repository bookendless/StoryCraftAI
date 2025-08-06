import express from "express";
import { createServer } from "http";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { localStorage } from "./storage.local";
import { checkOllamaConnection, getAvailableModels } from "./services/ollama";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files - serve the built client
app.use(express.static(join(__dirname, '../client/dist')));

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
import { registerLocalRoutes } from "./routes.local";
registerLocalRoutes(app);

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../client/dist/index.html'));
});

const server = createServer(app);

server.listen(port, () => {
  console.log(`🚀 AIストーリービルダー（ローカル版）がポート ${port} で起動しました`);
  console.log(`📱 アプリケーション: http://localhost:${port}`);
  console.log(`💾 データベース: SQLite (local.db)`);
  console.log(`🤖 AI: Ollama (http://localhost:11434)`);
});

export { server };