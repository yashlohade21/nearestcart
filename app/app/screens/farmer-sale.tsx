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
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Fonts } from "../../lib/colors";
import { useT } from "../../lib/i18n";
import api from "../../lib/api";

interface FarmerEntry {
  id: string;
  farmer_name: string | null;
  product_name: string | null;
  amount: number;
  weight: number;
}

export default function FarmerSaleScreen() {
  const t = useT();
  const params = useLocalSearchParams<{ farmer_entry_id?: string }>();

  const [farmerEntryId, setFarmerEntryId] = useState(params.farmer_entry_id || "");
  const [farmerEntries, setFarmerEntries] = useState<FarmerEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<FarmerEntry | null>(null);
  const [showEntryPicker, setShowEntryPicker] = useState(false);

  const [marketFees, setMarketFees] = useState("");
  const [supervision, setSupervision] = useState("");
  const [adatCommission, setAdatCommission] = useState("");
  const [bardan, setBardan] = useState("");
  const [labour, setLabour] = useState("");
  const [sutli, setSutli] = useState("");
  const [gadiBhada, setGadiBhada] = useState("");
  const [weightShort, setWeightShort] = useState("");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api<FarmerEntry[]>("/farmer-entries").then(setFarmerEntries).catch(() => {});
  }, []);

  useEffect(() => {
    if (farmerEntryId && farmerEntries.length > 0) {
      const entry = farmerEntries.find((e) => e.id === farmerEntryId) || null;
      setSelectedEntry(entry);
    }
  }, [farmerEntryId, farmerEntries]);

  const totalDeductions = useMemo(() => {
    return (
      (parseFloat(marketFees) || 0) +
      (parseFloat(supervision) || 0) +
      (parseFloat(adatCommission) || 0) +
      (parseFloat(bardan) || 0) +
      (parseFloat(labour) || 0) +
      (parseFloat(sutli) || 0) +
      (parseFloat(gadiBhada) || 0) +
      (parseFloat(weightShort) || 0)
    );
  }, [marketFees, supervision, adatCommission, bardan, labour, sutli, gadiBhada, weightShort]);

  const netPayable = useMemo(() => {
    const entryAmount = selectedEntry?.amount || 0;
    return entryAmount - totalDeductions;
  }, [selectedEntry, totalDeductions]);

  const handleSave = async () => {
    if (!farmerEntryId) {
      Alert.alert(t("error"), "Please select a farmer entry");
      return;
    }

    setSaving(true);
    try {
      await api("/farmer-sales", {
        method: "POST",
        body: {
          farmer_entry_id: farmerEntryId,
          market_fees: parseFloat(marketFees) || 0,
          supervision: parseFloat(supervision) || 0,
          adat_commission: parseFloat(adatCommission) || 0,
          bardan: parseFloat(bardan) || 0,
          labour: parseFloat(labour) || 0,
          sutli: parseFloat(sutli) || 0,
          gadi_bhada: parseFloat(gadiBhada) || 0,
          weight_short: parseFloat(weightShort) || 0,
          total_deductions: totalDeductions,
          net_payable: netPayable,
        },
      });
      Alert.alert(t("done"), "Farmer sale saved!", [
        { text: t("ok"), onPress: () => router.back() },
      ]);
    } catch (err: unknown) {
      Alert.alert(t("error"), err instanceof Error ? err.message : "Failed to save farmer sale");
    } finally {
      setSaving(false);
    }
  };

  const fmt = (n: number) => `₹${new Intl.NumberFormat("en-IN").format(n)}`;

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
          {/* Farmer Entry Selector */}
          <Text style={styles.label}>Farmer Entry</Text>
          <TouchableOpacity
            style={styles.pickerBtn}
            onPress={() => setShowEntryPicker(!showEntryPicker)}
            activeOpacity={0.7}
          >
            <Text style={selectedEntry ? styles.pickerBtnText : styles.pickerBtnPlaceholder}>
              {selectedEntry
                ? `${selectedEntry.farmer_name || "Unknown"} — ${selectedEntry.product_name || "Unknown"} (${fmt(selectedEntry.amount)})`
                : "Select farmer entry"}
            </Text>
            <Ionicons name="chevron-down" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          {showEntryPicker && (
            <View style={styles.dropdownList}>
              {farmerEntries.length === 0 ? (
                <Text style={styles.dropdownEmpty}>No farmer entries found</Text>
              ) : (
                farmerEntries.map((entry) => (
                  <TouchableOpacity
                    key={entry.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setFarmerEntryId(entry.id);
                      setSelectedEntry(entry);
                      setShowEntryPicker(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>
                      {entry.farmer_name || "Unknown"} — {entry.product_name || "Unknown"}
                    </Text>
                    <Text style={styles.dropdownItemSub}>
                      {entry.weight} kg | {fmt(entry.amount)}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}

          {/* Entry amount reference */}
          {selectedEntry && (
            <View style={styles.calcRow}>
              <Text style={styles.calcLabel}>Entry Amount</Text>
              <Text style={styles.calcValue}>{fmt(selectedEntry.amount)}</Text>
            </View>
          )}

          <Text style={styles.sectionHeader}>Fee Breakup</Text>

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
              <Text style={styles.label}>Adat Commission</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
                keyboardType="decimal-pad"
                value={adatCommission}
                onChangeText={setAdatCommission}
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
          </View>

          <View style={styles.row}>
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
          <Text style={styles.sectionHeader}>Summary</Text>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Deductions</Text>
              <Text style={[styles.summaryValue, { color: Colors.red }]}>
                - {fmt(totalDeductions)}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { fontWeight: "700" }]}>Net Payable</Text>
              <Text
                style={[
                  styles.summaryValueBig,
                  { color: netPayable >= 0 ? Colors.green : Colors.red },
                ]}
              >
                {fmt(netPayable)}
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
  pickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: Colors.card,
  },
  pickerBtnText: { fontSize: Fonts.base, color: Colors.text, flex: 1 },
  pickerBtnPlaceholder: { fontSize: Fonts.base, color: Colors.textMuted, flex: 1 },
  dropdownList: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    backgroundColor: Colors.card,
    marginTop: 4,
    maxHeight: 200,
    overflow: "hidden",
  },
  dropdownEmpty: {
    padding: 16,
    color: Colors.textMuted,
    textAlign: "center",
    fontSize: Fonts.sm,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  dropdownItemText: { fontSize: Fonts.base, color: Colors.text },
  dropdownItemSub: { fontSize: Fonts.xs, color: Colors.textMuted, marginTop: 2 },
  calcRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    backgroundColor: Colors.greenBg,
    borderRadius: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.greenLight,
  },
  calcLabel: { fontSize: Fonts.sm, color: Colors.textSecondary },
  calcValue: { fontSize: Fonts.lg, fontWeight: "700", color: Colors.green },
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
    paddingVertical: 4,
  },
  summaryLabel: { fontSize: Fonts.sm, color: Colors.textSecondary },
  summaryValue: { fontSize: Fonts.base, fontWeight: "700" },
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
