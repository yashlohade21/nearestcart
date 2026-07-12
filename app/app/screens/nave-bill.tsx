import { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Fonts } from "../../lib/colors";
import { useT } from "../../lib/i18n";
import api from "../../lib/api";
import EntityPicker, { Entity } from "../../components/EntityPicker";

interface LineItem {
  id: string;
  product_id: string;
  product_name: string;
  kharidar_name: string;
  pauti_no: string;
  weight: string;
  rate: string;
}

let lineItemCounter = 1;

function newLineItem(): LineItem {
  return {
    id: String(lineItemCounter++),
    product_id: "",
    product_name: "",
    kharidar_name: "",
    pauti_no: "",
    weight: "",
    rate: "",
  };
}

export default function NaveBillScreen() {
  const t = useT();

  // Header fields
  const [billNo, setBillNo] = useState("");
  const [billDate, setBillDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [buyerId, setBuyerId] = useState("");

  // Line items
  const [lineItems, setLineItems] = useState<LineItem[]>([newLineItem()]);

  // Fee details
  const [marketFees, setMarketFees] = useState("");
  const [supervision, setSupervision] = useState("");
  const [adat, setAdat] = useState("");
  const [bardan, setBardan] = useState("");
  const [labour, setLabour] = useState("");
  const [gadiBhada, setGadiBhada] = useState("");
  const [sutli, setSutli] = useState("");
  const [weightShort, setWeightShort] = useState("");

  const [buyers, setBuyers] = useState<Entity[]>([]);
  const [products, setProducts] = useState<Entity[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      api<Entity[]>("/buyers").catch(() => []),
      api<Entity[]>("/products").catch(() => []),
    ]).then(([b, p]) => {
      setBuyers(b);
      setProducts(p);
    });
  }, []);

  const updateLineItem = (id: string, field: keyof LineItem, value: string) => {
    setLineItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const addLineItem = () => setLineItems((prev) => [...prev, newLineItem()]);

  const removeLineItem = (id: string) => {
    if (lineItems.length === 1) {
      Alert.alert("Cannot remove", "At least one line item is required");
      return;
    }
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  const lineItemAmount = (item: LineItem) => {
    const w = parseFloat(item.weight) || 0;
    const r = parseFloat(item.rate) || 0;
    return w * r;
  };

  const totalAmount = useMemo(
    () => lineItems.reduce((sum, item) => sum + lineItemAmount(item), 0),
    [lineItems]
  );

  const totalDeductions = useMemo(() => {
    return (
      (parseFloat(marketFees) || 0) +
      (parseFloat(supervision) || 0) +
      (parseFloat(adat) || 0) +
      (parseFloat(bardan) || 0) +
      (parseFloat(labour) || 0) +
      (parseFloat(gadiBhada) || 0) +
      (parseFloat(sutli) || 0) +
      (parseFloat(weightShort) || 0)
    );
  }, [marketFees, supervision, adat, bardan, labour, gadiBhada, sutli, weightShort]);

  const netAmount = useMemo(() => totalAmount - totalDeductions, [totalAmount, totalDeductions]);

  const fmt = (n: number) => `₹${new Intl.NumberFormat("en-IN").format(n)}`;

  const handleSave = async () => {
    if (!buyerId) {
      Alert.alert(t("error"), t("selectBuyer"));
      return;
    }
    if (!billNo.trim()) {
      Alert.alert(t("error"), "Please enter bill number");
      return;
    }
    const validItems = lineItems.filter((item) => item.product_id && item.weight && item.rate);
    if (validItems.length === 0) {
      Alert.alert(t("error"), "Please add at least one complete line item");
      return;
    }

    setSaving(true);
    try {
      await api("/nave-bills", {
        method: "POST",
        body: {
          bill_no: billNo.trim(),
          bill_date: billDate,
          buyer_id: buyerId,
          items: validItems.map((item) => ({
            product_id: item.product_id,
            kharidar_name: item.kharidar_name.trim() || null,
            pauti_no: item.pauti_no.trim() || null,
            weight: parseFloat(item.weight),
            rate: parseFloat(item.rate),
            amount: lineItemAmount(item),
          })),
          fee_details: {
            market_fees: parseFloat(marketFees) || 0,
            supervision: parseFloat(supervision) || 0,
            adat: parseFloat(adat) || 0,
            bardan: parseFloat(bardan) || 0,
            labour: parseFloat(labour) || 0,
            gadi_bhada: parseFloat(gadiBhada) || 0,
            sutli: parseFloat(sutli) || 0,
            weight_short: parseFloat(weightShort) || 0,
          },
          total_amount: totalAmount,
          total_deductions: totalDeductions,
          net_amount: netAmount,
        },
      });
      Alert.alert(t("done"), "Nave bill saved!", [
        { text: t("ok"), onPress: () => router.back() },
      ]);
    } catch (err: unknown) {
      Alert.alert(t("error"), err instanceof Error ? err.message : "Failed to save nave bill");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Fields */}
          <Text style={styles.sectionHeader}>Bill Details</Text>

          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.label}>Bill No.</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. NB-001"
                placeholderTextColor={Colors.textMuted}
                value={billNo}
                onChangeText={setBillNo}
              />
            </View>
            <View style={styles.half}>
              <Text style={styles.label}>Bill Date</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.textMuted}
                value={billDate}
                onChangeText={setBillDate}
              />
            </View>
          </View>

          <EntityPicker
            label={t("buyer")}
            placeholder={t("selectBuyer")}
            items={buyers}
            selectedId={buyerId}
            onSelect={setBuyerId}
            onAddNew={async (name) => {
              try {
                const b = await api<Entity>("/buyers", { method: "POST", body: { name } });
                setBuyers((prev) => [...prev, b]);
                setBuyerId(b.id);
              } catch (err: unknown) {
                Alert.alert(t("error"), err instanceof Error ? err.message : t("failedAddBuyer"));
              }
            }}
            addLabel={t("addBuyer")}
          />

          {/* Line Items */}
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionHeader}>Line Items</Text>
            <TouchableOpacity style={styles.addItemBtn} onPress={addLineItem} activeOpacity={0.7}>
              <Ionicons name="add" size={18} color={Colors.green} />
              <Text style={styles.addItemBtnText}>Add Item</Text>
            </TouchableOpacity>
          </View>

          {lineItems.map((item, index) => (
            <View key={item.id} style={styles.lineItemCard}>
              <View style={styles.lineItemHeader}>
                <Text style={styles.lineItemTitle}>Item {index + 1}</Text>
                <TouchableOpacity onPress={() => removeLineItem(item.id)} activeOpacity={0.7}>
                  <Ionicons name="trash-outline" size={18} color={Colors.red} />
                </TouchableOpacity>
              </View>

              {/* Product Picker for line item */}
              <Text style={styles.label}>{t("product")}</Text>
              <TouchableOpacity
                style={styles.pickerBtn}
                onPress={() => {
                  // Simple product selection via Alert
                  if (products.length === 0) {
                    Alert.alert("No products", "No products available");
                    return;
                  }
                  Alert.alert(
                    "Select Product",
                    undefined,
                    [
                      ...products.map((p) => ({
                        text: p.name,
                        onPress: () => {
                          updateLineItem(item.id, "product_id", p.id);
                          updateLineItem(item.id, "product_name", p.name);
                        },
                      })),
                      { text: t("cancel"), style: "cancel" as const },
                    ]
                  );
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={item.product_id ? styles.pickerBtnText : styles.pickerBtnPlaceholder}
                >
                  {item.product_name || t("selectProduct")}
                </Text>
                <Ionicons name="chevron-down" size={16} color={Colors.textMuted} />
              </TouchableOpacity>

              <View style={styles.row}>
                <View style={styles.half}>
                  <Text style={styles.label}>Kharidar Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Name"
                    placeholderTextColor={Colors.textMuted}
                    value={item.kharidar_name}
                    onChangeText={(v) => updateLineItem(item.id, "kharidar_name", v)}
                  />
                </View>
                <View style={styles.half}>
                  <Text style={styles.label}>Pauti No.</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Pauti no."
                    placeholderTextColor={Colors.textMuted}
                    value={item.pauti_no}
                    onChangeText={(v) => updateLineItem(item.id, "pauti_no", v)}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.half}>
                  <Text style={styles.label}>Weight (kg)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="decimal-pad"
                    value={item.weight}
                    onChangeText={(v) => updateLineItem(item.id, "weight", v)}
                  />
                </View>
                <View style={styles.half}>
                  <Text style={styles.label}>Rate (₹/kg)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="decimal-pad"
                    value={item.rate}
                    onChangeText={(v) => updateLineItem(item.id, "rate", v)}
                  />
                </View>
              </View>

              <View style={styles.amountRow}>
                <Text style={styles.calcLabel}>Amount</Text>
                <Text style={styles.calcValue}>{fmt(lineItemAmount(item))}</Text>
              </View>
            </View>
          ))}

          {/* Fee Details */}
          <Text style={styles.sectionHeader}>Fee Details</Text>

          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.label}>Market Fees</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
                keyboardType="decimal-pad"
                value={marketFees}
                onChangeText={setMarketFees}
              />
            </View>
            <View style={styles.half}>
              <Text style={styles.label}>Supervision</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
                keyboardType="decimal-pad"
                value={supervision}
                onChangeText={setSupervision}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.label}>Adat</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
                keyboardType="decimal-pad"
                value={adat}
                onChangeText={setAdat}
              />
            </View>
            <View style={styles.half}>
              <Text style={styles.label}>Bardan</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
                keyboardType="decimal-pad"
                value={bardan}
                onChangeText={setBardan}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.label}>{t("labour")}</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
                keyboardType="decimal-pad"
                value={labour}
                onChangeText={setLabour}
              />
            </View>
            <View style={styles.half}>
              <Text style={styles.label}>Gadi Bhada</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
                keyboardType="decimal-pad"
                value={gadiBhada}
                onChangeText={setGadiBhada}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.label}>Sutli</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
                keyboardType="decimal-pad"
                value={sutli}
                onChangeText={setSutli}
              />
            </View>
            <View style={styles.half}>
              <Text style={styles.label}>Weight Short</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
                keyboardType="decimal-pad"
                value={weightShort}
                onChangeText={setWeightShort}
              />
            </View>
          </View>

          {/* Summary */}
          <Text style={styles.sectionHeader}>Bill Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Amount</Text>
              <Text style={styles.summaryValue}>{fmt(totalAmount)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Deductions</Text>
              <Text style={[styles.summaryValue, { color: Colors.red }]}>
                - {fmt(totalDeductions)}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { fontWeight: "700" }]}>Net Amount</Text>
              <Text
                style={[
                  styles.summaryValueBig,
                  { color: netAmount >= 0 ? Colors.green : Colors.red },
                ]}
              >
                {fmt(netAmount)}
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>{t("save")}</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  label: {
    fontSize: Fonts.xs,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: Fonts.base,
    backgroundColor: Colors.card,
    color: Colors.text,
  },
  row: { flexDirection: "row", gap: 12 },
  half: { flex: 1 },
  sectionHeader: {
    fontSize: Fonts.xs,
    fontWeight: "700",
    color: Colors.textSecondary,
    marginTop: 20,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 4,
  },
  addItemBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.greenLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addItemBtnText: { fontSize: Fonts.xs, fontWeight: "700", color: Colors.green },
  lineItemCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  lineItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  lineItemTitle: { fontSize: Fonts.sm, fontWeight: "700", color: Colors.text },
  pickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    marginBottom: 4,
  },
  pickerBtnText: { fontSize: Fonts.base, color: Colors.text, flex: 1 },
  pickerBtnPlaceholder: { fontSize: Fonts.base, color: Colors.textMuted, flex: 1 },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: Colors.greenBg,
    borderRadius: 8,
    marginTop: 8,
  },
  calcLabel: { fontSize: Fonts.sm, color: Colors.textSecondary },
  calcValue: { fontSize: Fonts.base, fontWeight: "700", color: Colors.green },
  summaryCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },
  summaryLabel: { fontSize: Fonts.sm, color: Colors.textSecondary },
  summaryValue: { fontSize: Fonts.base, fontWeight: "700", color: Colors.text },
  summaryValueBig: { fontSize: Fonts.xl, fontWeight: "800" },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 10 },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.card,
  },
  saveBtn: {
    backgroundColor: Colors.green,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontSize: Fonts.base, fontWeight: "700" },
});
