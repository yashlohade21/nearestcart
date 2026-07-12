// Dalla Deal Tracker — Report Templates
// All template functions return complete HTML strings ready for PDF generation.

import {
  buildLetterhead,
  buildTitleBar,
  buildTable,
  buildPrintFooter,
  wrapHtml,
  fmtRupees,
  fmtNumber,
  amountInWords,
  todayStr,
} from "./pdf-generator";

// ── Shared inner helpers ───────────────────────────────────────────────────────

function partyBox(label: string, name: string, sub?: string): string {
  return `
    <div class="party-box">
      <div class="party-box-label">${label}</div>
      <div class="party-box-value">${name}</div>
      ${sub ? `<div class="party-box-sub">${sub}</div>` : ""}
    </div>`;
}

function summaryBox(label: string, value: string, variant?: "red" | "amber"): string {
  return `
    <div class="summary-box${variant ? " " + variant : ""}">
      <div class="summary-label">${label}</div>
      <div class="summary-value">${value}</div>
    </div>`;
}

function signatureRow(...labels: string[]): string {
  const boxes = labels
    .map(
      (l) => `
      <div class="signature-box">
        <div class="signature-line">&nbsp;</div>
        <div class="signature-label">${l}</div>
      </div>`
    )
    .join("");
  return `<div class="signature-row">${boxes}</div>`;
}

function feeRow(label: string, amount: number): string {
  return `<tr><td>${label}</td><td class="right">${fmtRupees(amount)}</td></tr>`;
}

// ── 1. Sale Invoice (Tax Invoice to Buyer) ─────────────────────────────────────

export interface InvoiceItem {
  product: string;
  hsn?: string;
  qty: number;
  unit?: string;
  rate: number;
  amount: number;
}

export interface InvoiceData {
  invoiceNo: string;
  date: string;
  buyerName: string;
  buyerAddress?: string;
  buyerGst?: string;
  farmerName?: string;
  items: InvoiceItem[];
  transport?: number;
  tcs?: number;
  total: number;
  companyName: string;
  companyAddress?: string;
  companyGst?: string;
  logoBase64?: string;
}

export function invoiceTemplate(data: InvoiceData): string {
  const letterhead = buildLetterhead({
    companyName: data.companyName,
    companyAddress: data.companyAddress,
    companyGst: data.companyGst,
    logoBase64: data.logoBase64,
  });

  const rows = data.items.map((it, i) => [
    String(i + 1),
    it.product,
    it.hsn || "—",
    `${fmtNumber(it.qty)} ${it.unit || "Qtl"}`,
    fmtRupees(it.rate),
    fmtRupees(it.amount),
  ]);

  const itemsTable = buildTable(
    ["Sr.", "Item Description", "HSN", "Qty", "Rate", "Amount"],
    rows,
    undefined,
    2
  );

  const taxableValue = data.items.reduce((s, it) => s + it.amount, 0);
  const transport = data.transport || 0;
  const tcs = data.tcs || 0;
  const grandTotal = data.total;

  const totalsHtml = `
    <table class="deductions-table" style="width:40%;margin-left:auto;margin-bottom:12px;">
      ${feeRow("Taxable Value", taxableValue)}
      ${feeRow("CGST @ 0% (Exempt)", 0)}
      ${feeRow("SGST @ 0% (Exempt)", 0)}
      ${transport > 0 ? feeRow("Transport Charges", transport) : ""}
      ${tcs > 0 ? feeRow("TCS @ 0.1%", tcs) : ""}
      <tr class="deduct-total">
        <td><strong>Grand Total</strong></td>
        <td class="right"><strong>${fmtRupees(grandTotal)}</strong></td>
      </tr>
    </table>`;

  const body = `
    ${letterhead}
    <div class="report-title-bar">
      <div>
        <div class="report-title">TAX INVOICE</div>
        <div class="report-subtitle">Agricultural Produce (GST Exempt — CGST Act 2017, Sch. I)</div>
      </div>
      <div class="report-date">
        <div><strong>Invoice No:</strong> ${data.invoiceNo}</div>
        <div><strong>Date:</strong> ${data.date}</div>
      </div>
    </div>
    <div class="party-row">
      ${partyBox("Bill To (Buyer)", data.buyerName, [data.buyerAddress, data.buyerGst ? "GST: " + data.buyerGst : ""].filter(Boolean).join(" | "))}
      ${data.farmerName ? partyBox("Supplier (Farmer)", data.farmerName) : ""}
    </div>
    ${itemsTable}
    ${totalsHtml}
    <div class="amount-words">${amountInWords(grandTotal)}</div>
    <div class="note-box">Note: Agricultural produce is exempt from GST under Schedule I of the CGST Act, 2017.</div>
    ${signatureRow("Prepared By", "Authorised Signatory")}
    ${buildPrintFooter()}`;

  return wrapHtml(body);
}

// ── 2. Purchase Invoice (from Farmer) ─────────────────────────────────────────

export interface PurchaseInvoiceData {
  invoiceNo: string;
  date: string;
  farmerName: string;
  farmerVillage?: string;
  farmerPhone?: string;
  items: InvoiceItem[];
  total: number;
  advance?: number;
  netPayable: number;
  companyName: string;
  companyAddress?: string;
  companyGst?: string;
  logoBase64?: string;
}

export function purchaseInvoiceTemplate(data: PurchaseInvoiceData): string {
  const letterhead = buildLetterhead({
    companyName: data.companyName,
    companyAddress: data.companyAddress,
    companyGst: data.companyGst,
    logoBase64: data.logoBase64,
  });

  const rows = data.items.map((it, i) => [
    String(i + 1),
    it.product,
    it.hsn || "—",
    `${fmtNumber(it.qty)} ${it.unit || "Qtl"}`,
    fmtRupees(it.rate),
    fmtRupees(it.amount),
  ]);

  const itemsTable = buildTable(
    ["Sr.", "Item Description", "HSN", "Qty", "Rate", "Amount"],
    rows,
    undefined,
    2
  );

  const body = `
    ${letterhead}
    <div class="report-title-bar">
      <div>
        <div class="report-title">PURCHASE INVOICE</div>
        <div class="report-subtitle">Produce Received from Farmer</div>
      </div>
      <div class="report-date">
        <div><strong>Invoice No:</strong> ${data.invoiceNo}</div>
        <div><strong>Date:</strong> ${data.date}</div>
      </div>
    </div>
    <div class="party-row">
      ${partyBox("Received From (Farmer)", data.farmerName, [data.farmerVillage, data.farmerPhone].filter(Boolean).join(" | "))}
      ${partyBox("Purchased By", data.companyName, data.companyAddress)}
    </div>
    ${itemsTable}
    <table class="deductions-table" style="width:40%;margin-left:auto;margin-bottom:12px;">
      ${feeRow("Total Purchase Value", data.total)}
      ${data.advance ? feeRow("Less: Advance Paid", data.advance) : ""}
      <tr class="deduct-total">
        <td><strong>Net Payable to Farmer</strong></td>
        <td class="right"><strong>${fmtRupees(data.netPayable)}</strong></td>
      </tr>
    </table>
    <div class="amount-words">${amountInWords(data.netPayable)}</div>
    ${signatureRow("Farmer Signature", "Authorised Signatory")}
    ${buildPrintFooter()}`;

  return wrapHtml(body);
}

// ── 3. Customer Statement ──────────────────────────────────────────────────────

export interface StatementEntry {
  date: string;
  particular: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface CustomerStatementData {
  customerName: string;
  customerAddress?: string;
  period: string;
  openingBalance: number;
  entries: StatementEntry[];
  closingBalance: number;
  companyName: string;
  companyAddress?: string;
  companyGst?: string;
  logoBase64?: string;
}

export function customerStatementTemplate(data: CustomerStatementData): string {
  const letterhead = buildLetterhead({
    companyName: data.companyName,
    companyAddress: data.companyAddress,
    companyGst: data.companyGst,
    logoBase64: data.logoBase64,
  });

  const rows: (string | number)[][] = [
    [data.entries[0]?.date || todayStr(), "Opening Balance", "", "", fmtRupees(data.openingBalance)],
    ...data.entries.map((e) => [
      e.date,
      e.particular,
      e.debit > 0 ? fmtRupees(e.debit) : "—",
      e.credit > 0 ? fmtRupees(e.credit) : "—",
      fmtRupees(e.balance),
    ]),
  ];

  const totals = [
    "",
    "Closing Balance",
    fmtRupees(data.entries.reduce((s, e) => s + e.debit, 0)),
    fmtRupees(data.entries.reduce((s, e) => s + e.credit, 0)),
    fmtRupees(data.closingBalance),
  ];

  const table = buildTable(
    ["Date", "Particular", "Debit (Dr)", "Credit (Cr)", "Balance"],
    rows,
    totals,
    2
  );

  const body = `
    ${letterhead}
    ${buildTitleBar("CUSTOMER ACCOUNT STATEMENT", `Period: ${data.period}`, todayStr())}
    <div class="party-row">
      ${partyBox("Account Of", data.customerName, data.customerAddress)}
      <div class="summary-grid" style="flex:1;margin:0;">
        ${summaryBox("Opening Balance", fmtRupees(data.openingBalance))}
        ${summaryBox("Closing Balance", fmtRupees(data.closingBalance), data.closingBalance < 0 ? "red" : undefined)}
      </div>
    </div>
    ${table}
    ${buildPrintFooter()}`;

  return wrapHtml(body);
}

// ── 4. Purchase Statement (Supplier-wise) ──────────────────────────────────────

export interface PurchaseStatementData {
  supplierName: string;
  supplierVillage?: string;
  period: string;
  openingBalance: number;
  entries: StatementEntry[];
  closingBalance: number;
  companyName: string;
  companyAddress?: string;
  companyGst?: string;
  logoBase64?: string;
}

export function purchaseStatementTemplate(data: PurchaseStatementData): string {
  const letterhead = buildLetterhead({
    companyName: data.companyName,
    companyAddress: data.companyAddress,
    companyGst: data.companyGst,
    logoBase64: data.logoBase64,
  });

  const rows: (string | number)[][] = data.entries.map((e) => [
    e.date,
    e.particular,
    e.debit > 0 ? fmtRupees(e.debit) : "—",
    e.credit > 0 ? fmtRupees(e.credit) : "—",
    fmtRupees(e.balance),
  ]);

  const table = buildTable(
    ["Date", "Particular", "Debit (Dr)", "Credit (Cr)", "Balance"],
    rows,
    [
      "",
      "Closing Balance",
      fmtRupees(data.entries.reduce((s, e) => s + e.debit, 0)),
      fmtRupees(data.entries.reduce((s, e) => s + e.credit, 0)),
      fmtRupees(data.closingBalance),
    ],
    2
  );

  const body = `
    ${letterhead}
    ${buildTitleBar("PURCHASE / SUPPLIER STATEMENT", `Period: ${data.period}`, todayStr())}
    <div class="party-row">
      ${partyBox("Supplier", data.supplierName, data.supplierVillage)}
      <div class="summary-grid" style="flex:1;margin:0;">
        ${summaryBox("Opening Balance", fmtRupees(data.openingBalance))}
        ${summaryBox("Net Payable", fmtRupees(data.closingBalance), "red")}
      </div>
    </div>
    ${table}
    ${buildPrintFooter()}`;

  return wrapHtml(body);
}

// ── 5. Hisab Patti (Farmer Settlement Sheet) ───────────────────────────────────

export interface HisabPattiEntry {
  product: string;
  weight: number;
  rate: number;
  amount: number;
}

export interface HisabPattiData {
  farmerName: string;
  village: string;
  date: string;
  entries: HisabPattiEntry[];
  deductions: { label: string; amount: number }[];
  totalAmount: number;
  totalDeductions: number;
  netPayable: number;
  companyName: string;
  companyAddress?: string;
  companyGst?: string;
  logoBase64?: string;
}

export function hisabPattiTemplate(data: HisabPattiData): string {
  const letterhead = buildLetterhead({
    companyName: data.companyName,
    companyAddress: data.companyAddress,
    companyGst: data.companyGst,
    logoBase64: data.logoBase64,
  });

  const rows = data.entries.map((e) => [
    e.product,
    `${fmtNumber(e.weight)} Kg`,
    fmtRupees(e.rate),
    fmtRupees(e.amount),
  ]);

  const itemsTable = buildTable(
    ["Product", "Weight", "Rate (per Qtl)", "Amount"],
    rows,
    ["Total", "", "", fmtRupees(data.totalAmount)],
    1
  );

  const deductRows = data.deductions.map((d) => feeRow(d.label, d.amount)).join("");

  const body = `
    ${letterhead}
    <div class="report-title-bar">
      <div>
        <div class="report-title">हिसाब पट्टी / HISAB PATTI</div>
        <div class="report-subtitle">Farmer Settlement Sheet</div>
      </div>
      <div class="report-date"><strong>Date:</strong> ${data.date}</div>
    </div>
    <div class="party-row">
      ${partyBox("Farmer (किसान)", data.farmerName, `Village: ${data.village}`)}
      ${partyBox("Commission Agent", data.companyName, data.companyAddress)}
    </div>
    ${itemsTable}
    <div style="display:flex;gap:16px;margin-bottom:14px;">
      <div style="flex:1;"></div>
      <div style="flex:1;">
        <table class="deductions-table">
          <tr><td colspan="2" style="font-weight:700;color:#059669;padding-bottom:4px;">Deductions / कटौती</td></tr>
          ${deductRows}
          <tr class="deduct-total">
            <td><strong>Total Deductions</strong></td>
            <td class="right"><strong>${fmtRupees(data.totalDeductions)}</strong></td>
          </tr>
        </table>
        <table class="deductions-table">
          <tr style="background:#f0fdf4;">
            <td style="font-size:14px;font-weight:700;color:#059669;">Net Payable to Farmer</td>
            <td class="right" style="font-size:14px;font-weight:700;color:#059669;">${fmtRupees(data.netPayable)}</td>
          </tr>
        </table>
      </div>
    </div>
    <div class="amount-words">${amountInWords(data.netPayable)}</div>
    ${signatureRow("Farmer Signature / हस्ताक्षर", "Agent Signature")}
    ${buildPrintFooter()}`;

  return wrapHtml(body);
}

// ── 6. Nave Bill ───────────────────────────────────────────────────────────────

export interface NaveBillItem {
  product: string;
  kharidar: string;
  pauti: string;
  weight: number;
  rate: number;
  amount: number;
}

export interface NaveBillFees {
  marketFees: number;
  supervision: number;
  adat: number;
  bardan: number;
  labour: number;
  gadiBhada: number;
  sutli: number;
  weightShort: number;
}

export interface NaveBillData {
  billNo: string;
  date: string;
  buyerName: string;
  items: NaveBillItem[];
  fees: NaveBillFees;
  total: number;
  totalDeductions: number;
  netAmount: number;
  companyName: string;
  companyAddress?: string;
  companyGst?: string;
  logoBase64?: string;
}

export function naveBillTemplate(data: NaveBillData): string {
  const letterhead = buildLetterhead({
    companyName: data.companyName,
    companyAddress: data.companyAddress,
    companyGst: data.companyGst,
    logoBase64: data.logoBase64,
  });

  const rows = data.items.map((it) => [
    it.product,
    it.kharidar,
    it.pauti,
    `${fmtNumber(it.weight)} Kg`,
    fmtRupees(it.rate),
    fmtRupees(it.amount),
  ]);

  const itemsTable = buildTable(
    ["Product", "Kharidar", "Pauti No.", "Weight", "Rate", "Amount"],
    rows,
    ["", "", "", "", "Total", fmtRupees(data.total)],
    3
  );

  const f = data.fees;
  const body = `
    ${letterhead}
    <div class="report-title-bar">
      <div>
        <div class="report-title">नवे बिल / NAVE BILL</div>
        <div class="report-subtitle">Mandi Commission Bill</div>
      </div>
      <div class="report-date">
        <div><strong>Bill No:</strong> ${data.billNo}</div>
        <div><strong>Date:</strong> ${data.date}</div>
      </div>
    </div>
    <div class="party-row">
      ${partyBox("Buyer (खरीदार)", data.buyerName)}
      ${partyBox("Commission Agent", data.companyName, data.companyAddress)}
    </div>
    ${itemsTable}
    <div style="display:flex;gap:16px;margin-bottom:14px;">
      <div style="flex:1;"></div>
      <div style="flex:1;">
        <table class="deductions-table">
          <tr><td colspan="2" style="font-weight:700;color:#059669;">Fee Deductions / कटौती</td></tr>
          ${feeRow("Market Fees (मंडी शुल्क)", f.marketFees)}
          ${feeRow("Supervision", f.supervision)}
          ${feeRow("Adat (Commission)", f.adat)}
          ${feeRow("Bardan (Packaging)", f.bardan)}
          ${feeRow("Labour (मजदूरी)", f.labour)}
          ${feeRow("Gadi Bhada (Freight)", f.gadiBhada)}
          ${feeRow("Sutli (Binding)", f.sutli)}
          ${feeRow("Weight Short", f.weightShort)}
          <tr class="deduct-total">
            <td><strong>Total Deductions</strong></td>
            <td class="right"><strong>${fmtRupees(data.totalDeductions)}</strong></td>
          </tr>
        </table>
        <table class="deductions-table">
          <tr style="background:#f0fdf4;">
            <td style="font-size:14px;font-weight:700;color:#059669;">Net Amount</td>
            <td class="right" style="font-size:14px;font-weight:700;color:#059669;">${fmtRupees(data.netAmount)}</td>
          </tr>
        </table>
      </div>
    </div>
    <div class="amount-words">${amountInWords(data.netAmount)}</div>
    ${signatureRow("Buyer Signature", "Agent Signature")}
    ${buildPrintFooter()}`;

  return wrapHtml(body);
}

// ── 7. Cash Voucher ────────────────────────────────────────────────────────────

export interface CashVoucherData {
  voucherNo: string;
  date: string;
  type: "receipt" | "payment";
  partyName: string;
  amount: number;
  paymentMode: string;
  narration?: string;
  referenceNo?: string;
  companyName: string;
  companyAddress?: string;
  companyGst?: string;
  logoBase64?: string;
}

export function cashVoucherTemplate(data: CashVoucherData): string {
  const letterhead = buildLetterhead({
    companyName: data.companyName,
    companyAddress: data.companyAddress,
    companyGst: data.companyGst,
    logoBase64: data.logoBase64,
  });

  const isReceipt = data.type === "receipt";
  const title = isReceipt ? "RECEIPT VOUCHER" : "PAYMENT VOUCHER";
  const subtitle = isReceipt ? "Cash / Bank Receipt" : "Cash / Bank Payment";

  const body = `
    ${letterhead}
    <div class="report-title-bar">
      <div>
        <div class="report-title">${title}</div>
        <div class="report-subtitle">${subtitle}</div>
      </div>
      <div class="report-date">
        <div><strong>Voucher No:</strong> ${data.voucherNo}</div>
        <div><strong>Date:</strong> ${data.date}</div>
      </div>
    </div>
    <div class="party-row">
      ${partyBox(isReceipt ? "Received From" : "Paid To", data.partyName)}
      ${partyBox("Payment Mode", data.paymentMode, data.referenceNo ? "Ref: " + data.referenceNo : undefined)}
    </div>
    <table class="deductions-table" style="width:50%;margin:0 auto 14px auto;">
      <tr style="background:#f0fdf4;">
        <td style="font-size:16px;font-weight:700;color:#059669;padding:12px;">
          ${isReceipt ? "Amount Received" : "Amount Paid"}
        </td>
        <td class="right" style="font-size:16px;font-weight:700;color:#059669;padding:12px;">
          ${fmtRupees(data.amount)}
        </td>
      </tr>
    </table>
    <div class="amount-words">${amountInWords(data.amount)}</div>
    ${data.narration ? `<div class="note-box"><strong>Narration:</strong> ${data.narration}</div>` : ""}
    ${signatureRow(isReceipt ? "Received By" : "Paid By", "Authorised Signatory")}
    ${buildPrintFooter()}`;

  return wrapHtml(body);
}

// ── 8. Bhada Pauti (Transport Receipt) ────────────────────────────────────────

export interface BhadaPautiData {
  pautiNo: string;
  date: string;
  transporterName: string;
  vehicleNo: string;
  from: string;
  to: string;
  items: { product: string; weight: number; bags: number }[];
  freightAmount: number;
  advance?: number;
  balance: number;
  companyName: string;
  companyAddress?: string;
  logoBase64?: string;
}

export function bhadaPautiTemplate(data: BhadaPautiData): string {
  const letterhead = buildLetterhead({
    companyName: data.companyName,
    companyAddress: data.companyAddress,
    logoBase64: data.logoBase64,
  });

  const rows = data.items.map((it) => [
    it.product,
    `${fmtNumber(it.weight)} Kg`,
    String(it.bags),
  ]);

  const table = buildTable(["Product", "Weight", "Bags"], rows, undefined, 1);

  const body = `
    ${letterhead}
    <div class="report-title-bar">
      <div>
        <div class="report-title">भाड़ा पावती / BHADA PAUTI</div>
        <div class="report-subtitle">Transport / Freight Receipt</div>
      </div>
      <div class="report-date">
        <div><strong>Pauti No:</strong> ${data.pautiNo}</div>
        <div><strong>Date:</strong> ${data.date}</div>
      </div>
    </div>
    <div class="party-row">
      ${partyBox("Transporter", data.transporterName, `Vehicle: ${data.vehicleNo}`)}
      ${partyBox("Route", `${data.from} \u2192 ${data.to}`)}
    </div>
    ${table}
    <table class="deductions-table" style="width:40%;margin-left:auto;margin-bottom:12px;">
      ${feeRow("Freight Amount", data.freightAmount)}
      ${data.advance ? feeRow("Less: Advance", data.advance) : ""}
      <tr class="deduct-total">
        <td><strong>Balance Payable</strong></td>
        <td class="right"><strong>${fmtRupees(data.balance)}</strong></td>
      </tr>
    </table>
    <div class="amount-words">${amountInWords(data.balance)}</div>
    ${signatureRow("Driver Signature", "Agent Signature")}
    ${buildPrintFooter()}`;

  return wrapHtml(body);
}

// ── 9. Date-wise Purchase Report ───────────────────────────────────────────────

export interface DateWisePurchaseEntry {
  date: string;
  farmerName: string;
  product: string;
  weight: number;
  rate: number;
  amount: number;
}

export interface DateWisePurchaseTotals {
  totalWeight: number;
  totalAmount: number;
}

export interface DateWisePurchaseData {
  period: string;
  entries: DateWisePurchaseEntry[];
  totals: DateWisePurchaseTotals;
  companyName: string;
  companyAddress?: string;
  companyGst?: string;
  logoBase64?: string;
}

export function dateWisePurchaseTemplate(data: DateWisePurchaseData): string {
  const rows = data.entries.map((e) => [
    e.date,
    e.farmerName,
    e.product,
    `${fmtNumber(e.weight)} Kg`,
    fmtRupees(e.rate),
    fmtRupees(e.amount),
  ]);

  const table = buildTable(
    ["Date", "Farmer", "Product", "Weight", "Rate", "Amount"],
    rows,
    ["", "", "Total", `${fmtNumber(data.totals.totalWeight)} Kg`, "", fmtRupees(data.totals.totalAmount)],
    3
  );

  const body = `
    ${buildLetterhead({ companyName: data.companyName, companyAddress: data.companyAddress, companyGst: data.companyGst, logoBase64: data.logoBase64 })}
    ${buildTitleBar("DATE-WISE PURCHASE REPORT", `Period: ${data.period}`, todayStr())}
    <div class="summary-grid">
      ${summaryBox("Total Entries", String(data.entries.length))}
      ${summaryBox("Total Weight", `${fmtNumber(data.totals.totalWeight)} Kg`)}
      ${summaryBox("Total Purchase Value", fmtRupees(data.totals.totalAmount))}
    </div>
    ${table}
    ${buildPrintFooter()}`;

  return wrapHtml(body);
}

// ── 10. Date-wise Sale Report ──────────────────────────────────────────────────

export interface DateWiseSaleEntry {
  date: string;
  buyerName: string;
  product: string;
  weight: number;
  rate: number;
  amount: number;
}

export interface DateWiseSaleData {
  period: string;
  entries: DateWiseSaleEntry[];
  totals: { totalWeight: number; totalAmount: number };
  companyName: string;
  companyAddress?: string;
  companyGst?: string;
  logoBase64?: string;
}

export function dateWiseSaleTemplate(data: DateWiseSaleData): string {
  const rows = data.entries.map((e) => [
    e.date,
    e.buyerName,
    e.product,
    `${fmtNumber(e.weight)} Kg`,
    fmtRupees(e.rate),
    fmtRupees(e.amount),
  ]);

  const table = buildTable(
    ["Date", "Buyer", "Product", "Weight", "Rate", "Amount"],
    rows,
    ["", "", "Total", `${fmtNumber(data.totals.totalWeight)} Kg`, "", fmtRupees(data.totals.totalAmount)],
    3
  );

  const body = `
    ${buildLetterhead({ companyName: data.companyName, companyAddress: data.companyAddress, companyGst: data.companyGst, logoBase64: data.logoBase64 })}
    ${buildTitleBar("DATE-WISE SALE REPORT", `Period: ${data.period}`, todayStr())}
    <div class="summary-grid">
      ${summaryBox("Total Entries", String(data.entries.length))}
      ${summaryBox("Total Weight", `${fmtNumber(data.totals.totalWeight)} Kg`)}
      ${summaryBox("Total Sale Value", fmtRupees(data.totals.totalAmount))}
    </div>
    ${table}
    ${buildPrintFooter()}`;

  return wrapHtml(body);
}

// ── 11. Date-wise Farmer Report ────────────────────────────────────────────────

export interface DateWiseFarmerEntry {
  date: string;
  product: string;
  weight: number;
  rate: number;
  grossAmount: number;
  deductions: number;
  netPaid: number;
}

export interface DateWiseFarmerData {
  farmerName: string;
  village?: string;
  period: string;
  entries: DateWiseFarmerEntry[];
  totals: { totalWeight: number; totalGross: number; totalDeductions: number; totalNet: number };
  companyName: string;
  companyAddress?: string;
  logoBase64?: string;
}

export function dateWiseFarmerTemplate(data: DateWiseFarmerData): string {
  const rows = data.entries.map((e) => [
    e.date,
    e.product,
    `${fmtNumber(e.weight)} Kg`,
    fmtRupees(e.rate),
    fmtRupees(e.grossAmount),
    fmtRupees(e.deductions),
    fmtRupees(e.netPaid),
  ]);

  const table = buildTable(
    ["Date", "Product", "Weight", "Rate", "Gross", "Deductions", "Net Paid"],
    rows,
    [
      "",
      "Total",
      `${fmtNumber(data.totals.totalWeight)} Kg`,
      "",
      fmtRupees(data.totals.totalGross),
      fmtRupees(data.totals.totalDeductions),
      fmtRupees(data.totals.totalNet),
    ],
    2
  );

  const body = `
    ${buildLetterhead({ companyName: data.companyName, companyAddress: data.companyAddress, logoBase64: data.logoBase64 })}
    ${buildTitleBar("FARMER DATE-WISE REPORT", `${data.farmerName}${data.village ? " \u2014 " + data.village : ""} | Period: ${data.period}`, todayStr())}
    <div class="summary-grid">
      ${summaryBox("Gross Amount", fmtRupees(data.totals.totalGross))}
      ${summaryBox("Total Deductions", fmtRupees(data.totals.totalDeductions), "amber")}
      ${summaryBox("Net Paid", fmtRupees(data.totals.totalNet))}
    </div>
    ${table}
    ${buildPrintFooter()}`;

  return wrapHtml(body);
}

// farmerDatewiseTemplate is an alias for dateWiseFarmerTemplate
export const farmerDatewiseTemplate = dateWiseFarmerTemplate;

// ── 12. Day-wise Summary ───────────────────────────────────────────────────────

export interface DayWiseSummaryEntry {
  date: string;
  deals: number;
  purchases: number;
  sales: number;
  receipts: number;
  payments: number;
  netCashFlow: number;
}

export interface DayWiseSummaryData {
  period: string;
  entries: DayWiseSummaryEntry[];
  totals: {
    totalDeals: number;
    totalPurchases: number;
    totalSales: number;
    totalReceipts: number;
    totalPayments: number;
    netCashFlow: number;
  };
  companyName: string;
  companyAddress?: string;
  companyGst?: string;
  logoBase64?: string;
}

export function dayWiseSummaryTemplate(data: DayWiseSummaryData): string {
  const rows = data.entries.map((e) => [
    e.date,
    String(e.deals),
    fmtRupees(e.purchases),
    fmtRupees(e.sales),
    fmtRupees(e.receipts),
    fmtRupees(e.payments),
    fmtRupees(e.netCashFlow),
  ]);

  const t = data.totals;
  const table = buildTable(
    ["Date", "Deals", "Purchases", "Sales", "Receipts", "Payments", "Net Cash Flow"],
    rows,
    [
      "Total",
      String(t.totalDeals),
      fmtRupees(t.totalPurchases),
      fmtRupees(t.totalSales),
      fmtRupees(t.totalReceipts),
      fmtRupees(t.totalPayments),
      fmtRupees(t.netCashFlow),
    ],
    1
  );

  const body = `
    ${buildLetterhead({ companyName: data.companyName, companyAddress: data.companyAddress, companyGst: data.companyGst, logoBase64: data.logoBase64 })}
    ${buildTitleBar("DAY-WISE SUMMARY REPORT", `Period: ${data.period}`, todayStr())}
    <div class="summary-grid">
      ${summaryBox("Total Purchases", fmtRupees(t.totalPurchases))}
      ${summaryBox("Total Sales", fmtRupees(t.totalSales))}
      ${summaryBox("Net Cash Flow", fmtRupees(t.netCashFlow), t.netCashFlow < 0 ? "red" : undefined)}
    </div>
    ${table}
    ${buildPrintFooter()}`;

  return wrapHtml(body);
}

// ── 13. Receivable Report (Milna Hai) ─────────────────────────────────────────

export interface ReceivableEntry {
  name: string;
  phone?: string;
  amount: number;
  days: number;
  lastDealDate?: string;
}

export interface ReceivableReportData {
  entries: ReceivableEntry[];
  total: number;
  companyName: string;
  companyAddress?: string;
  companyGst?: string;
  logoBase64?: string;
}

export function receivableReportTemplate(data: ReceivableReportData): string {
  const rows = data.entries.map((e) => {
    const agingClass =
      e.days > 90 ? "aging-90" : e.days > 60 ? "aging-60" : e.days > 30 ? "aging-30" : "aging-current";
    return [
      e.name,
      e.phone || "—",
      fmtRupees(e.amount),
      e.lastDealDate || "—",
      `<span class="${agingClass}">${e.days}d</span>`,
    ];
  });

  const table = buildTable(
    ["Buyer Name", "Phone", "Amount Due", "Last Deal", "Aging"],
    rows,
    ["Total", "", fmtRupees(data.total), "", ""],
    2
  );

  const over90 = data.entries.filter((e) => e.days > 90).reduce((s, e) => s + e.amount, 0);
  const over30 = data.entries.filter((e) => e.days > 30 && e.days <= 90).reduce((s, e) => s + e.amount, 0);
  const current = data.entries.filter((e) => e.days <= 30).reduce((s, e) => s + e.amount, 0);

  const body = `
    ${buildLetterhead({ companyName: data.companyName, companyAddress: data.companyAddress, companyGst: data.companyGst, logoBase64: data.logoBase64 })}
    ${buildTitleBar("RECEIVABLE REPORT (मिलना है)", `As on ${todayStr()}`, todayStr())}
    <div class="summary-grid">
      ${summaryBox("Total Receivable", fmtRupees(data.total))}
      ${summaryBox("Current (\u226430d)", fmtRupees(current))}
      ${summaryBox("31\u201390 Days", fmtRupees(over30), "amber")}
      ${summaryBox("90+ Days", fmtRupees(over90), "red")}
    </div>
    ${table}
    ${buildPrintFooter()}`;

  return wrapHtml(body);
}

// ── 14. Payable Report (Dena Hai) ─────────────────────────────────────────────

export interface PayableEntry {
  name: string;
  phone?: string;
  amount: number;
  days: number;
  village?: string;
}

export interface PayableReportData {
  entries: PayableEntry[];
  total: number;
  companyName: string;
  companyAddress?: string;
  companyGst?: string;
  logoBase64?: string;
}

export function payableReportTemplate(data: PayableReportData): string {
  const rows = data.entries.map((e) => [
    e.name,
    e.village || "—",
    e.phone || "—",
    fmtRupees(e.amount),
    String(e.days) + " days",
  ]);

  const table = buildTable(
    ["Farmer Name", "Village", "Phone", "Amount Payable", "Pending Since"],
    rows,
    ["Total", "", "", fmtRupees(data.total), ""],
    3
  );

  const body = `
    ${buildLetterhead({ companyName: data.companyName, companyAddress: data.companyAddress, companyGst: data.companyGst, logoBase64: data.logoBase64 })}
    ${buildTitleBar("PAYABLE REPORT (\u0926\u0947\u0928\u093e \u0939\u0948)", `As on ${todayStr()}`, todayStr())}
    <div class="summary-grid">
      ${summaryBox("Total Payable", fmtRupees(data.total), "red")}
      ${summaryBox("No. of Farmers", String(data.entries.length))}
    </div>
    ${table}
    ${buildPrintFooter()}`;

  return wrapHtml(body);
}

// ── 15. Party Payment Report ───────────────────────────────────────────────────

export interface PartyPaymentEntry {
  date: string;
  voucherNo: string;
  mode: string;
  referenceNo?: string;
  amount: number;
  narration?: string;
}

export interface PartyPaymentReportData {
  partyName: string;
  partyType: "buyer" | "farmer" | "supplier";
  period: string;
  entries: PartyPaymentEntry[];
  totalReceived: number;
  totalPaid: number;
  companyName: string;
  companyAddress?: string;
  logoBase64?: string;
}

export function partyPaymentReportTemplate(data: PartyPaymentReportData): string {
  const rows = data.entries.map((e) => [
    e.date,
    e.voucherNo,
    e.mode,
    e.referenceNo || "—",
    fmtRupees(e.amount),
    e.narration || "—",
  ]);

  const table = buildTable(
    ["Date", "Voucher No.", "Mode", "Reference", "Amount", "Narration"],
    rows,
    ["", "", "", "Total", fmtRupees(data.totalReceived + data.totalPaid), ""],
    4
  );

  const body = `
    ${buildLetterhead({ companyName: data.companyName, companyAddress: data.companyAddress, logoBase64: data.logoBase64 })}
    ${buildTitleBar("PARTY PAYMENT REPORT", `${data.partyName} | Period: ${data.period}`, todayStr())}
    <div class="summary-grid">
      ${summaryBox("Total Received", fmtRupees(data.totalReceived))}
      ${summaryBox("Total Paid", fmtRupees(data.totalPaid), "red")}
    </div>
    ${table}
    ${buildPrintFooter()}`;

  return wrapHtml(body);
}

// ── 16. Farmer Report (Summary) ────────────────────────────────────────────────

export interface FarmerReportEntry {
  farmerName: string;
  village: string;
  totalDeals: number;
  totalWeight: number;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  advance: number;
  balance: number;
}

export interface FarmerReportData {
  period: string;
  entries: FarmerReportEntry[];
  companyName: string;
  companyAddress?: string;
  companyGst?: string;
  logoBase64?: string;
}

export function farmerReportTemplate(data: FarmerReportData): string {
  const rows = data.entries.map((e) => [
    e.farmerName,
    e.village,
    String(e.totalDeals),
    `${fmtNumber(e.totalWeight)} Kg`,
    fmtRupees(e.totalGross),
    fmtRupees(e.totalDeductions),
    fmtRupees(e.totalNet),
    fmtRupees(e.advance),
    fmtRupees(e.balance),
  ]);

  const totals = data.entries.reduce(
    (acc, e) => {
      acc.weight += e.totalWeight;
      acc.gross += e.totalGross;
      acc.deduct += e.totalDeductions;
      acc.net += e.totalNet;
      acc.advance += e.advance;
      acc.balance += e.balance;
      return acc;
    },
    { weight: 0, gross: 0, deduct: 0, net: 0, advance: 0, balance: 0 }
  );

  const table = buildTable(
    ["Farmer", "Village", "Deals", "Weight", "Gross", "Deductions", "Net", "Advance", "Balance"],
    rows,
    [
      "Total",
      "",
      String(data.entries.length),
      `${fmtNumber(totals.weight)} Kg`,
      fmtRupees(totals.gross),
      fmtRupees(totals.deduct),
      fmtRupees(totals.net),
      fmtRupees(totals.advance),
      fmtRupees(totals.balance),
    ],
    3
  );

  const body = `
    ${buildLetterhead({ companyName: data.companyName, companyAddress: data.companyAddress, companyGst: data.companyGst, logoBase64: data.logoBase64 })}
    ${buildTitleBar("FARMER SUMMARY REPORT", `Period: ${data.period}`, todayStr())}
    ${table}
    ${buildPrintFooter()}`;

  return wrapHtml(body);
}

// ── 17. Farmer Sum Group (Product-wise for a Farmer) ──────────────────────────

export interface FarmerSumGroupEntry {
  product: string;
  totalWeight: number;
  avgRate: number;
  totalAmount: number;
  deductions: number;
  net: number;
}

export interface FarmerSumGroupData {
  farmerName: string;
  village?: string;
  period: string;
  entries: FarmerSumGroupEntry[];
  companyName: string;
  companyAddress?: string;
  logoBase64?: string;
}

export function farmerSumGroupTemplate(data: FarmerSumGroupData): string {
  const rows = data.entries.map((e) => [
    e.product,
    `${fmtNumber(e.totalWeight)} Kg`,
    fmtRupees(e.avgRate),
    fmtRupees(e.totalAmount),
    fmtRupees(e.deductions),
    fmtRupees(e.net),
  ]);

  const t = data.entries.reduce(
    (acc, e) => { acc.w += e.totalWeight; acc.a += e.totalAmount; acc.d += e.deductions; acc.n += e.net; return acc; },
    { w: 0, a: 0, d: 0, n: 0 }
  );

  const table = buildTable(
    ["Product", "Total Weight", "Avg Rate", "Amount", "Deductions", "Net"],
    rows,
    ["Total", `${fmtNumber(t.w)} Kg`, "", fmtRupees(t.a), fmtRupees(t.d), fmtRupees(t.n)],
    1
  );

  const body = `
    ${buildLetterhead({ companyName: data.companyName, companyAddress: data.companyAddress, logoBase64: data.logoBase64 })}
    ${buildTitleBar("FARMER PRODUCT-WISE SUMMARY", `${data.farmerName}${data.village ? " \u2014 " + data.village : ""} | ${data.period}`, todayStr())}
    ${table}
    ${buildPrintFooter()}`;

  return wrapHtml(body);
}

// ── 18. Market Fees Report ─────────────────────────────────────────────────────

export interface MarketFeesEntry {
  date: string;
  billNo: string;
  farmerName: string;
  product: string;
  amount: number;
  marketFeesPct: number;
  marketFeesAmount: number;
}

export interface MarketFeesReportData {
  period: string;
  entries: MarketFeesEntry[];
  totalAmount: number;
  totalFees: number;
  companyName: string;
  companyAddress?: string;
  companyGst?: string;
  logoBase64?: string;
}

export function marketFeesReportTemplate(data: MarketFeesReportData): string {
  const rows = data.entries.map((e) => [
    e.date,
    e.billNo,
    e.farmerName,
    e.product,
    fmtRupees(e.amount),
    `${e.marketFeesPct}%`,
    fmtRupees(e.marketFeesAmount),
  ]);

  const table = buildTable(
    ["Date", "Bill No.", "Farmer", "Product", "Bill Amount", "Fee %", "Market Fees"],
    rows,
    ["", "", "", "Total", fmtRupees(data.totalAmount), "", fmtRupees(data.totalFees)],
    4
  );

  const body = `
    ${buildLetterhead({ companyName: data.companyName, companyAddress: data.companyAddress, companyGst: data.companyGst, logoBase64: data.logoBase64 })}
    ${buildTitleBar("MARKET FEES REPORT", `Period: ${data.period}`, todayStr())}
    <div class="summary-grid">
      ${summaryBox("Total Bill Amount", fmtRupees(data.totalAmount))}
      ${summaryBox("Total Market Fees", fmtRupees(data.totalFees), "amber")}
    </div>
    ${table}
    ${buildPrintFooter()}`;

  return wrapHtml(body);
}

// ── 19. Shetkari On Bank Detail ────────────────────────────────────────────────

export interface ShetkariOnBankEntry {
  farmerName: string;
  village: string;
  bankName: string;
  accountNo: string;
  ifsc: string;
  amount: number;
}

export interface ShetkariOnBankDetailData {
  date: string;
  entries: ShetkariOnBankEntry[];
  totalAmount: number;
  companyName: string;
  companyAddress?: string;
  logoBase64?: string;
}

export function shetkariOnBankDetailTemplate(data: ShetkariOnBankDetailData): string {
  const rows = data.entries.map((e, i) => [
    String(i + 1),
    e.farmerName,
    e.village,
    e.bankName,
    e.accountNo,
    e.ifsc,
    fmtRupees(e.amount),
  ]);

  const table = buildTable(
    ["Sr.", "Farmer Name", "Village", "Bank", "Account No.", "IFSC", "Amount"],
    rows,
    ["", "", "", "", "", "Total", fmtRupees(data.totalAmount)],
    6
  );

  const body = `
    ${buildLetterhead({ companyName: data.companyName, companyAddress: data.companyAddress, logoBase64: data.logoBase64 })}
    ${buildTitleBar("FARMER BANK PAYMENT DETAILS", `Date: ${data.date}`, todayStr())}
    <div class="summary-grid">
      ${summaryBox("Total Farmers", String(data.entries.length))}
      ${summaryBox("Total Amount", fmtRupees(data.totalAmount))}
    </div>
    ${table}
    ${buildPrintFooter()}`;

  return wrapHtml(body);
}

// ── 20. Expense Report ─────────────────────────────────────────────────────────

export interface ExpenseEntry {
  date: string;
  category: string;
  description: string;
  amount: number;
  paidTo?: string;
  mode: string;
}

export interface ExpenseReportData {
  period: string;
  entries: ExpenseEntry[];
  totalByCategory: { category: string; total: number }[];
  grandTotal: number;
  companyName: string;
  companyAddress?: string;
  companyGst?: string;
  logoBase64?: string;
}

export function expenseReportTemplate(data: ExpenseReportData): string {
  const rows = data.entries.map((e) => [
    e.date,
    e.category,
    e.description,
    e.paidTo || "—",
    e.mode,
    fmtRupees(e.amount),
  ]);

  const table = buildTable(
    ["Date", "Category", "Description", "Paid To", "Mode", "Amount"],
    rows,
    ["", "", "", "", "Total", fmtRupees(data.grandTotal)],
    5
  );

  const catRows = data.totalByCategory
    .map((c) => `<tr><td>${c.category}</td><td class="right">${fmtRupees(c.total)}</td></tr>`)
    .join("");

  const body = `
    ${buildLetterhead({ companyName: data.companyName, companyAddress: data.companyAddress, companyGst: data.companyGst, logoBase64: data.logoBase64 })}
    ${buildTitleBar("EXPENSE REPORT", `Period: ${data.period}`, todayStr())}
    ${table}
    <div style="display:flex;gap:16px;margin-bottom:14px;">
      <div style="flex:1;"></div>
      <div style="flex:1;">
        <div style="font-weight:700;color:#059669;margin-bottom:8px;font-size:12px;">Category-wise Summary</div>
        <table class="deductions-table">
          ${catRows}
          <tr class="deduct-total">
            <td><strong>Grand Total</strong></td>
            <td class="right"><strong>${fmtRupees(data.grandTotal)}</strong></td>
          </tr>
        </table>
      </div>
    </div>
    ${buildPrintFooter()}`;

  return wrapHtml(body);
}

// ── 21. Deposit Report ─────────────────────────────────────────────────────────

export interface DepositEntry {
  date: string;
  bankName: string;
  accountNo: string;
  chequeNo?: string;
  amount: number;
  narration?: string;
}

export interface DepositReportData {
  period: string;
  entries: DepositEntry[];
  totalDeposited: number;
  totalWithdrawn: number;
  netBalance: number;
  companyName: string;
  companyAddress?: string;
  logoBase64?: string;
}

export function depositReportTemplate(data: DepositReportData): string {
  const rows = data.entries.map((e) => [
    e.date,
    e.bankName,
    e.accountNo,
    e.chequeNo || "—",
    fmtRupees(e.amount),
    e.narration || "—",
  ]);

  const table = buildTable(
    ["Date", "Bank", "Account No.", "Cheque No.", "Amount", "Narration"],
    rows,
    ["", "", "", "Total", fmtRupees(data.totalDeposited), ""],
    4
  );

  const body = `
    ${buildLetterhead({ companyName: data.companyName, companyAddress: data.companyAddress, logoBase64: data.logoBase64 })}
    ${buildTitleBar("BANK DEPOSIT REPORT", `Period: ${data.period}`, todayStr())}
    <div class="summary-grid">
      ${summaryBox("Total Deposited", fmtRupees(data.totalDeposited))}
      ${summaryBox("Total Withdrawn", fmtRupees(data.totalWithdrawn), "red")}
      ${summaryBox("Net Balance", fmtRupees(data.netBalance), data.netBalance < 0 ? "red" : undefined)}
    </div>
    ${table}
    ${buildPrintFooter()}`;

  return wrapHtml(body);
}

// ── 22. Stock Report ───────────────────────────────────────────────────────────

export interface StockEntry {
  product: string;
  openingStock: number;
  purchased: number;
  sold: number;
  closingStock: number;
  avgBuyRate: number;
  avgSellRate: number;
  purchaseValue: number;
  saleValue: number;
  margin: number;
}

export interface StockReportData {
  date: string;
  entries: StockEntry[];
  companyName: string;
  companyAddress?: string;
  companyGst?: string;
  logoBase64?: string;
}

export function stockReportTemplate(data: StockReportData): string {
  const rows = data.entries.map((e) => [
    e.product,
    `${fmtNumber(e.openingStock)} Kg`,
    `${fmtNumber(e.purchased)} Kg`,
    `${fmtNumber(e.sold)} Kg`,
    `${fmtNumber(e.closingStock)} Kg`,
    fmtRupees(e.avgBuyRate),
    fmtRupees(e.avgSellRate),
    fmtRupees(e.purchaseValue),
    fmtRupees(e.saleValue),
    fmtRupees(e.margin),
  ]);

  const t = data.entries.reduce(
    (acc, e) => { acc.pv += e.purchaseValue; acc.sv += e.saleValue; acc.m += e.margin; return acc; },
    { pv: 0, sv: 0, m: 0 }
  );

  const table = buildTable(
    ["Product", "Opening", "Purchased", "Sold", "Closing", "Avg Buy", "Avg Sell", "Purchase Val.", "Sale Val.", "Margin"],
    rows,
    ["Total", "", "", "", "", "", "", fmtRupees(t.pv), fmtRupees(t.sv), fmtRupees(t.m)],
    1
  );

  const body = `
    ${buildLetterhead({ companyName: data.companyName, companyAddress: data.companyAddress, companyGst: data.companyGst, logoBase64: data.logoBase64 })}
    ${buildTitleBar("STOCK REGISTER", `As on ${data.date}`, todayStr())}
    <div class="summary-grid">
      ${summaryBox("Total Purchase Value", fmtRupees(t.pv))}
      ${summaryBox("Total Sale Value", fmtRupees(t.sv))}
      ${summaryBox("Total Margin", fmtRupees(t.m))}
    </div>
    ${table}
    ${buildPrintFooter()}`;

  return wrapHtml(body);
}

// ── 23. GST Report ─────────────────────────────────────────────────────────────

export interface GstReportEntry {
  product: string;
  hsnCode: string;
  totalSales: number;
  totalPurchases: number;
  grossProfit: number;
  dealsCount: number;
  gstRate: number;
  cgst: number;
  sgst: number;
}

export interface GstReportData {
  period: string;
  entries: GstReportEntry[];
  totalSales: number;
  totalPurchases: number;
  totalGrossProfit: number;
  companyName: string;
  companyAddress?: string;
  companyGst?: string;
  logoBase64?: string;
}

export function gstReportTemplate(data: GstReportData): string {
  const rows = data.entries.map((e) => [
    e.product,
    e.hsnCode,
    String(e.dealsCount),
    fmtRupees(e.totalPurchases),
    fmtRupees(e.totalSales),
    fmtRupees(e.grossProfit),
    `${e.gstRate}%`,
    fmtRupees(e.cgst),
    fmtRupees(e.sgst),
  ]);

  const t = data.entries.reduce(
    (acc, e) => { acc.cgst += e.cgst; acc.sgst += e.sgst; return acc; },
    { cgst: 0, sgst: 0 }
  );

  const table = buildTable(
    ["Product", "HSN", "Deals", "Purchases", "Sales", "Gross Profit", "GST %", "CGST", "SGST"],
    rows,
    [
      "Total",
      "",
      String(data.entries.reduce((s, e) => s + e.dealsCount, 0)),
      fmtRupees(data.totalPurchases),
      fmtRupees(data.totalSales),
      fmtRupees(data.totalGrossProfit),
      "",
      fmtRupees(t.cgst),
      fmtRupees(t.sgst),
    ],
    3
  );

  const body = `
    ${buildLetterhead({ companyName: data.companyName, companyAddress: data.companyAddress, companyGst: data.companyGst, logoBase64: data.logoBase64 })}
    ${buildTitleBar("GST REPORT", `Period: ${data.period}`, todayStr())}
    <div class="note-box">Agricultural produce (fresh) is exempt from GST under CGST Act 2017. Processing charges may attract GST as applicable.</div>
    <div class="summary-grid">
      ${summaryBox("Total Sales", fmtRupees(data.totalSales))}
      ${summaryBox("Total Purchases", fmtRupees(data.totalPurchases))}
      ${summaryBox("Gross Profit", fmtRupees(data.totalGrossProfit))}
      ${summaryBox("Total CGST", fmtRupees(t.cgst), "amber")}
      ${summaryBox("Total SGST", fmtRupees(t.sgst), "amber")}
    </div>
    ${table}
    ${buildPrintFooter()}`;

  return wrapHtml(body);
}

// ── 24. Agent Commission Report ────────────────────────────────────────────────

export interface AgentCommissionEntry {
  date: string;
  billNo: string;
  farmerName: string;
  product: string;
  billAmount: number;
  commissionPct: number;
  commissionAmount: number;
  agentName: string;
}

export interface AgentCommissionReportData {
  period: string;
  agentName?: string;
  entries: AgentCommissionEntry[];
  totalBillAmount: number;
  totalCommission: number;
  companyName: string;
  companyAddress?: string;
  companyGst?: string;
  logoBase64?: string;
}

export function agentCommissionReportTemplate(data: AgentCommissionReportData): string {
  const rows = data.entries.map((e) => [
    e.date,
    e.billNo,
    e.agentName,
    e.farmerName,
    e.product,
    fmtRupees(e.billAmount),
    `${e.commissionPct}%`,
    fmtRupees(e.commissionAmount),
  ]);

  const table = buildTable(
    ["Date", "Bill No.", "Agent", "Farmer", "Product", "Bill Amount", "Comm. %", "Commission"],
    rows,
    ["", "", "", "", "Total", fmtRupees(data.totalBillAmount), "", fmtRupees(data.totalCommission)],
    5
  );

  const body = `
    ${buildLetterhead({ companyName: data.companyName, companyAddress: data.companyAddress, companyGst: data.companyGst, logoBase64: data.logoBase64 })}
    ${buildTitleBar(
      "AGENT COMMISSION REPORT",
      `${data.agentName ? "Agent: " + data.agentName + " | " : ""}Period: ${data.period}`,
      todayStr()
    )}
    <div class="summary-grid">
      ${summaryBox("Total Bill Amount", fmtRupees(data.totalBillAmount))}
      ${summaryBox("Total Commission", fmtRupees(data.totalCommission), "amber")}
    </div>
    ${table}
    ${buildPrintFooter()}`;

  return wrapHtml(body);
}

// ── 25. Group By Date-wise ─────────────────────────────────────────────────────

export interface GroupByDateEntry {
  date: string;
  product: string;
  purchases: number;
  sales: number;
  grossMargin: number;
  netProfit: number;
  deals: number;
}

export interface GroupByDatewiseData {
  period: string;
  entries: GroupByDateEntry[];
  companyName: string;
  companyAddress?: string;
  companyGst?: string;
  logoBase64?: string;
}

export function groupByDatewiseTemplate(data: GroupByDatewiseData): string {
  const rows = data.entries.map((e) => [
    e.date,
    e.product,
    String(e.deals),
    fmtRupees(e.purchases),
    fmtRupees(e.sales),
    fmtRupees(e.grossMargin),
    fmtRupees(e.netProfit),
  ]);

  const t = data.entries.reduce(
    (acc, e) => {
      acc.deals += e.deals;
      acc.purchases += e.purchases;
      acc.sales += e.sales;
      acc.margin += e.grossMargin;
      acc.profit += e.netProfit;
      return acc;
    },
    { deals: 0, purchases: 0, sales: 0, margin: 0, profit: 0 }
  );

  const table = buildTable(
    ["Date", "Product", "Deals", "Purchases", "Sales", "Gross Margin", "Net Profit"],
    rows,
    [
      "Total",
      "",
      String(t.deals),
      fmtRupees(t.purchases),
      fmtRupees(t.sales),
      fmtRupees(t.margin),
      fmtRupees(t.profit),
    ],
    2
  );

  const body = `
    ${buildLetterhead({ companyName: data.companyName, companyAddress: data.companyAddress, companyGst: data.companyGst, logoBase64: data.logoBase64 })}
    ${buildTitleBar("DATE-WISE GROUPED REPORT", `Period: ${data.period}`, todayStr())}
    <div class="summary-grid">
      ${summaryBox("Total Purchases", fmtRupees(t.purchases))}
      ${summaryBox("Total Sales", fmtRupees(t.sales))}
      ${summaryBox("Gross Margin", fmtRupees(t.margin))}
      ${summaryBox("Net Profit", fmtRupees(t.profit), t.profit < 0 ? "red" : undefined)}
    </div>
    ${table}
    ${buildPrintFooter()}`;

  return wrapHtml(body);
}

// ── 26. Product-wise Summary ───────────────────────────────────────────────────

export interface ProductWiseSummaryEntry {
  product: string;
  hsnCode?: string;
  totalDeals: number;
  totalPurchasedQty: number;
  totalSoldQty: number;
  avgBuyRate: number;
  avgSellRate: number;
  totalPurchaseValue: number;
  totalSaleValue: number;
  grossMargin: number;
  marginPct: number;
}

export interface ProductWiseSummaryData {
  period: string;
  entries: ProductWiseSummaryEntry[];
  companyName: string;
  companyAddress?: string;
  companyGst?: string;
  logoBase64?: string;
}

export function productWiseSummaryTemplate(data: ProductWiseSummaryData): string {
  const rows = data.entries.map((e) => [
    e.product,
    e.hsnCode || "—",
    String(e.totalDeals),
    `${fmtNumber(e.totalPurchasedQty)} Kg`,
    `${fmtNumber(e.totalSoldQty)} Kg`,
    fmtRupees(e.avgBuyRate),
    fmtRupees(e.avgSellRate),
    fmtRupees(e.totalPurchaseValue),
    fmtRupees(e.totalSaleValue),
    fmtRupees(e.grossMargin),
    `${e.marginPct.toFixed(1)}%`,
  ]);

  const t = data.entries.reduce(
    (acc, e) => { acc.deals += e.totalDeals; acc.pv += e.totalPurchaseValue; acc.sv += e.totalSaleValue; acc.margin += e.grossMargin; return acc; },
    { deals: 0, pv: 0, sv: 0, margin: 0 }
  );

  const overallMarginPct = t.sv > 0 ? ((t.margin / t.sv) * 100).toFixed(1) : "0.0";

  const table = buildTable(
    ["Product", "HSN", "Deals", "Purchased", "Sold", "Avg Buy", "Avg Sell", "Purchase Val.", "Sale Val.", "Margin", "Margin %"],
    rows,
    ["Total", "", String(t.deals), "", "", "", "", fmtRupees(t.pv), fmtRupees(t.sv), fmtRupees(t.margin), `${overallMarginPct}%`],
    3
  );

  const body = `
    ${buildLetterhead({ companyName: data.companyName, companyAddress: data.companyAddress, companyGst: data.companyGst, logoBase64: data.logoBase64 })}
    ${buildTitleBar("PRODUCT-WISE SUMMARY REPORT", `Period: ${data.period}`, todayStr())}
    <div class="summary-grid">
      ${summaryBox("Total Purchase Value", fmtRupees(t.pv))}
      ${summaryBox("Total Sale Value", fmtRupees(t.sv))}
      ${summaryBox("Total Gross Margin", fmtRupees(t.margin))}
      ${summaryBox("Overall Margin %", `${overallMarginPct}%`)}
    </div>
    ${table}
    ${buildPrintFooter()}`;

  return wrapHtml(body);
}

// ── 27. Weekly P&L Report ──────────────────────────────────────────────────────

export interface WeeklyPnlReportData {
  weekStart: string;
  weekEnd: string;
  totalDeals: number;
  totalBought: number;
  totalSold: number;
  grossMargin: number;
  totalCosts: number;
  netProfit: number;
  totalSpoilageQty: number;
  avgSpoilagePct: number;
  dealRows?: { product: string; qty: number; buyTotal: number; sellTotal: number; margin: number }[];
  companyName: string;
  companyAddress?: string;
  companyGst?: string;
  logoBase64?: string;
}

export function weeklyPnlReportTemplate(data: WeeklyPnlReportData): string {
  const dealTableHtml =
    data.dealRows && data.dealRows.length > 0
      ? buildTable(
          ["Product", "Qty (Kg)", "Buy Total", "Sell Total", "Margin"],
          data.dealRows.map((r) => [
            r.product,
            fmtNumber(r.qty),
            fmtRupees(r.buyTotal),
            fmtRupees(r.sellTotal),
            fmtRupees(r.margin),
          ]),
          [
            "Total",
            "",
            fmtRupees(data.totalBought),
            fmtRupees(data.totalSold),
            fmtRupees(data.grossMargin),
          ],
          1
        )
      : "";

  const body = `
    ${buildLetterhead({ companyName: data.companyName, companyAddress: data.companyAddress, companyGst: data.companyGst, logoBase64: data.logoBase64 })}
    ${buildTitleBar("WEEKLY P&L REPORT", `${data.weekStart} \u2014 ${data.weekEnd}`, todayStr())}
    <div class="summary-grid">
      ${summaryBox("Total Deals", String(data.totalDeals))}
      ${summaryBox("Total Bought", fmtRupees(data.totalBought))}
      ${summaryBox("Total Sold", fmtRupees(data.totalSold))}
      ${summaryBox("Gross Margin", fmtRupees(data.grossMargin))}
      ${summaryBox("Total Costs", fmtRupees(data.totalCosts), "amber")}
      ${summaryBox("Net Profit", fmtRupees(data.netProfit), data.netProfit < 0 ? "red" : undefined)}
    </div>
    ${dealTableHtml}
    <table class="deductions-table" style="width:45%;margin-left:auto;margin-bottom:14px;">
      ${feeRow("Total Bought", data.totalBought)}
      ${feeRow("Total Sold", data.totalSold)}
      ${feeRow("Gross Margin", data.grossMargin)}
      ${feeRow("Total Costs (Transport / Labour / Other)", data.totalCosts)}
      <tr class="deduct-total">
        <td><strong>Net Profit</strong></td>
        <td class="right" style="color:${data.netProfit >= 0 ? "#059669" : "#dc2626"};"><strong>${fmtRupees(data.netProfit)}</strong></td>
      </tr>
    </table>
    ${data.avgSpoilagePct > 0 ? `<div class="note-box">Spoilage: ${fmtNumber(data.totalSpoilageQty)} Kg | Avg Spoilage: ${data.avgSpoilagePct.toFixed(1)}%</div>` : ""}
    ${buildPrintFooter()}`;

  return wrapHtml(body);
}

// ── 28. Outstanding / Aging Report ────────────────────────────────────────────

export interface OutstandingEntry {
  partyName: string;
  partyType: "buyer" | "farmer";
  totalDue: number;
  current: number;
  days30_60: number;
  days60_90: number;
  days90Plus: number;
}

export interface OutstandingReportData {
  asOnDate: string;
  entries: OutstandingEntry[];
  companyName: string;
  companyAddress?: string;
  companyGst?: string;
  logoBase64?: string;
}

export function outstandingReportTemplate(data: OutstandingReportData): string {
  const rows = data.entries.map((e) => [
    e.partyName,
    e.partyType === "buyer" ? "Buyer" : "Farmer",
    `<span class="aging-current">${fmtRupees(e.current)}</span>`,
    `<span class="aging-30">${fmtRupees(e.days30_60)}</span>`,
    `<span class="aging-60">${fmtRupees(e.days60_90)}</span>`,
    `<span class="aging-90">${fmtRupees(e.days90Plus)}</span>`,
    fmtRupees(e.totalDue),
  ]);

  const t = data.entries.reduce(
    (acc, e) => {
      acc.current += e.current;
      acc.d30 += e.days30_60;
      acc.d60 += e.days60_90;
      acc.d90 += e.days90Plus;
      acc.total += e.totalDue;
      return acc;
    },
    { current: 0, d30: 0, d60: 0, d90: 0, total: 0 }
  );

  const table = buildTable(
    ["Party Name", "Type", "Current (\u226430d)", "30\u201360 Days", "60\u201390 Days", "90+ Days", "Total Due"],
    rows,
    [
      "Total",
      "",
      fmtRupees(t.current),
      fmtRupees(t.d30),
      fmtRupees(t.d60),
      fmtRupees(t.d90),
      fmtRupees(t.total),
    ],
    2
  );

  const body = `
    ${buildLetterhead({ companyName: data.companyName, companyAddress: data.companyAddress, companyGst: data.companyGst, logoBase64: data.logoBase64 })}
    ${buildTitleBar("OUTSTANDING / AGING REPORT", `As on ${data.asOnDate}`, todayStr())}
    <div class="summary-grid">
      ${summaryBox("Current (\u226430d)", fmtRupees(t.current))}
      ${summaryBox("30\u201390 Days", fmtRupees(t.d30 + t.d60), "amber")}
      ${summaryBox("90+ Days", fmtRupees(t.d90), "red")}
      ${summaryBox("Total Outstanding", fmtRupees(t.total))}
    </div>
    ${table}
    ${buildPrintFooter()}`;

  return wrapHtml(body);
}

// ── 29. Ledger Report ─────────────────────────────────────────────────────────

export interface LedgerEntry {
  date: string;
  particular: string;
  voucherNo?: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface LedgerReportData {
  partyName: string;
  partyType: string;
  period: string;
  openingBalance: number;
  entries: LedgerEntry[];
  closingBalance: number;
  totalDebit: number;
  totalCredit: number;
  companyName: string;
  companyAddress?: string;
  companyGst?: string;
  logoBase64?: string;
}

export function ledgerReportTemplate(data: LedgerReportData): string {
  const rows: (string | number)[][] = [
    [data.entries[0]?.date || todayStr(), "Opening Balance", "—", "—", "—", fmtRupees(data.openingBalance)],
    ...data.entries.map((e) => [
      e.date,
      e.particular,
      e.voucherNo || "—",
      e.debit > 0 ? fmtRupees(e.debit) : "—",
      e.credit > 0 ? fmtRupees(e.credit) : "—",
      fmtRupees(e.balance),
    ]),
  ];

  const table = buildTable(
    ["Date", "Particular", "Voucher No.", "Debit (Dr)", "Credit (Cr)", "Balance"],
    rows,
    [
      "",
      "Closing Balance",
      "",
      fmtRupees(data.totalDebit),
      fmtRupees(data.totalCredit),
      fmtRupees(data.closingBalance),
    ],
    3
  );

  const body = `
    ${buildLetterhead({ companyName: data.companyName, companyAddress: data.companyAddress, companyGst: data.companyGst, logoBase64: data.logoBase64 })}
    ${buildTitleBar("PARTY LEDGER", `${data.partyName} (${data.partyType}) | Period: ${data.period}`, todayStr())}
    <div class="summary-grid">
      ${summaryBox("Opening Balance", fmtRupees(data.openingBalance))}
      ${summaryBox("Total Debit", fmtRupees(data.totalDebit))}
      ${summaryBox("Total Credit", fmtRupees(data.totalCredit))}
      ${summaryBox("Closing Balance", fmtRupees(data.closingBalance), data.closingBalance < 0 ? "red" : undefined)}
    </div>
    ${table}
    ${buildPrintFooter()}`;

  return wrapHtml(body);
}

// ── 30. Day Book ───────────────────────────────────────────────────────────────

export interface DayBookData {
  date: string;
  deals: { time?: string; farmer: string; buyer: string; product: string; qty: number; buyTotal: number; sellTotal: number; margin: number }[];
  payments: { time?: string; party: string; mode: string; amount: number; type: "receipt" | "payment"; narration?: string }[];
  totalPurchases: number;
  totalSales: number;
  totalReceipts: number;
  totalPaymentsOut: number;
  netCashFlow: number;
  companyName: string;
  companyAddress?: string;
  logoBase64?: string;
}

export function dayBookTemplate(data: DayBookData): string {
  const dealRows = data.deals.map((d) => [
    d.time || "—",
    d.farmer,
    d.buyer,
    d.product,
    fmtNumber(d.qty) + " Kg",
    fmtRupees(d.buyTotal),
    fmtRupees(d.sellTotal),
    fmtRupees(d.margin),
  ]);

  const dealsTable = buildTable(
    ["Time", "Farmer", "Buyer", "Product", "Qty", "Buy Total", "Sell Total", "Margin"],
    dealRows,
    ["", "", "", "Total", "", fmtRupees(data.totalPurchases), fmtRupees(data.totalSales), fmtRupees(data.totalSales - data.totalPurchases)],
    4
  );

  const paymentRows = data.payments.map((p) => [
    p.time || "—",
    p.party,
    p.type === "receipt" ? "Receipt" : "Payment",
    p.mode,
    fmtRupees(p.amount),
    p.narration || "—",
  ]);

  const paymentsTable = buildTable(
    ["Time", "Party", "Type", "Mode", "Amount", "Narration"],
    paymentRows,
    ["", "", "", "Total Receipts", fmtRupees(data.totalReceipts), ""],
    4
  );

  const body = `
    ${buildLetterhead({ companyName: data.companyName, companyAddress: data.companyAddress, logoBase64: data.logoBase64 })}
    ${buildTitleBar("DAY BOOK", `Date: ${data.date}`, todayStr())}
    <div class="summary-grid">
      ${summaryBox("Total Purchases", fmtRupees(data.totalPurchases))}
      ${summaryBox("Total Sales", fmtRupees(data.totalSales))}
      ${summaryBox("Receipts", fmtRupees(data.totalReceipts))}
      ${summaryBox("Payments Out", fmtRupees(data.totalPaymentsOut), "red")}
      ${summaryBox("Net Cash Flow", fmtRupees(data.netCashFlow), data.netCashFlow < 0 ? "red" : undefined)}
    </div>
    <div style="font-weight:700;color:#059669;margin-bottom:8px;font-size:13px;">Today's Deals</div>
    ${data.deals.length > 0 ? dealsTable : "<p style='color:#94a3b8;font-size:12px;margin-bottom:14px;'>No deals today</p>"}
    <div style="font-weight:700;color:#059669;margin-bottom:8px;font-size:13px;">Today's Payments</div>
    ${data.payments.length > 0 ? paymentsTable : "<p style='color:#94a3b8;font-size:12px;'>No payments today</p>"}
    ${buildPrintFooter()}`;

  return wrapHtml(body);
}

// ── 31. Advances Report ────────────────────────────────────────────────────────

export interface AdvanceEntry {
  farmerName: string;
  village?: string;
  advanceDate: string;
  purpose?: string;
  originalAmount: number;
  recoveredAmount: number;
  balance: number;
  status: "active" | "recovered";
}

export interface AdvancesReportData {
  asOnDate: string;
  entries: AdvanceEntry[];
  totalActive: number;
  totalRecovered: number;
  companyName: string;
  companyAddress?: string;
  logoBase64?: string;
}

export function advancesReportTemplate(data: AdvancesReportData): string {
  const rows = data.entries.map((e) => [
    e.farmerName,
    e.village || "—",
    e.advanceDate,
    e.purpose || "—",
    fmtRupees(e.originalAmount),
    fmtRupees(e.recoveredAmount),
    fmtRupees(e.balance),
    e.status === "active" ? "Active" : "Recovered",
  ]);

  const table = buildTable(
    ["Farmer", "Village", "Date", "Purpose", "Original", "Recovered", "Balance", "Status"],
    rows,
    [
      "Total",
      "",
      "",
      "",
      fmtRupees(data.entries.reduce((s, e) => s + e.originalAmount, 0)),
      fmtRupees(data.entries.reduce((s, e) => s + e.recoveredAmount, 0)),
      fmtRupees(data.totalActive),
      "",
    ],
    4
  );

  const body = `
    ${buildLetterhead({ companyName: data.companyName, companyAddress: data.companyAddress, logoBase64: data.logoBase64 })}
    ${buildTitleBar("ADVANCES REPORT", `As on ${data.asOnDate}`, todayStr())}
    <div class="summary-grid">
      ${summaryBox("Active Balance", fmtRupees(data.totalActive), "amber")}
      ${summaryBox("Total Recovered", fmtRupees(data.totalRecovered))}
      ${summaryBox("Active Farmers", String(data.entries.filter((e) => e.status === "active").length))}
    </div>
    ${table}
    ${buildPrintFooter()}`;

  return wrapHtml(body);
}

// ── 32. Transporter Report ─────────────────────────────────────────────────────

export interface TransporterReportEntry {
  transporterName: string;
  vehicleNo: string;
  totalTrips: number;
  totalWeight: number;
  totalFreight: number;
  advancePaid: number;
  balanceDue: number;
}

export interface TransporterReportData {
  period: string;
  entries: TransporterReportEntry[];
  companyName: string;
  companyAddress?: string;
  logoBase64?: string;
}

export function transporterReportTemplate(data: TransporterReportData): string {
  const rows = data.entries.map((e) => [
    e.transporterName,
    e.vehicleNo,
    String(e.totalTrips),
    `${fmtNumber(e.totalWeight)} Kg`,
    fmtRupees(e.totalFreight),
    fmtRupees(e.advancePaid),
    fmtRupees(e.balanceDue),
  ]);

  const t = data.entries.reduce(
    (acc, e) => {
      acc.trips += e.totalTrips;
      acc.weight += e.totalWeight;
      acc.freight += e.totalFreight;
      acc.advance += e.advancePaid;
      acc.balance += e.balanceDue;
      return acc;
    },
    { trips: 0, weight: 0, freight: 0, advance: 0, balance: 0 }
  );

  const table = buildTable(
    ["Transporter", "Vehicle No.", "Trips", "Weight", "Freight", "Advance Paid", "Balance Due"],
    rows,
    ["Total", "", String(t.trips), `${fmtNumber(t.weight)} Kg`, fmtRupees(t.freight), fmtRupees(t.advance), fmtRupees(t.balance)],
    2
  );

  const body = `
    ${buildLetterhead({ companyName: data.companyName, companyAddress: data.companyAddress, logoBase64: data.logoBase64 })}
    ${buildTitleBar("TRANSPORTER PERFORMANCE REPORT", `Period: ${data.period}`, todayStr())}
    ${table}
    ${buildPrintFooter()}`;

  return wrapHtml(body);
}

// ── 33. Buyer Performance Report ──────────────────────────────────────────────

export interface BuyerPerformanceEntry {
  buyerName: string;
  city?: string;
  totalDeals: number;
  totalQty: number;
  totalValue: number;
  totalPaid: number;
  outstanding: number;
  avgDaysToSettle: number;
}

export interface BuyerPerformanceData {
  period: string;
  entries: BuyerPerformanceEntry[];
  companyName: string;
  companyAddress?: string;
  companyGst?: string;
  logoBase64?: string;
}

export function buyerPerformanceTemplate(data: BuyerPerformanceData): string {
  const rows = data.entries.map((e) => [
    e.buyerName,
    e.city || "—",
    String(e.totalDeals),
    `${fmtNumber(e.totalQty)} Kg`,
    fmtRupees(e.totalValue),
    fmtRupees(e.totalPaid),
    fmtRupees(e.outstanding),
    `${e.avgDaysToSettle}d`,
  ]);

  const t = data.entries.reduce(
    (acc, e) => {
      acc.deals += e.totalDeals;
      acc.qty += e.totalQty;
      acc.value += e.totalValue;
      acc.paid += e.totalPaid;
      acc.outstanding += e.outstanding;
      return acc;
    },
    { deals: 0, qty: 0, value: 0, paid: 0, outstanding: 0 }
  );

  const table = buildTable(
    ["Buyer", "City", "Deals", "Qty", "Total Value", "Total Paid", "Outstanding", "Avg Days"],
    rows,
    ["Total", "", String(t.deals), `${fmtNumber(t.qty)} Kg`, fmtRupees(t.value), fmtRupees(t.paid), fmtRupees(t.outstanding), ""],
    2
  );

  const body = `
    ${buildLetterhead({ companyName: data.companyName, companyAddress: data.companyAddress, companyGst: data.companyGst, logoBase64: data.logoBase64 })}
    ${buildTitleBar("BUYER PERFORMANCE REPORT", `Period: ${data.period}`, todayStr())}
    <div class="summary-grid">
      ${summaryBox("Total Buyers", String(data.entries.length))}
      ${summaryBox("Total Value", fmtRupees(t.value))}
      ${summaryBox("Total Received", fmtRupees(t.paid))}
      ${summaryBox("Outstanding", fmtRupees(t.outstanding), "red")}
    </div>
    ${table}
    ${buildPrintFooter()}`;

  return wrapHtml(body);
}

// ── 34. Profit & Loss Summary ──────────────────────────────────────────────────

export interface PnlSummaryData {
  period: string;
  totalSales: number;
  totalPurchases: number;
  grossProfit: number;
  expenses: { category: string; amount: number }[];
  totalExpenses: number;
  netProfit: number;
  companyName: string;
  companyAddress?: string;
  companyGst?: string;
  logoBase64?: string;
}

export function pnlSummaryTemplate(data: PnlSummaryData): string {
  const expenseRows = data.expenses.map((e) => feeRow(e.category, e.amount)).join("");

  const body = `
    ${buildLetterhead({ companyName: data.companyName, companyAddress: data.companyAddress, companyGst: data.companyGst, logoBase64: data.logoBase64 })}
    ${buildTitleBar("PROFIT & LOSS STATEMENT", `Period: ${data.period}`, todayStr())}
    <div class="summary-grid">
      ${summaryBox("Total Sales", fmtRupees(data.totalSales))}
      ${summaryBox("Total Purchases", fmtRupees(data.totalPurchases))}
      ${summaryBox("Gross Profit", fmtRupees(data.grossProfit))}
      ${summaryBox("Total Expenses", fmtRupees(data.totalExpenses), "amber")}
      ${summaryBox("Net Profit", fmtRupees(data.netProfit), data.netProfit < 0 ? "red" : undefined)}
    </div>
    <div style="display:flex;gap:16px;margin-bottom:14px;">
      <div style="flex:1;">
        <div style="font-weight:700;color:#059669;margin-bottom:8px;font-size:13px;">Income</div>
        <table class="deductions-table">
          ${feeRow("Total Sales (Revenue)", data.totalSales)}
          ${feeRow("Less: Total Purchases (CoGS)", data.totalPurchases)}
          <tr class="deduct-total">
            <td><strong>Gross Profit</strong></td>
            <td class="right"><strong>${fmtRupees(data.grossProfit)}</strong></td>
          </tr>
        </table>
      </div>
      <div style="flex:1;">
        <div style="font-weight:700;color:#059669;margin-bottom:8px;font-size:13px;">Expenses</div>
        <table class="deductions-table">
          ${expenseRows}
          <tr class="deduct-total">
            <td><strong>Total Expenses</strong></td>
            <td class="right"><strong>${fmtRupees(data.totalExpenses)}</strong></td>
          </tr>
        </table>
      </div>
    </div>
    <table class="deductions-table" style="width:50%;margin-left:auto;">
      <tr style="background:#f0fdf4;">
        <td style="font-size:15px;font-weight:700;color:${data.netProfit >= 0 ? "#059669" : "#dc2626"};padding:12px;">
          Net Profit / (Loss)
        </td>
        <td class="right" style="font-size:15px;font-weight:700;color:${data.netProfit >= 0 ? "#059669" : "#dc2626"};padding:12px;">
          ${fmtRupees(data.netProfit)}
        </td>
      </tr>
    </table>
    <div class="amount-words">${amountInWords(Math.abs(data.netProfit))}</div>
    ${buildPrintFooter()}`;

  return wrapHtml(body);
}

// ── 35. Balance Sheet ──────────────────────────────────────────────────────────

export interface BalanceSheetData {
  asOnDate: string;
  assets: { label: string; amount: number }[];
  liabilities: { label: string; amount: number }[];
  totalAssets: number;
  totalLiabilities: number;
  companyName: string;
  companyAddress?: string;
  companyGst?: string;
  logoBase64?: string;
}

export function balanceSheetTemplate(data: BalanceSheetData): string {
  const assetRows = data.assets.map((a) => feeRow(a.label, a.amount)).join("");
  const liabilityRows = data.liabilities.map((l) => feeRow(l.label, l.amount)).join("");

  const body = `
    ${buildLetterhead({ companyName: data.companyName, companyAddress: data.companyAddress, companyGst: data.companyGst, logoBase64: data.logoBase64 })}
    ${buildTitleBar("BALANCE SHEET", `As on ${data.asOnDate}`, todayStr())}
    <div style="display:flex;gap:16px;margin-bottom:14px;">
      <div style="flex:1;">
        <div style="font-weight:700;color:#059669;margin-bottom:8px;font-size:13px;">Assets</div>
        <table class="deductions-table">
          ${assetRows}
          <tr class="deduct-total">
            <td><strong>Total Assets</strong></td>
            <td class="right"><strong>${fmtRupees(data.totalAssets)}</strong></td>
          </tr>
        </table>
      </div>
      <div style="flex:1;">
        <div style="font-weight:700;color:#059669;margin-bottom:8px;font-size:13px;">Liabilities</div>
        <table class="deductions-table">
          ${liabilityRows}
          <tr class="deduct-total">
            <td><strong>Total Liabilities</strong></td>
            <td class="right"><strong>${fmtRupees(data.totalLiabilities)}</strong></td>
          </tr>
        </table>
      </div>
    </div>
    ${buildPrintFooter()}`;

  return wrapHtml(body);
}

// ── 36. Print Deals List ───────────────────────────────────────────────────────

export interface PrintDealEntry {
  dealDate: string;
  farmerName: string;
  buyerName: string;
  product: string;
  qty: number;
  unit: string;
  buyRate: number;
  sellRate: number;
  netProfit: number;
  status: string;
}

export interface PrintDealsData {
  period: string;
  entries: PrintDealEntry[];
  totalNetProfit: number;
  companyName: string;
  companyAddress?: string;
  companyGst?: string;
  logoBase64?: string;
}

export function printDealsTemplate(data: PrintDealsData): string {
  const rows = data.entries.map((e) => [
    e.dealDate,
    e.farmerName,
    e.buyerName,
    e.product,
    `${fmtNumber(e.qty)} ${e.unit}`,
    fmtRupees(e.buyRate),
    fmtRupees(e.sellRate),
    fmtRupees(e.netProfit),
    e.status,
  ]);

  const table = buildTable(
    ["Date", "Farmer", "Buyer", "Product", "Qty", "Buy Rate", "Sell Rate", "Net Profit", "Status"],
    rows,
    ["", "", "", `Total (${data.entries.length} deals)`, "", "", "", fmtRupees(data.totalNetProfit), ""],
    4
  );

  const body = `
    ${buildLetterhead({ companyName: data.companyName, companyAddress: data.companyAddress, companyGst: data.companyGst, logoBase64: data.logoBase64 })}
    ${buildTitleBar("DEALS LIST", `Period: ${data.period}`, todayStr())}
    <div class="summary-grid">
      ${summaryBox("Total Deals", String(data.entries.length))}
      ${summaryBox("Total Net Profit", fmtRupees(data.totalNetProfit), data.totalNetProfit < 0 ? "red" : undefined)}
    </div>
    ${table}
    ${buildPrintFooter()}`;

  return wrapHtml(body);
}

// ── 37. Cash Book Summary ──────────────────────────────────────────────────────

export interface CashBookEntry {
  date: string;
  particular: string;
  voucherNo: string;
  receipt: number;
  payment: number;
  balance: number;
}

export interface CashBookData {
  period: string;
  openingBalance: number;
  entries: CashBookEntry[];
  totalReceipts: number;
  totalPayments: number;
  closingBalance: number;
  companyName: string;
  companyAddress?: string;
  logoBase64?: string;
}

export function cashBookTemplate(data: CashBookData): string {
  const rows: (string | number)[][] = [
    [data.entries[0]?.date || todayStr(), "Opening Balance", "—", fmtRupees(data.openingBalance), "—", fmtRupees(data.openingBalance)],
    ...data.entries.map((e) => [
      e.date,
      e.particular,
      e.voucherNo,
      e.receipt > 0 ? fmtRupees(e.receipt) : "—",
      e.payment > 0 ? fmtRupees(e.payment) : "—",
      fmtRupees(e.balance),
    ]),
  ];

  const table = buildTable(
    ["Date", "Particular", "Voucher No.", "Receipt", "Payment", "Balance"],
    rows,
    ["", "Closing Balance", "", fmtRupees(data.totalReceipts), fmtRupees(data.totalPayments), fmtRupees(data.closingBalance)],
    3
  );

  const body = `
    ${buildLetterhead({ companyName: data.companyName, companyAddress: data.companyAddress, logoBase64: data.logoBase64 })}
    ${buildTitleBar("CASH BOOK", `Period: ${data.period}`, todayStr())}
    <div class="summary-grid">
      ${summaryBox("Opening Balance", fmtRupees(data.openingBalance))}
      ${summaryBox("Total Receipts", fmtRupees(data.totalReceipts))}
      ${summaryBox("Total Payments", fmtRupees(data.totalPayments), "red")}
      ${summaryBox("Closing Balance", fmtRupees(data.closingBalance), data.closingBalance < 0 ? "red" : undefined)}
    </div>
    ${table}
    ${buildPrintFooter()}`;

  return wrapHtml(body);
}
