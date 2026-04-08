"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";

interface PendingPaymentSummary {
  party_id: string;
  party_name: string;
  party_phone: string | null;
  pending_amount: number;
  pending_deals: number;
  oldest_deal_date: string | null;
  max_overdue_days: number | null;
}

interface PendingPayments {
  from_buyers: PendingPaymentSummary[];
  to_farmers: PendingPaymentSummary[];
  total_from_buyers: number;
  total_to_farmers: number;
  net_position: number;
}

const PAYMENT_MODES = ["Cash", "UPI", "Bank Transfer", "Cheque"];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function overdueBadgeColor(days: number | null): string {
  if (!days || days <= 0) return "bg-green-100 text-green-700";
  if (days > 7) return "bg-red-100 text-red-700";
  if (days > 3) return "bg-yellow-100 text-yellow-700";
  return "bg-green-100 text-green-700";
}

export default function PaymentsPage() {
  const [data, setData] = useState<PendingPayments | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"buyer" | "farmer">("buyer");

  // Record payment form state
  const [recordingFor, setRecordingFor] = useState<PendingPaymentSummary | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payMode, setPayMode] = useState("Cash");
  const [payRef, setPayRef] = useState("");
  const [payNotes, setPayNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);

  const fetchPayments = useCallback(() => {
    setLoading(true);
    api
      .get("/payments/pending")
      .then((res) => setData(res.data))
      .catch(() => setError("Failed to load payment data."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const items =
    tab === "buyer" ? data?.from_buyers ?? [] : data?.to_farmers ?? [];
  const total =
    tab === "buyer"
      ? data?.total_from_buyers ?? 0
      : data?.total_to_farmers ?? 0;

  const openRecord = (item: PendingPaymentSummary) => {
    setRecordingFor(item);
    setPayAmount(String(item.pending_amount));
    setPayMode("Cash");
    setPayRef("");
    setPayNotes("");
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordingFor) return;
    setSubmitting(true);
    setError("");
    try {
      const body: Record<string, unknown> = {
        direction: tab === "buyer" ? "incoming" : "outgoing",
        amount: parseFloat(payAmount),
        payment_mode: payMode,
        reference_no: payRef.trim() || null,
        notes: payNotes.trim() || null,
      };
      if (tab === "buyer") {
        body.buyer_id = recordingFor.party_id;
      } else {
        body.farmer_id = recordingFor.party_id;
      }
      await api.post("/payments", body);
      setRecordingFor(null);
      fetchPayments();
    } catch {
      setError("Failed to record payment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReminder = async (item: PendingPaymentSummary) => {
    setSendingReminder(item.party_id);
    try {
      await api.post("/notifications/payment-reminder", {
        party_type: tab === "buyer" ? "buyer" : "farmer",
        party_id: item.party_id,
        amount: item.pending_amount,
        include_upi_link: tab === "buyer",
      });
      alert(`Payment reminder sent to ${item.party_name}`);
    } catch {
      alert("Failed to send reminder. Check WhatsApp configuration.");
    } finally {
      setSendingReminder(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Payments</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => { setTab("buyer"); setRecordingFor(null); }}
          className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-colors ${
            tab === "buyer"
              ? "bg-emerald-600 text-white"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          Receivable (From Buyers)
        </button>
        <button
          onClick={() => { setTab("farmer"); setRecordingFor(null); }}
          className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-colors ${
            tab === "farmer"
              ? "bg-emerald-600 text-white"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          Payable (To Farmers)
        </button>
      </div>

      {/* Total Card */}
      {data && (
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
          <p className="text-sm text-gray-500 mb-1">
            {tab === "buyer" ? "Total Receivable" : "Total Payable"}
          </p>
          <p
            className={`text-3xl font-extrabold ${
              tab === "buyer" ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {formatCurrency(total)}
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No pending payments for {tab === "buyer" ? "buyers" : "farmers"}.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    Party Name
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">
                    Pending Amount
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">
                    Deals
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">
                    Overdue
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((p) => (
                  <tr
                    key={p.party_id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {p.party_name}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {formatCurrency(p.pending_amount)}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {p.pending_deals}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {p.max_overdue_days != null && p.max_overdue_days > 0 ? (
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${overdueBadgeColor(
                            p.max_overdue_days
                          )}`}
                        >
                          {p.max_overdue_days}d
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openRecord(p)}
                          className="px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors"
                        >
                          Record
                        </button>
                        {p.party_phone && (
                          <button
                            onClick={() => handleSendReminder(p)}
                            disabled={sendingReminder === p.party_id}
                            className="px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 rounded-lg hover:bg-green-100 disabled:opacity-50 transition-colors"
                          >
                            {sendingReminder === p.party_id ? "..." : "Remind"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Inline Record Payment Form */}
          {recordingFor && (
            <div className="border-t border-gray-100 p-6 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Record Payment for{" "}
                <span className="text-gray-900">
                  {recordingFor.party_name}
                </span>{" "}
                <span className="text-gray-400 font-normal">
                  (Pending: {formatCurrency(recordingFor.pending_amount)})
                </span>
              </h3>
              <form
                onSubmit={handleRecordPayment}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    required
                    min="1"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={payMode}
                    onChange={(e) => setPayMode(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  >
                    {PAYMENT_MODES.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reference No.
                  </label>
                  <input
                    type="text"
                    value={payRef}
                    onChange={(e) => setPayRef(e.target.value)}
                    placeholder="UPI ID / Cheque No."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <input
                    type="text"
                    value={payNotes}
                    onChange={(e) => setPayNotes(e.target.value)}
                    placeholder="Optional"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                  >
                    {submitting ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecordingFor(null)}
                    className="px-4 py-2 text-gray-600 font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
