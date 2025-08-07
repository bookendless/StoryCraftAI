// 最もシンプルなローカルサーバー（CommonJS版）
const express = require('express');
const path = require('path');
const fs = require('fs');

console.log('====================================');
console.log(' Simple Local Server Starting');
console.log('====================================');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist/public')));

// メモリストレージ
const storage = {
  projects: new Map(),
  characters: new Map(),
  plots: new Map()
};

// CORS対応
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

// API Routes - プロジェクト管理
app.get('/api/projects', (req, res) => {
  const projects = Array.from(storage.projects.values());
  console.log(`[API] GET /api/projects - ${projects.length} projects found`);
  res.json(projects);
});

app.post('/api/projects', (req, res) => {
  const project = {
    id: Math.random().toString(36).substr(2, 9),
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  storage.projects.set(project.id, project);
  console.log(`[API] POST /api/projects - Created project: ${project.title || project.id}`);
  res.json(project);
});

app.get('/api/projects/:id', (req, res) => {
  const project = storage.projects.get(req.params.id);
  if (!project) {
    console.log(`[API] GET /api/projects/${req.params.id} - Not found`);
    return res.status(404).json({ error: 'プロジェクトが見つかりません' });
  }
  console.log(`[API] GET /api/projects/${req.params.id} - Found: ${project.title || project.id}`);
  res.json(project);
});

app.put('/api/projects/:id', (req, res) => {
  const existing = storage.projects.get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'プロジェクトが見つかりません' });
  }
  
  const updated = {
    ...existing,
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  storage.projects.set(req.params.id, updated);
  console.log(`[API] PUT /api/projects/${req.params.id} - Updated: ${updated.title || updated.id}`);
  res.json(updated);
});

app.delete('/api/projects/:id', (req, res) => {
  if (storage.projects.delete(req.params.id)) {
    console.log(`[API] DELETE /api/projects/${req.params.id} - Deleted`);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'プロジェクトが見つかりません' });
  }
});

// キャラクター管理
app.get('/api/projects/:projectId/characters', (req, res) => {
  const projectChars = Array.from(storage.characters.values())
    .filter(char => char.projectId === req.params.projectId);
  res.json(projectChars);
});

app.post('/api/projects/:projectId/characters', (req, res) => {
  const character = {
    id: Math.random().toString(36).substr(2, 9),
    projectId: req.params.projectId,
    ...req.body,
    createdAt: new Date().toISOString()
  };
  storage.characters.set(character.id, character);
  console.log(`[API] Created character: ${character.name || character.id}`);
  res.json(character);
});

// AI completion endpoints with fallback responses
app.post('/api/ai/complete-character', (req, res) => {
  console.log('[AI] Character completion requested - using fallback');
  const fallback = {
    description: "魅力的で個性豊かなキャラクター",
    personality: "誠実で行動力があり、困っている人を放っておけない性格",
    background: "平凡な日常を送っていたが、運命的な出会いをきっかけに特別な世界に足を踏み入れる",
    role: "物語の中心となる重要な人物"
  };
  res.json(fallback);
});

app.post('/api/ai/generate-plot', (req, res) => {
  console.log('[AI] Plot generation requested - using fallback');
  const fallback = {
    theme: "成長と冒険",
    setting: "現代の日本を舞台とした異世界もの",
    hook: "平凡な日常に突如現れる非日常的な出来事",
    opening: "主人公の日常描写と運命を変える出会い",
    development: "新たな世界での試練と仲間との出会い",
    climax: "最大の敵との対決と真実の発覚",
    conclusion: "成長した主人公と平和になった世界"
  };
  res.json(fallback);
});

// SPAフォールバック
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, '../dist/public/index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Build files not found. Please run: npm run build');
  }
});

const port = process.env.PORT || 5000;
const host = 'localhost'; // Windows対応

app.listen(port, host, () => {
  console.log('');
  console.log(`Server running: http://${host}:${port}`);
  console.log('Mode: Production Build + Memory Storage');
  console.log('Features: All basic story creation features available');
  console.log('AI: Fallback responses (no API key required)');
  console.log('');
  console.log('Press Ctrl+C to stop server');
});