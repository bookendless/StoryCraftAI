const { app, BrowserWindow } = require('electron');
const path = require('path');

console.log('Electron starting...');
console.log('Electron version:', process.versions.electron);
console.log('Node version:', process.versions.node);
console.log('Current directory:', __dirname);

let mainWindow;

function createWindow() {
  console.log('Creating main window...');
  
  // メインウィンドウを作成
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
    show: false,
  });

  console.log('Loading URL: http://localhost:5000');

  // サーバーが起動していることを確認してからロード
  mainWindow.loadURL('http://localhost:5000')
    .then(() => {
      console.log('URL loaded successfully');
    })
    .catch((error) => {
      console.error('Failed to load URL:', error);
    });

  mainWindow.once('ready-to-show', () => {
    console.log('Window ready to show');
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    console.log('Main window closed');
    mainWindow = null;
  });

  // エラーハンドリング
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Failed to load page:', {
      errorCode,
      errorDescription,
      validatedURL
    });
  });

  // 開発者ツールを開く（デバッグ用）
  mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  console.log('App ready, creating window...');
  createWindow();
});

app.on('window-all-closed', () => {
  console.log('All windows closed');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  console.log('App activated');
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// エラーハンドリング
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});