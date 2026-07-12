import { useState } from "react";
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

interface GstProduct {
  product_id: string;
  product_name: string;
  hsn_code: string | null;
  quantity: number;
  unit: string;
  purchase_value: number;
  sale_value: number;
  margin: number;
}

interface GstData {
  period_start: string;
  period_end: string;
  total_sales: number;
  total_purchases: number;
  gross_profit: number;
  deals_count: number;
  by_product: GstProduct[];
}

export default function GstReportScreen() {
  const t = useT();

  // Default to current month
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const [dateFrom, setDateFrom] = useState(firstDay);
  const [dateTo, setDateTo] = useState(lastDay);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [data, setData] = useState<GstData | null>(null);
  const [loading, setLoading] = useState(false);

  const fmtDate = (d: Date) => d.toISOString().split("T")[0];
  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  const fetchData = async () => {
    setLoading(true);
    try {
      const d = await api<GstData>(
        `/reports/gst?date_from=${fmtDate(dateFrom)}&date_to=${fmtDate(dateTo)}`
      );
      setData(d);
    } catch {}
    setLoading(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.greenBg }} edges={["bottom"]}>
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={fetchData} colors={[Colors.green]} />
      }
    >
      {/* Date Range */}
      <View style={styles.dateRow}>
        <TouchableOpacity style={styles.dateBtn} onPress={() => setShowFromPicker(true)}>
          <Ionicons name="calendar-outline" size={18} color={Colors.green} />
          <Text style={styles.dateText}>{fmtDate(dateFrom)}</Text>
        </TouchableOpacity>
        <Text style={styles.dateSep}>to</Text>
        <TouchableOpacity style={styles.dateBtn} onPress={() => setShowToPicker(true)}>
          <Ionicons name="calendar-outline" size={18} color={Colors.green} />
          <Text style={styles.dateText}>{fmtDate(dateTo)}</Text>
        </TouchableOpacity>
      </View>

      {showFromPicker && (
        <DateTimePicker
          value={dateFrom}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, d) => {
            setShowFromPicker(false);
            if (d) setDateFrom(d);
          }}
        />
      )}
      {showToPicker && (
        <DateTimePicker
          value={dateTo}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, d) => {
            setShowToPicker(false);
            if (d) setDateTo(d);
          }}
        />
      )}

      <TouchableOpacity style={styles.generateBtn} onPress={fetchData} activeOpacity={0.7}>
        <Ionicons name="document-text-outline" size={20} color={Colors.textWhite} />
        <Text style={styles.generateText}>{t("generateReport")}</Text>
      </TouchableOpacity>

      {/* Summary */}
      {data && (
        <>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <SummaryItem label={t("totalPurchases")} value={fmt(data.total_purchases)} />
              <SummaryItem label={t("totalSales")} value={fmt(data.total_sales)} />
            </View>
            <View style={styles.summaryRow}>
              <SummaryItem label={t("grossProfit")} value={fmt(data.gross_profit)} color={data.gross_profit >= 0 ? Colors.green : Colors.red} />
              <SummaryItem label={t("dealsCount")} value={String(data.deals_count)} />
            </View>
          </View>

          {/* Product Table */}
          <Text style={styles.sectionHeader}>Product-wise Breakdown</Text>

          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.thCell, { flex: 2 }]}>Product</Text>
            <Text style={styles.thCell}>{t("hsnCode")}</Text>
            <Text style={styles.thCell}>Qty</Text>
            <Text style={styles.thCell}>Purchase</Text>
            <Text style={styles.thCell}>Sale</Text>
            <Text style={styles.thCell}>{t("margin")}</Text>
          </View>

          {data.by_product.length > 0 ? (
            data.by_product.map((p) => (
              <View key={p.product_id} style={styles.tableRow}>
                <Text style={[styles.tdCell, { flex: 2, fontWeight: "600" }]}>{p.product_name}</Text>
                <Text style={styles.tdCell}>{p.hsn_code || "-"}</Text>
                <Text style={styles.tdCell}>{p.quantity} {p.unit}</Text>
                <Text style={styles.tdCell}>{fmt(p.purchase_value)}</Text>
                <Text style={styles.tdCell}>{fmt(p.sale_value)}</Text>
                <Text style={[styles.tdCell, { color: p.margin >= 0 ? Colors.green : Colors.red, fontWeight: "600" }]}>
                  {fmt(p.margin)}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>{t("noGstData")}</Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
    </SafeAreaView>
  );
}

function SummaryItem({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={{ flex: 1, marginBottom: 8 }}>
      <Text style={{ fontSize: Fonts.xs, color: Colors.textMuted, marginBottom: 2 }}>{label}</Text>
      <Text style={{ fontSize: Fonts.lg, fontWeight: "700", color: color || Colors.text }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.greenBg },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    marginBottom: 8,
    gap: 8,
  },
  dateBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.card,
    padding: 12,
    borderRadius: 10,
  },
  dateText: { fontSize: Fonts.sm, fontWeight: "600", color: Colors.text },
  dateSep: { fontSize: Fonts.sm, color: Colors.textMuted },
  generateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.green,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  generateText: { color: Colors.textWhite, fontSize: Fonts.base, fontWeight: "700" },
  summaryCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  summaryRow: { flexDirection: "row", marginBottom: 4 },
  sectionHeader: {
    fontSize: Fonts.base,
    fontWeight: "700",
    color: Colors.textSecondary,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: Colors.greenLight,
    marginHorizontal: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  thCell: { flex: 1, fontSize: 11, fontWeight: "700", color: Colors.textSecondary },
  tableRow: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tdCell: { flex: 1, fontSize: 12, color: Colors.text },
  empty: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 24,
    marginHorizontal: 16,
    alignItems: "center",
  },
  emptyText: { fontSize: Fonts.sm, color: Colors.textMuted },
});
