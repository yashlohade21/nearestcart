"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

interface OverviewData {
  today_deals: number;
  today_buy_total: number;
  today_sell_total: number;
  today_net_profit: number;
  pending_from_buyers: number;
  pending_to_farmers: number;
  net_position: number;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function DashboardOverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/dashboard/overview")
      .then((res) => setData(res.data))
      .catch(() => setError("Failed to load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>
    );
  }

  if (!data) return null;

  const cards: { label: string; value: string | number; color: string }[] = [
    { label: "Today's Deals", value: data.today_deals, color: "bg-emerald-500" },
    { label: "Today Buy Total", value: formatCurrency(data.today_buy_total), color: "bg-blue-500" },
    { label: "Today Sell Total", value: formatCurrency(data.today_sell_total), color: "bg-indigo-500" },
    {
      label: "Today Net Profit",
      value: formatCurrency(data.today_net_profit),
      color: data.today_net_profit >= 0 ? "bg-green-500" : "bg-red-500",
    },
    { label: "Pending from Buyers", value: formatCurrency(data.pending_from_buyers), color: "bg-amber-500" },
    { label: "Pending to Farmers", value: formatCurrency(data.pending_to_farmers), color: "bg-orange-500" },
    {
      label: "Net Position",
      value: formatCurrency(data.net_position),
      color: data.net_position >= 0 ? "bg-emerald-600" : "bg-red-600",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className={`h-1.5 ${card.color}`} />
            <div className="p-5">
              <p className="text-sm text-gray-500 mb-1">{card.label}</p>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
