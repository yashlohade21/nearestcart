"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

interface AuditEntry {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  changes: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

const ACTION_COLORS: Record<string, string> = {
  create: "bg-green-100 text-green-700",
  update: "bg-blue-100 text-blue-700",
  delete: "bg-red-100 text-red-700",
};

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = { limit: "100" };
    if (entityFilter) params.entity_type = entityFilter;
    api.get("/audit", { params })
      .then((res) => setLogs(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [entityFilter]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Activity Log</h1>

      <div className="flex gap-2 mb-4">
        {["", "deal", "payment", "farmer", "buyer"].map((f) => (
          <button
            key={f}
            onClick={() => setEntityFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors capitalize ${
              entityFilter === f
                ? "bg-emerald-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {f || "All"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500">No activity recorded yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex items-start gap-4">
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${ACTION_COLORS[log.action] || "bg-gray-100 text-gray-700"}`}>
                {log.action}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">
                  <span className="capitalize">{log.entity_type}</span>
                  <span className="text-gray-400 ml-2 text-xs font-mono">{log.entity_id.slice(0, 8)}...</span>
                </p>
                {log.changes && Object.keys(log.changes).length > 0 && (
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    Changed: {Object.keys(log.changes).join(", ")}
                  </p>
                )}
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {new Date(log.created_at).toLocaleString("en-IN")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
