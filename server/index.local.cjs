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
    this.synopses = new Map();
    this.chapters = new Map();
    this.episodes = new Map();
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
    Array.from(this.synopses.keys()).forEach(synopsisId => {
      const synopsis = this.synopses.get(synopsisId);
      if (synopsis && synopsis.projectId === id) {
        this.synopses.delete(synopsisId);
      }
    });
    Array.from(this.chapters.keys()).forEach(chapterId => {
      const chapter = this.chapters.get(chapterId);
      if (chapter && chapter.projectId === id) {
        this.chapters.delete(chapterId);
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

  // Synopses
  getSynopsis(projectId) {
    return Array.from(this.synopses.values()).find(synopsis => synopsis.projectId === projectId);
  }

  createSynopsis(synopsisData) {
    const synopsis = {
      id: this.generateId(),
      content: synopsisData.content || '',
      tone: synopsisData.tone || '',
      style: synopsisData.style || '',
      projectId: synopsisData.projectId,
      version: synopsisData.version || 1,
      isActive: synopsisData.isActive !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.synopses.set(synopsis.id, synopsis);
    return synopsis;
  }

  updateSynopsis(id, synopsisData) {
    const existing = this.synopses.get(id);
    if (!existing) throw new Error('Synopsis not found');
    
    const updated = {
      ...existing,
      ...synopsisData,
      updatedAt: new Date().toISOString(),
    };
    this.synopses.set(id, updated);
    return updated;
  }

  // Chapters
  getChapters(projectId) {
    return Array.from(this.chapters.values())
      .filter(chapter => chapter.projectId === projectId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  createChapter(chapterData) {
    const chapter = {
      id: this.generateId(),
      title: chapterData.title || '',
      summary: chapterData.summary || '',
      structure: chapterData.structure || 'ki',
      estimatedWords: chapterData.estimatedWords || 0,
      estimatedReadingTime: chapterData.estimatedReadingTime || 0,
      characterIds: chapterData.characterIds || [],
      order: chapterData.order || 0,
      projectId: chapterData.projectId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.chapters.set(chapter.id, chapter);
    return chapter;
  }

  updateChapter(id, chapterData) {
    const existing = this.chapters.get(id);
    if (!existing) throw new Error('Chapter not found');
    
    const updated = {
      ...existing,
      ...chapterData,
      updatedAt: new Date().toISOString(),
    };
    this.chapters.set(id, updated);
    return updated;
  }
}

// ストレージ初期化
const storage = new SimpleStorage();

// デモデータの作成（初回起動時）
console.log('プロジェクト作成: サンプルプロジェクト');
if (storage.getProjects().length === 0) {
  const demoProject = storage.createProject({
    title: 'サンプルプロジェクト',
    genre: '現代小説',
    description: 'AIストーリービルダーの使い方を学ぶためのサンプルプロジェクトです。',
    currentStep: 1,
    progress: 0
  });
  
  const demoCharacter = storage.createCharacter({
    name: '田中太郎',
    description: '平凡な会社員だが、内に秘めた情熱を持っている',
    personality: '真面目で責任感が強い',
    background: '東京で働く29歳のサラリーマン',
    role: '主人公',
    affiliation: '',
    projectId: demoProject.id,
    order: 0
  });
  
  // プロットも初期化
  const demoPlot = storage.createPlot({
    projectId: demoProject.id,
    theme: '成長と自己発見',
    setting: '現代の東京',
    structure: 'kishotenketsu',
    hook: '突然の転職の誘い',
    opening: '普通の毎日を送る会社員',
    development: '新しい環境での挑戦',
    climax: '重要な決断の瞬間',
    conclusion: '新たな自分の発見'
  });
  
  console.log(`サンプルプロジェクト作成完了: ${demoProject.id}`);
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
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
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
    storage: 'memory',
    ollama: ollamaConnected,
    projects: storage.getProjects().length
  });
});

// API Routes - Projects
app.get("/api/projects", (req, res) => {
  try {
    const projects = storage.getProjects();
    res.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
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
    console.error("Error fetching project:", error);
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/projects", (req, res) => {
  try {
    const project = storage.createProject(req.body);
    res.status(201).json(project);
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(400).json({ message: error.message });
  }
});

app.patch("/api/projects/:id", (req, res) => {
  try {
    const project = storage.updateProject(req.params.id, req.body);
    res.json(project);
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/projects/:id", (req, res) => {
  try {
    storage.deleteProject(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting project:", error);
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

// API Routes - Synopsis
app.get("/api/projects/:projectId/synopsis", (req, res) => {
  try {
    const synopsis = storage.getSynopsis(req.params.projectId);
    res.json(synopsis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/projects/:projectId/synopsis", (req, res) => {
  try {
    const synopsisData = {
      ...req.body,
      projectId: req.params.projectId
    };
    const synopsis = storage.createSynopsis(synopsisData);
    res.status(201).json(synopsis);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.patch("/api/synopsis/:id", (req, res) => {
  try {
    const synopsis = storage.updateSynopsis(req.params.id, req.body);
    res.json(synopsis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// API Routes - Chapters
app.get("/api/projects/:projectId/chapters", (req, res) => {
  try {
    const chapters = storage.getChapters(req.params.projectId);
    res.json(chapters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/projects/:projectId/chapters", (req, res) => {
  try {
    const chapterData = {
      ...req.body,
      projectId: req.params.projectId
    };
    const chapter = storage.createChapter(chapterData);
    res.status(201).json(chapter);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.patch("/api/chapters/:id", (req, res) => {
  try {
    const chapter = storage.updateChapter(req.params.id, req.body);
    res.json(chapter);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Synopsis generation
app.post("/api/projects/:projectId/synopsis/generate", (req, res) => {
  try {
    const project = storage.getProject(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const characters = storage.getCharacters(req.params.projectId);
    const plot = storage.getPlot(req.params.projectId);
    
    // 簡易あらすじ生成
    const characterNames = characters.map(c => c.name).join('、') || '主人公';
    const setting = plot?.setting || '現代日本';
    
    const generatedContent = `${setting}を舞台に、${characterNames}が繰り広げる${project.genre}の物語。${plot?.theme || 'ドラマチックな展開'}を通じて、登場人物たちは成長し、新たな絆を築いていく。${plot?.hook || '予想外の出来事'}から始まる物語は、${plot?.climax || '重要な決断の瞬間'}を経て、${plot?.conclusion || '希望に満ちた結末'}へと向かう。`;

    res.json({
      content: generatedContent,
      tone: "warm",
      style: "narrative"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Ollama integration and AI completion
app.post("/api/ai/complete", async (req, res) => {
  try {
    const { prompt, type = "general" } = req.body;
    console.log(`AI completion request: ${type}`);
    
    // Check Ollama connection
    const ollamaConnected = await checkOllamaConnection();
    
    if (ollamaConnected) {
      try {
        console.log("Using Ollama for AI completion");
        const response = await fetch('http://localhost:11434/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama3.2:3b',
            prompt: prompt,
            stream: false
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log("Ollama response received");
          return res.json({ completion: data.response || "補完に失敗しました" });
        }
      } catch (error) {
        console.error("Ollama error:", error);
      }
    }
    
    console.log("Using fallback AI completion");
    // Enhanced fallback completions
    let completion = "";
    switch (type) {
      case "character":
        completion = "独特な個性と深い内面を持つ魅力的なキャラクター。読者に強い印象を残し、物語の展開に重要な役割を果たします。感情豊かで成長性があり、他のキャラクターとの関係性も興味深く描かれます。";
        break;
      case "plot":
        completion = "読者を引き込む魅力的な物語構造。予期せぬ展開と感動的なクライマックスを含み、登場人物の成長と変化が丁寧に描かれます。テーマ性も深く、読み終わった後も余韻の残る作品となります。";
        break;
      case "synopsis":
        completion = "心に響く感動的な物語。魅力的な設定と個性豊かな登場人物が織りなす、読者の心を掴んで離さない作品です。普遍的なテーマを扱いながらも、独自性のある展開で新鮮な読書体験を提供します。";
        break;
      case "description":
        completion = "詳細で生き生きとした描写。読者が場面を鮮明に想像できるような具体的で魅力的な内容です。";
        break;
      case "personality":
        completion = "多面的で魅力的な性格。複雑さと深みを持ちながらも親しみやすく、読者が感情移入できるキャラクターです。";
        break;
      case "background":
        completion = "興味深い過去の経歴。現在の行動や性格に影響を与える重要な体験や出来事を含んだ背景設定です。";
        break;
      default:
        completion = "創造性に富み、読者の興味を引く魅力的な内容。想像力をかき立て、物語に深みを与える要素です。";
    }
    
    res.json({ completion });
  } catch (error) {
    console.error("AI completion error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Character AI completion
app.post("/api/projects/:projectId/characters/:characterId/complete", async (req, res) => {
  try {
    const { field, currentValue } = req.body;
    console.log(`Character completion request: ${field}`);
    
    let prompt = "";
    let type = "character";
    
    switch (field) {
      case "description":
        prompt = `キャラクターの外見や第一印象について、以下の内容を補完してください：${currentValue || "新しいキャラクター"}`;
        type = "description";
        break;
      case "personality":
        prompt = `キャラクターの性格について、以下の内容を補完してください：${currentValue || ""}`;
        type = "personality";
        break;
      case "background":
        prompt = `キャラクターの背景や過去について、以下の内容を補完してください：${currentValue || ""}`;
        type = "background";
        break;
      default:
        prompt = `キャラクターの${field}について補完してください：${currentValue || ""}`;
    }
    
    const completion = await generateAICompletion(prompt, type);
    res.json({ completion });
  } catch (error) {
    console.error("Character completion error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Helper function for AI completion
async function generateAICompletion(prompt, type) {
  const ollamaConnected = await checkOllamaConnection();
  
  if (ollamaConnected) {
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.2:3b',
          prompt: prompt,
          stream: false
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.response || "補完に失敗しました";
      }
    } catch (error) {
      console.error("Ollama error:", error);
    }
  }
  
  // Fallback completions
  const fallbacks = {
    description: "印象的な外見と存在感を持つ人物。特徴的な服装や表情があり、一度見たら忘れられない魅力を放っています。",
    personality: "複雑で多面的な性格。表面的には見えない深い内面があり、状況に応じて異なる一面を見せる興味深いキャラクターです。",
    background: "興味深い過去を持つ人物。これまでの経験が現在の行動や考え方に大きな影響を与えており、物語に深みを加える要素を持っています。",
    character: "魅力的で個性的なキャラクター。読者の心に残る印象深い人物として、物語に重要な役割を果たします。"
  };
  
  return fallbacks[type] || fallbacks.character;
}

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
  
  console.log('終了するには Ctrl+C を押してください。');
  
  // Windows用：ブラウザ自動起動（3秒後）
  if (process.platform === 'win32') {
    console.log('3秒後にブラウザが自動で開きます...');
    setTimeout(() => {
      require('child_process').exec(`start http://localhost:${port}`, (error) => {
        if (error) {
          console.log('手動でブラウザを開いてください: http://localhost:' + port);
        }
      });
    }, 3000);
  }
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
      
      console.log('終了するには Ctrl+C を押してください。');
      
      if (process.platform === 'win32') {
        console.log('3秒後にブラウザが自動で開きます...');
        setTimeout(() => {
          require('child_process').exec(`start http://localhost:${newPort}`, (error) => {
            if (error) {
              console.log('手動でブラウザを開いてください: http://localhost:' + newPort);
            }
          });
        }, 3000);
      }
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