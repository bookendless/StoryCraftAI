const express = require("express");
const { createServer } = require("http");
const { join, dirname, resolve } = require("path");
const { existsSync, mkdirSync } = require("fs");
const Database = require('better-sqlite3');

// Windows互換のパス設定
const getDataPath = () => {
  if (process.platform === 'win32') {
    // Windowsの場合、ユーザーのAppDataディレクトリを使用
    const appDataPath = process.env.APPDATA || join(process.env.USERPROFILE || '', 'AppData', 'Roaming');
    const appDir = join(appDataPath, 'AIストーリービルダー');
    
    // ディレクトリが存在しない場合は作成
    if (!existsSync(appDir)) {
      mkdirSync(appDir, { recursive: true });
    }
    
    return join(appDir, 'local.db');
  }
  
  // その他のプラットフォーム
  return resolve(process.cwd(), 'local.db');
};

const databasePath = getDataPath();
console.log('データベースパス:', databasePath);

// 基本的なメモリストレージ（SQLite接続失敗時のフォールバック）
class MemoryStorage {
  constructor() {
    this.projects = new Map();
    this.characters = new Map();
    this.plots = new Map();
    this.synopses = new Map();
    this.chapters = new Map();
    this.episodes = new Map();
    this.drafts = new Map();
  }

  // Projects
  async getProjects() {
    return Array.from(this.projects.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getProject(id) {
    return this.projects.get(id);
  }

  async createProject(projectData) {
    const project = {
      id: Date.now().toString(),
      ...projectData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.projects.set(project.id, project);
    return project;
  }

  async updateProject(id, projectData) {
    const existing = this.projects.get(id);
    if (!existing) throw new Error('Project not found');
    
    const updated = {
      ...existing,
      ...projectData,
      updatedAt: new Date().toISOString(),
    };
    this.projects.set(id, updated);
    return updated;
  }

  async deleteProject(id) {
    this.projects.delete(id);
  }

  // Characters
  async getCharacters(projectId) {
    return Array.from(this.characters.values())
      .filter(char => char.projectId === projectId)
      .sort((a, b) => a.order - b.order);
  }

  async getCharacter(id) {
    return this.characters.get(id);
  }

  async createCharacter(characterData) {
    const character = {
      id: Date.now().toString(),
      ...characterData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.characters.set(character.id, character);
    return character;
  }

  async updateCharacter(id, characterData) {
    const existing = this.characters.get(id);
    if (!existing) throw new Error('Character not found');
    
    const updated = {
      ...existing,
      ...characterData,
      updatedAt: new Date().toISOString(),
    };
    this.characters.set(id, updated);
    return updated;
  }

  async deleteCharacter(id) {
    this.characters.delete(id);
  }

  // Plots
  async getPlot(projectId) {
    return Array.from(this.plots.values()).find(plot => plot.projectId === projectId);
  }

  async createPlot(plotData) {
    const plot = {
      id: Date.now().toString(),
      ...plotData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.plots.set(plot.id, plot);
    return plot;
  }

  async updatePlot(id, plotData) {
    const existing = this.plots.get(id);
    if (!existing) throw new Error('Plot not found');
    
    const updated = {
      ...existing,
      ...plotData,
      updatedAt: new Date().toISOString(),
    };
    this.plots.set(id, updated);
    return updated;
  }
}

// ストレージ初期化
const storage = new MemoryStorage();

// Ollama接続確認（フォールバック対応）
const checkOllamaConnection = async () => {
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    return response.ok;
  } catch (error) {
    return false;
  }
};

const getAvailableModels = async () => {
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    if (response.ok) {
      const data = await response.json();
      return data.models.map(model => model.name);
    }
    return [];
  } catch (error) {
    return [];
  }
};

// Express アプリケーション設定
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
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
    database: 'memory',
    ollama: {
      connected: ollamaConnected,
      models: models
    }
  });
});

// API Routes
app.get("/api/projects", async (req, res) => {
  try {
    const projects = await storage.getProjects();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/projects/:id", async (req, res) => {
  try {
    const project = await storage.getProject(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/projects", async (req, res) => {
  try {
    const project = await storage.createProject(req.body);
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.patch("/api/projects/:id", async (req, res) => {
  try {
    const project = await storage.updateProject(req.params.id, req.body);
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/projects/:id", async (req, res) => {
  try {
    await storage.deleteProject(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Characters
app.get("/api/projects/:projectId/characters", async (req, res) => {
  try {
    const characters = await storage.getCharacters(req.params.projectId);
    res.json(characters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/projects/:projectId/characters", async (req, res) => {
  try {
    const characterData = {
      ...req.body,
      projectId: req.params.projectId
    };
    const character = await storage.createCharacter(characterData);
    res.status(201).json(character);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.patch("/api/characters/:id", async (req, res) => {
  try {
    const character = await storage.updateCharacter(req.params.id, req.body);
    res.json(character);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/characters/:id", async (req, res) => {
  try {
    await storage.deleteCharacter(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Character completion (簡易版)
app.post("/api/characters/:characterId/complete", async (req, res) => {
  try {
    const character = await storage.getCharacter(req.params.characterId);
    if (!character) {
      return res.status(404).json({ message: "Character not found" });
    }

    // 簡易的なAI補完（Ollama接続時はそちらを使用）
    const ollamaConnected = await checkOllamaConnection();
    
    if (!ollamaConnected) {
      // フォールバック：基本的な補完データ
      const completion = {};
      if (!character.description) completion.description = "魅力的なキャラクターです。";
      if (!character.personality) completion.personality = "明るく前向きな性格です。";
      if (!character.background) completion.background = "興味深い過去を持っています。";
      if (!character.role) completion.role = "物語の重要な役割を担います。";
      if (!character.affiliation) completion.affiliation = "特定の組織や集団に属しています。";
      
      const updatedCharacter = await storage.updateCharacter(req.params.characterId, completion);
      return res.json(updatedCharacter);
    }

    // Ollama使用時の処理は省略（フォールバック対応）
    res.json(character);
  } catch (error) {
    console.error("Character completion error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Plots
app.get("/api/projects/:projectId/plot", async (req, res) => {
  try {
    const plot = await storage.getPlot(req.params.projectId);
    res.json(plot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/projects/:projectId/plot", async (req, res) => {
  try {
    const plotData = {
      ...req.body,
      projectId: req.params.projectId
    };
    const plot = await storage.createPlot(plotData);
    res.status(201).json(plot);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.patch("/api/plots/:id", async (req, res) => {
  try {
    const plot = await storage.updatePlot(req.params.id, req.body);
    res.json(plot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Plot generation
app.post("/api/projects/:projectId/plot/generate", async (req, res) => {
  try {
    const project = await storage.getProject(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // 簡易的なプロット生成
    const suggestion = {
      theme: "人間の成長と絆",
      setting: "現代日本",
      hook: "謎めいた出会い",
      opening: "平凡な日常から始まる物語",
      development: "困難な試練と成長",
      climax: "最大の危機と決断",
      conclusion: "新たな始まりへ"
    };

    res.json(suggestion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  const indexPath = existsSync(join(__dirname, '../client/dist/index.html'))
    ? join(__dirname, '../client/dist/index.html')
    : join(__dirname, '../dist/public/index.html');
  
  if (existsSync(indexPath)) {
    res.sendFile(resolve(indexPath));
  } else {
    res.status(404).send('アプリケーションファイルが見つかりません。');
  }
});

const server = createServer(app);

server.listen(port, '0.0.0.0', () => {
  console.log(`🚀 AIストーリービルダー（ローカル版）がポート ${port} で起動しました`);
  console.log(`📱 アプリケーション: http://localhost:${port}`);
  console.log(`💾 データベース: メモリ（${process.platform === 'win32' ? 'Windows互換モード' : 'フォールバックモード'}）`);
  console.log(`🤖 AI: ${checkOllamaConnection ? 'Ollama対応' : 'フォールバックモード'} (http://localhost:11434)`);
  console.log(`🖥️ プラットフォーム: ${process.platform}`);
  console.log(`🗂️ 作業ディレクトリ: ${process.cwd()}`);
  
  // ブラウザを自動で開く（Windows）
  if (process.platform === 'win32') {
    setTimeout(() => {
      require('child_process').exec(`start http://localhost:${port}`);
    }, 2000);
  }
});

// エラーハンドリング
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`ポート ${port} は既に使用されています。他のポートを試します...`);
    server.listen(port + 1, '0.0.0.0');
  } else {
    console.error('サーバーエラー:', err);
  }
});

// プロセス終了時のクリーンアップ
process.on('SIGINT', () => {
  console.log('\nAIストーリービルダーを終了しています...');
  server.close(() => {
    console.log('サーバーが正常に終了しました。');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('AIストーリービルダーを終了しています...');
  server.close(() => {
    console.log('サーバーが正常に終了しました。');
    process.exit(0);
  });
});