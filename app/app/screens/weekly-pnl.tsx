import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Ionicons } from "@expo/vector-icons";
import api, { getApiHost } from "../../lib/api";
import { Colors, Fonts } from "../../lib/colors";
import { formatRupees } from "../../components/formatters";
import LoadingScreen from "../../components/LoadingScreen";
import * as SecureStore from "expo-secure-store";

interface WeeklyData {
  week_start: string;
  week_end: string;
  total_deals: number;
  total_bought: number;
  total_sold: number;
  gross_margin: number;
  total_costs: number;
  net_profit: number;
  total_spoilage_qty: number;
  avg_spoilage_pct: number;
}

function InfoRow({
  label,
  value,
  color,
  bold,
}: {
  label: string;
  value: string;
  color?: string;
  bold?: boolean;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, bold && { fontWeight: "700" }]}>
        {label}
      </Text>
      <Text
        style={[
          bold ? styles.infoValueBold : styles.infoValue,
          color ? { color } : {},
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

export default function WeeklyPnLScreen() {
  const [data, setData] = useState<WeeklyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const result = await api<WeeklyData>("/dashboard/weekly");
      setData(result);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <LoadingScreen />;
  if (!data) return null;

  const profitColor = data.net_profit >= 0 ? Colors.green : Colors.red;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchData();
          }}
          colors={[Colors.green]}
        />
      }
    >
      {/* Date Range */}
      <Text style={styles.dateRange}>
        {data.week_start} — {data.week_end}
      </Text>

      {/* Hero: Net Profit */}
      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>Net Profit</Text>
        <Text style={[styles.heroValue, { color: profitColor }]}>
          {formatRupees(data.net_profit)}
        </Text>
        <Text style={styles.heroSub}>
          {data.total_deals} deal{data.total_deals !== 1 ? "s" : ""} this week
        </Text>
      </View>

      {/* Volume */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="swap-vertical" size={18} color={Colors.green} />
          <Text style={styles.cardTitle}>Volume</Text>
        </View>
        <InfoRow label="Total Bought" value={formatRupees(data.total_bought)} />
        <InfoRow label="Total Sold" value={formatRupees(data.total_sold)} />
      </View>

      {/* Margin Breakdown */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="trending-up" size={18} color={Colors.green} />
          <Text style={styles.cardTitle}>Margin Breakdown</Text>
        </View>
        <InfoRow
          label="Gross Margin"
          value={formatRupees(data.gross_margin)}
          color={data.gross_margin >= 0 ? Colors.green : Colors.red}
        />
        <InfoRow label="Total Costs" value={formatRupees(data.total_costs)} />
        <View style={styles.divider} />
        <InfoRow
          label="Net Profit"
          value={formatRupees(data.net_profit)}
          color={profitColor}
          bold
        />
      </View>

      {/* Export Button */}
      <TouchableOpacity
        style={styles.exportButton}
        onPress={async () => {
          try {
            let token: string | null = null;
            try { token = await SecureStore.getItemAsync("token"); } catch {}
            const BASE_URL = `http://${getApiHost()}:8000/api`;
            const fileUri = FileSystem.cacheDirectory + `pnl_${data.week_start}.pdf`;
            const res = await FileSystem.downloadAsync(
              `${BASE_URL}/export/pnl/pdf?date_from=${data.week_start}&date_to=${data.week_end}`,
              fileUri,
              { headers: token ? { Authorization: `Bearer ${token}` } : {} }
            );
            if (res.status === 200 && await Sharing.isAvailableAsync()) {
              await Sharing.shareAsync(res.uri, { mimeType: "application/pdf" });
            } else {
              Alert.alert("Error", "Sharing not available");
            }
          } catch {
            Alert.alert("Error", "Failed to export PDF");
          }
        }}
        activeOpacity={0.7}
      >
        <Ionicons name="download-outline" size={18} color={Colors.textWhite} />
        <Text style={styles.exportText}>Export PDF</Text>
      </TouchableOpacity>

      {/* Spoilage (conditional) */}
      {data.total_spoilage_qty > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="warning" size={18} color={Colors.amber} />
            <Text style={styles.cardTitle}>Spoilage</Text>
          </View>
          <InfoRow
            label="Total Spoilage"
            value={`${data.total_spoilage_qty} kg`}
            color={Colors.red}
          />
          <InfoRow
            label="Avg Spoilage %"
            value={`${data.avg_spoilage_pct.toFixed(1)}%`}
            color={Colors.amber}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.greenBg,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  dateRange: {
    fontSize: Fonts.sm,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 16,
  },
  heroCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  heroLabel: {
    fontSize: Fonts.sm,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  heroValue: {
    fontSize: Fonts["4xl"],
    fontWeight: "800",
  },
  heroSub: {
    fontSize: Fonts.sm,
    color: Colors.textMuted,
    marginTop: 6,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: Fonts.base,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: Fonts.sm,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: Fonts.base,
    fontWeight: "600",
    color: Colors.text,
  },
  infoValueBold: {
    fontSize: Fonts.lg,
    fontWeight: "800",
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.green,
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 12,
  },
  exportText: {
    fontSize: Fonts.base,
    fontWeight: "700",
    color: Colors.textWhite,
  },
});
