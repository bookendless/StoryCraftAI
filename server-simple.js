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

// 基本的なAPIエンドポイント
app.get('/api/projects', (req, res) => {
  res.json([]);
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
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