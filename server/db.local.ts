import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from "@shared/schema";
import { join, resolve } from 'path';
import { existsSync, mkdirSync } from 'fs';

// Windows互換のデータベースパス設定
const getDataPath = () => {
  if (process.platform === 'win32') {
    // Windowsの場合、ユーザーのAppDataディレクトリを使用
    const appDataPath = process.env.APPDATA || join(process.env.USERPROFILE || '', 'AppData', 'Roaming');
    const appDir = join(appDataPath, 'AIストーリービルダー');
    
    // ディレクトリが存在しない場合は作成
    if (!existsSync(appDir)) {
      mkdirSync(appDir, { recursive: true });
    }
    
    return join(appDir, 'local.db');
  }
  
  // その他のプラットフォーム
  return resolve(process.cwd(), 'local.db');
};

const databasePath = getDataPath();
console.log('データベースパス:', databasePath);

// データベース接続
const sqlite = new Database(databasePath);

// WALモードを有効にしてパフォーマンスを向上
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });

// アプリケーション終了時にデータベースを閉じる
process.on('exit', () => sqlite.close());
process.on('SIGINT', () => {
  sqlite.close();
  process.exit(0);
});