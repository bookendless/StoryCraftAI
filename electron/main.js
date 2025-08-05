import { app, BrowserWindow, Menu, dialog } from 'electron';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let serverProcess;

function createWindow() {
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
    icon: path.join(__dirname, '../assets/icon.png'), // アイコンファイルが存在する場合
    show: false, // 準備完了まで表示しない
  });

  // メニューバーを設定
  const menuTemplate = [
    {
      label: 'ファイル',
      submenu: [
        {
          label: '新しいプロジェクト',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.executeJavaScript(`
              window.dispatchEvent(new CustomEvent('electron-new-project'));
            `);
          }
        },
        { type: 'separator' },
        {
          label: '設定',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow.webContents.executeJavaScript(`
              window.dispatchEvent(new CustomEvent('electron-open-settings'));
            `);
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
      label: '表示',
      submenu: [
        { label: '再読み込み', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: '強制再読み込み', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
        { label: '開発者ツール', accelerator: 'F12', role: 'toggleDevTools' },
        { type: 'separator' },
        { label: '実際のサイズ', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
        { label: '拡大', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
        { label: '縮小', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
        { type: 'separator' },
        { label: '全画面表示', accelerator: 'F11', role: 'togglefullscreen' }
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
              title: 'バージョン情報',
              message: 'AIストーリービルダー',
              detail: `Version: 1.0.0\nElectron: ${process.versions.electron}\nNode: ${process.versions.node}`
            });
          }
        }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));

  // 開発環境では直接localhost:5000に接続
  // 本番環境では、ビルドされたファイルをロード
  if (isDev || process.env.NODE_ENV === 'development') {
    // 開発サーバーが起動するまで少し待機
    setTimeout(() => {
      mainWindow.loadURL('http://localhost:5000');
    }, 2000);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../client/dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (serverProcess) {
      serverProcess.kill();
    }
  });
}

// この関数は不要になったため削除

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// セキュリティ: 新しいウィンドウの作成を制限
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
  });
});