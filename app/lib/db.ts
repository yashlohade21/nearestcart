import * as SQLite from "expo-sqlite";
import { Platform } from "react-native";

let _db: SQLite.SQLiteDatabase | null = null;
let _initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    if (Platform.OS === "web") {
      // expo-sqlite web requires WASM that Metro can't bundle — skip
      throw new Error("SQLite not supported on web");
    }
    const db = await SQLite.openDatabaseAsync("dalla_local.db");
    await initSchema(db);
    _db = db;
    return db;
  })();

  try {
    return await _initPromise;
  } catch (err) {
    _initPromise = null;
    throw err;
  }
}

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS farmers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      village TEXT,
      district TEXT,
      state TEXT,
      notes TEXT,
      is_active INTEGER DEFAULT 1,
      updated_at TEXT
    )`,
  `CREATE TABLE IF NOT EXISTS buyers (
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
    )`,
  `CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      name_local TEXT,
      category TEXT,
      unit TEXT DEFAULT 'kg',
      updated_at TEXT
    )`,
  `CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      commission_rate REAL,
      city TEXT,
      state TEXT,
      notes TEXT,
      is_active INTEGER DEFAULT 1,
      updated_at TEXT
    )`,
  `CREATE TABLE IF NOT EXISTS bank_accounts (
      id TEXT PRIMARY KEY,
      bank_name TEXT NOT NULL,
      account_no TEXT,
      ifsc_code TEXT,
      branch TEXT,
      opening_balance REAL DEFAULT 0,
      current_balance REAL DEFAULT 0,
      notes TEXT,
      is_active INTEGER DEFAULT 1,
      updated_at TEXT
    )`,
  `CREATE TABLE IF NOT EXISTS deals (
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
    )`,
  // ── Mandi trading & accounting tables ──
  `CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT,
      gst_no TEXT,
      pan_no TEXT,
      is_default INTEGER DEFAULT 0,
      phone TEXT,
      email TEXT,
      updated_at TEXT
    )`,
  `CREATE TABLE IF NOT EXISTS cash_entries (
      id TEXT PRIMARY KEY,
      company_id TEXT,
      entry_date TEXT,
      type TEXT,
      narration TEXT,
      amount REAL,
      party_name TEXT,
      party_type TEXT,
      reference_no TEXT,
      branch TEXT,
      updated_at TEXT
    )`,
  `CREATE TABLE IF NOT EXISTS bank_transactions (
      id TEXT PRIMARY KEY,
      company_id TEXT,
      bank_account_id TEXT,
      txn_date TEXT,
      type TEXT,
      amount REAL,
      party_name TEXT,
      cheque_no TEXT,
      cheque_date TEXT,
      narration TEXT,
      reconciled INTEGER DEFAULT 0,
      updated_at TEXT
    )`,
  `CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      company_id TEXT,
      expense_date TEXT,
      category TEXT,
      narration TEXT,
      amount REAL,
      payment_mode TEXT DEFAULT 'cash',
      bank_account_id TEXT,
      cheque_no TEXT,
      party_name TEXT,
      farmer_bill_ref TEXT,
      updated_at TEXT
    )`,
  `CREATE TABLE IF NOT EXISTS purchase_entries (
      id TEXT PRIMARY KEY,
      company_id TEXT,
      bill_no TEXT,
      p_date TEXT,
      supplier_id TEXT,
      vehicle_no TEXT,
      product_id TEXT,
      agent_id TEXT,
      quantity REAL,
      rate REAL,
      gross_amount REAL,
      transport_cost REAL DEFAULT 0,
      loading_cost REAL DEFAULT 0,
      unloading_cost REAL DEFAULT 0,
      advance REAL DEFAULT 0,
      net_amount REAL,
      commission_deduction REAL DEFAULT 0,
      branch TEXT,
      notes TEXT,
      updated_at TEXT
    )`,
  `CREATE TABLE IF NOT EXISTS sale_entries (
      id TEXT PRIMARY KEY,
      company_id TEXT,
      invoice_no TEXT,
      sale_date TEXT,
      buyer_id TEXT,
      product_id TEXT,
      quantity REAL,
      rate REAL,
      gross_amount REAL,
      transport_cost REAL DEFAULT 0,
      lr_no TEXT,
      driver_name TEXT,
      vehicle_no TEXT,
      owner_name TEXT,
      hsn_code TEXT,
      tcs_amount REAL DEFAULT 0,
      add_topay REAL DEFAULT 0,
      less_topay REAL DEFAULT 0,
      net_amount REAL,
      po_no TEXT,
      branch TEXT,
      updated_at TEXT
    )`,
  `CREATE TABLE IF NOT EXISTS purchase_payments (
      id TEXT PRIMARY KEY,
      company_id TEXT,
      supplier_id TEXT,
      payment_date TEXT,
      bill_no TEXT,
      total REAL,
      paid REAL,
      balance REAL,
      bank_name TEXT,
      cheque_no TEXT,
      payment_mode TEXT DEFAULT 'cash',
      narration TEXT,
      updated_at TEXT
    )`,
  `CREATE TABLE IF NOT EXISTS sale_payments (
      id TEXT PRIMARY KEY,
      company_id TEXT,
      buyer_id TEXT,
      payment_date TEXT,
      invoice_no TEXT,
      total REAL,
      received REAL,
      balance REAL,
      bank_name TEXT,
      cheque_no TEXT,
      payment_mode TEXT DEFAULT 'cash',
      narration TEXT,
      updated_at TEXT
    )`,
  `CREATE TABLE IF NOT EXISTS farmer_entries (
      id TEXT PRIMARY KEY,
      company_id TEXT,
      invoice_no TEXT,
      entry_date TEXT,
      farmer_id TEXT,
      village TEXT,
      kharidar_id TEXT,
      product_id TEXT,
      weight REAL,
      rate REAL,
      amount REAL,
      hamali REAL DEFAULT 0,
      tawali REAL DEFAULT 0,
      warai REAL DEFAULT 0,
      auto_charge REAL DEFAULT 0,
      kharcha REAL DEFAULT 0,
      mobile_no TEXT,
      updated_at TEXT
    )`,
  `CREATE TABLE IF NOT EXISTS farmer_sales (
      id TEXT PRIMARY KEY,
      company_id TEXT,
      farmer_entry_id TEXT,
      market_fees REAL DEFAULT 0,
      supervision REAL DEFAULT 0,
      adat_commission REAL DEFAULT 0,
      bardan REAL DEFAULT 0,
      labour REAL DEFAULT 0,
      sutli REAL DEFAULT 0,
      gadi_bhada REAL DEFAULT 0,
      weight_short REAL DEFAULT 0,
      total_deductions REAL DEFAULT 0,
      net_payable REAL DEFAULT 0,
      updated_at TEXT
    )`,
  `CREATE TABLE IF NOT EXISTS farmer_payment_records (
      id TEXT PRIMARY KEY,
      company_id TEXT,
      farmer_id TEXT,
      payment_date TEXT,
      amount REAL,
      cash_amount REAL DEFAULT 0,
      bank_name TEXT,
      cheque_no TEXT,
      narration TEXT,
      updated_at TEXT
    )`,
  `CREATE TABLE IF NOT EXISTS nave_bills (
      id TEXT PRIMARY KEY,
      company_id TEXT,
      bill_no TEXT,
      bill_date TEXT,
      buyer_id TEXT,
      total_amount REAL DEFAULT 0,
      total_deductions REAL DEFAULT 0,
      net_amount REAL DEFAULT 0,
      status TEXT DEFAULT 'draft',
      updated_at TEXT
    )`,
  `CREATE TABLE IF NOT EXISTS nave_bill_items (
      id TEXT PRIMARY KEY,
      nave_bill_id TEXT,
      product_id TEXT,
      kharidar_name TEXT,
      pauti_no TEXT,
      weight REAL,
      rate REAL,
      amount REAL
    )`,
  `CREATE TABLE IF NOT EXISTS agent_commissions (
      id TEXT PRIMARY KEY,
      company_id TEXT,
      agent_id TEXT,
      bill_no TEXT,
      supplier_name TEXT,
      vehicle_no TEXT,
      bill_total REAL,
      commission_pct REAL,
      commission_amount REAL,
      payment_date TEXT,
      paid INTEGER DEFAULT 0,
      updated_at TEXT
    )`,
  `CREATE TABLE IF NOT EXISTS stock_ledger (
      id TEXT PRIMARY KEY,
      company_id TEXT,
      product_id TEXT,
      txn_date TEXT,
      txn_type TEXT,
      quantity REAL,
      reference_id TEXT,
      reference_type TEXT,
      balance_after REAL,
      updated_at TEXT
    )`,
  `CREATE TABLE IF NOT EXISTS vehicles (
      id TEXT PRIMARY KEY,
      company_id TEXT,
      vehicle_no TEXT,
      owner_name TEXT,
      driver_name TEXT,
      phone TEXT,
      vehicle_type TEXT,
      is_active INTEGER DEFAULT 1,
      updated_at TEXT
    )`,
  `CREATE TABLE IF NOT EXISTS delivery_places (
      id TEXT PRIMARY KEY,
      company_id TEXT,
      place_name TEXT NOT NULL,
      district TEXT,
      state TEXT,
      updated_at TEXT
    )`,
  `CREATE TABLE IF NOT EXISTS kharidars (
      id TEXT PRIMARY KEY,
      company_id TEXT,
      name TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      is_active INTEGER DEFAULT 1,
      updated_at TEXT
    )`,
  `CREATE TABLE IF NOT EXISTS sync_queue (
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
    )`,
  `CREATE TABLE IF NOT EXISTS sync_meta (
      key TEXT PRIMARY KEY,
      value TEXT
    )`,
];

async function initSchema(db: SQLite.SQLiteDatabase) {
  // Run PRAGMAs separately — they return result rows and can confuse multi-statement exec
  try {
    await db.execAsync("PRAGMA foreign_keys = ON");
  } catch {
    // Non-fatal
  }

  // Run each CREATE TABLE individually so one failure doesn't kill the rest
  for (const stmt of SCHEMA_STATEMENTS) {
    try {
      await db.execAsync(stmt);
    } catch (err) {
      console.warn("[db] Failed to run schema statement:", err);
    }
  }
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
