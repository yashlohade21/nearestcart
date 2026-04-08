"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";

interface Advance {
  id: string;
  farmer_id: string;
  farmer_name: string | null;
  amount: number;
  recovered: number;
  balance: number;
  purpose: string | null;
  given_date: string;
  expected_recovery_date: string | null;
  status: string;
  notes: string | null;
}

interface Farmer {
  id: string;
  name: string;
}

interface NewAdvanceForm {
  farmer_id: string;
  amount: string;
  purpose: string;
  notes: string;
}

const emptyForm: NewAdvanceForm = {
  farmer_id: "",
  amount: "",
  purpose: "",
  notes: "",
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function statusBadge(status: string): string {
  switch (status) {
    case "recovered":
      return "bg-green-100 text-green-700";
    case "partial":
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-amber-100 text-amber-700";
  }
}

export default function AdvancesPage() {
  const [advances, setAdvances] = useState<Advance[]>([]);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewAdvanceForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<"active" | "all">("active");

  const fetchAdvances = useCallback(() => {
    setLoading(true);
    const endpoint = filter === "active" ? "/advances/active" : "/advances";
    api
      .get(endpoint)
      .then((res) => setAdvances(res.data))
      .catch(() => setError("Failed to load advances."))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => {
    fetchAdvances();
    api.get("/farmers").then((res) => setFarmers(res.data)).catch(() => {});
  }, [fetchAdvances]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.post("/advances", {
        farmer_id: form.farmer_id,
        amount: parseFloat(form.amount),
        purpose: form.purpose.trim() || null,
        notes: form.notes.trim() || null,
      });
      setForm(emptyForm);
      setShowForm(false);
      fetchAdvances();
    } catch {
      setError("Failed to create advance.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Advances</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
        >
          {showForm ? "Cancel" : "+ New Advance"}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* New Advance Form */}
      {showForm && (
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Create New Advance
          </h2>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Farmer
              </label>
              <select
                name="farmer_id"
                value={form.farmer_id}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              >
                <option value="">Select farmer</option>
                {farmers.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                required
                min="1"
                step="0.01"
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purpose
              </label>
              <input
                type="text"
                name="purpose"
                value={form.purpose}
                onChange={handleChange}
                placeholder="e.g. Seeds, Fertilizer"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <input
                type="text"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Optional notes"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? "Creating..." : "Create Advance"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter("active")}
          className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-colors ${
            filter === "active"
              ? "bg-emerald-600 text-white"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setFilter("all")}
          className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-colors ${
            filter === "all"
              ? "bg-emerald-600 text-white"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          All
        </button>
      </div>

      {/* Advances Table */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
        </div>
      ) : advances.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No advances found.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    Farmer
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">
                    Amount
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">
                    Recovered
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">
                    Balance
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    Purpose
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    Given Date
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {advances.map((a) => (
                  <tr
                    key={a.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {a.farmer_name || "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {formatCurrency(a.amount)}
                    </td>
                    <td className="px-4 py-3 text-right text-green-600">
                      {formatCurrency(a.recovered)}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-semibold ${
                        a.balance > 0 ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {formatCurrency(a.balance)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {a.purpose || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {a.given_date}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge(
                          a.status
                        )}`}
                      >
                        {a.status}
                      </span>
                    </td>
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
