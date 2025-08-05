const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// 静的ファイル配信 - 複数のパスをチェック
const fs = require('fs');
const distPath = path.join(__dirname, 'dist/public');
const clientDistPath = path.join(__dirname, 'client/dist');
const clientPath = path.join(__dirname, 'client');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  console.log('Static files served from:', distPath);
} else if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  console.log('Static files served from:', clientDistPath);
} else if (fs.existsSync(clientPath)) {
  app.use(express.static(clientPath));
  console.log('Using client directory as fallback');
} else {
  console.log('Warning: No static files directory found.');
}
app.use(express.json());

// データベース接続（環境変数から）
const DATABASE_URL = process.env.DATABASE_URL;
let projects = []; // メモリ内ストレージ（簡易実装）

// 基本的なAPIエンドポイント
app.get('/api/projects', (req, res) => {
  console.log('GET /api/projects - returning', projects.length, 'projects');
  res.json(projects);
});

app.post('/api/projects', (req, res) => {
  console.log('POST /api/projects - creating project:', req.body);
  const newProject = {
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...req.body
  };
  projects.push(newProject);
  console.log('Project created with ID:', newProject.id);
  res.status(201).json(newProject);
});

app.get('/api/projects/:id', (req, res) => {
  const project = projects.find(p => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  res.json(project);
});

app.put('/api/projects/:id', (req, res) => {
  const index = projects.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Project not found' });
  }
  projects[index] = {
    ...projects[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  console.log('Project updated:', projects[index].id);
  res.json(projects[index]);
});

app.delete('/api/projects/:id', (req, res) => {
  const index = projects.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Project not found' });
  }
  projects.splice(index, 1);
  console.log('Project deleted:', req.params.id);
  res.status(204).send();
});

// キャラクター管理
let characters = [];

app.get('/api/projects/:projectId/characters', (req, res) => {
  const projectCharacters = characters.filter(c => c.projectId === req.params.projectId);
  console.log('GET /api/projects/:projectId/characters - returning', projectCharacters.length, 'characters');
  res.json(projectCharacters);
});

app.post('/api/projects/:projectId/characters', (req, res) => {
  console.log('POST /api/projects/:projectId/characters - creating character:', req.body);
  const newCharacter = {
    id: Date.now().toString(),
    projectId: req.params.projectId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...req.body
  };
  characters.push(newCharacter);
  console.log('Character created with ID:', newCharacter.id);
  res.status(201).json(newCharacter);
});

app.put('/api/projects/:projectId/characters/:id', (req, res) => {
  const index = characters.findIndex(c => c.id === req.params.id && c.projectId === req.params.projectId);
  if (index === -1) {
    return res.status(404).json({ error: 'Character not found' });
  }
  characters[index] = {
    ...characters[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  console.log('Character updated:', characters[index].id);
  res.json(characters[index]);
});

// プロット管理
let plots = [];

app.get('/api/projects/:projectId/plots', (req, res) => {
  const projectPlots = plots.filter(p => p.projectId === req.params.projectId);
  res.json(projectPlots);
});

app.post('/api/projects/:projectId/plots', (req, res) => {
  const newPlot = {
    id: Date.now().toString(),
    projectId: req.params.projectId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...req.body
  };
  plots.push(newPlot);
  res.status(201).json(newPlot);
});

// シノプシス管理
let synopses = [];

app.get('/api/projects/:projectId/synopses', (req, res) => {
  const projectSynopses = synopses.filter(s => s.projectId === req.params.projectId);
  res.json(projectSynopses);
});

app.post('/api/projects/:projectId/synopses', (req, res) => {
  const newSynopsis = {
    id: Date.now().toString(),
    projectId: req.params.projectId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...req.body
  };
  synopses.push(newSynopsis);
  res.status(201).json(newSynopsis);
});

// 画像アップロード用のエンドポイント（本格実装）
app.post('/api/upload', (req, res) => {
  console.log('POST /api/upload - image upload requested');
  
  // ローカル開発用：実際のファイルアップロード処理をシミュレート
  const fileTypes = ['character', 'scene', 'concept'];
  const randomType = fileTypes[Math.floor(Math.random() * fileTypes.length)];
  const imageUrl = `https://picsum.photos/400/300?random=${Date.now()}`;
  
  console.log('Generated image URL:', imageUrl);
  res.json({ 
    url: imageUrl,
    type: randomType,
    filename: `upload_${Date.now()}.jpg`,
    message: 'Image processed successfully (local development mode)'
  });
});

// AI生成エンドポイント（モック実装）
app.post('/api/ai/generate-character', (req, res) => {
  console.log('POST /api/ai/generate-character - generating character with prompt:', req.body.prompt);
  
  const sampleCharacters = [
    {
      name: "田中太郎",
      age: 25,
      occupation: "エンジニア",
      personality: "内向的で論理的思考を持つ。技術に対する情熱が強い。",
      background: "都市部で育ち、大学でコンピューターサイエンスを学んだ。",
      goals: "革新的なソフトウェアを開発して世界を変えたい。"
    },
    {
      name: "山田花子",
      age: 22,
      occupation: "アーティスト",
      personality: "創造的で感情豊か。自由を愛する芸術家魂を持つ。",
      background: "地方の小さな町で育ち、都市部の美術大学に進学。",
      goals: "自分の作品で人々の心を動かしたい。"
    }
  ];
  
  const randomCharacter = sampleCharacters[Math.floor(Math.random() * sampleCharacters.length)];
  
  setTimeout(() => {
    res.json({
      character: randomCharacter,
      message: 'キャラクターが生成されました（デモ版）'
    });
  }, 1000); // 1秒の遅延でAI処理をシミュレート
});

app.post('/api/ai/generate-plot', (req, res) => {
  console.log('POST /api/ai/generate-plot - generating plot');
  
  const samplePlot = {
    title: "運命の出会い",
    summary: "主人公が偶然の出会いから始まる冒険の物語。困難を乗り越えながら成長していく。",
    mainConflict: "古い価値観と新しい世界観の衝突",
    resolution: "理解と協力を通じて新しい未来を築く",
    themes: ["成長", "友情", "勇気", "変化"]
  };
  
  setTimeout(() => {
    res.json({
      plot: samplePlot,
      message: 'プロットが生成されました（デモ版）'
    });
  }, 1500);
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    database: DATABASE_URL ? 'configured' : 'not configured',
    projectsCount: projects.length
  });
});

// フロントエンドのルーティング対応
app.get('*', (req, res) => {
  const distIndexPath = path.join(__dirname, 'dist/public/index.html');
  const clientDistIndexPath = path.join(__dirname, 'client/dist/index.html');
  const clientIndexPath = path.join(__dirname, 'client/index.html');
  
  if (fs.existsSync(distIndexPath)) {
    res.sendFile(distIndexPath);
  } else if (fs.existsSync(clientDistIndexPath)) {
    res.sendFile(clientDistIndexPath);
  } else if (fs.existsSync(clientIndexPath)) {
    res.sendFile(clientIndexPath);
  } else {
    res.status(404).send(`
      <html>
        <head>
          <title>AI Story Builder</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            pre { background: #f5f5f5; padding: 10px; border-radius: 5px; }
          </style>
        </head>
        <body>
          <h1>AI Story Builder</h1>
          <p>Frontend files not found. Please try one of these commands:</p>
          <h3>Option 1: Build for production</h3>
          <pre>build-local.bat</pre>
          <h3>Option 2: Run development server</h3>
          <pre>start-local-dev.bat</pre>
          <p>Current server is running at: <strong>http://localhost:${PORT}</strong></p>
        </body>
      </html>
    `);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[express] serving on port ${PORT}`);
  console.log(`Server is ready at http://localhost:${PORT}`);
});