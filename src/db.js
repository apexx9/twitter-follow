import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { config } from "../config.js";

const dbPath = resolve(config.databasePath);
mkdirSync(dirname(dbPath), { recursive: true });

export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE COLLATE NOCASE,
    profile_url TEXT NOT NULL,
    display_name TEXT DEFAULT '',
    country TEXT DEFAULT 'Unknown',
    followers INTEGER DEFAULT 0,
    following INTEGER DEFAULT 0,
    posts_7d INTEGER DEFAULT 0,
    replies_7d INTEGER DEFAULT 0,
    likes_7d INTEGER DEFAULT 0,
    bio TEXT DEFAULT '',
    tags TEXT DEFAULT '',
    score REAL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'new',
    source TEXT DEFAULT 'manual-import',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_accounts_status ON accounts(status);
  CREATE INDEX IF NOT EXISTS idx_accounts_score ON accounts(score DESC);
`);

export function closeDb() {
  db.close();
}
