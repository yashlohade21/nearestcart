"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";

interface Buyer {
  id: number;
  name: string;
  phone: string;
  company_type: string;
  city: string;
  total_deals: number;
  payment_rating: number;
}

interface NewBuyerForm {
  name: string;
  phone: string;
  company_type: string;
  city: string;
}

const emptyForm: NewBuyerForm = {
  name: "",
  phone: "",
  company_type: "",
  city: "",
};

export default function BuyersPage() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewBuyerForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 50;

  const fetchBuyers = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("limit", String(PAGE_SIZE));
    params.set("offset", String(page * PAGE_SIZE));
    api
      .get(`/buyers?${params.toString()}`)
      .then((res) => {
        setBuyers(res.data);
        setHasMore(res.data.length === PAGE_SIZE);
      })
      .catch(() => setError("Failed to load buyers."))
      .finally(() => setLoading(false));
  }, [search, page]);

  useEffect(() => {
    fetchBuyers();
  }, [fetchBuyers]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.post("/buyers", form);
      setForm(emptyForm);
      setShowForm(false);
      fetchBuyers();
    } catch {
      setError("Failed to add buyer.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? "text-yellow-400" : "text-gray-300"}>
          ★
        </span>
      );
    }
    return <span className="text-sm">{stars}</span>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Buyers</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
        >
          {showForm ? "Cancel" : "+ Add Buyer"}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search buyers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
        />
      </div>

      {showForm && (
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Buyer</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Buyer name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                placeholder="Phone number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Type</label>
              <input
                type="text"
                name="company_type"
                value={form.company_type}
                onChange={handleChange}
                placeholder="e.g. Retailer, Wholesaler"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                required
                placeholder="City name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? "Adding..." : "Add Buyer"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
        </div>
      ) : buyers.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No buyers found. Add your first buyer above.</div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Name</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Phone</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Company Type</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">City</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-600">Total Deals</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-600">Payment Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {buyers.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-800">{b.name}</td>
                      <td className="px-4 py-3 text-gray-600">{b.phone}</td>
                      <td className="px-4 py-3 text-gray-600">{b.company_type}</td>
                      <td className="px-4 py-3 text-gray-600">{b.city}</td>
                      <td className="px-4 py-3 text-center text-gray-700">{b.total_deals}</td>
                      <td className="px-4 py-3 text-center">{renderStars(b.payment_rating)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-gray-500">Page {page + 1} · {buyers.length} results</span>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors">Previous</button>
              <button onClick={() => setPage((p) => p + 1)} disabled={!hasMore} className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors">Next</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
