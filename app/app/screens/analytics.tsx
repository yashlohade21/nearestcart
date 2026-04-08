import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../../lib/api";
import { Colors, Fonts } from "../../lib/colors";
import { formatRupees } from "../../components/formatters";

type Tab = "farmers" | "buyers" | "transporters";

interface FarmerPerf {
  farmer_id: string; farmer_name: string; total_deals: number;
  total_quantity_kg: number; total_business: number;
  avg_spoilage_pct: number; dispute_pct: number; outstanding_advance: number;
}
interface BuyerPerf {
  buyer_id: string; buyer_name: string; total_deals: number;
  total_quantity_kg: number; total_business: number;
  total_profit_from_buyer: number; dispute_pct: number;
}
interface TransporterPerf {
  transporter_id: string; transporter_name: string; vehicle_type: string | null;
  total_trips: number; avg_trip_cost: number;
  avg_spoilage_pct: number; total_transport_spend: number;
}

const fmt = formatRupees;

export default function AnalyticsScreen() {
  const [tab, setTab] = useState<Tab>("farmers");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api<any[]>(`/analytics/${tab}`)
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [tab]);

  const renderFarmer = ({ item }: { item: FarmerPerf }) => (
    <View style={styles.card}>
      <Text style={styles.cardName}>{item.farmer_name}</Text>
      <View style={styles.statsRow}>
        <Stat label="Deals" value={String(item.total_deals)} />
        <Stat label="Business" value={fmt(item.total_business)} color={Colors.green} />
        <Stat label="Spoilage" value={item.avg_spoilage_pct.toFixed(1) + "%"} color={item.avg_spoilage_pct > 5 ? Colors.red : Colors.green} />
      </View>
      <View style={styles.statsRow}>
        <Stat label="Volume" value={item.total_quantity_kg.toLocaleString("en-IN") + " kg"} />
        <Stat label="Disputes" value={item.dispute_pct.toFixed(1) + "%"} color={item.dispute_pct > 10 ? Colors.red : Colors.green} />
        {item.outstanding_advance > 0 && <Stat label="Advance Due" value={fmt(item.outstanding_advance)} color={Colors.amber} />}
      </View>
    </View>
  );

  const renderBuyer = ({ item }: { item: BuyerPerf }) => (
    <View style={styles.card}>
      <Text style={styles.cardName}>{item.buyer_name}</Text>
      <View style={styles.statsRow}>
        <Stat label="Deals" value={String(item.total_deals)} />
        <Stat label="Business" value={fmt(item.total_business)} color={Colors.green} />
        <Stat label="Profit" value={fmt(item.total_profit_from_buyer)} color={Colors.green} />
      </View>
      <View style={styles.statsRow}>
        <Stat label="Volume" value={item.total_quantity_kg.toLocaleString("en-IN") + " kg"} />
        <Stat label="Disputes" value={item.dispute_pct.toFixed(1) + "%"} color={item.dispute_pct > 10 ? Colors.red : Colors.green} />
      </View>
    </View>
  );

  const renderTransporter = ({ item }: { item: TransporterPerf }) => (
    <View style={styles.card}>
      <Text style={styles.cardName}>{item.transporter_name}</Text>
      {item.vehicle_type && <Text style={styles.cardSub}>{item.vehicle_type}</Text>}
      <View style={styles.statsRow}>
        <Stat label="Trips" value={String(item.total_trips)} />
        <Stat label="Avg Cost" value={fmt(item.avg_trip_cost)} />
        <Stat label="Total Spend" value={fmt(item.total_transport_spend)} color={Colors.red} />
      </View>
      <View style={styles.statsRow}>
        <Stat label="Spoilage" value={item.avg_spoilage_pct.toFixed(1) + "%"} color={item.avg_spoilage_pct > 5 ? Colors.red : Colors.green} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {(["farmers", "buyers", "transporters"] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={Colors.green} /></View>
      ) : (
        <FlatList
          data={data as any[]}
          keyExtractor={(item: any) => item.farmer_id || item.buyer_id || item.transporter_id}
          renderItem={tab === "farmers" ? renderFarmer as any : tab === "buyers" ? renderBuyer as any : renderTransporter as any}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="analytics-outline" size={40} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No data yet</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, color ? { color } : null]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.greenBg },
  tabBar: { flexDirection: "row", margin: 16, marginBottom: 8, backgroundColor: Colors.border, borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  tabActive: { backgroundColor: Colors.green },
  tabText: { fontSize: Fonts.sm, fontWeight: "600", color: Colors.textSecondary },
  tabTextActive: { color: Colors.textWhite },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  card: { backgroundColor: Colors.card, borderRadius: 14, padding: 16, marginBottom: 10, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  cardName: { fontSize: Fonts.base, fontWeight: "700", color: Colors.text, marginBottom: 4 },
  cardSub: { fontSize: Fonts.xs, color: Colors.textMuted, marginBottom: 8 },
  statsRow: { flexDirection: "row", marginTop: 8, gap: 16, flexWrap: "wrap" },
  stat: {},
  statLabel: { fontSize: Fonts.xs, color: Colors.textMuted },
  statValue: { fontSize: Fonts.sm, fontWeight: "700", color: Colors.text, marginTop: 2 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 40 },
  emptyText: { fontSize: Fonts.base, color: Colors.textMuted, marginTop: 12 },
});
