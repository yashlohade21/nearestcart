// Dalla Deal Tracker — PDF Generator Utility
// Uses expo-print for PDF generation and expo-sharing for file sharing

import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ReportData {
  title: string;
  subtitle?: string;
  date?: string;
  companyName?: string;
  companyAddress?: string;
  companyGst?: string;
  headers: string[];
  rows: (string | number)[][];
  totals?: (string | number)[];
  footer?: string;
}

// ── Core PDF Functions ─────────────────────────────────────────────────────────

/**
 * Renders an HTML string to a PDF file on disk and returns the local URI.
 */
export async function generatePdf(html: string): Promise<string> {
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  return uri;
}

/**
 * Opens the system print dialog for an HTML string.
 */
export async function printHtml(html: string): Promise<void> {
  await Print.printAsync({ html });
}

/**
 * Shares a PDF file using the platform share sheet.
 * Falls back silently if sharing is unavailable.
 */
export async function sharePdf(uri: string): Promise<void> {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      UTI: "com.adobe.pdf",
    });
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Formats a number using Indian comma notation with ₹ prefix.
 * Non-numeric or zero values are returned as-is (string passthrough).
 */
export function fmtRupees(value: string | number): string {
  if (typeof value === "number") {
    return (
      "₹" +
      new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value)
    );
  }
  return String(value);
}

/**
 * Formats a plain number using Indian comma style (no ₹ prefix).
 */
export function fmtNumber(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Returns today's date as DD/MM/YYYY.
 */
export function todayStr(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

// ── Shared CSS ─────────────────────────────────────────────────────────────────

/**
 * Base inline CSS block used by all report templates.
 * Designed for A4 printing with green (#059669) brand accents.
 */
export function baseStyles(): string {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700&display=swap');

    @page {
      size: A4;
      margin: 18mm 16mm 18mm 16mm;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Noto Sans Devanagari', Arial, sans-serif;
      font-size: 12px;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.5;
    }

    /* ── Letterhead ── */
    .letterhead {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      border-bottom: 3px solid #059669;
      padding-bottom: 12px;
      margin-bottom: 14px;
    }

    .company-logo {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      object-fit: cover;
      margin-right: 14px;
      flex-shrink: 0;
    }

    .company-info {
      flex: 1;
    }

    .company-name {
      font-size: 20px;
      font-weight: 700;
      color: #059669;
      margin-bottom: 3px;
    }

    .company-sub {
      font-size: 11px;
      color: #64748b;
      margin-top: 1px;
    }

    .company-gst {
      display: inline-block;
      margin-top: 5px;
      font-size: 11px;
      font-weight: 600;
      color: #059669;
      background: #f0fdf4;
      padding: 2px 8px;
      border-radius: 4px;
    }

    /* ── Report Title Bar ── */
    .report-title-bar {
      background: #059669;
      color: #ffffff;
      padding: 9px 16px;
      border-radius: 6px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .report-title {
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 0.3px;
    }

    .report-subtitle {
      font-size: 11px;
      opacity: 0.88;
    }

    .report-date {
      font-size: 11px;
      opacity: 0.9;
      text-align: right;
    }

    /* ── Party Info Boxes ── */
    .party-row {
      display: flex;
      gap: 12px;
      margin-bottom: 12px;
    }

    .party-box {
      flex: 1;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px 12px;
    }

    .party-box-label {
      font-size: 10px;
      font-weight: 700;
      color: #059669;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 3px;
    }

    .party-box-value {
      font-size: 12px;
      font-weight: 600;
      color: #0f172a;
    }

    .party-box-sub {
      font-size: 10px;
      color: #64748b;
      margin-top: 1px;
    }

    /* ── Main Table ── */
    table.report-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 14px;
      font-size: 12px;
    }

    table.report-table th {
      background: #059669;
      color: #ffffff;
      text-align: left;
      padding: 8px 10px;
      font-size: 11px;
      font-weight: 600;
      border: 1px solid #047857;
    }

    table.report-table th.right,
    table.report-table td.right {
      text-align: right;
    }

    table.report-table th.center,
    table.report-table td.center {
      text-align: center;
    }

    table.report-table td {
      padding: 7px 10px;
      border: 1px solid #e2e8f0;
      vertical-align: top;
    }

    table.report-table tbody tr:nth-child(even) {
      background: #f8fafc;
    }

    table.report-table tbody tr:hover {
      background: #f0fdf4;
    }

    /* ── Totals Row ── */
    tr.totals-row td {
      background: #f0fdf4 !important;
      font-weight: 700;
      color: #059669;
      border-top: 2px solid #059669;
      padding: 9px 10px;
    }

    /* ── Grand Total Row ── */
    tr.grand-total-row td {
      background: #059669 !important;
      font-weight: 700;
      color: #ffffff !important;
      font-size: 13px;
      padding: 10px;
      border: 1px solid #047857;
    }

    /* ── Summary Boxes ── */
    .summary-grid {
      display: flex;
      gap: 10px;
      margin-bottom: 14px;
      flex-wrap: wrap;
    }

    .summary-box {
      flex: 1;
      min-width: 110px;
      background: #f0fdf4;
      border: 1px solid #d1fae5;
      border-radius: 8px;
      padding: 10px 12px;
      text-align: center;
    }

    .summary-box.red {
      background: #fef2f2;
      border-color: #fee2e2;
    }

    .summary-box.amber {
      background: #fffbeb;
      border-color: #fef3c7;
    }

    .summary-label {
      font-size: 10px;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      margin-bottom: 4px;
    }

    .summary-value {
      font-size: 16px;
      font-weight: 700;
      color: #059669;
    }

    .summary-box.red .summary-value {
      color: #dc2626;
    }

    .summary-box.amber .summary-value {
      color: #d97706;
    }

    /* ── Amount in Words ── */
    .amount-words {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px 14px;
      font-size: 11px;
      font-style: italic;
      color: #334155;
      margin-bottom: 12px;
    }

    /* ── Notes / GST Note ── */
    .note-box {
      background: #fffbeb;
      border: 1px solid #fbbf24;
      border-radius: 6px;
      padding: 8px 14px;
      font-size: 11px;
      color: #92400e;
      margin-bottom: 12px;
    }

    /* ── Signature Row ── */
    .signature-row {
      display: flex;
      justify-content: space-between;
      margin-top: 28px;
    }

    .signature-box {
      text-align: center;
      width: 130px;
    }

    .signature-line {
      border-top: 1px solid #94a3b8;
      margin-bottom: 4px;
      padding-top: 4px;
    }

    .signature-label {
      font-size: 10px;
      color: #64748b;
    }

    /* ── Deductions Table ── */
    table.deductions-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
    }

    table.deductions-table td {
      padding: 5px 10px;
      font-size: 12px;
      border-bottom: 1px solid #f1f5f9;
    }

    table.deductions-table td.right {
      text-align: right;
    }

    table.deductions-table tr.deduct-total td {
      font-weight: 700;
      border-top: 1.5px solid #e2e8f0;
      background: #f8fafc;
    }

    /* ── Print Footer ── */
    .print-footer {
      margin-top: 20px;
      padding-top: 10px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #94a3b8;
    }

    /* ── Ledger Balance Row ── */
    tr.balance-positive td.balance-cell {
      color: #059669;
      font-weight: 700;
    }

    tr.balance-negative td.balance-cell {
      color: #dc2626;
      font-weight: 700;
    }

    /* ── Aging cells ── */
    .aging-current { color: #059669; font-weight: 600; }
    .aging-30      { color: #d97706; font-weight: 600; }
    .aging-60      { color: #ea580c; font-weight: 600; }
    .aging-90      { color: #dc2626; font-weight: 600; }

    /* ── Page break utility ── */
    .page-break {
      page-break-after: always;
    }
  `;
}

// ── Amount in Words (Indian Numbering) ────────────────────────────────────────

const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];
const TENS = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
];

function twoDigitWords(n: number): string {
  if (n < 20) return ONES[n];
  return TENS[Math.floor(n / 10)] + (n % 10 ? " " + ONES[n % 10] : "");
}

export function amountInWords(amount: number): string {
  if (amount === 0) return "Rupees Zero Only";
  const num = Math.abs(Math.round(amount));
  const crore = Math.floor(num / 10_000_000);
  const lakh = Math.floor((num % 10_000_000) / 100_000);
  const thousand = Math.floor((num % 100_000) / 1_000);
  const hundred = Math.floor((num % 1_000) / 100);
  const rest = num % 100;
  const parts: string[] = [];
  if (crore) parts.push(twoDigitWords(crore) + " Crore");
  if (lakh) parts.push(twoDigitWords(lakh) + " Lakh");
  if (thousand) parts.push(twoDigitWords(thousand) + " Thousand");
  if (hundred) parts.push(ONES[hundred] + " Hundred");
  if (rest) parts.push(twoDigitWords(rest));
  return "Rupees " + parts.join(" ") + " Only";
}

// ── Letterhead Builder ─────────────────────────────────────────────────────────

export function buildLetterhead(opts: {
  companyName?: string;
  companyAddress?: string;
  companyGst?: string;
  logoBase64?: string;
}): string {
  const { companyName, companyAddress, companyGst, logoBase64 } = opts;
  const logoHtml = logoBase64
    ? `<img class="company-logo" src="${logoBase64}" />`
    : "";
  return `
    <div class="letterhead">
      <div style="display:flex;align-items:center;flex:1;">
        ${logoHtml}
        <div class="company-info">
          <div class="company-name">${companyName || "Dalla Deal Tracker"}</div>
          ${companyAddress ? `<div class="company-sub">${companyAddress}</div>` : ""}
          ${companyGst ? `<span class="company-gst">GSTIN: ${companyGst}</span>` : ""}
        </div>
      </div>
    </div>
  `;
}

// ── Title Bar Builder ──────────────────────────────────────────────────────────

export function buildTitleBar(title: string, subtitle?: string, date?: string): string {
  return `
    <div class="report-title-bar">
      <div>
        <div class="report-title">${title}</div>
        ${subtitle ? `<div class="report-subtitle">${subtitle}</div>` : ""}
      </div>
      ${date ? `<div class="report-date">${date}</div>` : ""}
    </div>
  `;
}

// ── Table Builder ──────────────────────────────────────────────────────────────

export function buildTable(
  headers: string[],
  rows: (string | number)[][],
  totals?: (string | number)[],
  rightAlignFromCol?: number
): string {
  const colRight = rightAlignFromCol ?? 1;

  const thHtml = headers
    .map((h, i) => `<th class="${i >= colRight ? "right" : ""}">${h}</th>`)
    .join("");

  const tbodyHtml = rows
    .map((row) => {
      const cells = row
        .map((cell, i) => {
          const cls = i >= colRight ? "right" : "";
          const val =
            typeof cell === "number" && cell !== 0
              ? fmtNumber(cell)
              : String(cell);
          return `<td class="${cls}">${val}</td>`;
        })
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");

  const totalsHtml = totals
    ? `<tr class="totals-row">${totals
        .map((t, i) => {
          const cls = i >= colRight ? "right" : "";
          const val =
            typeof t === "number" && t !== 0
              ? fmtNumber(t)
              : String(t);
          return `<td class="${cls}">${val}</td>`;
        })
        .join("")}</tr>`
    : "";

  return `
    <table class="report-table">
      <thead><tr>${thHtml}</tr></thead>
      <tbody>${tbodyHtml}${totalsHtml}</tbody>
    </table>
  `;
}

// ── Print Footer ───────────────────────────────────────────────────────────────

export function buildPrintFooter(footer?: string): string {
  return `
    <div class="print-footer">
      <span>${footer || "Generated by Dalla Deal Tracker"}</span>
      <span>Printed on: ${todayStr()}</span>
    </div>
  `;
}

// ── Master HTML Wrapper ────────────────────────────────────────────────────────

export function wrapHtml(body: string, extraStyles?: string): string {
  return `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Dalla Deal Tracker — Report</title>
  <style>
    ${baseStyles()}
    ${extraStyles || ""}
  </style>
</head>
<body>
  ${body}
</body>
</html>`;
}

// ── buildReportHtml — Generic Report Builder ───────────────────────────────────

/**
 * Generates a complete A4 HTML document for a generic tabular report.
 * Handles company letterhead, title bar, data table, totals row, and footer.
 * Numbers are formatted using Indian comma notation with ₹ where > 0.
 */
export function buildReportHtml(data: ReportData): string {
  const letterhead = buildLetterhead({
    companyName: data.companyName,
    companyAddress: data.companyAddress,
    companyGst: data.companyGst,
  });

  const titleBar = buildTitleBar(data.title, data.subtitle, data.date || todayStr());

  // Determine from which column to right-align (heuristic: first column is text label)
  const table = buildTable(data.headers, data.rows, data.totals, 1);

  const footer = buildPrintFooter(data.footer);

  const body = `
    ${letterhead}
    ${titleBar}
    ${table}
    ${footer}
  `;

  return wrapHtml(body);
}
