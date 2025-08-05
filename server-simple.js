const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// 静的ファイル配信 - distディレクトリが存在しない場合の対処
const distPath = path.join(__dirname, 'client/dist');
const fs = require('fs');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  console.log('Static files served from:', distPath);
} else {
  console.log('Warning: client/dist directory not found. Please run: npm run build');
  // 開発環境用の代替パス
  const clientPath = path.join(__dirname, 'client');
  if (fs.existsSync(clientPath)) {
    app.use(express.static(clientPath));
    console.log('Using client directory as fallback');
  }
}
app.use(express.json());

// 基本的なAPIエンドポイント
app.get('/api/projects', (req, res) => {
  res.json([]);
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// フロントエンドのルーティング対応
app.get('*', (req, res) => {
  const fs = require('fs');
  const distIndexPath = path.join(__dirname, 'client/dist/index.html');
  const clientIndexPath = path.join(__dirname, 'client/index.html');
  
  if (fs.existsSync(distIndexPath)) {
    res.sendFile(distIndexPath);
  } else if (fs.existsSync(clientIndexPath)) {
    res.sendFile(clientIndexPath);
  } else {
    res.status(404).send(`
      <html>
        <body>
          <h1>AI Story Builder</h1>
          <p>Frontend not built yet. Please run:</p>
          <pre>npm run build</pre>
          <p>Or check if the development server is running properly.</p>
        </body>
      </html>
    `);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[express] serving on port ${PORT}`);
  console.log(`Server is ready at http://localhost:${PORT}`);
});