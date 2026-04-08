/**
 * Offline-aware API wrapper.
 *
 * - Reads: tries server first, falls back to local SQLite.
 * - Writes: sends to server if online, otherwise queues in sync_queue + writes locally.
 */

import { api as rawApi } from "./api";
import { getIsOnline } from "./sync";
import {
  getAll,
  getOne,
  upsertRow,
  addToSyncQueue,
  deleteRow,
} from "./db";

// ── Entity mapping: endpoint → table name ──

function tableForEndpoint(endpoint: string): string | null {
  if (endpoint.startsWith("/farmers")) return "farmers";
  if (endpoint.startsWith("/buyers")) return "buyers";
  if (endpoint.startsWith("/products")) return "products";
  if (endpoint.startsWith("/deals")) return "deals";
  return null;
}

// ── Offline-aware GET ──

export async function offlineGet<T>(endpoint: string): Promise<T> {
  if (getIsOnline()) {
    try {
      const data = await rawApi<T>(endpoint);
      // Cache list responses locally
      const table = tableForEndpoint(endpoint);
      if (table && Array.isArray(data)) {
        // Don't await — fire and forget to avoid blocking UI
        cacheListLocally(table, data as any[]).catch(() => {});
      }
      return data;
    } catch {
      // Network error — fall through to local
    }
  }

  // Offline or server error — read from local DB
  const table = tableForEndpoint(endpoint);
  if (!table) throw new Error("Offline: this data is not available locally");

  // Check if it's a detail request (e.g. /deals/uuid)
  const parts = endpoint.split("/").filter(Boolean);
  if (parts.length >= 2 && isUuid(parts[parts.length - 1])) {
    const id = parts[parts.length - 1];
    const row = await getOne<T>(table, id);
    if (!row) throw new Error("Not found in local cache");
    return row;
  }

  // List request
  const rows = await getAll<T>(table);
  return rows as unknown as T;
}

// ── Offline-aware POST (create) ──

export async function offlinePost<T>(
  endpoint: string,
  body: Record<string, unknown>
): Promise<T> {
  if (getIsOnline()) {
    try {
      return await rawApi<T>(endpoint, { method: "POST", body });
    } catch (err: unknown) {
      // If it's a real validation error (4xx), throw — don't queue
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("400") || msg.includes("422")) throw err;
      // Network error — fall through to offline queue
    }
  }

  // Queue for later sync
  const table = tableForEndpoint(endpoint);
  const tempId = body.id as string || `temp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  if (table) {
    await upsertRow(table, { ...body, id: tempId, updated_at: new Date().toISOString() });
  }

  await addToSyncQueue(
    table || "unknown",
    tempId,
    "create",
    endpoint,
    "POST",
    body
  );

  return { ...body, id: tempId, _offline: true } as unknown as T;
}

// ── Offline-aware PATCH (update) ──

export async function offlinePatch<T>(
  endpoint: string,
  body: Record<string, unknown>
): Promise<T> {
  if (getIsOnline()) {
    try {
      return await rawApi<T>(endpoint, { method: "PATCH", body });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("400") || msg.includes("422")) throw err;
    }
  }

  // Queue for later sync
  const table = tableForEndpoint(endpoint);
  const parts = endpoint.split("/").filter(Boolean);
  const entityId = parts[parts.length - 1];

  if (table && entityId) {
    await upsertRow(table, { ...body, id: entityId, updated_at: new Date().toISOString() });
  }

  await addToSyncQueue(
    table || "unknown",
    entityId || null,
    "update",
    endpoint,
    "PATCH",
    body
  );

  return { ...body, id: entityId, _offline: true } as unknown as T;
}

// ── Offline-aware DELETE ──

export async function offlineDelete(endpoint: string): Promise<void> {
  if (getIsOnline()) {
    try {
      await rawApi(endpoint, { method: "DELETE" });
      // Also remove from local cache
      const table = tableForEndpoint(endpoint);
      const parts = endpoint.split("/").filter(Boolean);
      const entityId = parts[parts.length - 1];
      if (table && entityId) {
        await deleteRow(table, entityId);
      }
      return;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("400") || msg.includes("404")) throw err;
    }
  }

  const table = tableForEndpoint(endpoint);
  const parts = endpoint.split("/").filter(Boolean);
  const entityId = parts[parts.length - 1];

  if (table && entityId) {
    await deleteRow(table, entityId);
  }

  await addToSyncQueue(
    table || "unknown",
    entityId || null,
    "delete",
    endpoint,
    "DELETE"
  );
}

// ── Helpers ──

function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)
    || s.startsWith("temp_");
}

async function cacheListLocally(table: string, rows: any[]): Promise<void> {
  const { upsertMany } = await import("./db");
  const mapped = rows.map((r) => {
    const row: Record<string, unknown> = { id: r.id };
    // Copy all simple fields
    for (const [key, val] of Object.entries(r)) {
      if (val !== null && val !== undefined && typeof val !== "object") {
        row[key] = val;
      }
    }
    if (!row.updated_at) row.updated_at = new Date().toISOString();
    return row;
  });
  await upsertMany(table, mapped);
}
