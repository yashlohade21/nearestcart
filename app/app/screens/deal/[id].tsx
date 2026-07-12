import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import api from "../../../lib/api";
import { Colors, Fonts, getProductEmoji } from "../../../lib/colors";
import { formatRupees, formatDate } from "../../../components/formatters";
import LoadingScreen from "../../../components/LoadingScreen";
import PhotoAttachment from "../../../components/PhotoAttachment";
import { useT } from "../../../lib/i18n";

interface DealDetail {
  id: string; farmer_name: string | null; buyer_name: string | null; product_name: string | null;
  quantity: number; unit: string; buy_rate: number; sell_rate: number; buy_total: number; sell_total: number;
  gross_margin: number; transport_cost: number; labour_cost: number; other_cost: number; total_cost: number;
  net_profit: number; deal_date: string; status: string; notes: string | null; buyer_paid: number; farmer_paid: number; created_at: string;
}

export default function DealDetailScreen() {
  const t = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [deal, setDeal] = useState<DealDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDeal = async () => {
    try { const data = await api<DealDetail>(`/deals/${id}`); setDeal(data); }
    catch { Alert.alert(t("error"), t("failedLoadDeal")); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchDeal(); }, [id]);

  const markComplete = async () => {
    try { await api(`/deals/${id}`, { method: "PATCH", body: { status: "completed" } }); fetchDeal(); }
    catch { Alert.alert(t("error"), t("failedUpdateDeal")); }
  };

  if (loading) return <LoadingScreen />;
  if (!deal) return null;

  const buyerPending = (deal.sell_total || 0) - (deal.buyer_paid || 0);
  const farmerPending = (deal.buy_total || 0) - (deal.farmer_paid || 0);
  const emoji = getProductEmoji(deal.product_name || "");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.greenBg }} edges={["bottom"]}>
    <ScrollView style={styles.container} contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchDeal(); }} colors={[Colors.green]} />}>
      <View style={styles.statusRow}>
        <View style={[styles.statusBadge, deal.status === "completed" ? { backgroundColor: Colors.greenLight } : { backgroundColor: Colors.amberLight }]}>
          <Text style={[styles.statusText, deal.status === "completed" ? { color: Colors.green } : { color: Colors.amber }]}>{deal.status.toUpperCase()}</Text>
        </View>
        <Text style={styles.dateText}>{formatDate(deal.deal_date)}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t("parties")}</Text>
        <InfoRow label={t("product")} value={`${emoji} ${deal.product_name || "—"}`} />
        <InfoRow label={t("farmer")} value={deal.farmer_name || "—"} />
        <InfoRow label={t("buyer")} value={deal.buyer_name || "—"} />
        <InfoRow label={t("quantity")} value={`${deal.quantity} ${deal.unit}`} />
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t("financials")}</Text>
        <InfoRow label={t("buyRate")} value={`${formatRupees(deal.buy_rate)}/${deal.unit}`} />
        <InfoRow label={t("sellRate")} value={`${formatRupees(deal.sell_rate)}/${deal.unit}`} />
        <View style={styles.divider} />
        <InfoRow label={t("buyTotal")} value={formatRupees(deal.buy_total || deal.buy_rate * deal.quantity)} />
        <InfoRow label={t("sellTotal")} value={formatRupees(deal.sell_total || deal.sell_rate * deal.quantity)} />
        <View style={styles.divider} />
        <InfoRow label={t("grossMargin")} value={formatRupees(deal.gross_margin || (deal.sell_rate - deal.buy_rate) * deal.quantity)} color={(deal.gross_margin || 0) >= 0 ? Colors.green : Colors.red} />
        {(deal.transport_cost || 0) > 0 && <InfoRow label={t("transport")} value={formatRupees(deal.transport_cost)} />}
        {(deal.labour_cost || 0) > 0 && <InfoRow label={t("labour")} value={formatRupees(deal.labour_cost)} />}
        {(deal.other_cost || 0) > 0 && <InfoRow label={t("otherCost")} value={formatRupees(deal.other_cost)} />}
        <View style={styles.divider} />
        <InfoRow label={t("netProfit")} value={formatRupees(deal.net_profit)} color={deal.net_profit >= 0 ? Colors.green : Colors.red} bold />
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t("paymentStatus")}</Text>
        <InfoRow label={t("buyerPaid")} value={formatRupees(deal.buyer_paid || 0)} color={Colors.green} />
        <InfoRow label={t("buyerPending")} value={formatRupees(buyerPending)} color={buyerPending > 0 ? Colors.amber : Colors.green} />
        <View style={styles.divider} />
        <InfoRow label={t("farmerPaid")} value={formatRupees(deal.farmer_paid || 0)} color={Colors.green} />
        <InfoRow label={t("farmerPending")} value={formatRupees(farmerPending)} color={farmerPending > 0 ? Colors.amber : Colors.green} />
      </View>
      <PhotoAttachment entityType="deal" entityId={id!} />
      {deal.notes && <View style={styles.card}><Text style={styles.cardTitle}>{t("notes")}</Text><Text style={styles.notesText}>{deal.notes}</Text></View>}
      <View style={styles.actions}>
        {deal.status !== "completed" && deal.status !== "cancelled" && (
          <TouchableOpacity style={styles.editButton} onPress={() => router.push({ pathname: "/screens/deal/edit", params: { id: deal.id } })} activeOpacity={0.7}>
            <Ionicons name="create-outline" size={20} color={Colors.green} /><Text style={styles.completeText}>{t("editDeal")}</Text>
          </TouchableOpacity>
        )}
        {deal.status !== "completed" && (
          <TouchableOpacity style={styles.completeButton} onPress={markComplete} activeOpacity={0.7}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.green} /><Text style={styles.completeText}>{t("markComplete")}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.invoiceButton} onPress={() => router.push({ pathname: "/screens/deal/invoice", params: { dealId: deal.id } })} activeOpacity={0.7}>
          <Ionicons name="document-text" size={20} color={Colors.textWhite} /><Text style={styles.invoiceText}>{t("generateInvoice")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.biltyButton} onPress={() => router.push({ pathname: "/screens/deal/bilty", params: { dealId: deal.id } })} activeOpacity={0.7}>
          <Ionicons name="car" size={20} color={Colors.textWhite} /><Text style={styles.invoiceText}>{t("generateBilty")}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value, color, bold }: { label: string; value: string; color?: string; bold?: boolean }) {
  return (
    <View style={infoStyles.row}>
      <Text style={[infoStyles.label, bold && { fontWeight: "700" }]}>{label}</Text>
      <Text style={[bold ? infoStyles.valueBold : infoStyles.value, color ? { color } : {}]}>{value}</Text>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6 },
  label: { fontSize: Fonts.sm, color: Colors.textSecondary },
  value: { fontSize: Fonts.base, fontWeight: "600", color: Colors.text },
  valueBold: { fontSize: Fonts.lg, fontWeight: "800" },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.greenBg },
  content: { padding: 16, paddingBottom: 40 },
  statusRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  statusText: { fontSize: Fonts.xs, fontWeight: "700" },
  dateText: { fontSize: Fonts.sm, color: Colors.textSecondary },
  card: { backgroundColor: Colors.card, borderRadius: 16, padding: 20, marginBottom: 12, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  cardTitle: { fontSize: Fonts.base, fontWeight: "700", color: Colors.textSecondary, marginBottom: 10 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 8 },
  notesText: { fontSize: Fonts.base, color: Colors.text, lineHeight: 22 },
  actions: { gap: 10, marginTop: 8 },
  editButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: Colors.greenLight, borderRadius: 14, paddingVertical: 16, borderWidth: 1, borderColor: Colors.green },
  completeButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: Colors.greenLight, borderRadius: 14, paddingVertical: 16 },
  completeText: { fontSize: Fonts.base, fontWeight: "700", color: Colors.green },
  invoiceButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: Colors.green, borderRadius: 14, paddingVertical: 16 },
  biltyButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#d97706", borderRadius: 14, paddingVertical: 16 },
  invoiceText: { fontSize: Fonts.base, fontWeight: "700", color: Colors.textWhite },
});
