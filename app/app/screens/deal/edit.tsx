import { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import api from "../../../lib/api";
import { Colors, Fonts } from "../../../lib/colors";
import { formatRupees } from "../../../components/formatters";
import EntityPicker, { Entity } from "../../../components/EntityPicker";

interface DealDetail {
  id: string;
  farmer_id: string;
  buyer_id: string;
  product_id: string;
  quantity: number;
  unit: string;
  buy_rate: number;
  sell_rate: number;
  transport_cost: number;
  labour_cost: number;
  other_cost: number;
  notes: string | null;
}

export default function EditDealScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [farmerId, setFarmerId] = useState("");
  const [buyerId, setBuyerId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [buyRate, setBuyRate] = useState("");
  const [sellRate, setSellRate] = useState("");
  const [transportCost, setTransportCost] = useState("");
  const [labourCost, setLabourCost] = useState("");
  const [otherCost, setOtherCost] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [farmers, setFarmers] = useState<Entity[]>([]);
  const [buyers, setBuyers] = useState<Entity[]>([]);
  const [products, setProducts] = useState<Entity[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [deal, f, b, p] = await Promise.all([
          api<DealDetail>(`/deals/${id}`),
          api<Entity[]>("/farmers").catch(() => []),
          api<Entity[]>("/buyers").catch(() => []),
          api<Entity[]>("/products").catch(() => []),
        ]);

        setFarmerId(deal.farmer_id);
        setBuyerId(deal.buyer_id);
        setProductId(deal.product_id);
        setQuantity(String(deal.quantity));
        setUnit(deal.unit);
        setBuyRate(String(deal.buy_rate));
        setSellRate(String(deal.sell_rate));
        setTransportCost(String(deal.transport_cost || 0));
        setLabourCost(String(deal.labour_cost || 0));
        setOtherCost(String(deal.other_cost || 0));
        setNotes(deal.notes || "");
        setFarmers(f);
        setBuyers(b);
        setProducts(p);
      } catch {
        Alert.alert("Error", "Failed to load deal");
      } finally {
        setFetching(false);
      }
    }
    loadData();
  }, [id]);

  const calculations = useMemo(() => {
    const qty = parseFloat(quantity) || 0;
    const buy = parseFloat(buyRate) || 0;
    const sell = parseFloat(sellRate) || 0;
    const transport = parseFloat(transportCost) || 0;
    const labour = parseFloat(labourCost) || 0;
    const other = parseFloat(otherCost) || 0;

    const buyTotal = buy * qty;
    const sellTotal = sell * qty;
    const grossMargin = sellTotal - buyTotal;
    const netProfit = grossMargin - transport - labour - other;

    return { buyTotal, sellTotal, grossMargin, netProfit };
  }, [quantity, buyRate, sellRate, transportCost, labourCost, otherCost]);

  const saveDeal = async () => {
    if (!farmerId || !buyerId || !productId) {
      Alert.alert("Error", "Please select farmer, buyer and product");
      return;
    }
    if (!quantity || !buyRate || !sellRate) {
      Alert.alert("Error", "Please fill quantity and rates");
      return;
    }

    setLoading(true);
    try {
      await api(`/deals/${id}`, {
        method: "PATCH",
        body: {
          farmer_id: farmerId,
          buyer_id: buyerId,
          product_id: productId,
          quantity: parseFloat(quantity),
          unit,
          buy_rate: parseFloat(buyRate),
          sell_rate: parseFloat(sellRate),
          transport_cost: parseFloat(transportCost) || 0,
          labour_cost: parseFloat(labourCost) || 0,
          other_cost: parseFloat(otherCost) || 0,
          notes: notes.trim() || null,
        },
      });
      Alert.alert("Done!", "Deal updated!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update deal";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.green} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <EntityPicker
          label="Farmer"
          placeholder="Select farmer"
          items={farmers}
          selectedId={farmerId}
          onSelect={(id) => setFarmerId(id)}
          onAddNew={async (name) => {
            const f = await api<Entity>("/farmers", { method: "POST", body: { name } });
            setFarmers((prev) => [...prev, f]);
            setFarmerId(f.id);
          }}
          addLabel="Add Farmer"
        />

        <EntityPicker
          label="Buyer"
          placeholder="Select buyer"
          items={buyers}
          selectedId={buyerId}
          onSelect={(id) => setBuyerId(id)}
          onAddNew={async (name) => {
            const b = await api<Entity>("/buyers", { method: "POST", body: { name } });
            setBuyers((prev) => [...prev, b]);
            setBuyerId(b.id);
          }}
          addLabel="Add Buyer"
        />

        <EntityPicker
          label="Product"
          placeholder="Select product"
          items={products}
          selectedId={productId}
          onSelect={(id) => setProductId(id)}
          onAddNew={async (name) => {
            const p = await api<Entity>("/products", { method: "POST", body: { name } });
            setProducts((prev) => [...prev, p]);
            setProductId(p.id);
          }}
          addLabel="Add Product"
        />

        <View style={styles.row}>
          <View style={[styles.fieldContainer, { flex: 2 }]}>
            <Text style={styles.label}>Quantity</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor={Colors.textMuted}
              keyboardType="decimal-pad"
              value={quantity}
              onChangeText={setQuantity}
            />
          </View>
          <View style={[styles.fieldContainer, { flex: 1, marginLeft: 12 }]}>
            <Text style={styles.label}>Unit</Text>
            <TextInput
              style={styles.input}
              placeholder="kg"
              placeholderTextColor={Colors.textMuted}
              value={unit}
              onChangeText={setUnit}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.fieldContainer, { flex: 1 }]}>
            <Text style={styles.label}>Buy Rate (/{unit})</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor={Colors.textMuted}
              keyboardType="decimal-pad"
              value={buyRate}
              onChangeText={setBuyRate}
            />
          </View>
          <View style={[styles.fieldContainer, { flex: 1, marginLeft: 12 }]}>
            <Text style={styles.label}>Sell Rate (/{unit})</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor={Colors.textMuted}
              keyboardType="decimal-pad"
              value={sellRate}
              onChangeText={setSellRate}
            />
          </View>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Transport Cost</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor={Colors.textMuted}
            keyboardType="decimal-pad"
            value={transportCost}
            onChangeText={setTransportCost}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.fieldContainer, { flex: 1 }]}>
            <Text style={styles.label}>Labour Cost</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor={Colors.textMuted}
              keyboardType="decimal-pad"
              value={labourCost}
              onChangeText={setLabourCost}
            />
          </View>
          <View style={[styles.fieldContainer, { flex: 1, marginLeft: 12 }]}>
            <Text style={styles.label}>Other Cost</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor={Colors.textMuted}
              keyboardType="decimal-pad"
              value={otherCost}
              onChangeText={setOtherCost}
            />
          </View>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, { minHeight: 60, textAlignVertical: "top" }]}
            placeholder="Optional notes..."
            placeholderTextColor={Colors.textMuted}
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </View>

        {/* Calculation Preview */}
        <View style={styles.calcCard}>
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Buy Total</Text>
            <Text style={styles.calcValue}>{formatRupees(calculations.buyTotal)}</Text>
          </View>
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Sell Total</Text>
            <Text style={styles.calcValue}>{formatRupees(calculations.sellTotal)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Gross Margin</Text>
            <Text
              style={[
                styles.calcValue,
                { color: calculations.grossMargin >= 0 ? Colors.green : Colors.red },
              ]}
            >
              {formatRupees(calculations.grossMargin)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.calcRow}>
            <Text style={[styles.calcLabel, { fontWeight: "700" }]}>Net Profit</Text>
            <Text
              style={[
                styles.calcValueBig,
                { color: calculations.netProfit >= 0 ? Colors.green : Colors.red },
              ]}
            >
              {formatRupees(calculations.netProfit)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={saveDeal}
          disabled={loading}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator color={Colors.textWhite} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={22} color={Colors.textWhite} />
              <Text style={styles.saveButtonText}>Update Deal</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.greenBg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.greenBg,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  fieldContainer: {
    marginBottom: 14,
  },
  label: {
    fontSize: Fonts.sm,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: Fonts.base,
    color: Colors.text,
  },
  row: {
    flexDirection: "row",
  },
  calcCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  calcRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  calcLabel: {
    fontSize: Fonts.sm,
    color: Colors.textSecondary,
  },
  calcValue: {
    fontSize: Fonts.lg,
    fontWeight: "700",
    color: Colors.text,
  },
  calcValueBig: {
    fontSize: Fonts["2xl"],
    fontWeight: "800",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 10,
  },
  saveButton: {
    backgroundColor: Colors.green,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: Colors.textWhite,
    fontSize: Fonts.lg,
    fontWeight: "700",
  },
});
