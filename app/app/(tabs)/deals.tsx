import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import api from "../../lib/api";
import { offlineGet } from "../../lib/offline-api";
import { Colors, Fonts } from "../../lib/colors";
import LoadingScreen from "../../components/LoadingScreen";
import EmptyState from "../../components/EmptyState";
import DealCard, { DealCardData } from "../../components/DealCard";

type DateFilter = "today" | "week" | "month" | "all";

function getDateRange(filter: DateFilter): { from?: string; to?: string } {
  const now = new Date();
  const today = now.toISOString().split("T")[0];

  switch (filter) {
    case "today":
      return { from: today, to: today };
    case "week": {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return { from: weekAgo.toISOString().split("T")[0], to: today };
    }
    case "month": {
      const monthAgo = new Date(now);
      monthAgo.setDate(monthAgo.getDate() - 30);
      return { from: monthAgo.toISOString().split("T")[0], to: today };
    }
    case "all":
      return {};
  }
}

const LIMIT = 20;

export default function DealsScreen() {
  const [deals, setDeals] = useState<DealCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchDeals = useCallback(
    async (reset = true) => {
      const currentOffset = reset ? 0 : offset;
      if (!reset) setLoadingMore(true);

      try {
        const { from, to } = getDateRange(dateFilter);
        let url = `/deals?limit=${LIMIT}&offset=${currentOffset}`;
        if (from) url += `&date_from=${from}`;
        if (to) url += `&date_to=${to}`;

        const data = await offlineGet<DealCardData[]>(url);

        if (reset) {
          setDeals(data);
          setOffset(LIMIT);
        } else {
          setDeals((prev) => [...prev, ...data]);
          setOffset(currentOffset + LIMIT);
        }
        setHasMore(data.length === LIMIT);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [dateFilter, offset]
  );

  useEffect(() => {
    setLoading(true);
    fetchDeals(true);
  }, [dateFilter]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDeals(true);
  };

  const onEndReached = () => {
    if (!loadingMore && hasMore) {
      fetchDeals(false);
    }
  };

  const filters: { key: DateFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "today", label: "Today" },
    { key: "week", label: "Week" },
    { key: "month", label: "Month" },
  ];

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.chip,
              dateFilter === f.key && styles.chipActive,
            ]}
            onPress={() => setDateFilter(f.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.chipText,
                dateFilter === f.key && styles.chipTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={deals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DealCard
            deal={item}
            onPress={() => router.push(`/screens/deal/${item.id}`)}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.green]}
            tintColor={Colors.green}
          />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <EmptyState
            icon="document-text-outline"
            title="No deals found"
            subtitle="Create a new deal to get started"
          />
        }
        ListFooterComponent={
          loadingMore ? (
            <Text style={styles.loadingMore}>Loading more...</Text>
          ) : null
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/screens/new-deal")}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={Colors.textWhite} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.greenBg,
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.green,
    borderColor: Colors.green,
  },
  chipText: {
    fontSize: Fonts.sm,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.textWhite,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  loadingMore: {
    textAlign: "center",
    color: Colors.textMuted,
    paddingVertical: 12,
    fontSize: Fonts.sm,
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.green,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});
