import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Fonts } from "../../lib/colors";
import { useT } from "../../lib/i18n";
import api from "../../lib/api";

interface OutstandingParty {
  party_id: string;
  party_name: string;
  party_phone: string | null;
  total_outstanding: number;
  current: number;
  days_30_60: number;
  days_60_90: number;
  days_90_plus: number;
}

interface OutstandingBuckets {
  current: number;
  days_30_60: number;
  days_60_90: number;
  days_90_plus: number;
}

interface OutstandingData {
  type: string;
  total: number;
  buckets: OutstandingBuckets;
  parties: OutstandingParty[];
}

export default function OutstandingScreen() {
  const t = useT();
  const [tab, setTab] = useState<"receivable" | "payable">("receivable");
  const [data, setData] = useState<OutstandingData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const d = await api<OutstandingData>(`/reports/outstanding?type=${tab}`);
      setData(d);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [tab]);

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  const isReceivable = tab === "receivable";
  const accentColor = isReceivable ? Colors.green : Colors.red;

  const renderParty = ({ item }: { item: OutstandingParty }) => (
    <View style={styles.partyCard}>
      <View style={styles.partyHeader}>
        <Text style={styles.partyName}>{item.party_name}</Text>
        <Text style={[styles.partyTotal, { color: accentColor }]}>
          {fmt(item.total_outstanding)}
        </Text>
      </View>

      {/* Aging bar */}
      {item.total_outstanding > 0 && (
        <View style={styles.agingBar}>
          {item.current > 0 && (
            <View style={[styles.agingSegment, { flex: item.current, backgroundColor: "#22c55e" }]} />
          )}
          {item.days_30_60 > 0 && (
            <View style={[styles.agingSegment, { flex: item.days_30_60, backgroundColor: "#f59e0b" }]} />
          )}
          {item.days_60_90 > 0 && (
            <View style={[styles.agingSegment, { flex: item.days_60_90, backgroundColor: "#f97316" }]} />
          )}
          {item.days_90_plus > 0 && (
            <View style={[styles.agingSegment, { flex: item.days_90_plus, backgroundColor: "#ef4444" }]} />
          )}
        </View>
      )}

      <View style={styles.bucketRow}>
        <BucketPill label={t("current")} value={fmt(item.current)} color="#22c55e" />
        <BucketPill label={t("days30_60")} value={fmt(item.days_30_60)} color="#f59e0b" />
        <BucketPill label={t("days60_90")} value={fmt(item.days_60_90)} color="#f97316" />
        <BucketPill label={t("days90Plus")} value={fmt(item.days_90_plus)} color="#ef4444" />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.greenBg }} edges={["bottom"]}>
    <View style={styles.container}>
      {/* Tab Toggle */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggle, isReceivable && { backgroundColor: Colors.green }]}
          onPress={() => setTab("receivable")}
        >
          <Text style={[styles.toggleText, isReceivable && { color: Colors.textWhite }]}>
            {t("receivable")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggle, !isReceivable && { backgroundColor: Colors.red }]}
          onPress={() => setTab("payable")}
        >
          <Text style={[styles.toggleText, !isReceivable && { color: Colors.textWhite }]}>
            {t("payable")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Total + Aging Summary */}
      {data && (
        <View style={styles.summaryCard}>
          <Text style={styles.totalLabel}>Total {isReceivable ? "Receivable" : "Payable"}</Text>
          <Text style={[styles.totalValue, { color: accentColor }]}>{fmt(data.total)}</Text>

          <View style={styles.agingBar}>
            {data.buckets.current > 0 && (
              <View style={[styles.agingSegment, { flex: data.buckets.current, backgroundColor: "#22c55e" }]} />
            )}
            {data.buckets.days_30_60 > 0 && (
              <View style={[styles.agingSegment, { flex: data.buckets.days_30_60, backgroundColor: "#f59e0b" }]} />
            )}
            {data.buckets.days_60_90 > 0 && (
              <View style={[styles.agingSegment, { flex: data.buckets.days_60_90, backgroundColor: "#f97316" }]} />
            )}
            {data.buckets.days_90_plus > 0 && (
              <View style={[styles.agingSegment, { flex: data.buckets.days_90_plus, backgroundColor: "#ef4444" }]} />
            )}
          </View>

          <View style={styles.bucketRow}>
            <BucketPill label={t("current")} value={fmt(data.buckets.current)} color="#22c55e" />
            <BucketPill label={t("days30_60")} value={fmt(data.buckets.days_30_60)} color="#f59e0b" />
            <BucketPill label={t("days60_90")} value={fmt(data.buckets.days_60_90)} color="#f97316" />
            <BucketPill label={t("days90Plus")} value={fmt(data.buckets.days_90_plus)} color="#ef4444" />
          </View>
        </View>
      )}

      {/* Party List */}
      <FlatList
        data={data?.parties || []}
        renderItem={renderParty}
        keyExtractor={(item) => item.party_id}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchData} colors={[Colors.green]} />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Ionicons name="checkmark-circle-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyText}>{t("noOutstanding")}</Text>
            </View>
          ) : null
        }
      />
    </View>
    </SafeAreaView>
  );
}

function BucketPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={bucketStyles.pill}>
      <View style={[bucketStyles.dot, { backgroundColor: color }]} />
      <View>
        <Text style={bucketStyles.label}>{label}</Text>
        <Text style={bucketStyles.value}>{value}</Text>
      </View>
    </View>
  );
}

const bucketStyles = StyleSheet.create({
  pill: { flexDirection: "row", alignItems: "center", gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  label: { fontSize: 11, color: Colors.textMuted },
  value: { fontSize: Fonts.xs, fontWeight: "600", color: Colors.text },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.greenBg },
  toggleRow: {
    flexDirection: "row",
    margin: 16,
    marginBottom: 0,
    backgroundColor: Colors.card,
    borderRadius: 12,
    overflow: "hidden",
  },
  toggle: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  toggleText: {
    fontSize: Fonts.sm,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  summaryCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    margin: 16,
    marginBottom: 8,
  },
  totalLabel: { fontSize: Fonts.sm, color: Colors.textMuted, marginBottom: 4 },
  totalValue: { fontSize: Fonts["2xl"], fontWeight: "800", marginBottom: 12 },
  agingBar: {
    flexDirection: "row",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: Colors.border,
    marginBottom: 10,
  },
  agingSegment: {
    height: 8,
  },
  bucketRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  partyCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  partyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  partyName: { fontSize: Fonts.base, fontWeight: "600", color: Colors.text },
  partyTotal: { fontSize: Fonts.lg, fontWeight: "700" },
  empty: { alignItems: "center", marginTop: 60 },
  emptyText: { fontSize: Fonts.base, color: Colors.textMuted, marginTop: 12 },
});
