"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

interface WeeklyReport {
  week_start: string;
  week_end: string;
  total_deals: number;
  total_bought: number;
  total_sold: number;
  gross_margin: number;
  total_costs: number;
  net_profit: number;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ReportsPage() {
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState("");

  useEffect(() => {
    api
      .get("/dashboard/weekly")
      .then((res) => {
        const data = res.data;
        setReports(Array.isArray(data) ? data : [data]);
      })
      .catch(() => setError("Failed to load report data."))
      .finally(() => setLoading(false));
  }, []);

  const handleExport = async (format: "csv" | "excel" | "pdf") => {
    setExporting(format);
    try {
      const endpoints: Record<string, string> = {
        csv: "/export/deals/csv",
        excel: "/export/deals/excel",
        pdf: "/export/pnl/pdf",
      };
      const res = await api.get(endpoints[format], { responseType: "blob" });
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const extensions: Record<string, string> = { csv: "csv", excel: "xlsx", pdf: "pdf" };
      a.download = `export_${new Date().toISOString().split("T")[0]}.${extensions[format]}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setError(`Failed to export ${format.toUpperCase()}.`);
    } finally {
      setExporting("");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Reports & Export</h1>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport("csv")}
            disabled={!!exporting}
            className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {exporting === "csv" ? "Exporting..." : "Export CSV"}
          </button>
          <button
            onClick={() => handleExport("excel")}
            disabled={!!exporting}
            className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {exporting === "excel" ? "Exporting..." : "Export Excel"}
          </button>
          <button
            onClick={() => handleExport("pdf")}
            disabled={!!exporting}
            className="px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {exporting === "pdf" ? "Exporting..." : "P&L PDF"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      {reports.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No report data available yet.</div>
      ) : (
        <div className="space-y-6">
          {reports.map((report, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              {report.week_start && report.week_end && (
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                  Week: {report.week_start} to {report.week_end}
                </h2>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Deals</p>
                  <p className="text-xl font-bold text-gray-800">{report.total_deals}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-xs text-blue-600 uppercase tracking-wide mb-1">Total Bought</p>
                  <p className="text-xl font-bold text-blue-800">{formatCurrency(report.total_bought)}</p>
                </div>
                <div className="bg-indigo-50 rounded-lg p-4">
                  <p className="text-xs text-indigo-600 uppercase tracking-wide mb-1">Total Sold</p>
                  <p className="text-xl font-bold text-indigo-800">{formatCurrency(report.total_sold)}</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-4">
                  <p className="text-xs text-emerald-600 uppercase tracking-wide mb-1">Gross Margin</p>
                  <p className="text-xl font-bold text-emerald-800">{formatCurrency(report.gross_margin)}</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-xs text-orange-600 uppercase tracking-wide mb-1">Total Costs</p>
                  <p className="text-xl font-bold text-orange-800">{formatCurrency(report.total_costs)}</p>
                </div>
                <div className={`rounded-lg p-4 ${report.net_profit >= 0 ? "bg-green-50" : "bg-red-50"}`}>
                  <p className={`text-xs uppercase tracking-wide mb-1 ${report.net_profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                    Net Profit
                  </p>
                  <p className={`text-xl font-bold ${report.net_profit >= 0 ? "text-green-800" : "text-red-800"}`}>
                    {formatCurrency(report.net_profit)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
