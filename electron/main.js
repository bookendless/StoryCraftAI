const { app, BrowserWindow, Menu, shell, dialog, ipcMain } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const { existsSync } = require('fs');

// アプリケーションの状態
let mainWindow;
let serverProcess;
const isDevelopment = process.env.NODE_ENV === 'local';
const port = 5000;

// セキュリティ設定
app.commandLine.appendSwitch('--no-sandbox');
app.commandLine.appendSwitch('--disable-web-security');

// アプリケーション準備完了時
app.whenReady().then(() => {
  createWindow();
  startLocalServer();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// 全ウィンドウが閉じられた時
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    stopLocalServer();
    app.quit();
  }
});

// アプリケーション終了前
app.on('before-quit', () => {
  stopLocalServer();
});

// メインウィンドウの作成
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 1000,
    minWidth: 1200,
    minHeight: 800,
    icon: path.join(__dirname, '../assets/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: false,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false,
    titleBarStyle: 'default',
    autoHideMenuBar: false
  });

  // メニューバーの設定
  const template = [
    {
      label: 'ファイル',
      submenu: [
        {
          label: '新しいプロジェクト',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('new-project');
          }
        },
        { type: 'separator' },
        {
          label: '終了',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: '編集',
      submenu: [
        { label: '元に戻す', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'やり直し', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: '切り取り', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'コピー', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: '貼り付け', accelerator: 'CmdOrCtrl+V', role: 'paste' }
      ]
    },
    {
      label: 'AI',
      submenu: [
        {
          label: 'Ollama設定',
          click: () => {
            shell.openExternal('http://localhost:11434');
          }
        },
        {
          label: 'AI動作確認',
          click: () => {
            mainWindow.webContents.send('check-ai');
          }
        }
      ]
    },
    {
      label: 'ヘルプ',
      submenu: [
        {
          label: 'バージョン情報',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'AIストーリービルダーについて',
              message: 'AIストーリービルダー v1.0.0',
              detail: 'ローカルAI搭載の小説創作支援アプリケーション\n\n' +
                     'データベース: SQLite\n' +
                     'AI: Ollama (ローカルLLM)\n' +
                     'フレームワーク: Electron + React'
            });
          }
        },
        {
          label: 'Ollamaガイド',
          click: () => {
            shell.openExternal('https://ollama.ai/');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // ローカルサーバーが起動するまで待機
  const checkServer = setInterval(() => {
    mainWindow.loadURL(`http://localhost:${port}`)
      .then(() => {
        clearInterval(checkServer);
        mainWindow.show();
        
        // 開発者ツールを開く（必要に応じて）
        if (isDevelopment) {
          mainWindow.webContents.openDevTools();
        }
      })
      .catch(() => {
        // サーバーがまだ起動していない場合は再試行
      });
  }, 1000);

  // 外部リンクを既定のブラウザで開く
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// ローカルサーバーの起動
function startLocalServer() {
  const serverScript = path.join(__dirname, '../server/index.local.js');
  
  if (!existsSync(serverScript)) {
    console.error('サーバースクリプトが見つかりません:', serverScript);
    dialog.showErrorBox(
      'エラー',
      'アプリケーションファイルが見つかりません。再インストールしてください。'
    );
    return;
  }

  console.log('ローカルサーバーを起動中...');
  
  serverProcess = spawn('node', [serverScript], {
    env: { ...process.env, NODE_ENV: 'local', PORT: port.toString() },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  serverProcess.stdout.on('data', (data) => {
    console.log(`サーバー: ${data}`);
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`サーバーエラー: ${data}`);
  });

  serverProcess.on('close', (code) => {
    console.log(`サーバープロセスが終了しました (コード: ${code})`);
  });

  serverProcess.on('error', (error) => {
    console.error('サーバー起動エラー:', error);
    dialog.showErrorBox(
      'サーバー起動エラー',
      'ローカルサーバーの起動に失敗しました。アプリケーションを再起動してください。'
    );
  });
}

// ローカルサーバーの停止
function stopLocalServer() {
  if (serverProcess) {
    console.log('ローカルサーバーを停止中...');
    serverProcess.kill('SIGTERM');
    serverProcess = null;
  }
}

// IPCハンドラー
ipcMain.handle('check-ollama', async () => {
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    if (response.ok) {
      const data = await response.json();
      return { connected: true, models: data.models };
    }
    return { connected: false, models: [] };
  } catch (error) {
    return { connected: false, models: [], error: error.message };
  }
});

// アプリケーション情報
app.setName('AIストーリービルダー');
app.setAboutPanelOptions({
  applicationName: 'AIストーリービルダー',
  applicationVersion: '1.0.0',
  copyright: '© 2025 AI Story Builder',
  credits: 'ローカルAI搭載の小説創作支援アプリケーション'
});