import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../../lib/api";
import { Colors, Fonts } from "../../lib/colors";
import { formatRupees } from "../../components/formatters";

interface MandiRate {
  id: string; product_name: string; mandi_name: string;
  city: string; state: string;
  min_price: number | null; max_price: number | null; modal_price: number | null;
  unit: string; rate_date: string;
}

const fmt = formatRupees;

export default function MandiRatesScreen() {
  const [rates, setRates] = useState<MandiRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState("");

  const fetchRates = (product?: string) => {
    setLoading(true);
    const params = product ? `?product=${encodeURIComponent(product)}` : "";
    api<MandiRate[]>(`/mandi-rates${params}`)
      .then(setRates)
      .catch(() => setRates([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRates(); }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await api<{ synced: number; fetched: number }>("/mandi-rates/sync", { method: "POST" });
      Alert.alert("Synced", `${result.synced} rates synced from ${result.fetched} fetched`);
      fetchRates();
    } catch {
      Alert.alert("Error", "Failed to sync rates");
    } finally {
      setSyncing(false);
    }
  };

  const handleSearch = () => { fetchRates(search.trim() || undefined); };

  const renderItem = ({ item }: { item: MandiRate }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.productName}>{item.product_name}</Text>
        <Text style={styles.dateText}>{item.rate_date}</Text>
      </View>
      <Text style={styles.mandiText}>{item.mandi_name}, {item.city}</Text>
      <View style={styles.priceRow}>
        <View style={styles.priceItem}>
          <Text style={styles.priceLabel}>Min</Text>
          <Text style={styles.priceValue}>{item.min_price != null ? fmt(item.min_price) : "—"}</Text>
        </View>
        <View style={styles.priceItem}>
          <Text style={styles.priceLabel}>Modal</Text>
          <Text style={[styles.priceValue, styles.modalPrice]}>{item.modal_price != null ? fmt(item.modal_price) : "—"}</Text>
        </View>
        <View style={styles.priceItem}>
          <Text style={styles.priceLabel}>Max</Text>
          <Text style={styles.priceValue}>{item.max_price != null ? fmt(item.max_price) : "—"}</Text>
        </View>
      </View>
      <Text style={styles.unitText}>per {item.unit}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search product..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.syncButton} onPress={handleSync} disabled={syncing}>
          {syncing ? (
            <ActivityIndicator size="small" color={Colors.textWhite} />
          ) : (
            <Ionicons name="sync" size={20} color={Colors.textWhite} />
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={Colors.green} /></View>
      ) : (
        <FlatList
          data={rates}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="leaf-outline" size={40} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No rates found</Text>
              <Text style={styles.emptySubtext}>Tap sync to fetch latest mandi rates</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.greenBg },
  searchRow: { flexDirection: "row", margin: 16, marginBottom: 8, gap: 8 },
  searchInput: { flex: 1, backgroundColor: Colors.card, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: Fonts.base, color: Colors.text, borderWidth: 1, borderColor: Colors.border },
  syncButton: { backgroundColor: Colors.green, borderRadius: 12, width: 44, justifyContent: "center", alignItems: "center" },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  card: { backgroundColor: Colors.card, borderRadius: 14, padding: 14, marginBottom: 8, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  productName: { fontSize: Fonts.base, fontWeight: "700", color: Colors.text },
  dateText: { fontSize: Fonts.xs, color: Colors.textMuted },
  mandiText: { fontSize: Fonts.xs, color: Colors.textSecondary, marginBottom: 10 },
  priceRow: { flexDirection: "row", justifyContent: "space-between" },
  priceItem: { alignItems: "center", flex: 1 },
  priceLabel: { fontSize: Fonts.xs, color: Colors.textMuted },
  priceValue: { fontSize: Fonts.sm, fontWeight: "700", color: Colors.text, marginTop: 2 },
  modalPrice: { color: Colors.green, fontSize: Fonts.base },
  unitText: { fontSize: Fonts.xs, color: Colors.textMuted, textAlign: "center", marginTop: 6 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 40 },
  emptyText: { fontSize: Fonts.base, color: Colors.textMuted, marginTop: 12 },
  emptySubtext: { fontSize: Fonts.sm, color: Colors.textMuted, marginTop: 4 },
});
