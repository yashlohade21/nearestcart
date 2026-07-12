import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Fonts } from "../../lib/colors";
import { useT } from "../../lib/i18n";
import api from "../../lib/api";

interface StockItem {
  product_id: string;
  product_name: string;
  unit: string;
  hsn_code: string | null;
  total_purchased_qty: number;
  total_sold_qty: number;
  total_spoilage: number;
  net_stock: number;
  purchase_value: number;
  sale_value: number;
  margin: number;
}

interface StockData {
  items: StockItem[];
  total_purchase_value: number;
  total_sale_value: number;
  total_margin: number;
}

export default function StockRegisterScreen() {
  const t = useT();
  const [data, setData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const d = await api<StockData>("/reports/stock");
      setData(d);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  const renderItem = ({ item }: { item: StockItem }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.productName}>{item.product_name}</Text>
        {item.hsn_code && (
          <Text style={styles.hsn}>HSN: {item.hsn_code}</Text>
        )}
      </View>

      <View style={styles.qtyRow}>
        <View style={styles.qtyItem}>
          <Text style={styles.qtyLabel}>{t("purchased")}</Text>
          <Text style={styles.qtyValue}>{item.total_purchased_qty} {item.unit}</Text>
        </View>
        <View style={styles.qtyItem}>
          <Text style={styles.qtyLabel}>{t("sold")}</Text>
          <Text style={styles.qtyValue}>{item.total_sold_qty} {item.unit}</Text>
        </View>
        <View style={styles.qtyItem}>
          <Text style={styles.qtyLabel}>{t("spoilage")}</Text>
          <Text style={[styles.qtyValue, item.total_spoilage > 0 && { color: Colors.red }]}>
            {item.total_spoilage} {item.unit}
          </Text>
        </View>
        <View style={styles.qtyItem}>
          <Text style={styles.qtyLabel}>{t("netStock")}</Text>
          <Text style={[styles.qtyValue, { fontWeight: "800" }]}>{item.net_stock} {item.unit}</Text>
        </View>
      </View>

      <View style={styles.valueRow}>
        <View style={styles.valueItem}>
          <Text style={styles.valueLabel}>{t("purchaseValue")}</Text>
          <Text style={styles.valueAmt}>{fmt(item.purchase_value)}</Text>
        </View>
        <View style={styles.valueItem}>
          <Text style={styles.valueLabel}>{t("saleValue")}</Text>
          <Text style={styles.valueAmt}>{fmt(item.sale_value)}</Text>
        </View>
        <View style={styles.valueItem}>
          <Text style={styles.valueLabel}>{t("margin")}</Text>
          <Text style={[styles.valueAmt, { color: item.margin >= 0 ? Colors.green : Colors.red }]}>
            {fmt(item.margin)}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.greenBg }} edges={["bottom"]}>
    <View style={styles.container}>
      {/* Totals Summary */}
      {data && (
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>{t("purchaseValue")}</Text>
              <Text style={styles.summaryValue}>{fmt(data.total_purchase_value)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>{t("saleValue")}</Text>
              <Text style={styles.summaryValue}>{fmt(data.total_sale_value)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>{t("margin")}</Text>
              <Text style={[styles.summaryValue, { color: data.total_margin >= 0 ? Colors.green : Colors.red }]}>
                {fmt(data.total_margin)}
              </Text>
            </View>
          </View>
        </View>
      )}

      <FlatList
        data={data?.items || []}
        renderItem={renderItem}
        keyExtractor={(item) => item.product_id}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetch} colors={[Colors.green]} />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Ionicons name="cube-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyText}>{t("noStockData")}</Text>
            </View>
          ) : null
        }
      />
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.greenBg },
  summaryCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    margin: 16,
    marginBottom: 8,
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryItem: { alignItems: "center" },
  summaryLabel: { fontSize: Fonts.xs, color: Colors.textMuted, marginBottom: 4 },
  summaryValue: { fontSize: Fonts.lg, fontWeight: "700", color: Colors.text },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  productName: { fontSize: Fonts.lg, fontWeight: "700", color: Colors.text },
  hsn: { fontSize: Fonts.xs, color: Colors.textMuted, backgroundColor: Colors.greenBg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  qtyRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  qtyItem: { alignItems: "center" },
  qtyLabel: { fontSize: Fonts.xs, color: Colors.textMuted, marginBottom: 2 },
  qtyValue: { fontSize: Fonts.sm, fontWeight: "600", color: Colors.text },
  valueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  valueItem: { alignItems: "center" },
  valueLabel: { fontSize: Fonts.xs, color: Colors.textMuted, marginBottom: 2 },
  valueAmt: { fontSize: Fonts.sm, fontWeight: "700", color: Colors.text },
  empty: { alignItems: "center", marginTop: 60 },
  emptyText: { fontSize: Fonts.base, color: Colors.textMuted, marginTop: 12 },
});
