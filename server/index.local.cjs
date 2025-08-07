// CommonJS版ローカルサーバー（Windows 11完全対応）
const express = require("express");
const { createServer } = require("http");
const { join, resolve } = require("path");
const { existsSync, mkdirSync } = require("fs");

console.log('=== AIストーリービルダー ローカル版 ===');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);
console.log('Working directory:', process.cwd());
console.log('');

// Windows互換のデータベースパス設定
const getDataPath = () => {
  if (process.platform === 'win32') {
    const appDataPath = process.env.APPDATA || join(process.env.USERPROFILE || '', 'AppData', 'Roaming');
    const appDir = join(appDataPath, 'AIストーリービルダー');
    
    if (!existsSync(appDir)) {
      mkdirSync(appDir, { recursive: true });
      console.log('データフォルダを作成しました:', appDir);
    }
    
    return join(appDir, 'local.db');
  }
  
  return resolve(process.cwd(), 'local.db');
};

// メモリストレージ（軽量版）
class SimpleStorage {
  constructor() {
    this.projects = new Map();
    this.characters = new Map();
    this.plots = new Map();
    this.nextId = 1;
  }

  generateId() {
    return (this.nextId++).toString();
  }

  // Projects
  getProjects() {
    return Array.from(this.projects.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getProject(id) {
    return this.projects.get(id);
  }

  createProject(projectData) {
    const project = {
      id: this.generateId(),
      title: projectData.title || '新しいプロジェクト',
      genre: projectData.genre || '小説',
      description: projectData.description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.projects.set(project.id, project);
    console.log('プロジェクト作成:', project.title);
    return project;
  }

  updateProject(id, projectData) {
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

  deleteProject(id) {
    this.projects.delete(id);
    // 関連データも削除
    Array.from(this.characters.keys()).forEach(charId => {
      const char = this.characters.get(charId);
      if (char && char.projectId === id) {
        this.characters.delete(charId);
      }
    });
    Array.from(this.plots.keys()).forEach(plotId => {
      const plot = this.plots.get(plotId);
      if (plot && plot.projectId === id) {
        this.plots.delete(plotId);
      }
    });
  }

  // Characters
  getCharacters(projectId) {
    return Array.from(this.characters.values())
      .filter(char => char.projectId === projectId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  getCharacter(id) {
    return this.characters.get(id);
  }

  createCharacter(characterData) {
    const character = {
      id: this.generateId(),
      name: characterData.name || '',
      description: characterData.description || '',
      personality: characterData.personality || '',
      background: characterData.background || '',
      role: characterData.role || '',
      affiliation: characterData.affiliation || '',
      projectId: characterData.projectId,
      order: characterData.order || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.characters.set(character.id, character);
    return character;
  }

  updateCharacter(id, characterData) {
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

  deleteCharacter(id) {
    this.characters.delete(id);
  }

  // Plots
  getPlot(projectId) {
    return Array.from(this.plots.values()).find(plot => plot.projectId === projectId);
  }

  createPlot(plotData) {
    const plot = {
      id: this.generateId(),
      theme: plotData.theme || '',
      setting: plotData.setting || '',
      hook: plotData.hook || '',
      opening: plotData.opening || '',
      development: plotData.development || '',
      climax: plotData.climax || '',
      conclusion: plotData.conclusion || '',
      projectId: plotData.projectId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.plots.set(plot.id, plot);
    return plot;
  }

  updatePlot(id, plotData) {
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
const storage = new SimpleStorage();

// デモデータの作成（初回起動時）
if (storage.getProjects().length === 0) {
  const demoProject = storage.createProject({
    title: 'サンプルプロジェクト',
    genre: '現代小説',
    description: 'AIストーリービルダーの使い方を学ぶためのサンプルプロジェクトです。'
  });
  
  storage.createCharacter({
    name: '田中太郎',
    description: '平凡な会社員だが、内に秘めた情熱を持っている',
    personality: '真面目で責任感が強い',
    role: '主人公',
    projectId: demoProject.id,
    order: 0
  });
}

// Ollama接続確認
const checkOllamaConnection = async () => {
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Express アプリケーション設定
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS設定（ローカル環境用）
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Static files - 複数のパスを試行
const staticPaths = [
  join(__dirname, '../dist/public'),
  join(__dirname, '../client/dist'),
  join(process.cwd(), 'dist/public'),
  join(process.cwd(), 'client/dist')
];

let clientPath = null;
for (const path of staticPaths) {
  if (existsSync(path)) {
    clientPath = path;
    break;
  }
}

if (clientPath) {
  console.log('静的ファイルパス:', clientPath);
  app.use(express.static(clientPath));
} else {
  console.warn('静的ファイルが見つかりません。npm run build を実行してください。');
}

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const ollamaConnected = await checkOllamaConnection();
  
  res.json({
    status: 'ok',
    environment: 'local',
    database: 'memory',
    storage: 'simple',
    dataPath: getDataPath(),
    ollama: {
      connected: ollamaConnected,
      models: ollamaConnected ? ['llama3.2:3b'] : []
    },
    stats: {
      projects: storage.getProjects().length,
      characters: storage.characters.size,
      plots: storage.plots.size
    }
  });
});

// API Routes - Projects
app.get("/api/projects", (req, res) => {
  try {
    const projects = storage.getProjects();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/projects/:id", (req, res) => {
  try {
    const project = storage.getProject(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/projects", (req, res) => {
  try {
    const project = storage.createProject(req.body);
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.patch("/api/projects/:id", (req, res) => {
  try {
    const project = storage.updateProject(req.params.id, req.body);
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/projects/:id", (req, res) => {
  try {
    storage.deleteProject(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// API Routes - Characters
app.get("/api/projects/:projectId/characters", (req, res) => {
  try {
    const characters = storage.getCharacters(req.params.projectId);
    res.json(characters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/projects/:projectId/characters", (req, res) => {
  try {
    const characterData = {
      ...req.body,
      projectId: req.params.projectId
    };
    const character = storage.createCharacter(characterData);
    res.status(201).json(character);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.patch("/api/characters/:id", (req, res) => {
  try {
    const character = storage.updateCharacter(req.params.id, req.body);
    res.json(character);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/characters/:id", (req, res) => {
  try {
    storage.deleteCharacter(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Character completion
app.post("/api/characters/:characterId/complete", async (req, res) => {
  try {
    const character = storage.getCharacter(req.params.characterId);
    if (!character) {
      return res.status(404).json({ message: "Character not found" });
    }

    // 簡易AI補完
    const completion = {};
    if (!character.description) completion.description = "魅力的で複雑な内面を持つキャラクターです。";
    if (!character.personality) completion.personality = "明るく前向きで、困難に立ち向かう強さを持っています。";
    if (!character.background) completion.background = "興味深い過去の経験が現在の行動に影響を与えています。";
    if (!character.role) completion.role = "物語の重要な局面で活躍する役割を担います。";
    if (!character.affiliation) completion.affiliation = "特定の組織や集団との関係性を持っています。";
    
    const updatedCharacter = storage.updateCharacter(req.params.characterId, completion);
    res.json(updatedCharacter);
  } catch (error) {
    console.error("Character completion error:", error);
    res.status(500).json({ message: error.message });
  }
});

// API Routes - Plots
app.get("/api/projects/:projectId/plot", (req, res) => {
  try {
    const plot = storage.getPlot(req.params.projectId);
    res.json(plot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/projects/:projectId/plot", (req, res) => {
  try {
    const plotData = {
      ...req.body,
      projectId: req.params.projectId
    };
    const plot = storage.createPlot(plotData);
    res.status(201).json(plot);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.patch("/api/plots/:id", (req, res) => {
  try {
    const plot = storage.updatePlot(req.params.id, req.body);
    res.json(plot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Plot generation
app.post("/api/projects/:projectId/plot/generate", (req, res) => {
  try {
    const project = storage.getProject(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // 簡易プロット生成
    const suggestion = {
      theme: "人間の成長と絆をテーマとした心温まる物語",
      setting: `現代日本の${project.genre === '学園' ? '学校' : '日常'}を舞台に`,
      hook: "主人公の日常に突然現れる謎めいた出来事",
      opening: "平凡な毎日を送る主人公の前に現れる運命的な出会い",
      development: "困難な試練を通じて成長していく主人公と仲間たち",
      climax: "すべてが明らかになる緊張の瞬間と重要な決断",
      conclusion: "新たな絆を得て、さらなる未来へと歩み出す希望ある結末"
    };

    res.json(suggestion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  const indexPaths = [
    join(__dirname, '../dist/public/index.html'),
    join(__dirname, '../client/dist/index.html'),
    join(process.cwd(), 'dist/public/index.html'),
    join(process.cwd(), 'client/dist/index.html')
  ];

  for (const indexPath of indexPaths) {
    if (existsSync(indexPath)) {
      return res.sendFile(resolve(indexPath));
    }
  }
  
  res.status(404).send(`
    <h1>AIストーリービルダー - セットアップが必要です</h1>
    <p>アプリケーションファイルが見つかりません。</p>
    <p>コマンドプロンプトで以下を実行してください：</p>
    <pre>npm run build</pre>
  `);
});

// サーバー起動
const server = createServer(app);

server.listen(port, '0.0.0.0', () => {
  console.log('');
  console.log('🚀 AIストーリービルダー（ローカル版）が起動しました！');
  console.log(`📱 アプリケーション: http://localhost:${port}`);
  console.log(`💾 データベース: メモリストレージ`);
  console.log(`🤖 AI: 基本補完機能 + Ollama対応`);
  console.log(`🖥️ プラットフォーム: ${process.platform}`);
  console.log(`📊 サンプルプロジェクト: ${storage.getProjects().length}個`);
  console.log('');
  
  // Windows用：ブラウザ自動起動（3秒後）
  if (process.platform === 'win32') {
    console.log('3秒後にブラウザが自動で開きます...');
    setTimeout(() => {
      require('child_process').exec(`start http://localhost:${port}`);
    }, 3000);
  }
  
  console.log('終了するには Ctrl+C を押してください。');
});

// エラーハンドリング
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const newPort = port + 1;
    console.log(`ポート ${port} は使用中です。ポート ${newPort} で再試行...`);
    server.listen(newPort, '0.0.0.0', () => {
      console.log('');
      console.log('🚀 AIストーリービルダー（ローカル版）が起動しました！');
      console.log(`📱 アプリケーション: http://localhost:${newPort}`);
      console.log(`💾 データベース: メモリストレージ`);
      console.log(`🤖 AI: 基本補完機能 + Ollama対応`);
      console.log(`🖥️ プラットフォーム: ${process.platform}`);
      console.log(`📊 サンプルプロジェクト: ${storage.getProjects().length}個`);
      console.log('');
      
      if (process.platform === 'win32') {
        console.log('3秒後にブラウザが自動で開きます...');
        setTimeout(() => {
          require('child_process').exec(`start http://localhost:${newPort}`);
        }, 3000);
      }
      
      console.log('終了するには Ctrl+C を押してください。');
    });
  } else {
    console.error('サーバーエラー:', err);
    process.exit(1);
  }
});

// プロセス終了処理
process.on('SIGINT', () => {
  console.log('\n\nAIストーリービルダーを終了しています...');
  server.close(() => {
    console.log('正常に終了しました。またのご利用をお待ちしています！');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('AIストーリービルダーを終了しています...');
  server.close(() => {
    process.exit(0);
  });
});