"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";

interface Transporter {
  id: string;
  name: string;
  phone: string | null;
  vehicle_type: string | null;
  vehicle_number: string | null;
  base_city: string | null;
  total_trips: number;
  rating: number | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
}

interface FormData {
  name: string;
  phone: string;
  vehicle_type: string;
  vehicle_number: string;
  base_city: string;
  notes: string;
}

const emptyForm: FormData = {
  name: "",
  phone: "",
  vehicle_type: "",
  vehicle_number: "",
  base_city: "",
  notes: "",
};

export default function TransportersPage() {
  const [transporters, setTransporters] = useState<Transporter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");

  const fetchTransporters = useCallback(() => {
    setLoading(true);
    const params = search ? `?search=${encodeURIComponent(search)}` : "";
    api
      .get(`/transporters${params}`)
      .then((res) => setTransporters(res.data))
      .catch(() => setError("Failed to load transporters."))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    fetchTransporters();
  }, [fetchTransporters]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const body: Record<string, string> = { name: form.name };
      if (form.phone) body.phone = form.phone;
      if (form.vehicle_type) body.vehicle_type = form.vehicle_type;
      if (form.vehicle_number) body.vehicle_number = form.vehicle_number;
      if (form.base_city) body.base_city = form.base_city;
      if (form.notes) body.notes = form.notes;
      await api.post("/transporters", body);
      setForm(emptyForm);
      setShowForm(false);
      fetchTransporters();
    } catch {
      setError("Failed to add transporter.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Archive this transporter?")) return;
    try {
      await api.delete(`/transporters/${id}`);
      fetchTransporters();
    } catch {
      setError("Failed to delete transporter.");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Transporters</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
        >
          {showForm ? "Cancel" : "+ Add Transporter"}
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
          placeholder="Search transporters..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
        />
      </div>

      {showForm && (
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Transporter</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Transporter name"
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
                placeholder="Phone number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
              <input
                type="text"
                name="vehicle_type"
                value={form.vehicle_type}
                onChange={handleChange}
                placeholder="e.g. Truck, Tempo"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
              <input
                type="text"
                name="vehicle_number"
                value={form.vehicle_number}
                onChange={handleChange}
                placeholder="e.g. MP 09 AB 1234"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base City</label>
              <input
                type="text"
                name="base_city"
                value={form.base_city}
                onChange={handleChange}
                placeholder="City name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Optional notes"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? "Adding..." : "Add Transporter"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
        </div>
      ) : transporters.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No transporters found. Add your first transporter above.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Phone</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Vehicle</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Base City</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Trips</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Rating</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transporters.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">{t.name}</td>
                    <td className="px-4 py-3 text-gray-600">{t.phone || "—"}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {t.vehicle_type || ""}{t.vehicle_number ? ` · ${t.vehicle_number}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{t.base_city || "—"}</td>
                    <td className="px-4 py-3 text-center text-gray-700">{t.total_trips}</td>
                    <td className="px-4 py-3 text-center text-gray-700">{t.rating ?? "—"}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                      >
                        Archive
                      </button>
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
