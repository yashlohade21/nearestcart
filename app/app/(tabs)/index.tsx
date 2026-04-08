import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import api from "../../lib/api";
import { offlineGet } from "../../lib/offline-api";
import { Colors, Fonts } from "../../lib/colors";
import { formatRupees } from "../../components/formatters";
import LoadingScreen from "../../components/LoadingScreen";
import EmptyState from "../../components/EmptyState";
import DealCard, { DealCardData } from "../../components/DealCard";

interface DashboardOverview {
  today_deals: number;
  today_buy_total: number;
  today_sell_total: number;
  today_net_profit: number;
  pending_from_buyers: number;
  pending_to_farmers: number;
  net_position: number;
  active_advances: number;
}

export default function HomeScreen() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [deals, setDeals] = useState<DealCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [overviewData, dealsData] = await Promise.all([
        api<DashboardOverview>("/dashboard/overview").catch(() => null),
        offlineGet<DealCardData[]>("/deals?limit=5"),
      ]);
      setOverview(overviewData);
      setDeals(dealsData);
    } catch {
      // silently fail, user can pull to refresh
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) return <LoadingScreen />;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[Colors.green]}
          tintColor={Colors.green}
        />
      }
    >
      {/* Today's Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.cardTitle}>Today's Summary</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {overview?.today_deals ?? 0}
            </Text>
            <Text style={styles.summaryLabel}>Deals</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: Colors.green }]}>
              {formatRupees(overview?.today_net_profit ?? 0)}
            </Text>
            <Text style={styles.summaryLabel}>Net Profit</Text>
          </View>
        </View>
      </View>

      {/* Receivable / Payable */}
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.miniCard, styles.greenCard]}
          onPress={() => router.push("/(tabs)/payments")}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-down-circle" size={24} color={Colors.green} />
          <Text style={styles.miniCardTitle}>Receivable</Text>
          <Text style={[styles.miniCardValue, { color: Colors.green }]}>
            {formatRupees(overview?.pending_from_buyers ?? 0)}
          </Text>
          <Text style={styles.miniCardSub}>From Buyers</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.miniCard, styles.redCard]}
          onPress={() => router.push("/(tabs)/payments")}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-up-circle" size={24} color={Colors.red} />
          <Text style={styles.miniCardTitle}>Payable</Text>
          <Text style={[styles.miniCardValue, { color: Colors.red }]}>
            {formatRupees(overview?.pending_to_farmers ?? 0)}
          </Text>
          <Text style={styles.miniCardSub}>To Farmers</Text>
        </TouchableOpacity>
      </View>

      {/* Net Position */}
      <View style={styles.netCard}>
        <Text style={styles.cardTitle}>Net Position</Text>
        <Text
          style={[
            styles.netValue,
            {
              color:
                (overview?.net_position ?? 0) >= 0 ? Colors.green : Colors.red,
            },
          ]}
        >
          {(overview?.net_position ?? 0) >= 0 ? "+" : "-"}
          {formatRupees(overview?.net_position ?? 0)}
        </Text>
      </View>

      {/* Active Advances */}
      {(overview?.active_advances ?? 0) > 0 && (
        <View style={styles.advanceCard}>
          <Ionicons name="cash-outline" size={20} color={Colors.amber} />
          <Text style={styles.advanceText}>
            Active Advances: {formatRupees(overview?.active_advances ?? 0)}
          </Text>
        </View>
      )}

      {/* Recent Deals */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Deals</Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/deals")}
            style={styles.viewAllButton}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.green} />
          </TouchableOpacity>
        </View>

        {deals.length === 0 ? (
          <View style={styles.emptyCard}>
            <EmptyState
              icon="document-text-outline"
              title="No deals yet"
              subtitle='Tap "New Deal" to add your first deal'
            />
          </View>
        ) : (
          deals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              onPress={() => router.push(`/screens/deal/${deal.id}`)}
            />
          ))
        )}
      </View>
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
    paddingBottom: 32,
  },
  summaryCard: {
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
  cardTitle: {
    fontSize: Fonts.base,
    fontWeight: "700",
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.text,
  },
  summaryLabel: {
    fontSize: Fonts.sm,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  miniCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  greenCard: {
    backgroundColor: Colors.greenLight,
  },
  redCard: {
    backgroundColor: Colors.redBg,
  },
  miniCardTitle: {
    fontSize: Fonts.sm,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginTop: 6,
    marginBottom: 4,
  },
  miniCardValue: {
    fontSize: Fonts.xl,
    fontWeight: "800",
  },
  miniCardSub: {
    fontSize: Fonts.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  netCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  netValue: {
    fontSize: 32,
    fontWeight: "800",
  },
  advanceCard: {
    backgroundColor: Colors.amberLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  advanceText: {
    fontSize: Fonts.sm,
    fontWeight: "600",
    color: Colors.text,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: Fonts.lg,
    fontWeight: "700",
    color: Colors.text,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  viewAllText: {
    fontSize: Fonts.sm,
    fontWeight: "600",
    color: Colors.green,
  },
  emptyCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
});
