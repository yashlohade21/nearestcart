import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import api, { getApiHost } from "../../../lib/api";
import { Colors, Fonts } from "../../../lib/colors";
import { formatRupees, formatDate } from "../../../components/formatters";
import LoadingScreen from "../../../components/LoadingScreen";

interface DealDetail {
  id: string;
  farmer_name: string | null;
  buyer_name: string | null;
  product_name: string | null;
  quantity: number;
  unit: string;
  buy_rate: number;
  sell_rate: number;
  buy_total: number;
  sell_total: number;
  gross_margin: number;
  transport_cost: number;
  labour_cost: number;
  other_cost: number;
  total_cost: number;
  net_profit: number;
  deal_date: string;
  status: string;
}

interface UserProfile {
  name: string;
  phone: string;
  business_name: string | null;
  city: string | null;
  state: string | null;
  mandi_name: string | null;
  address: string | null;
  gst_number: string | null;
  logo_url: string | null;
}

const API_HOST = `http://${getApiHost()}:8000`;

type PageSize = "a4" | "a5" | "thermal";
type CopyLabel = "none" | "buyer" | "farmer" | "self";
type PrintAction = "print" | "share";

const PAGE_DIMENSIONS: Record<PageSize, { width?: number; height?: number; cssSize: string }> = {
  a4: { cssSize: "A4" },
  a5: { width: 420, height: 595, cssSize: "148mm 210mm" },
  thermal: { width: 165, height: 500, cssSize: "58mm 176mm" },
};

const COPY_LABELS: Record<CopyLabel, string> = {
  none: "",
  buyer: "BUYER COPY",
  farmer: "FARMER COPY",
  self: "SELF COPY",
};

// ── Amount in words (Indian numbering) ──

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

function amountInWords(amount: number): string {
  if (amount === 0) return "Rupees Zero Only";

  const num = Math.abs(Math.round(amount));
  if (num === 0) return "Rupees Zero Only";

  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const hundred = Math.floor((num % 1000) / 100);
  const rest = num % 100;

  const parts: string[] = [];
  if (crore) parts.push(twoDigitWords(crore) + " Crore");
  if (lakh) parts.push(twoDigitWords(lakh) + " Lakh");
  if (thousand) parts.push(twoDigitWords(thousand) + " Thousand");
  if (hundred) parts.push(ONES[hundred] + " Hundred");
  if (rest) parts.push(twoDigitWords(rest));

  return "Rupees " + parts.join(" ") + " Only";
}

// ── Logo to base64 for PDF ──

async function fetchLogoBase64(logoUrl: string): Promise<string | null> {
  try {
    const fullUrl = `${API_HOST}${logoUrl}`;
    const result = await FileSystem.downloadAsync(
      fullUrl,
      FileSystem.cacheDirectory + "invoice_logo.jpg"
    );
    const base64 = await FileSystem.readAsStringAsync(result.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const ext = logoUrl.split(".").pop() || "jpeg";
    const mime = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
    return `data:${mime};base64,${base64}`;
  } catch {
    return null;
  }
}

function invoiceNumber(dealId: string): string {
  return `INV-${dealId.slice(0, 8).toUpperCase()}`;
}

function buildReceiptHtml(
  deal: DealDetail,
  user: UserProfile,
  copies: number,
  copyLabel: CopyLabel
): string {
  const sellTotal = deal.sell_total || deal.sell_rate * deal.quantity;
  const totalCosts = (deal.transport_cost || 0) + (deal.labour_cost || 0) + (deal.other_cost || 0);
  const grandTotal = sellTotal + totalCosts;
  const invNo = invoiceNumber(deal.id);
  const label = COPY_LABELS[copyLabel];
  const line = "--------------------------------";
  const dblLine = "================================";

  const receiptBody = `
${dblLine}
${(user.business_name || user.name).toUpperCase().substring(0, 32)}
Phone: ${user.phone}
${user.gst_number ? `GSTIN: ${user.gst_number}` : ""}
${dblLine}
TAX INVOICE    ${invNo}
Date: ${formatDate(deal.deal_date)}
${line}
Buyer:  ${deal.buyer_name || "—"}
Farmer: ${deal.farmer_name || "—"}
${line}
${deal.product_name || "—"}
${deal.quantity} ${deal.unit} × ${formatRupees(deal.sell_rate)} = ${formatRupees(sellTotal)}
${line}
Taxable:        ${formatRupees(sellTotal).padStart(12)}
CGST 0%:        ${formatRupees(0).padStart(12)}
SGST 0%:        ${formatRupees(0).padStart(12)}
${totalCosts > 0 ? `Transport etc: ${formatRupees(totalCosts).padStart(12)}\n` : ""}${dblLine}
TOTAL:          ${formatRupees(grandTotal).padStart(12)}
${dblLine}
${amountInWords(grandTotal)}
${line}
Agri produce exempt from GST
CGST Act 2017, Schedule I
${label ? `${dblLine}\n        ${label}` : dblLine}
`.trim();

  const singlePage = `<div class="page"><pre>${receiptBody}</pre></div>`;
  const pages = Array(copies).fill(singlePage).join('<div style="page-break-after:always"></div>\n');

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<style>
  @page { size: 58mm auto; margin: 2mm; }
  body { margin: 0; padding: 0; font-family: 'Courier New', monospace; font-size: 10px; width: 280px; }
  pre { white-space: pre-wrap; word-break: break-all; font-family: inherit; font-size: inherit; margin: 0; line-height: 1.4; }
  .page { padding: 4px; }
</style>
</head><body>${pages}</body></html>`;
}

function buildInvoiceHtml(
  deal: DealDetail,
  user: UserProfile,
  logoBase64: string | null,
  pageSize: PageSize = "a4",
  copies: number = 1,
  copyLabel: CopyLabel = "none"
): string {
  const buyTotal = deal.buy_total || deal.buy_rate * deal.quantity;
  const sellTotal = deal.sell_total || deal.sell_rate * deal.quantity;
  const totalCosts = (deal.transport_cost || 0) + (deal.labour_cost || 0) + (deal.other_cost || 0);
  const grandTotal = sellTotal + totalCosts;
  const invNo = invoiceNumber(deal.id);

  const addressParts = [user.address, user.city, user.state].filter(Boolean).join(" | ");

  const logoHtml = logoBase64
    ? `<img src="${logoBase64}" style="width:60px;height:60px;border-radius:8px;object-fit:cover;margin-right:16px;" />`
    : "";

  const label = COPY_LABELS[copyLabel];
  const dims = PAGE_DIMENSIONS[pageSize];

  const singlePageContent = `
  <div class="header">
    <div class="header-logo">${logoHtml}</div>
    <div class="header-info">
      <h1>${user.business_name || user.name}</h1>
      ${addressParts ? `<p>${addressParts}</p>` : ""}
      <p>Phone: ${user.phone}${user.mandi_name ? " | Mandi: " + user.mandi_name : ""}</p>
      ${user.gst_number ? `<p>GSTIN: ${user.gst_number}</p>` : ""}
    </div>
  </div>

  <div class="tax-invoice-bar">
    <span class="label">TAX INVOICE</span>
    <span>Invoice: ${invNo} &nbsp;|&nbsp; Date: ${formatDate(deal.deal_date)}</span>
  </div>

  <div class="meta">
    <div class="meta-box">
      <strong>Buyer</strong>
      ${deal.buyer_name || "—"}
    </div>
    <div class="meta-box" style="text-align: right;">
      <strong>Farmer (Supplier)</strong>
      ${deal.farmer_name || "—"}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Sr.</th>
        <th>Item</th>
        <th>HSN</th>
        <th>Qty</th>
        <th>Rate</th>
        <th style="text-align:right">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td>${deal.product_name || "—"}</td>
        <td>—</td>
        <td>${deal.quantity} ${deal.unit}</td>
        <td>${formatRupees(deal.sell_rate)}/${deal.unit}</td>
        <td style="text-align:right">${formatRupees(sellTotal)}</td>
      </tr>
    </tbody>
  </table>

  <table class="totals">
    <tr><td>Taxable Value</td><td style="text-align:right">${formatRupees(sellTotal)}</td></tr>
    <tr><td>CGST @ 0% (Exempt)</td><td style="text-align:right">${formatRupees(0)}</td></tr>
    <tr><td>SGST @ 0% (Exempt)</td><td style="text-align:right">${formatRupees(0)}</td></tr>
    ${totalCosts > 0 ? `<tr><td>Transport / Labour / Other</td><td style="text-align:right">${formatRupees(totalCosts)}</td></tr>` : ""}
    <tr class="grand"><td>TOTAL</td><td style="text-align:right">${formatRupees(grandTotal)}</td></tr>
  </table>

  <div class="words">${amountInWords(grandTotal)}</div>

  <div class="gst-note">
    Note: Agricultural produce is exempt from GST under Schedule I of the CGST Act, 2017. No tax is applicable on this transaction.
  </div>

  <div class="footer">
    Generated by Dalla Deal Tracker
  </div>
  ${label ? `<div class="copy-label">${label}</div>` : ""}`;

  const pages = Array(copies).fill(`<div class="page">${singlePageContent}</div>`).join('<div style="page-break-after:always"></div>\n');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  @page { size: ${dims.cssSize}; margin: 16px; }
  body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; font-size: 13px; }
  .header { display: flex; align-items: center; border-bottom: 2px solid #059669; padding-bottom: 16px; margin-bottom: 16px; }
  .header-logo { flex-shrink: 0; }
  .header-info { flex: 1; }
  .header-info h1 { color: #059669; margin: 0; font-size: 22px; }
  .header-info p { margin: 2px 0; color: #64748b; font-size: 12px; }
  .tax-invoice-bar { display: flex; justify-content: space-between; background: #f0fdf4; padding: 10px 16px; border-radius: 6px; margin-bottom: 16px; font-size: 13px; }
  .tax-invoice-bar .label { font-weight: bold; color: #059669; font-size: 15px; }
  .meta { display: flex; justify-content: space-between; margin-bottom: 16px; }
  .meta-box { font-size: 13px; }
  .meta-box strong { display: block; color: #059669; margin-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  th { background: #f0fdf4; color: #059669; text-align: left; padding: 8px 10px; font-size: 12px; border-bottom: 2px solid #059669; }
  td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
  .totals { margin-top: 12px; }
  .totals tr td { border: none; padding: 4px 10px; }
  .totals tr.grand td { font-weight: bold; font-size: 15px; color: #059669; border-top: 2px solid #059669; padding-top: 10px; }
  .words { background: #f8fafc; padding: 10px 14px; border-radius: 6px; margin-bottom: 16px; font-style: italic; color: #334155; font-size: 12px; }
  .gst-note { background: #fffbeb; border: 1px solid #fbbf24; border-radius: 6px; padding: 10px 14px; font-size: 11px; color: #92400e; margin-bottom: 16px; }
  .copy-label { position: fixed; top: 10px; right: 16px; font-size: 11px; font-weight: bold; color: #94a3b8; letter-spacing: 1px; }
  .footer { text-align: center; margin-top: 24px; color: #94a3b8; font-size: 11px; }
</style>
</head>
<body>${pages}</body>
</html>`;
}

export default function InvoiceScreen() {
  const { dealId } = useLocalSearchParams<{ dealId: string }>();
  const [deal, setDeal] = useState<DealDetail | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Print options state
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printAction, setPrintAction] = useState<PrintAction>("print");
  const [pageSize, setPageSize] = useState<PageSize>("a4");
  const [copies, setCopies] = useState(1);
  const [copyLabel, setCopyLabel] = useState<CopyLabel>("none");

  useEffect(() => {
    async function load() {
      try {
        const [d, u] = await Promise.all([
          api<DealDetail>(`/deals/${dealId}`),
          api<UserProfile>("/auth/profile"),
        ]);
        setDeal(d);
        setUser(u);

        if (u.logo_url) {
          const b64 = await fetchLogoBase64(u.logo_url);
          setLogoBase64(b64);
        }
      } catch {
        Alert.alert("Error", "Failed to load invoice data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [dealId]);

  const openPrintModal = (action: PrintAction) => {
    setPrintAction(action);
    setShowPrintModal(true);
  };

  const generateHtml = () => {
    if (!deal || !user) return "";
    if (pageSize === "thermal") {
      return buildReceiptHtml(deal, user, copies, copyLabel);
    }
    return buildInvoiceHtml(deal, user, logoBase64, pageSize, copies, copyLabel);
  };

  const handlePrint = async () => {
    if (!deal || !user) return;
    setShowPrintModal(false);
    try {
      await Print.printAsync({ html: generateHtml() });
    } catch {
      Alert.alert("Error", "Print failed");
    }
  };

  const handleShare = async () => {
    if (!deal || !user) return;
    setShowPrintModal(false);
    try {
      const dims = PAGE_DIMENSIONS[pageSize];
      const { uri } = await Print.printToFileAsync({
        html: generateHtml(),
        ...(dims.width && dims.height ? { width: dims.width, height: dims.height } : {}),
      });
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "Share Invoice",
      });
    } catch {
      Alert.alert("Error", "Share failed");
    }
  };

  if (loading) return <LoadingScreen />;
  if (!deal || !user) return null;

  const buyTotal = deal.buy_total || deal.buy_rate * deal.quantity;
  const sellTotal = deal.sell_total || deal.sell_rate * deal.quantity;
  const totalCosts = (deal.transport_cost || 0) + (deal.labour_cost || 0) + (deal.other_cost || 0);
  const grandTotal = sellTotal + totalCosts;
  const invNo = invoiceNumber(deal.id);
  const logoUri = user.logo_url ? `${API_HOST}${user.logo_url}` : null;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.invoiceCard}>
          {/* Header with logo */}
          <View style={styles.header}>
            {logoUri && (
              <Image source={{ uri: logoUri }} style={styles.headerLogo} />
            )}
            <Text style={styles.businessName}>
              {user.business_name || user.name}
            </Text>
            <Text style={styles.headerSub}>
              {[user.address, user.city, user.state].filter(Boolean).join(" | ") || user.phone}
            </Text>
            {user.gst_number && (
              <Text style={styles.gstBadge}>GSTIN: {user.gst_number}</Text>
            )}
          </View>

          {/* Tax Invoice bar */}
          <View style={styles.taxInvoiceBar}>
            <Text style={styles.taxInvoiceLabel}>TAX INVOICE</Text>
            <View>
              <Text style={styles.invNoText}>{invNo}</Text>
              <Text style={styles.invDateText}>{formatDate(deal.deal_date)}</Text>
            </View>
          </View>

          {/* Parties */}
          <View style={styles.partiesRow}>
            <View>
              <Text style={styles.metaLabel}>Buyer</Text>
              <Text style={styles.metaValue}>{deal.buyer_name || "—"}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.metaLabel}>Farmer</Text>
              <Text style={styles.metaValue}>{deal.farmer_name || "—"}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Product */}
          <Text style={styles.productName}>{deal.product_name || "—"}</Text>
          <Text style={styles.qtyText}>
            {deal.quantity} {deal.unit}
          </Text>

          <View style={styles.ratesRow}>
            <View style={styles.rateBox}>
              <Text style={styles.rateLabel}>Buy Rate</Text>
              <Text style={styles.rateValue}>
                {formatRupees(deal.buy_rate)}/{deal.unit}
              </Text>
            </View>
            <View style={styles.rateBox}>
              <Text style={styles.rateLabel}>Sell Rate</Text>
              <Text style={styles.rateValue}>
                {formatRupees(deal.sell_rate)}/{deal.unit}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Totals */}
          <InfoRow label="Taxable Value" value={formatRupees(sellTotal)} />
          <InfoRow label="CGST @ 0% (Exempt)" value={formatRupees(0)} />
          <InfoRow label="SGST @ 0% (Exempt)" value={formatRupees(0)} />
          {totalCosts > 0 && (
            <InfoRow label="Transport/Labour/Other" value={formatRupees(totalCosts)} />
          )}

          <View style={styles.divider} />

          <View style={styles.profitRow}>
            <Text style={styles.profitLabel}>Total</Text>
            <Text style={styles.profitValue}>{formatRupees(grandTotal)}</Text>
          </View>

          {/* Amount in words */}
          <View style={styles.wordsBox}>
            <Text style={styles.wordsText}>{amountInWords(grandTotal)}</Text>
          </View>

          {/* Margin info */}
          <View style={styles.marginBox}>
            <InfoRow label="Buy Total" value={formatRupees(buyTotal)} />
            <InfoRow
              label="Gross Margin"
              value={formatRupees(deal.gross_margin || sellTotal - buyTotal)}
            />
            <View style={styles.profitRow}>
              <Text style={styles.netProfitLabel}>Net Profit</Text>
              <Text
                style={[
                  styles.netProfitValue,
                  { color: deal.net_profit >= 0 ? Colors.green : Colors.red },
                ]}
              >
                {formatRupees(deal.net_profit)}
              </Text>
            </View>
          </View>

          {/* GST Note */}
          <View style={styles.gstNote}>
            <Text style={styles.gstNoteText}>
              Agricultural produce is exempt from GST under Schedule I of the CGST Act, 2017.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => openPrintModal("share")}
          activeOpacity={0.7}
        >
          <Ionicons name="share-outline" size={20} color={Colors.green} />
          <Text style={styles.shareText}>Share PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.printButton}
          onPress={() => openPrintModal("print")}
          activeOpacity={0.7}
        >
          <Ionicons name="print" size={20} color={Colors.textWhite} />
          <Text style={styles.printText}>Print</Text>
        </TouchableOpacity>
      </View>

      {/* Print Options Modal */}
      <Modal
        visible={showPrintModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPrintModal(false)}
      >
        <TouchableOpacity
          style={modalStyles.overlay}
          activeOpacity={1}
          onPress={() => setShowPrintModal(false)}
        >
          <TouchableOpacity activeOpacity={1} style={modalStyles.sheet}>
            <View style={modalStyles.handle} />
            <Text style={modalStyles.title}>Print Options</Text>

            {/* Page Size */}
            <Text style={modalStyles.label}>Page Size</Text>
            <View style={modalStyles.chipRow}>
              {(["a4", "a5", "thermal"] as PageSize[]).map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[modalStyles.chip, pageSize === s && modalStyles.chipActive]}
                  onPress={() => setPageSize(s)}
                >
                  <Text style={[modalStyles.chipText, pageSize === s && modalStyles.chipTextActive]}>
                    {s === "thermal" ? "Receipt (58mm)" : s.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Copies */}
            <Text style={modalStyles.label}>Copies</Text>
            <View style={modalStyles.counterRow}>
              <TouchableOpacity
                style={modalStyles.counterBtn}
                onPress={() => setCopies((c) => Math.max(1, c - 1))}
              >
                <Ionicons name="remove" size={20} color={Colors.text} />
              </TouchableOpacity>
              <Text style={modalStyles.counterValue}>{copies}</Text>
              <TouchableOpacity
                style={modalStyles.counterBtn}
                onPress={() => setCopies((c) => Math.min(5, c + 1))}
              >
                <Ionicons name="add" size={20} color={Colors.text} />
              </TouchableOpacity>
            </View>

            {/* Copy Label */}
            <Text style={modalStyles.label}>Copy Label</Text>
            <View style={modalStyles.chipRow}>
              {(["none", "buyer", "farmer", "self"] as CopyLabel[]).map((l) => (
                <TouchableOpacity
                  key={l}
                  style={[modalStyles.chip, copyLabel === l && modalStyles.chipActive]}
                  onPress={() => setCopyLabel(l)}
                >
                  <Text style={[modalStyles.chipText, copyLabel === l && modalStyles.chipTextActive]}>
                    {l === "none" ? "None" : l.charAt(0).toUpperCase() + l.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Actions */}
            <View style={modalStyles.actionRow}>
              <TouchableOpacity
                style={[modalStyles.actionBtn, modalStyles.shareBtn]}
                onPress={printAction === "share" ? handleShare : handlePrint}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={printAction === "share" ? "share-outline" : "print"}
                  size={20}
                  color={Colors.textWhite}
                />
                <Text style={modalStyles.actionBtnText}>
                  {printAction === "share" ? "Share PDF" : "Print"}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={infoStyles.row}>
      <Text style={infoStyles.label}>{label}</Text>
      <Text style={infoStyles.value}>{value}</Text>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  label: {
    fontSize: Fonts.sm,
    color: Colors.textSecondary,
  },
  value: {
    fontSize: Fonts.sm,
    fontWeight: "600",
    color: Colors.text,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.greenBg,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  invoiceCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    alignItems: "center",
    marginBottom: 16,
  },
  headerLogo: {
    width: 56,
    height: 56,
    borderRadius: 10,
    marginBottom: 8,
  },
  businessName: {
    fontSize: Fonts.xl,
    fontWeight: "700",
    color: Colors.green,
  },
  headerSub: {
    fontSize: Fonts.xs,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: "center",
  },
  gstBadge: {
    marginTop: 6,
    fontSize: Fonts.xs,
    fontWeight: "600",
    color: Colors.green,
    backgroundColor: Colors.greenBg,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: "hidden",
  },
  taxInvoiceBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.greenBg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  taxInvoiceLabel: {
    fontSize: Fonts.base,
    fontWeight: "800",
    color: Colors.green,
  },
  invNoText: {
    fontSize: Fonts.xs,
    fontWeight: "600",
    color: Colors.text,
    textAlign: "right",
  },
  invDateText: {
    fontSize: Fonts.xs,
    color: Colors.textSecondary,
    textAlign: "right",
  },
  partiesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
  },
  metaLabel: {
    fontSize: Fonts.xs,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: Fonts.sm,
    fontWeight: "600",
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  productName: {
    fontSize: Fonts.lg,
    fontWeight: "700",
    color: Colors.text,
    textAlign: "center",
  },
  qtyText: {
    fontSize: Fonts.sm,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 12,
  },
  ratesRow: {
    flexDirection: "row",
    gap: 12,
  },
  rateBox: {
    flex: 1,
    backgroundColor: Colors.greenBg,
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  rateLabel: {
    fontSize: Fonts.xs,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  rateValue: {
    fontSize: Fonts.base,
    fontWeight: "700",
    color: Colors.text,
  },
  profitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  profitLabel: {
    fontSize: Fonts.base,
    fontWeight: "700",
    color: Colors.text,
  },
  profitValue: {
    fontSize: Fonts["2xl"],
    fontWeight: "800",
    color: Colors.green,
  },
  wordsBox: {
    backgroundColor: Colors.greenBg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 10,
  },
  wordsText: {
    fontSize: Fonts.xs,
    fontStyle: "italic",
    color: Colors.textSecondary,
  },
  marginBox: {
    marginTop: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    padding: 12,
  },
  netProfitLabel: {
    fontSize: Fonts.sm,
    fontWeight: "700",
    color: Colors.text,
  },
  netProfitValue: {
    fontSize: Fonts.lg,
    fontWeight: "800",
  },
  gstNote: {
    marginTop: 12,
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fbbf24",
    borderRadius: 8,
    padding: 10,
  },
  gstNoteText: {
    fontSize: Fonts.xs,
    color: "#92400e",
  },
  actionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 12,
    padding: 16,
    paddingBottom: 24,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  shareButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.greenLight,
    borderRadius: 14,
    paddingVertical: 16,
  },
  shareText: {
    fontSize: Fonts.base,
    fontWeight: "700",
    color: Colors.green,
  },
  printButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.green,
    borderRadius: 14,
    paddingVertical: 16,
  },
  printText: {
    fontSize: Fonts.base,
    fontWeight: "700",
    color: Colors.textWhite,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 32,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: Fonts.lg,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 16,
  },
  label: {
    fontSize: Fonts.sm,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: 8,
    marginTop: 12,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.greenBg,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  chipActive: {
    borderColor: Colors.green,
    backgroundColor: Colors.greenLight,
  },
  chipText: {
    fontSize: Fonts.sm,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.green,
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  counterBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.greenBg,
    alignItems: "center",
    justifyContent: "center",
  },
  counterValue: {
    fontSize: Fonts.xl,
    fontWeight: "700",
    color: Colors.text,
    minWidth: 24,
    textAlign: "center",
  },
  actionRow: {
    marginTop: 24,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  shareBtn: {
    backgroundColor: Colors.green,
  },
  actionBtnText: {
    fontSize: Fonts.base,
    fontWeight: "700",
    color: Colors.textWhite,
  },
});
