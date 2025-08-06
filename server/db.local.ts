import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from "@shared/schema";
import { join } from 'path';

// ローカル環境用SQLiteデータベース
const databasePath = process.env.NODE_ENV === 'local' 
  ? join(process.cwd(), 'local.db')
  : './local.db';

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