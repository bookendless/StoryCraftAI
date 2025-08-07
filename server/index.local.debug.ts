// ローカルデバッグ専用サーバー
import express from 'express';
import path from 'path';
// import { storage } from './storage.local';
// 簡易メモリストレージを直接実装
const storage = {
  projects: new Map(),
  async getAllProjects() {
    return Array.from(this.projects.values());
  },
  async getProject(id: string) {
    return this.projects.get(id);
  },
  async createProject(data: any) {
    const project = {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.projects.set(project.id, project);
    return project;
  }
};
import { createServer } from 'http';
import { createServer as createViteServer } from 'vite';

const app = express();
app.use(express.json());

// CORS対応
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// API Routes
app.get('/api/projects', async (req, res) => {
  const projects = await storage.getAllProjects();
  res.json(projects);
});

app.post('/api/projects', async (req, res) => {
  try {
    const project = await storage.createProject(req.body);
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'プロジェクト作成に失敗しました' });
  }
});

app.get('/api/projects/:id', async (req, res) => {
  try {
    const project = await storage.getProject(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'プロジェクトが見つかりません' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'プロジェクト取得に失敗しました' });
  }
});

const server = createServer(app);

async function startServer() {
  try {
    const port = parseInt(process.env.PORT || '5000', 10);
    const host = 'localhost';

    // Vite開発サーバーを起動
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
      root: path.resolve(process.cwd(), 'client'),
      publicDir: false,
      build: {
        outDir: '../dist/public'
      }
    });

    app.use(vite.middlewares);

    // SPAのフォールバック
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;

      try {
        // HTML template を読み込み
        const templatePath = path.resolve(process.cwd(), 'client/index.html');
        const template = await import('fs').then(fs => fs.promises.readFile(templatePath, 'utf-8'));
        const html = await vite.transformIndexHtml(url, template);

        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });

    server.listen({ port, host }, () => {
      console.log(`🚀 サーバーが起動しました: http://${host}:${port}`);
      console.log('📝 ローカル環境 + Vite開発サーバー');
    });

  } catch (error) {
    console.error('サーバー起動エラー:', error);
    process.exit(1);
  }
}

startServer();