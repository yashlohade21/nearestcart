"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

interface FarmerPerf {
  farmer_id: string;
  farmer_name: string;
  total_deals: number;
  total_quantity_kg: number;
  total_business: number;
  avg_spoilage_pct: number;
  dispute_pct: number;
  outstanding_advance: number;
}

interface BuyerPerf {
  buyer_id: string;
  buyer_name: string;
  total_deals: number;
  total_quantity_kg: number;
  total_business: number;
  total_profit_from_buyer: number;
  dispute_pct: number;
}

interface TransporterPerf {
  transporter_id: string;
  transporter_name: string;
  vehicle_type: string | null;
  total_trips: number;
  avg_trip_cost: number;
  avg_spoilage_pct: number;
  total_transport_spend: number;
}

function fmt(n: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

function pct(n: number): string {
  return n.toFixed(1) + "%";
}

type Tab = "farmers" | "buyers" | "transporters";

export default function AnalyticsPage() {
  const [tab, setTab] = useState<Tab>("farmers");
  const [farmers, setFarmers] = useState<FarmerPerf[]>([]);
  const [buyers, setBuyers] = useState<BuyerPerf[]>([]);
  const [transporters, setTransporters] = useState<TransporterPerf[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/analytics/${tab}`)
      .then((res) => {
        if (tab === "farmers") setFarmers(res.data);
        else if (tab === "buyers") setBuyers(res.data);
        else setTransporters(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tab]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Performance Analytics</h1>

      <div className="flex gap-2 mb-6">
        {(["farmers", "buyers", "transporters"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-colors capitalize ${
              tab === t
                ? "bg-emerald-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            {tab === "farmers" && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Farmer</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Deals</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Volume (kg)</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Business</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-600">Spoilage</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-600">Disputes</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Advance Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {farmers.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-8 text-gray-500">No data yet</td></tr>
                  ) : farmers.map((f) => (
                    <tr key={f.farmer_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{f.farmer_name}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{f.total_deals}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{f.total_quantity_kg.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3 text-right font-semibold">{fmt(f.total_business)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${f.avg_spoilage_pct > 5 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                          {pct(f.avg_spoilage_pct)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${f.dispute_pct > 10 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                          {pct(f.dispute_pct)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">{f.outstanding_advance > 0 ? <span className="text-amber-600 font-semibold">{fmt(f.outstanding_advance)}</span> : <span className="text-gray-400">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === "buyers" && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Buyer</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Deals</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Volume (kg)</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Business</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Profit</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-600">Disputes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {buyers.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-8 text-gray-500">No data yet</td></tr>
                  ) : buyers.map((b) => (
                    <tr key={b.buyer_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{b.buyer_name}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{b.total_deals}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{b.total_quantity_kg.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3 text-right font-semibold">{fmt(b.total_business)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-emerald-600">{fmt(b.total_profit_from_buyer)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${b.dispute_pct > 10 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                          {pct(b.dispute_pct)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === "transporters" && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Transporter</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Vehicle</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Trips</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Avg Cost</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-600">Spoilage</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600">Total Spend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {transporters.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-8 text-gray-500">No data yet</td></tr>
                  ) : transporters.map((t) => (
                    <tr key={t.transporter_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{t.transporter_name}</td>
                      <td className="px-4 py-3 text-gray-600">{t.vehicle_type || "—"}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{t.total_trips}</td>
                      <td className="px-4 py-3 text-right font-semibold">{fmt(t.avg_trip_cost)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${t.avg_spoilage_pct > 5 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                          {pct(t.avg_spoilage_pct)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">{fmt(t.total_transport_spend)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
