import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Fonts } from "../../lib/colors";
import { useT } from "../../lib/i18n";
import api from "../../lib/api";

interface DayBookDeal {
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
  net_profit: number;
}

interface DayBookPayment {
  id: string;
  direction: string;
  party_name: string | null;
  amount: number;
  payment_mode: string | null;
}

interface DayBookSummary {
  total_purchases: number;
  total_sales: number;
  total_receipts: number;
  total_payments_out: number;
  net_cash_flow: number;
}

interface DayBookData {
  date: string;
  deals: DayBookDeal[];
  payments: DayBookPayment[];
  summary: DayBookSummary;
}

export default function DayBookScreen() {
  const t = useT();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [data, setData] = useState<DayBookData | null>(null);
  const [loading, setLoading] = useState(true);

  const dateStr = selectedDate.toISOString().split("T")[0];

  const fetchData = async () => {
    setLoading(true);
    try {
      const d = await api<DayBookData>(`/reports/daybook?date=${dateStr}`);
      setData(d);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [dateStr]);

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.greenBg }} edges={["bottom"]}>
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={fetchData} colors={[Colors.green]} />
      }
    >
      {/* Date Picker */}
      <TouchableOpacity style={styles.dateBtn} onPress={() => setShowPicker(true)}>
        <Ionicons name="calendar-outline" size={20} color={Colors.green} />
        <Text style={styles.dateText}>{dateStr}</Text>
        <Ionicons name="chevron-down" size={16} color={Colors.textMuted} />
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, d) => {
            setShowPicker(false);
            if (d) setSelectedDate(d);
          }}
        />
      )}

      {/* Summary Card */}
      {data && (
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.summaryGrid}>
            <SummaryItem label={t("totalPurchases")} value={fmt(data.summary.total_purchases)} color={Colors.red} />
            <SummaryItem label={t("totalSales")} value={fmt(data.summary.total_sales)} color={Colors.green} />
            <SummaryItem label={t("totalReceipts")} value={fmt(data.summary.total_receipts)} color={Colors.green} />
            <SummaryItem label={t("totalPaymentsOut")} value={fmt(data.summary.total_payments_out)} color={Colors.red} />
          </View>
          <View style={styles.netRow}>
            <Text style={styles.netLabel}>{t("netCashFlow")}</Text>
            <Text style={[styles.netValue, { color: data.summary.net_cash_flow >= 0 ? Colors.green : Colors.red }]}>
              {fmt(data.summary.net_cash_flow)}
            </Text>
          </View>
        </View>
      )}

      {/* Deals Section */}
      <Text style={styles.sectionHeader}>{t("todaysDeals")} ({data?.deals.length || 0})</Text>
      {data?.deals.length ? (
        data.deals.map((d) => (
          <View key={d.id} style={styles.itemCard}>
            <View style={styles.itemRow}>
              <Text style={styles.itemTitle}>{d.product_name}</Text>
              <Text style={[styles.itemProfit, { color: d.net_profit >= 0 ? Colors.green : Colors.red }]}>
                {fmt(d.net_profit)}
              </Text>
            </View>
            <Text style={styles.itemSub}>
              {d.farmer_name} → {d.buyer_name} | {d.quantity} {d.unit}
            </Text>
            <View style={styles.itemRow}>
              <Text style={styles.itemDetail}>Buy: {fmt(d.buy_total)}</Text>
              <Text style={styles.itemDetail}>Sell: {fmt(d.sell_total)}</Text>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>{t("noDealsToday")}</Text>
        </View>
      )}

      {/* Payments Section */}
      <Text style={styles.sectionHeader}>{t("todaysPayments")} ({data?.payments.length || 0})</Text>
      {data?.payments.length ? (
        data.payments.map((p) => (
          <View key={p.id} style={styles.itemCard}>
            <View style={styles.itemRow}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons
                  name={p.direction === "incoming" ? "arrow-down-circle" : "arrow-up-circle"}
                  size={20}
                  color={p.direction === "incoming" ? Colors.green : Colors.red}
                />
                <Text style={styles.itemTitle}>{p.party_name || "Unknown"}</Text>
              </View>
              <Text style={[styles.itemProfit, { color: p.direction === "incoming" ? Colors.green : Colors.red }]}>
                {p.direction === "incoming" ? "+" : "-"}{fmt(p.amount)}
              </Text>
            </View>
            {p.payment_mode && <Text style={styles.itemSub}>{p.payment_mode}</Text>}
          </View>
        ))
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>{t("noPaymentsToday")}</Text>
        </View>
      )}
    </ScrollView>
    </SafeAreaView>
  );
}

function SummaryItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={summaryStyles.item}>
      <Text style={summaryStyles.label}>{label}</Text>
      <Text style={[summaryStyles.value, { color }]}>{value}</Text>
    </View>
  );
}

const summaryStyles = StyleSheet.create({
  item: { width: "48%", marginBottom: 12 },
  label: { fontSize: Fonts.xs, color: Colors.textMuted, marginBottom: 2 },
  value: { fontSize: Fonts.lg, fontWeight: "700" },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.greenBg },
  dateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.card,
    margin: 16,
    marginBottom: 8,
    padding: 14,
    borderRadius: 12,
  },
  dateText: { flex: 1, fontSize: Fonts.base, fontWeight: "600", color: Colors.text },
  summaryCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: Fonts.lg, fontWeight: "700", color: Colors.text, marginBottom: 12 },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  netRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  netLabel: { fontSize: Fonts.base, fontWeight: "700", color: Colors.text },
  netValue: { fontSize: Fonts.xl, fontWeight: "800" },
  sectionHeader: {
    fontSize: Fonts.base,
    fontWeight: "700",
    color: Colors.textSecondary,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  itemCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  itemRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  itemTitle: { fontSize: Fonts.base, fontWeight: "600", color: Colors.text },
  itemProfit: { fontSize: Fonts.base, fontWeight: "700" },
  itemSub: { fontSize: Fonts.sm, color: Colors.textMuted, marginTop: 4 },
  itemDetail: { fontSize: Fonts.sm, color: Colors.textSecondary, marginTop: 4 },
  empty: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 24,
    marginHorizontal: 16,
    marginBottom: 8,
    alignItems: "center",
  },
  emptyText: { fontSize: Fonts.sm, color: Colors.textMuted },
});
