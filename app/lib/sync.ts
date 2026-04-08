import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import {
  getSyncQueue,
  removeSyncItem,
  updateSyncItemError,
  upsertMany,
  setSyncMeta,
  getSyncMeta,
  getSyncQueueCount,
} from "./db";
import { api as rawApi } from "./api";

type SyncListener = (status: SyncStatus) => void;

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncAt: string | null;
}

let _isOnline = true;
let _isSyncing = false;
let _listeners: SyncListener[] = [];
let _unsubscribeNetInfo: (() => void) | null = null;

export function getIsOnline(): boolean {
  return _isOnline;
}

// ── Listeners ──

export function addSyncListener(fn: SyncListener): () => void {
  _listeners.push(fn);
  return () => {
    _listeners = _listeners.filter((l) => l !== fn);
  };
}

async function notifyListeners() {
  const count = await getSyncQueueCount();
  const lastSync = await getSyncMeta("last_sync");
  const status: SyncStatus = {
    isOnline: _isOnline,
    isSyncing: _isSyncing,
    pendingCount: count,
    lastSyncAt: lastSync,
  };
  _listeners.forEach((fn) => fn(status));
}

// ── Network monitoring ──

export function startNetworkMonitor() {
  if (_unsubscribeNetInfo) return; // already running

  _unsubscribeNetInfo = NetInfo.addEventListener((state: NetInfoState) => {
    const wasOffline = !_isOnline;
    _isOnline = state.isConnected === true && state.isInternetReachable !== false;

    notifyListeners();

    // Auto-sync when coming back online
    if (wasOffline && _isOnline) {
      processSyncQueue();
    }
  });

  // Check initial state
  NetInfo.fetch().then((state) => {
    _isOnline = state.isConnected === true && state.isInternetReachable !== false;
    notifyListeners();
  });
}

export function stopNetworkMonitor() {
  if (_unsubscribeNetInfo) {
    _unsubscribeNetInfo();
    _unsubscribeNetInfo = null;
  }
}

// ── Sync queue processing ──

const MAX_RETRIES = 5;

export async function processSyncQueue(): Promise<{ success: number; failed: number }> {
  if (_isSyncing || !_isOnline) return { success: 0, failed: 0 };

  _isSyncing = true;
  notifyListeners();

  let success = 0;
  let failed = 0;

  try {
    const queue = await getSyncQueue();

    for (const item of queue) {
      if (!_isOnline) break; // stop if we went offline mid-sync

      if (item.retries >= MAX_RETRIES) {
        await removeSyncItem(item.id);
        failed++;
        continue;
      }

      try {
        const body = item.body ? JSON.parse(item.body) : undefined;
        await rawApi(item.endpoint, { method: item.method, body });
        await removeSyncItem(item.id);
        success++;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        await updateSyncItemError(item.id, msg);
        failed++;
      }
    }

    if (success > 0) {
      await setSyncMeta("last_sync", new Date().toISOString());
    }
  } finally {
    _isSyncing = false;
    notifyListeners();
  }

  return { success, failed };
}

// ── Full data sync (download from server) ──

export async function fullSync(): Promise<void> {
  if (!_isOnline) return;

  _isSyncing = true;
  notifyListeners();

  try {
    // Process pending uploads first
    await processSyncQueue();

    // Download latest data from server
    const [farmers, buyers, products, deals] = await Promise.all([
      rawApi<any[]>("/farmers").catch(() => []),
      rawApi<any[]>("/buyers").catch(() => []),
      rawApi<any[]>("/products").catch(() => []),
      rawApi<any[]>("/deals?limit=200").catch(() => []),
    ]);

    // Upsert into local DB
    await upsertMany(
      "farmers",
      farmers.map((f: any) => ({
        id: f.id,
        name: f.name,
        phone: f.phone || null,
        village: f.village || null,
        district: f.district || null,
        state: f.state || null,
        notes: f.notes || null,
        is_active: f.is_active ? 1 : 0,
        updated_at: f.updated_at || new Date().toISOString(),
      }))
    );

    await upsertMany(
      "buyers",
      buyers.map((b: any) => ({
        id: b.id,
        name: b.name,
        contact_person: b.contact_person || null,
        phone: b.phone || null,
        company_type: b.company_type || null,
        city: b.city || null,
        state: b.state || null,
        gst_number: b.gst_number || null,
        notes: b.notes || null,
        is_active: b.is_active ? 1 : 0,
        updated_at: b.updated_at || new Date().toISOString(),
      }))
    );

    await upsertMany(
      "products",
      products.map((p: any) => ({
        id: p.id,
        name: p.name,
        name_local: p.name_local || null,
        category: p.category || null,
        unit: p.unit || "kg",
        updated_at: new Date().toISOString(),
      }))
    );

    await upsertMany(
      "deals",
      deals.map((d: any) => ({
        id: d.id,
        farmer_id: d.farmer_id || null,
        buyer_id: d.buyer_id || null,
        product_id: d.product_id || null,
        farmer_name: d.farmer_name || null,
        buyer_name: d.buyer_name || null,
        product_name: d.product_name || null,
        quantity: d.quantity,
        unit: d.unit || "kg",
        buy_rate: d.buy_rate,
        sell_rate: d.sell_rate,
        transport_cost: d.transport_cost || 0,
        labour_cost: d.labour_cost || 0,
        other_cost: d.other_cost || 0,
        status: d.status || "pending",
        deal_date: d.deal_date,
        notes: d.notes || null,
        net_profit: d.net_profit || 0,
        updated_at: d.updated_at || new Date().toISOString(),
      }))
    );

    await setSyncMeta("last_sync", new Date().toISOString());
    await setSyncMeta("last_full_sync", new Date().toISOString());
  } finally {
    _isSyncing = false;
    notifyListeners();
  }
}
