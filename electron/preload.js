const { contextBridge, ipcRenderer } = require('electron');

// セキュアなAPIをレンダラープロセスに公開
contextBridge.exposeInMainWorld('electronAPI', {
  // Ollama関連
  checkOllama: () => ipcRenderer.invoke('check-ollama'),
  
  // メニューイベントのリスナー
  onNewProject: (callback) => ipcRenderer.on('new-project', callback),
  onCheckAI: (callback) => ipcRenderer.on('check-ai', callback),
  
  // アプリ情報
  getAppVersion: () => process.env.npm_package_version || '1.0.0',
  isElectron: true
});