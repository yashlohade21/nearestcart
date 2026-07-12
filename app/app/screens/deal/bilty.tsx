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
import { SafeAreaView } from "react-native-safe-area-context";
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
  transport_cost: number;
  labour_cost: number;
  other_cost: number;
  deal_date: string;
  delivery_date: string | null;
  status: string;
  transporter_name: string | null;
  vehicle_number: string | null;
  vehicle_type: string | null;
  notes: string | null;
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
type PrintAction = "print" | "share";

const PAGE_DIMENSIONS: Record<PageSize, { width?: number; height?: number; cssSize: string }> = {
  a4: { cssSize: "A4" },
  a5: { width: 420, height: 595, cssSize: "148mm 210mm" },
  thermal: { width: 165, height: 500, cssSize: "58mm 176mm" },
};

async function fetchLogoBase64(logoUrl: string): Promise<string | null> {
  try {
    const fullUrl = `${API_HOST}${logoUrl}`;
    const result = await FileSystem.downloadAsync(
      fullUrl,
      FileSystem.cacheDirectory + "bilty_logo.jpg"
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

function biltyNumber(dealId: string): string {
  return `BLT-${dealId.slice(0, 8).toUpperCase()}`;
}

function buildThermalBilty(deal: DealDetail, user: UserProfile): string {
  const biltyNo = biltyNumber(deal.id);
  const line = "--------------------------------";
  const dblLine = "================================";

  const body = `
${dblLine}
${(user.business_name || user.name).toUpperCase().substring(0, 32)}
Phone: ${user.phone}
${user.gst_number ? `GSTIN: ${user.gst_number}` : ""}
${dblLine}
TRANSPORT RECEIPT (BILTY)
No: ${biltyNo}
Date: ${formatDate(deal.deal_date)}
${line}
From: ${deal.farmer_name || "—"}
${user.mandi_name ? `Origin: ${user.mandi_name}` : ""}
To:   ${deal.buyer_name || "—"}
${line}
Transporter: ${deal.transporter_name || "—"}
Vehicle: ${deal.vehicle_number || "—"}
Type: ${deal.vehicle_type || "—"}
${line}
GOODS DESCRIPTION
${deal.product_name || "—"}
Qty: ${deal.quantity} ${deal.unit}
${line}
Transport: ${formatRupees(deal.transport_cost || 0)}
Labour:    ${formatRupees(deal.labour_cost || 0)}
Other:     ${formatRupees(deal.other_cost || 0)}
${dblLine}
TOTAL:     ${formatRupees((deal.transport_cost || 0) + (deal.labour_cost || 0) + (deal.other_cost || 0))}
${dblLine}
${deal.notes ? `Note: ${deal.notes}\n${line}` : ""}
Consignor Sign:


Consignee Sign:


Driver Sign:

${dblLine}
`.trim();

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<style>
  @page { size: 58mm auto; margin: 2mm; }
  body { margin: 0; padding: 0; font-family: 'Courier New', monospace; font-size: 10px; width: 280px; }
  pre { white-space: pre-wrap; word-break: break-all; font-family: inherit; font-size: inherit; margin: 0; line-height: 1.4; }
  .page { padding: 4px; }
</style>
</head><body><div class="page"><pre>${body}</pre></div></body></html>`;
}

function buildBiltyHtml(
  deal: DealDetail,
  user: UserProfile,
  logoBase64: string | null,
  pageSize: PageSize = "a4",
  copies: number = 1
): string {
  const biltyNo = biltyNumber(deal.id);
  const totalTransport = (deal.transport_cost || 0) + (deal.labour_cost || 0) + (deal.other_cost || 0);
  const addressParts = [user.address, user.city, user.state].filter(Boolean).join(" | ");

  const logoHtml = logoBase64
    ? `<img src="${logoBase64}" style="width:50px;height:50px;border-radius:8px;object-fit:cover;margin-right:14px;" />`
    : "";

  const dims = PAGE_DIMENSIONS[pageSize];

  const singlePage = `
  <div class="header">
    <div class="header-left">${logoHtml}
      <div>
        <h1>${user.business_name || user.name}</h1>
        ${addressParts ? `<p>${addressParts}</p>` : ""}
        <p>Phone: ${user.phone}${user.gst_number ? ` | GSTIN: ${user.gst_number}` : ""}</p>
      </div>
    </div>
  </div>

  <div class="bilty-bar">
    <div>
      <span class="bilty-label">TRANSPORT RECEIPT (BILTY)</span>
    </div>
    <div class="bilty-meta">
      <span><strong>${biltyNo}</strong></span>
      <span>Date: ${formatDate(deal.deal_date)}</span>
      ${deal.delivery_date ? `<span>Delivery: ${formatDate(deal.delivery_date)}</span>` : ""}
    </div>
  </div>

  <div class="parties-grid">
    <div class="party-box consignor">
      <div class="party-title">CONSIGNOR (Sender)</div>
      <div class="party-name">${deal.farmer_name || "—"}</div>
      ${user.mandi_name ? `<div class="party-detail">Origin: ${user.mandi_name}</div>` : ""}
    </div>
    <div class="arrow-col">
      <div class="arrow">→</div>
    </div>
    <div class="party-box consignee">
      <div class="party-title">CONSIGNEE (Receiver)</div>
      <div class="party-name">${deal.buyer_name || "—"}</div>
    </div>
  </div>

  <div class="transport-box">
    <div class="transport-title">TRANSPORTER DETAILS</div>
    <div class="transport-grid">
      <div class="t-item"><span class="t-label">Transporter</span><span class="t-value">${deal.transporter_name || "—"}</span></div>
      <div class="t-item"><span class="t-label">Vehicle No.</span><span class="t-value vehicle-no">${deal.vehicle_number || "—"}</span></div>
      <div class="t-item"><span class="t-label">Vehicle Type</span><span class="t-value">${deal.vehicle_type || "—"}</span></div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Sr.</th>
        <th>Description of Goods</th>
        <th>Quantity</th>
        <th>Unit</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td>${deal.product_name || "—"}</td>
        <td style="text-align:center">${deal.quantity}</td>
        <td style="text-align:center">${deal.unit}</td>
      </tr>
    </tbody>
  </table>

  <div class="charges-section">
    <div class="charges-title">CHARGES</div>
    <table class="charges-table">
      ${deal.transport_cost ? `<tr><td>Transport / Freight</td><td style="text-align:right">${formatRupees(deal.transport_cost)}</td></tr>` : ""}
      ${deal.labour_cost ? `<tr><td>Loading / Unloading / Labour</td><td style="text-align:right">${formatRupees(deal.labour_cost)}</td></tr>` : ""}
      ${deal.other_cost ? `<tr><td>Other Charges</td><td style="text-align:right">${formatRupees(deal.other_cost)}</td></tr>` : ""}
      <tr class="total-row"><td><strong>TOTAL CHARGES</strong></td><td style="text-align:right"><strong>${formatRupees(totalTransport)}</strong></td></tr>
    </table>
  </div>

  ${deal.notes ? `<div class="notes-box"><strong>Notes:</strong> ${deal.notes}</div>` : ""}

  <div class="signatures">
    <div class="sig-box">
      <div class="sig-line"></div>
      <div class="sig-label">Consignor's Signature</div>
    </div>
    <div class="sig-box">
      <div class="sig-line"></div>
      <div class="sig-label">Driver's Signature</div>
    </div>
    <div class="sig-box">
      <div class="sig-line"></div>
      <div class="sig-label">Consignee's Signature</div>
    </div>
  </div>

  <div class="footer">
    <p>This is a computer generated transport receipt. Goods are carried at owner's risk.</p>
    <p class="powered">Generated by Dalla Deal Tracker</p>
  </div>`;

  const pages = Array(copies)
    .fill(`<div class="page">${singlePage}</div>`)
    .join('<div style="page-break-after:always"></div>\n');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  @page { size: ${dims.cssSize}; margin: 14px; }
  * { box-sizing: border-box; }
  body { font-family: Arial, sans-serif; padding: 20px; color: #0f172a; font-size: 13px; margin: 0; }

  .header { border-bottom: 3px solid #059669; padding-bottom: 14px; margin-bottom: 14px; }
  .header-left { display: flex; align-items: center; }
  .header h1 { color: #059669; margin: 0; font-size: 20px; }
  .header p { margin: 2px 0; color: #64748b; font-size: 11px; }

  .bilty-bar { display: flex; justify-content: space-between; align-items: center; background: #fef3c7; border: 2px solid #f59e0b; padding: 10px 14px; border-radius: 6px; margin-bottom: 14px; }
  .bilty-label { font-weight: 800; color: #92400e; font-size: 15px; letter-spacing: 0.5px; }
  .bilty-meta { display: flex; flex-direction: column; text-align: right; font-size: 12px; color: #92400e; gap: 2px; }

  .parties-grid { display: flex; gap: 12px; margin-bottom: 14px; align-items: stretch; }
  .party-box { flex: 1; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
  .party-box.consignor { border-left: 4px solid #059669; }
  .party-box.consignee { border-left: 4px solid #2563eb; }
  .party-title { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
  .party-name { font-size: 15px; font-weight: 700; color: #0f172a; }
  .party-detail { font-size: 12px; color: #64748b; margin-top: 4px; }
  .arrow-col { display: flex; align-items: center; justify-content: center; width: 30px; }
  .arrow { font-size: 24px; color: #94a3b8; }

  .transport-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 14px; }
  .transport-title { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; }
  .transport-grid { display: flex; gap: 20px; }
  .t-item { display: flex; flex-direction: column; }
  .t-label { font-size: 10px; color: #94a3b8; margin-bottom: 2px; }
  .t-value { font-size: 14px; font-weight: 600; color: #0f172a; }
  .vehicle-no { background: #fef3c7; padding: 2px 8px; border-radius: 4px; border: 1px solid #f59e0b; font-family: monospace; letter-spacing: 1px; }

  table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
  th { background: #f0fdf4; color: #059669; text-align: left; padding: 8px 10px; font-size: 11px; border-bottom: 2px solid #059669; }
  td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }

  .charges-section { margin-bottom: 14px; }
  .charges-title { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
  .charges-table { width: 60%; margin-left: auto; }
  .charges-table td { border: none; padding: 4px 10px; font-size: 13px; }
  .charges-table .total-row td { border-top: 2px solid #059669; padding-top: 8px; font-size: 14px; color: #059669; }

  .notes-box { background: #f8fafc; border-radius: 6px; padding: 10px 14px; font-size: 12px; color: #334155; margin-bottom: 14px; }

  .signatures { display: flex; justify-content: space-between; margin-top: 30px; margin-bottom: 20px; }
  .sig-box { text-align: center; width: 30%; }
  .sig-line { border-bottom: 1px solid #94a3b8; height: 50px; margin-bottom: 6px; }
  .sig-label { font-size: 10px; color: #64748b; }

  .footer { text-align: center; border-top: 1px solid #e2e8f0; padding-top: 10px; }
  .footer p { margin: 2px 0; font-size: 10px; color: #94a3b8; }
  .powered { font-style: italic; }
</style>
</head>
<body>${pages}</body>
</html>`;
}

export default function BiltyScreen() {
  const { dealId } = useLocalSearchParams<{ dealId: string }>();
  const [deal, setDeal] = useState<DealDetail | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printAction, setPrintAction] = useState<PrintAction>("print");
  const [pageSize, setPageSize] = useState<PageSize>("a4");
  const [copies, setCopies] = useState(2); // Default 2 copies for bilty

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
        Alert.alert("Error", "Failed to load bilty data");
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
    if (pageSize === "thermal") return buildThermalBilty(deal, user);
    return buildBiltyHtml(deal, user, logoBase64, pageSize, copies);
  };

  const handlePrint = async () => {
    setShowPrintModal(false);
    try {
      await Print.printAsync({ html: generateHtml() });
    } catch {
      Alert.alert("Error", "Print failed");
    }
  };

  const handleShare = async () => {
    setShowPrintModal(false);
    try {
      const dims = PAGE_DIMENSIONS[pageSize];
      const { uri } = await Print.printToFileAsync({
        html: generateHtml(),
        ...(dims.width && dims.height ? { width: dims.width, height: dims.height } : {}),
      });
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "Share Bilty",
      });
    } catch {
      Alert.alert("Error", "Share failed");
    }
  };

  if (loading) return <LoadingScreen />;
  if (!deal || !user) return null;

  const totalTransport = (deal.transport_cost || 0) + (deal.labour_cost || 0) + (deal.other_cost || 0);
  const biltyNo = biltyNumber(deal.id);
  const logoUri = user.logo_url ? `${API_HOST}${user.logo_url}` : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.greenBg }} edges={["bottom"]}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.biltyCard}>
            {/* Header */}
            <View style={styles.header}>
              {logoUri && <Image source={{ uri: logoUri }} style={styles.headerLogo} />}
              <Text style={styles.businessName}>{user.business_name || user.name}</Text>
              <Text style={styles.headerSub}>
                {[user.address, user.city, user.state].filter(Boolean).join(" | ") || user.phone}
              </Text>
            </View>

            {/* Bilty Bar */}
            <View style={styles.biltyBar}>
              <View>
                <Text style={styles.biltyLabel}>TRANSPORT RECEIPT</Text>
                <Text style={styles.biltySubLabel}>BILTY</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.biltyNo}>{biltyNo}</Text>
                <Text style={styles.biltyDate}>{formatDate(deal.deal_date)}</Text>
              </View>
            </View>

            {/* Parties */}
            <View style={styles.partiesRow}>
              <View style={[styles.partyBox, { borderLeftColor: Colors.green }]}>
                <Text style={styles.partyTitle}>FROM (Consignor)</Text>
                <Text style={styles.partyName}>{deal.farmer_name || "—"}</Text>
                {user.mandi_name && <Text style={styles.partyDetail}>Origin: {user.mandi_name}</Text>}
              </View>
              <View style={styles.arrowCol}>
                <Ionicons name="arrow-forward" size={20} color={Colors.textMuted} />
              </View>
              <View style={[styles.partyBox, { borderLeftColor: "#2563eb" }]}>
                <Text style={styles.partyTitle}>TO (Consignee)</Text>
                <Text style={styles.partyName}>{deal.buyer_name || "—"}</Text>
              </View>
            </View>

            {/* Transport Details */}
            <View style={styles.transportCard}>
              <Text style={styles.sectionLabel}>TRANSPORTER</Text>
              <View style={styles.transportGrid}>
                <TransportItem label="Name" value={deal.transporter_name || "—"} />
                <TransportItem label="Vehicle No." value={deal.vehicle_number || "—"} highlight />
                <TransportItem label="Vehicle Type" value={deal.vehicle_type || "—"} />
              </View>
            </View>

            <View style={styles.divider} />

            {/* Goods */}
            <Text style={styles.sectionLabel}>GOODS</Text>
            <View style={styles.goodsRow}>
              <View style={styles.goodsItem}>
                <Text style={styles.goodsLabel}>Product</Text>
                <Text style={styles.goodsValue}>{deal.product_name || "—"}</Text>
              </View>
              <View style={styles.goodsItem}>
                <Text style={styles.goodsLabel}>Quantity</Text>
                <Text style={styles.goodsValue}>{deal.quantity} {deal.unit}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Charges */}
            <Text style={styles.sectionLabel}>CHARGES</Text>
            {(deal.transport_cost || 0) > 0 && (
              <InfoRow label="Transport / Freight" value={formatRupees(deal.transport_cost)} />
            )}
            {(deal.labour_cost || 0) > 0 && (
              <InfoRow label="Loading / Labour" value={formatRupees(deal.labour_cost)} />
            )}
            {(deal.other_cost || 0) > 0 && (
              <InfoRow label="Other Charges" value={formatRupees(deal.other_cost)} />
            )}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Charges</Text>
              <Text style={styles.totalValue}>{formatRupees(totalTransport)}</Text>
            </View>

            {/* Notes */}
            {deal.notes && (
              <View style={styles.notesBox}>
                <Text style={styles.notesText}>Note: {deal.notes}</Text>
              </View>
            )}

            {/* Signatures */}
            <View style={styles.sigRow}>
              <View style={styles.sigBox}>
                <View style={styles.sigLine} />
                <Text style={styles.sigLabel}>Consignor</Text>
              </View>
              <View style={styles.sigBox}>
                <View style={styles.sigLine} />
                <Text style={styles.sigLabel}>Driver</Text>
              </View>
              <View style={styles.sigBox}>
                <View style={styles.sigLine} />
                <Text style={styles.sigLabel}>Consignee</Text>
              </View>
            </View>

            <Text style={styles.disclaimer}>
              Goods carried at owner's risk. This is a computer generated transport receipt.
            </Text>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => openPrintModal("share")}
            activeOpacity={0.7}
          >
            <Ionicons name="share-outline" size={20} color="#d97706" />
            <Text style={styles.shareText}>Share PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.printButton}
            onPress={() => openPrintModal("print")}
            activeOpacity={0.7}
          >
            <Ionicons name="print" size={20} color={Colors.textWhite} />
            <Text style={styles.printText}>Print Bilty</Text>
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
              <Text style={modalStyles.title}>Bilty Print Options</Text>

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

              {pageSize !== "thermal" && (
                <>
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
                </>
              )}

              <View style={modalStyles.actionRow}>
                <TouchableOpacity
                  style={modalStyles.actionBtn}
                  onPress={printAction === "share" ? handleShare : handlePrint}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={printAction === "share" ? "share-outline" : "print"}
                    size={20}
                    color={Colors.textWhite}
                  />
                  <Text style={modalStyles.actionBtnText}>
                    {printAction === "share" ? "Share Bilty PDF" : "Print Bilty"}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

function TransportItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.transportItem}>
      <Text style={styles.transportLabel}>{label}</Text>
      <Text style={[styles.transportValue, highlight && styles.vehicleHighlight]}>{value}</Text>
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
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  label: { fontSize: Fonts.sm, color: Colors.textSecondary },
  value: { fontSize: Fonts.sm, fontWeight: "600", color: Colors.text },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.greenBg },
  content: { padding: 16, paddingBottom: 100 },
  biltyCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  header: { alignItems: "center", marginBottom: 14 },
  headerLogo: { width: 50, height: 50, borderRadius: 10, marginBottom: 8 },
  businessName: { fontSize: Fonts.xl, fontWeight: "700", color: Colors.green },
  headerSub: { fontSize: Fonts.xs, color: Colors.textSecondary, marginTop: 4, textAlign: "center" },
  biltyBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    borderWidth: 2,
    borderColor: "#f59e0b",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  biltyLabel: { fontSize: Fonts.base, fontWeight: "800", color: "#92400e" },
  biltySubLabel: { fontSize: Fonts.xs, fontWeight: "600", color: "#b45309" },
  biltyNo: { fontSize: Fonts.sm, fontWeight: "700", color: "#92400e" },
  biltyDate: { fontSize: Fonts.xs, color: "#b45309" },
  partiesRow: { flexDirection: "row", gap: 8, marginBottom: 14, alignItems: "stretch" },
  partyBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 4,
    borderRadius: 10,
    padding: 12,
  },
  arrowCol: { justifyContent: "center", alignItems: "center", width: 24 },
  partyTitle: { fontSize: 10, fontWeight: "700", color: Colors.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  partyName: { fontSize: Fonts.base, fontWeight: "700", color: Colors.text },
  partyDetail: { fontSize: Fonts.xs, color: Colors.textSecondary, marginTop: 4 },
  transportCard: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  transportGrid: { flexDirection: "row", gap: 16 },
  transportItem: {},
  transportLabel: { fontSize: 10, color: Colors.textMuted, marginBottom: 2 },
  transportValue: { fontSize: Fonts.sm, fontWeight: "600", color: Colors.text },
  vehicleHighlight: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#f59e0b",
    fontFamily: "monospace",
    letterSpacing: 1,
    overflow: "hidden",
  },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 12 },
  goodsRow: { flexDirection: "row", gap: 20 },
  goodsItem: {},
  goodsLabel: { fontSize: 10, color: Colors.textMuted, marginBottom: 2 },
  goodsValue: { fontSize: Fonts.base, fontWeight: "700", color: Colors.text },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: Colors.green,
  },
  totalLabel: { fontSize: Fonts.base, fontWeight: "700", color: Colors.text },
  totalValue: { fontSize: Fonts.xl, fontWeight: "800", color: Colors.green },
  notesBox: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
  },
  notesText: { fontSize: Fonts.xs, color: Colors.textSecondary },
  sigRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 24, marginBottom: 16 },
  sigBox: { alignItems: "center", width: "30%" },
  sigLine: { width: "100%", borderBottomWidth: 1, borderBottomColor: Colors.textMuted, height: 40, marginBottom: 6 },
  sigLabel: { fontSize: 10, color: Colors.textMuted },
  disclaimer: { fontSize: 10, color: Colors.textMuted, textAlign: "center", fontStyle: "italic" },
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
    backgroundColor: "#fef3c7",
    borderRadius: 14,
    paddingVertical: 16,
  },
  shareText: { fontSize: Fonts.base, fontWeight: "700", color: "#92400e" },
  printButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#d97706",
    borderRadius: 14,
    paddingVertical: 16,
  },
  printText: { fontSize: Fonts.base, fontWeight: "700", color: Colors.textWhite },
});

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: { backgroundColor: Colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 32 },
  handle: { width: 40, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  title: { fontSize: Fonts.lg, fontWeight: "700", color: Colors.text, marginBottom: 16 },
  label: { fontSize: Fonts.sm, fontWeight: "600", color: Colors.textSecondary, marginBottom: 8, marginTop: 12 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: Colors.greenBg, borderWidth: 1.5, borderColor: "transparent" },
  chipActive: { borderColor: "#d97706", backgroundColor: "#fef3c7" },
  chipText: { fontSize: Fonts.sm, fontWeight: "600", color: Colors.textSecondary },
  chipTextActive: { color: "#92400e" },
  counterRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  counterBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: Colors.greenBg, alignItems: "center", justifyContent: "center" },
  counterValue: { fontSize: Fonts.xl, fontWeight: "700", color: Colors.text, minWidth: 24, textAlign: "center" },
  actionRow: { marginTop: 24 },
  actionBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: 14, backgroundColor: "#d97706" },
  actionBtnText: { fontSize: Fonts.base, fontWeight: "700", color: Colors.textWhite },
});
