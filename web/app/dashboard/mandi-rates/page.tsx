"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

interface MandiRate {
  id: string;
  product_name: string;
  mandi_name: string;
  city: string;
  state: string;
  min_price: number | null;
  max_price: number | null;
  modal_price: number | null;
  unit: string;
  rate_date: string;
  source: string;
}

function fmt(n: number | null): string {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

export default function MandiRatesPage() {
  const [rates, setRates] = useState<MandiRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [product, setProduct] = useState("");
  const [state, setState] = useState("");
  const [error, setError] = useState("");

  const fetchRates = () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (product.trim()) params.product = product.trim();
    if (state.trim()) params.state = state.trim();
    api.get("/mandi-rates", { params })
      .then((res) => setRates(res.data))
      .catch(() => setError("Failed to load rates."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRates(); }, []);

  const handleSync = async () => {
    setSyncing(true);
    setError("");
    try {
      const params: Record<string, string> = {};
      if (product.trim()) params.commodity = product.trim();
      if (state.trim()) params.state = state.trim();
      const res = await api.post("/mandi-rates/sync", null, { params });
      alert(`Synced ${res.data.synced} rates from ${res.data.fetched} fetched`);
      fetchRates();
    } catch {
      setError("Sync failed. Check internet connection.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Mandi Rates</h1>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          {syncing ? "Syncing..." : "Sync Latest Rates"}
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          value={product}
          onChange={(e) => setProduct(e.target.value)}
          placeholder="Search product..."
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
        />
        <input
          type="text"
          value={state}
          onChange={(e) => setState(e.target.value)}
          placeholder="Filter by state..."
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
        />
        <button
          onClick={fetchRates}
          className="px-4 py-2 bg-white text-gray-600 font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-sm"
        >
          Search
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
        </div>
      ) : rates.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-lg mb-2">No rates found</p>
          <p className="text-gray-400 text-sm">Try syncing latest rates or adjust your search filters</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Product</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Mandi</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">City / State</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Min Price</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Modal Price</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Max Price</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rates.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">{r.product_name}</td>
                    <td className="px-4 py-3 text-gray-600">{r.mandi_name}</td>
                    <td className="px-4 py-3 text-gray-600">{r.city}, {r.state}</td>
                    <td className="px-4 py-3 text-right">{fmt(r.min_price)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-700">{fmt(r.modal_price)}</td>
                    <td className="px-4 py-3 text-right">{fmt(r.max_price)}</td>
                    <td className="px-4 py-3 text-center text-gray-500 text-xs">{r.rate_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
