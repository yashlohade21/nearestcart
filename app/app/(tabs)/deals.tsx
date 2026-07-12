import { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import api from "../../lib/api";
import { offlineGet } from "../../lib/offline-api";
import { Colors, Fonts } from "../../lib/colors";
import LoadingScreen from "../../components/LoadingScreen";
import EmptyState from "../../components/EmptyState";
import DealCard, { DealCardData } from "../../components/DealCard";
import { useT } from "../../lib/i18n";

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
  const t = useT();
  const [deals, setDeals] = useState<DealCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search input → searchQuery (300ms)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchQuery(searchInput.trim());
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchInput]);

  const fetchDeals = useCallback(
    async (reset = true) => {
      const currentOffset = reset ? 0 : offset;
      if (!reset) setLoadingMore(true);

      try {
        const { from, to } = getDateRange(dateFilter);
        let url = `/deals?limit=${LIMIT}&offset=${currentOffset}`;
        if (from) url += `&date_from=${from}`;
        if (to) url += `&date_to=${to}`;
        if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;

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
    [dateFilter, offset, searchQuery]
  );

  useEffect(() => {
    setLoading(true);
    fetchDeals(true);
  }, [dateFilter, searchQuery]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDeals(true);
  };

  const onEndReached = () => {
    if (!loadingMore && hasMore) {
      fetchDeals(false);
    }
  };

  const filters: { key: DateFilter; labelKey: "all" | "today" | "week" | "month" }[] = [
    { key: "all", labelKey: "all" },
    { key: "today", labelKey: "today" },
    { key: "week", labelKey: "week" },
    { key: "month", labelKey: "month" },
  ];

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color={Colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={t("searchDeals")}
          placeholderTextColor={Colors.textMuted}
          value={searchInput}
          onChangeText={setSearchInput}
          returnKeyType="search"
        />
        {searchInput.length > 0 && (
          <TouchableOpacity onPress={() => setSearchInput("")} style={styles.clearBtn}>
            <Ionicons name="close-circle" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

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
              {t(f.labelKey)}
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
            title={t("noDealsFound")}
            subtitle={t("createNewDeal")}
          />
        }
        ListFooterComponent={
          loadingMore ? (
            <Text style={styles.loadingMore}>{t("loadingMore")}</Text>
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
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: Fonts.base,
    color: Colors.text,
    paddingVertical: 12,
  },
  clearBtn: {
    padding: 6,
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 48,
    justifyContent: "center",
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
    width: 64,
    height: 64,
    borderRadius: 32,
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
