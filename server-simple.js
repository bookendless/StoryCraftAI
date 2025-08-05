const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// 静的ファイル配信
app.use(express.static(path.join(__dirname, 'client/dist')));
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
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[express] serving on port ${PORT}`);
  console.log(`Server is ready at http://localhost:${PORT}`);
});