"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";

interface Deal {
  id: number;
  deal_date: string;
  farmer_name: string;
  buyer_name: string;
  product_name: string;
  quantity: number;
  buy_rate: number;
  sell_rate: number;
  net_profit: number;
  status: string;
}

interface Party {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
}

interface NewDealForm {
  farmer_id: string;
  buyer_id: string;
  product_id: string;
  quantity: string;
  buy_rate: string;
  sell_rate: string;
  transport_cost: string;
  labour_cost: string;
}

const emptyForm: NewDealForm = {
  farmer_id: "",
  buyer_id: "",
  product_id: "",
  quantity: "",
  buy_rate: "",
  sell_rate: "",
  transport_cost: "0",
  labour_cost: "0",
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [farmers, setFarmers] = useState<Party[]>([]);
  const [buyers, setBuyers] = useState<Party[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewDealForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 50;

  const fetchDeals = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    params.set("limit", String(PAGE_SIZE));
    params.set("offset", String(page * PAGE_SIZE));
    api
      .get(`/deals?${params.toString()}`)
      .then((res) => {
        setDeals(res.data);
        setHasMore(res.data.length === PAGE_SIZE);
      })
      .catch(() => setError("Failed to load deals."))
      .finally(() => setLoading(false));
  }, [statusFilter, page]);

  useEffect(() => {
    fetchDeals();
    api.get("/farmers").then((res) => setFarmers(res.data)).catch(() => {});
    api.get("/buyers").then((res) => setBuyers(res.data)).catch(() => {});
    api.get("/products").then((res) => setProducts(res.data)).catch(() => {});
  }, [fetchDeals]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.post("/deals", {
        farmer_id: parseInt(form.farmer_id),
        buyer_id: parseInt(form.buyer_id),
        product_id: parseInt(form.product_id),
        quantity: parseFloat(form.quantity),
        buy_rate: parseFloat(form.buy_rate),
        sell_rate: parseFloat(form.sell_rate),
        transport_cost: parseFloat(form.transport_cost) || 0,
        labour_cost: parseFloat(form.labour_cost) || 0,
      });
      setForm(emptyForm);
      setShowForm(false);
      fetchDeals();
    } catch {
      setError("Failed to create deal.");
    } finally {
      setSubmitting(false);
    }
  };

  const statusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Deals</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
        >
          {showForm ? "Cancel" : "+ New Deal"}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* Status Filter */}
      <div className="mb-4 flex gap-2">
        {["", "pending", "completed", "cancelled"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              statusFilter === s
                ? "bg-emerald-600 text-white"
                : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* New Deal Form */}
      {showForm && (
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Create New Deal</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Farmer</label>
              <select
                name="farmer_id"
                value={form.farmer_id}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              >
                <option value="">Select farmer</option>
                {farmers.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Buyer</label>
              <select
                name="buyer_id"
                value={form.buyer_id}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              >
                <option value="">Select buyer</option>
                {buyers.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
              <select
                name="product_id"
                value={form.product_id}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              >
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (kg)</label>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Buy Rate (per kg)</label>
              <input
                type="number"
                name="buy_rate"
                value={form.buy_rate}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sell Rate (per kg)</label>
              <input
                type="number"
                name="sell_rate"
                value={form.sell_rate}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transport Cost</label>
              <input
                type="number"
                name="transport_cost"
                value={form.transport_cost}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Labour Cost</label>
              <input
                type="number"
                name="labour_cost"
                value={form.labour_cost}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? "Creating..." : "Create Deal"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Deals Table */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
        </div>
      ) : deals.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No deals found. Create your first deal above.</div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Farmer</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Buyer</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Product</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Qty (kg)</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Buy Rate</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Sell Rate</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Profit</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {deals.map((deal) => (
                    <tr key={deal.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-700">{deal.deal_date}</td>
                      <td className="px-4 py-3 text-gray-700">{deal.farmer_name}</td>
                      <td className="px-4 py-3 text-gray-700">{deal.buyer_name}</td>
                      <td className="px-4 py-3 text-gray-700">{deal.product_name}</td>
                      <td className="px-4 py-3 text-gray-700 text-right">{deal.quantity}</td>
                      <td className="px-4 py-3 text-gray-700 text-right">{formatCurrency(deal.buy_rate)}</td>
                      <td className="px-4 py-3 text-gray-700 text-right">{formatCurrency(deal.sell_rate)}</td>
                      <td className={`px-4 py-3 text-right font-medium ${deal.net_profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {formatCurrency(deal.net_profit)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(deal.status)}`}>
                          {deal.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-gray-500">
              Page {page + 1} · {deals.length} results
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasMore}
                className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
