import * as SQLite from "expo-sqlite";

let _db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;
  _db = await SQLite.openDatabaseAsync("dalla_local.db");
  await initSchema(_db);
  return _db;
}

async function initSchema(db: SQLite.SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS farmers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      village TEXT,
      district TEXT,
      state TEXT,
      notes TEXT,
      is_active INTEGER DEFAULT 1,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS buyers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      contact_person TEXT,
      phone TEXT,
      company_type TEXT,
      city TEXT,
      state TEXT,
      gst_number TEXT,
      notes TEXT,
      is_active INTEGER DEFAULT 1,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      name_local TEXT,
      category TEXT,
      unit TEXT DEFAULT 'kg',
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS deals (
      id TEXT PRIMARY KEY,
      farmer_id TEXT,
      buyer_id TEXT,
      product_id TEXT,
      farmer_name TEXT,
      buyer_name TEXT,
      product_name TEXT,
      quantity REAL,
      unit TEXT DEFAULT 'kg',
      buy_rate REAL,
      sell_rate REAL,
      transport_cost REAL DEFAULT 0,
      labour_cost REAL DEFAULT 0,
      other_cost REAL DEFAULT 0,
      status TEXT DEFAULT 'pending',
      deal_date TEXT,
      notes TEXT,
      net_profit REAL,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      action TEXT NOT NULL,
      endpoint TEXT NOT NULL,
      method TEXT NOT NULL,
      body TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      retries INTEGER DEFAULT 0,
      last_error TEXT
    );

    CREATE TABLE IF NOT EXISTS sync_meta (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);
}

// ── Generic CRUD helpers ──

export async function upsertRow(
  table: string,
  data: Record<string, unknown>
): Promise<void> {
  const db = await getDb();
  const keys = Object.keys(data);
  const placeholders = keys.map(() => "?").join(", ");
  const updates = keys.map((k) => `${k} = excluded.${k}`).join(", ");
  const values = keys.map((k) => {
    const v = data[k];
    if (v === undefined || v === null) return null;
    if (typeof v === "boolean") return v ? 1 : 0;
    if (typeof v === "number" || typeof v === "string") return v;
    return String(v);
  });

  await db.runAsync(
    `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${placeholders})
     ON CONFLICT(id) DO UPDATE SET ${updates}`,
    values as any
  );
}

export async function upsertMany(
  table: string,
  rows: Record<string, unknown>[]
): Promise<void> {
  if (rows.length === 0) return;
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    for (const row of rows) {
      await upsertRow(table, row);
    }
  });
}

export async function getAll<T>(
  table: string,
  where?: string,
  params?: unknown[]
): Promise<T[]> {
  const db = await getDb();
  const sql = `SELECT * FROM ${table}${where ? ` WHERE ${where}` : ""} ORDER BY updated_at DESC`;
  return db.getAllAsync(sql, (params || []) as any) as Promise<T[]>;
}

export async function getOne<T>(table: string, id: string): Promise<T | null> {
  const db = await getDb();
  return db.getFirstAsync(`SELECT * FROM ${table} WHERE id = ?`, [id]) as Promise<T | null>;
}

export async function deleteRow(table: string, id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`DELETE FROM ${table} WHERE id = ?`, [id]);
}

// ── Sync queue ──

export async function addToSyncQueue(
  entityType: string,
  entityId: string | null,
  action: string,
  endpoint: string,
  method: string,
  body?: unknown
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO sync_queue (entity_type, entity_id, action, endpoint, method, body)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [entityType, entityId, action, endpoint, method, body ? JSON.stringify(body) : null]
  );
}

export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  const db = await getDb();
  return db.getAllAsync(
    "SELECT * FROM sync_queue ORDER BY created_at ASC"
  ) as Promise<SyncQueueItem[]>;
}

export async function removeSyncItem(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync("DELETE FROM sync_queue WHERE id = ?", [id]);
}

export async function updateSyncItemError(id: number, error: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    "UPDATE sync_queue SET retries = retries + 1, last_error = ? WHERE id = ?",
    [error, id]
  );
}

export async function getSyncQueueCount(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync("SELECT COUNT(*) as count FROM sync_queue") as { count: number } | null;
  return row?.count ?? 0;
}

// ── Sync metadata ──

export async function getSyncMeta(key: string): Promise<string | null> {
  const db = await getDb();
  const row = await db.getFirstAsync(
    "SELECT value FROM sync_meta WHERE key = ?",
    [key]
  ) as { value: string } | null;
  return row?.value ?? null;
}

export async function setSyncMeta(key: string, value: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    "INSERT INTO sync_meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    [key, value]
  );
}

export interface SyncQueueItem {
  id: number;
  entity_type: string;
  entity_id: string | null;
  action: string;
  endpoint: string;
  method: string;
  body: string | null;
  created_at: string;
  retries: number;
  last_error: string | null;
}
