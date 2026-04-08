"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";

interface TeamMember {
  id: string;
  phone: string;
  name: string;
  role: string;
  created_at: string;
}

const ROLES = ["manager", "viewer"];

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("manager");
  const [submitting, setSubmitting] = useState(false);

  const fetchMembers = useCallback(() => {
    setLoading(true);
    api
      .get("/auth/team")
      .then((res) => setMembers(res.data))
      .catch(() => setError("Failed to load team members."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.post("/auth/team", {
        phone: phone.trim(),
        name: name.trim(),
        role,
      });
      setShowForm(false);
      setPhone("");
      setName("");
      setRole("manager");
      fetchMembers();
    } catch {
      setError("Failed to add team member. Phone may already be registered.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (member: TeamMember) => {
    if (!confirm(`Remove ${member.name} from your team?`)) return;
    try {
      await api.delete(`/auth/team/${member.id}`);
      fetchMembers();
    } catch {
      setError("Failed to remove team member.");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Team Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
        >
          {showForm ? "Cancel" : "+ Add Member"}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* Add Member Form */}
      {showForm && (
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Add Team Member
          </h3>
          <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Member name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="10-digit phone"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? "Adding..." : "Add"}
              </button>
            </div>
          </form>
          <p className="mt-3 text-xs text-gray-500">
            <strong>Manager:</strong> Can create/edit deals, payments, and manage farmers/buyers.{" "}
            <strong>Viewer:</strong> Read-only access to all data.
          </p>
        </div>
      )}

      {/* Team Members Table */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-lg mb-2">No team members yet</p>
          <p className="text-gray-400 text-sm">
            Add managers or viewers to help manage your business
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                  Name
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                  Phone
                </th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">
                  Role
                </th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">
                  Added
                </th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {m.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{m.phone}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        m.role === "manager"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {m.role.charAt(0).toUpperCase() + m.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500 text-xs">
                    {new Date(m.created_at).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleRemove(m)}
                      className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
