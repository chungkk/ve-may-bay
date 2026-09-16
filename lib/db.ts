// ============================================
// SQLite Database — better-sqlite3
// ============================================

import Database from 'better-sqlite3';
import path from 'path';
import crypto from 'crypto';

const DB_PATH = path.join(process.cwd(), 'data', 've-may-bay.db');

// Ensure data directory exists
import fs from 'fs';
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Singleton database connection
let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');
    initSchema(_db);
  }
  return _db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      password_hash TEXT,
      google_id TEXT,
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS price_alerts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      origin TEXT NOT NULL,
      destination TEXT NOT NULL,
      target_price REAL NOT NULL,
      currency TEXT DEFAULT 'EUR',
      depart_date_from TEXT,
      depart_date_to TEXT,
      is_active INTEGER DEFAULT 1,
      notify_email INTEGER DEFAULT 1,
      last_notified_at DATETIME,
      last_checked_price REAL,
      notify_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_alerts_user ON price_alerts(user_id);
    CREATE INDEX IF NOT EXISTS idx_alerts_active ON price_alerts(is_active);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_google ON users(google_id);
  `);
}

// ---- User Helpers ----
export interface DbUser {
  id: string;
  email: string;
  name: string | null;
  password_hash: string | null;
  google_id: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export function createUser(data: {
  email: string;
  name?: string;
  password_hash?: string;
  google_id?: string;
  avatar_url?: string;
}): DbUser {
  const db = getDb();
  const id = crypto.randomUUID();
  const stmt = db.prepare(`
    INSERT INTO users (id, email, name, password_hash, google_id, avatar_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  stmt.run(id, data.email, data.name || null, data.password_hash || null, data.google_id || null, data.avatar_url || null);
  return getUserById(id)!;
}

export function getUserByEmail(email: string): DbUser | null {
  const db = getDb();
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as DbUser | null;
}

export function getUserById(id: string): DbUser | null {
  const db = getDb();
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as DbUser | null;
}

export function getUserByGoogleId(googleId: string): DbUser | null {
  const db = getDb();
  return db.prepare('SELECT * FROM users WHERE google_id = ?').get(googleId) as DbUser | null;
}

export function updateUser(id: string, data: Partial<Pick<DbUser, 'name' | 'avatar_url' | 'google_id'>>): void {
  const db = getDb();
  const sets: string[] = [];
  const values: unknown[] = [];

  if (data.name !== undefined) { sets.push('name = ?'); values.push(data.name); }
  if (data.avatar_url !== undefined) { sets.push('avatar_url = ?'); values.push(data.avatar_url); }
  if (data.google_id !== undefined) { sets.push('google_id = ?'); values.push(data.google_id); }

  if (sets.length === 0) return;
  sets.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);

  db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).run(...values);
}

// ---- Price Alert Helpers ----
export interface DbPriceAlert {
  id: string;
  user_id: string;
  origin: string;
  destination: string;
  target_price: number;
  currency: string;
  depart_date_from: string | null;
  depart_date_to: string | null;
  is_active: number;
  notify_email: number;
  last_notified_at: string | null;
  last_checked_price: number | null;
  notify_count: number;
  created_at: string;
}

export function createAlert(data: {
  user_id: string;
  origin: string;
  destination: string;
  target_price: number;
  currency?: string;
  depart_date_from?: string;
  depart_date_to?: string;
}): DbPriceAlert {
  const db = getDb();
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO price_alerts (id, user_id, origin, destination, target_price, currency, depart_date_from, depart_date_to)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.user_id,
    data.origin.toUpperCase(),
    data.destination.toUpperCase(),
    data.target_price,
    data.currency || 'EUR',
    data.depart_date_from || null,
    data.depart_date_to || null
  );
  return getAlertById(id)!;
}

export function getAlertsByUserId(userId: string): DbPriceAlert[] {
  const db = getDb();
  return db.prepare('SELECT * FROM price_alerts WHERE user_id = ? ORDER BY created_at DESC').all(userId) as DbPriceAlert[];
}

export function getAlertById(id: string): DbPriceAlert | null {
  const db = getDb();
  return db.prepare('SELECT * FROM price_alerts WHERE id = ?').get(id) as DbPriceAlert | null;
}

export function getActiveAlerts(): DbPriceAlert[] {
  const db = getDb();
  return db.prepare('SELECT * FROM price_alerts WHERE is_active = 1').all() as DbPriceAlert[];
}

export function toggleAlert(id: string, userId: string): boolean {
  const db = getDb();
  const result = db.prepare(
    'UPDATE price_alerts SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END WHERE id = ? AND user_id = ?'
  ).run(id, userId);
  return result.changes > 0;
}

export function deleteAlert(id: string, userId: string): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM price_alerts WHERE id = ? AND user_id = ?').run(id, userId);
  return result.changes > 0;
}

export function updateAlertCheck(id: string, price: number): void {
  const db = getDb();
  db.prepare(
    'UPDATE price_alerts SET last_checked_price = ?, last_notified_at = CURRENT_TIMESTAMP, notify_count = notify_count + 1 WHERE id = ?'
  ).run(price, id);
}
