import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Fonts } from "../../lib/colors";
import { useT } from "../../lib/i18n";
import api from "../../lib/api";

interface Deal {
  id: string;
  farmer_name: string;
  buyer_name: string;
  product_name: string;
  quantity: number;
  unit: string;
  buy_rate: number;
  sell_rate: number;
  deal_date: string;
  status: string;
  vehicle_number?: string;
}

const fmt = (n: number) =>
  `₹${Math.abs(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export default function PrintDealsScreen() {
  const t = useT();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isTransport = mode === "transport";

  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [showOptions, setShowOptions] = useState(false);

  const accentColor = isTransport ? "#d97706" : "#059669";
  const accentBg = isTransport ? "#fef3c7" : "#d1fae5";
  const docLabel = isTransport ? "Transport Invoice" : "Invoice";

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<Deal[]>("/deals?limit=50");
      setDeals(data);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  const filtered = search.trim()
    ? deals.filter((d) => {
        const q = search.toLowerCase();
        return (
          d.product_name.toLowerCase().includes(q) ||
          d.farmer_name.toLowerCase().includes(q) ||
          d.buyer_name.toLowerCase().includes(q)
        );
      })
    : deals;

  const handleDealTap = (deal: Deal) => {
    setSelectedDeal(deal);
    setShowOptions(true);
  };

  const handleProceed = () => {
    if (!selectedDeal) return;
    setShowOptions(false);
    if (isTransport) {
      router.push({ pathname: "/screens/deal/bilty", params: { dealId: selectedDeal.id } } as any);
    } else {
      router.push({ pathname: "/screens/deal/invoice", params: { dealId: selectedDeal.id } } as any);
    }
  };

  const renderDeal = ({ item }: { item: Deal }) => {
    const total = item.quantity * item.sell_rate;
    return (
      <TouchableOpacity
        style={styles.dealCard}
        onPress={() => handleDealTap(item)}
        activeOpacity={0.7}
      >
        <View style={styles.dealLeft}>
          <View style={[styles.iconWrap, { backgroundColor: accentBg }]}>
            <Ionicons name={isTransport ? "car" : "receipt"} size={22} color={accentColor} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.dealHeader}>
              <Text style={styles.dealProduct}>{item.product_name}</Text>
              <Text style={[styles.dealAmount, { color: accentColor }]}>{fmt(total)}</Text>
            </View>
            <Text style={styles.dealParties}>
              {item.farmer_name} → {item.buyer_name}
            </Text>
            <Text style={styles.dealMeta}>
              {item.quantity} {item.unit} @ {fmt(item.sell_rate)}/{item.unit} |{" "}
              {new Date(item.deal_date).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.greenBg }} edges={["bottom"]}>
      {/* ── Search ── */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by product, party..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Info Banner ── */}
      <View style={[styles.infoBanner, { backgroundColor: accentBg }]}>
        <Ionicons name="information-circle" size={18} color={accentColor} />
        <Text style={[styles.infoText, { color: accentColor }]}>
          {isTransport
            ? "Select a deal to generate Transport Invoice with consignor/consignee details"
            : "Select a deal to generate Invoice with print, share & page size options"}
        </Text>
      </View>

      {/* ── Deal List ── */}
      {loading && deals.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={accentColor} />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="document-text-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>
            {search ? "No matching deals" : t("noDealsFound")}
          </Text>
          <Text style={styles.emptySubtitle}>{t("createNewDeal")}</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderDeal}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchDeals} colors={[accentColor]} />
          }
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        />
      )}

      {/* ── Options Modal ── */}
      <Modal visible={showOptions} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Generate {docLabel}</Text>
              <TouchableOpacity onPress={() => setShowOptions(false)}>
                <Ionicons name="close" size={24} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Selected Deal Info */}
            {selectedDeal && (
              <View style={[styles.selectedDealCard, { borderLeftColor: accentColor }]}>
                <Text style={styles.selectedProduct}>{selectedDeal.product_name}</Text>
                <Text style={styles.selectedParties}>
                  {selectedDeal.farmer_name} → {selectedDeal.buyer_name}
                </Text>
                <Text style={styles.selectedMeta}>
                  {selectedDeal.quantity} {selectedDeal.unit} | {fmt(selectedDeal.quantity * selectedDeal.sell_rate)} |{" "}
                  {new Date(selectedDeal.deal_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </Text>
              </View>
            )}

            {/* What's included */}
            <Text style={styles.optionSectionTitle}>What's included</Text>
            <View style={styles.featureList}>
              <FeatureRow icon="print" label="Print (A4 / A5 / Thermal)" color={accentColor} />
              <FeatureRow icon="share" label="Share as PDF" color={accentColor} />
              {isTransport ? (
                <>
                  <FeatureRow icon="people" label="Consignor → Consignee details" color={accentColor} />
                  <FeatureRow icon="car" label="Vehicle & transporter info" color={accentColor} />
                  <FeatureRow icon="cube" label="Goods description" color={accentColor} />
                  <FeatureRow icon="cash" label="Freight & charges" color={accentColor} />
                </>
              ) : (
                <>
                  <FeatureRow icon="copy" label="Buyer / Farmer / Self copies" color={accentColor} />
                  <FeatureRow icon="text" label="Amount in words" color={accentColor} />
                  <FeatureRow icon="image" label="Your business logo" color={accentColor} />
                  <FeatureRow icon="document-text" label="GST details" color={accentColor} />
                </>
              )}
            </View>

            {/* Proceed Button */}
            <TouchableOpacity
              style={[styles.proceedBtn, { backgroundColor: accentColor }]}
              onPress={handleProceed}
              activeOpacity={0.7}
            >
              <Ionicons name={isTransport ? "car" : "receipt"} size={20} color="#fff" />
              <Text style={styles.proceedText}>Open {docLabel}</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function FeatureRow({ icon, label, color }: { icon: string; label: string; color?: string }) {
  return (
    <View style={styles.featureRow}>
      <Ionicons name={icon as any} size={16} color={color || Colors.green} />
      <Text style={styles.featureText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: Fonts.sm,
    color: Colors.text,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#d1fae5",
  },
  infoText: {
    fontSize: Fonts.xs,
    color: "#059669",
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyTitle: {
    fontSize: Fonts.lg,
    fontWeight: "700",
    color: Colors.text,
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: Fonts.sm,
    color: Colors.textMuted,
  },
  dealCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  dealLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  dealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dealProduct: {
    fontSize: Fonts.base,
    fontWeight: "700",
    color: Colors.text,
  },
  dealAmount: {
    fontSize: Fonts.base,
    fontWeight: "700",
  },
  dealParties: {
    fontSize: Fonts.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  dealMeta: {
    fontSize: Fonts.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: Fonts.xl,
    fontWeight: "800",
    color: Colors.text,
  },
  selectedDealCard: {
    backgroundColor: Colors.greenBg,
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: "#059669", // overridden inline
    marginBottom: 16,
  },
  selectedProduct: {
    fontSize: Fonts.base,
    fontWeight: "700",
    color: Colors.text,
  },
  selectedParties: {
    fontSize: Fonts.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  selectedMeta: {
    fontSize: Fonts.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  optionSectionTitle: {
    fontSize: Fonts.sm,
    fontWeight: "700",
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  featureList: {
    gap: 6,
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureText: {
    fontSize: Fonts.sm,
    color: Colors.text,
  },
  proceedBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
  },
  proceedText: {
    fontSize: Fonts.base,
    fontWeight: "700",
    color: "#fff",
  },
});
