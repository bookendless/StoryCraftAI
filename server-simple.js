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

// 画像アップロード用のエンドポイント（簡易実装）
app.post('/api/upload', (req, res) => {
  console.log('POST /api/upload - image upload requested');
  // 簡易実装：ダミーURLを返す
  const dummyImageUrl = `https://via.placeholder.com/300x200?text=Image+${Date.now()}`;
  console.log('Returning dummy image URL:', dummyImageUrl);
  res.json({ 
    url: dummyImageUrl,
    message: 'Image upload simulated (local development mode)'
  });
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