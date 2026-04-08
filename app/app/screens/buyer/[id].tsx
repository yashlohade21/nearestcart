import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import api from "../../../lib/api";
import { Colors, Fonts } from "../../../lib/colors";
import { formatRupees, formatDate } from "../../../components/formatters";
import LoadingScreen from "../../../components/LoadingScreen";
import PhotoAttachment from "../../../components/PhotoAttachment";

interface DealItem {
  id: string;
  deal_date: string;
  product_name: string | null;
  farmer_name: string | null;
  quantity: number;
  unit: string;
  sell_rate: number;
  sell_total: number;
  status: string;
}

interface PaymentItem {
  id: string;
  payment_date: string;
  amount: number;
  payment_mode: string;
  reference_no: string | null;
  notes: string | null;
}

interface BuyerDetail {
  id: string;
  name: string;
  contact_person: string | null;
  phone: string | null;
  company_type: string | null;
  city: string | null;
  state: string | null;
  gst_number: string | null;
  total_deals: number;
  total_volume_kg: number;
  total_business_amt: number;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  total_sell_amount: number;
  total_received_amount: number;
  outstanding_balance: number;
  deals: DealItem[];
  payments: PaymentItem[];
}

export default function BuyerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [buyer, setBuyer] = useState<BuyerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<"deals" | "payments">("deals");

  const fetchBuyer = async () => {
    try {
      const data = await api<BuyerDetail>(`/buyers/${id}`);
      setBuyer(data);
    } catch {
      Alert.alert("Error", "Failed to load buyer details");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBuyer();
  }, [id]);

  if (loading) return <LoadingScreen />;
  if (!buyer) return null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); fetchBuyer(); }}
          colors={[Colors.green]}
        />
      }
    >
      {/* Header Info */}
      <View style={styles.card}>
        <Text style={styles.name}>{buyer.name}</Text>
        {buyer.contact_person && <InfoRow label="Contact" value={buyer.contact_person} />}
        {buyer.phone && <InfoRow label="Phone" value={buyer.phone} />}
        {buyer.company_type && <InfoRow label="Type" value={buyer.company_type} />}
        {buyer.city && <InfoRow label="City" value={buyer.city} />}
        {buyer.state && <InfoRow label="State" value={buyer.state} />}
        {buyer.gst_number && <InfoRow label="GST" value={buyer.gst_number} />}
        <InfoRow label="Total Deals" value={String(buyer.total_deals)} />
        <InfoRow label="Total Volume" value={`${buyer.total_volume_kg} kg`} />
      </View>

      {/* Financial Summary */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Financial Summary</Text>
        <InfoRow label="Total Sold" value={formatRupees(buyer.total_sell_amount)} />
        <InfoRow label="Total Received" value={formatRupees(buyer.total_received_amount)} color={Colors.green} />
        <View style={styles.divider} />
        <InfoRow
          label="Outstanding"
          value={formatRupees(buyer.outstanding_balance)}
          color={buyer.outstanding_balance > 0 ? Colors.amber : Colors.green}
          bold
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, tab === "deals" && styles.tabActive]}
          onPress={() => setTab("deals")}
        >
          <Text style={[styles.tabText, tab === "deals" && styles.tabTextActive]}>
            Deals ({buyer.deals.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === "payments" && styles.tabActive]}
          onPress={() => setTab("payments")}
        >
          <Text style={[styles.tabText, tab === "payments" && styles.tabTextActive]}>
            Payments ({buyer.payments.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {tab === "deals" ? (
        buyer.deals.length === 0 ? (
          <Text style={styles.emptyText}>No deals yet</Text>
        ) : (
          buyer.deals.map((d) => (
            <TouchableOpacity
              key={d.id}
              style={styles.listCard}
              onPress={() => router.push({ pathname: "/screens/deal/[id]", params: { id: d.id } })}
            >
              <View style={styles.listRow}>
                <Text style={styles.listTitle}>{d.product_name || "Unknown"}</Text>
                <Text style={[styles.statusBadge, d.status === "completed" ? { color: Colors.green } : { color: Colors.amber }]}>
                  {d.status}
                </Text>
              </View>
              <View style={styles.listRow}>
                <Text style={styles.listSub}>{formatDate(d.deal_date)} · {d.farmer_name || "—"}</Text>
                <Text style={styles.listAmount}>{formatRupees(d.sell_total)}</Text>
              </View>
              <Text style={styles.listSub}>{d.quantity} {d.unit} @ {formatRupees(d.sell_rate)}</Text>
            </TouchableOpacity>
          ))
        )
      ) : (
        buyer.payments.length === 0 ? (
          <Text style={styles.emptyText}>No payments yet</Text>
        ) : (
          buyer.payments.map((p) => (
            <View key={p.id} style={styles.listCard}>
              <View style={styles.listRow}>
                <Text style={styles.listTitle}>{formatRupees(p.amount)}</Text>
                <Text style={styles.listSub}>{p.payment_mode}</Text>
              </View>
              <Text style={styles.listSub}>
                {formatDate(p.payment_date)}
                {p.reference_no ? ` · Ref: ${p.reference_no}` : ""}
              </Text>
              {p.notes && <Text style={styles.listSub}>{p.notes}</Text>}
            </View>
          ))
        )
      )}

      {/* Photos */}
      <PhotoAttachment entityType="buyer" entityId={id!} />

      {/* Notes */}
      {buyer.notes && (
        <View style={[styles.card, { marginTop: 12 }]}>
          <Text style={styles.cardTitle}>Notes</Text>
          <Text style={styles.notesText}>{buyer.notes}</Text>
        </View>
      )}
    </ScrollView>
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
  name: { fontSize: 22, fontWeight: "800", color: Colors.text, marginBottom: 8 },
  card: {
    backgroundColor: Colors.card, borderRadius: 16, padding: 20, marginBottom: 12,
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  cardTitle: { fontSize: Fonts.base, fontWeight: "700", color: Colors.textSecondary, marginBottom: 10 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 8 },
  notesText: { fontSize: Fonts.base, color: Colors.text, lineHeight: 22 },
  tabRow: { flexDirection: "row", marginBottom: 12, gap: 8 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.card, alignItems: "center" },
  tabActive: { backgroundColor: Colors.green },
  tabText: { fontSize: Fonts.sm, fontWeight: "600", color: Colors.textSecondary },
  tabTextActive: { color: Colors.textWhite },
  emptyText: { textAlign: "center", color: Colors.textSecondary, paddingVertical: 24, fontSize: Fonts.sm },
  listCard: {
    backgroundColor: Colors.card, borderRadius: 12, padding: 14, marginBottom: 8,
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  listRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  listTitle: { fontSize: Fonts.base, fontWeight: "700", color: Colors.text },
  listSub: { fontSize: Fonts.xs, color: Colors.textSecondary },
  listAmount: { fontSize: Fonts.base, fontWeight: "700", color: Colors.text },
  statusBadge: { fontSize: Fonts.xs, fontWeight: "700" },
});
