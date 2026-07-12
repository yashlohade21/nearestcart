import { useState, useEffect } from "react";
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

interface FarmerBalance {
  farmer_id: string;
  net_payable: number;
  total_paid: number;
  running_balance: number;
}

const PAYMENT_MODES = ["cash", "upi", "bank_transfer", "cheque"] as const;
type PaymentMode = (typeof PAYMENT_MODES)[number];

const MODE_LABELS: Record<PaymentMode, string> = {
  cash: "Cash",
  upi: "UPI",
  bank_transfer: "Bank Transfer",
  cheque: "Cheque",
};

export default function FarmerPaymentScreen() {
  const t = useT();

  const [farmerId, setFarmerId] = useState("");
  const [amount, setAmount] = useState("");
  const [cashAmount, setCashAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [chequeNo, setChequeNo] = useState("");
  const [narration, setNarration] = useState("");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("cash");

  const [farmers, setFarmers] = useState<Entity[]>([]);
  const [farmerBalance, setFarmerBalance] = useState<FarmerBalance | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api<Entity[]>("/farmers").then(setFarmers).catch(() => {});
  }, []);

  useEffect(() => {
    if (!farmerId) {
      setFarmerBalance(null);
      return;
    }
    setLoadingBalance(true);
    api<FarmerBalance>(`/farmer-payments/balance/${farmerId}`)
      .then(setFarmerBalance)
      .catch(() => setFarmerBalance(null))
      .finally(() => setLoadingBalance(false));
  }, [farmerId]);

  const fmt = (n: number) => `₹${new Intl.NumberFormat("en-IN").format(n)}`;

  const handleSave = async () => {
    if (!farmerId) {
      Alert.alert(t("error"), t("selectFarmerError"));
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert(t("error"), t("validAmountError"));
      return;
    }

    setSaving(true);
    try {
      await api("/farmer-payments", {
        method: "POST",
        body: {
          farmer_id: farmerId,
          amount: parseFloat(amount),
          cash_amount: parseFloat(cashAmount) || 0,
          bank_name: bankName.trim() || null,
          cheque_no: chequeNo.trim() || null,
          narration: narration.trim() || null,
          payment_mode: paymentMode,
        },
      });
      Alert.alert(t("done"), "Payment recorded!", [
        { text: t("ok"), onPress: () => router.back() },
      ]);
    } catch (err: unknown) {
      Alert.alert(t("error"), err instanceof Error ? err.message : "Failed to record payment");
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
          <EntityPicker
            label={t("farmer")}
            placeholder={t("selectFarmer")}
            items={farmers}
            selectedId={farmerId}
            onSelect={setFarmerId}
            onAddNew={async (name) => {
              try {
                const f = await api<Entity>("/farmers", { method: "POST", body: { name } });
                setFarmers((prev) => [...prev, f]);
                setFarmerId(f.id);
              } catch (err: unknown) {
                Alert.alert(t("error"), err instanceof Error ? err.message : t("failedAddFarmer"));
              }
            }}
            addLabel={t("addFarmer")}
          />

          {/* Running balance card */}
          {farmerId && (
            <View style={styles.balanceCard}>
              {loadingBalance ? (
                <ActivityIndicator color={Colors.green} size="small" />
              ) : farmerBalance ? (
                <>
                  <View style={styles.balanceRow}>
                    <Text style={styles.balanceLabel}>Net Payable</Text>
                    <Text style={styles.balanceValue}>{fmt(farmerBalance.net_payable)}</Text>
                  </View>
                  <View style={styles.balanceRow}>
                    <Text style={styles.balanceLabel}>Already Paid</Text>
                    <Text style={styles.balanceValue}>{fmt(farmerBalance.total_paid)}</Text>
                  </View>
                  <View style={[styles.balanceRow, styles.balanceTotalRow]}>
                    <Text style={styles.balanceTotalLabel}>Running Balance</Text>
                    <Text
                      style={[
                        styles.balanceTotalValue,
                        { color: farmerBalance.running_balance >= 0 ? Colors.green : Colors.red },
                      ]}
                    >
                      {fmt(farmerBalance.running_balance)}
                    </Text>
                  </View>
                </>
              ) : (
                <Text style={styles.balanceEmpty}>No balance data available</Text>
              )}
            </View>
          )}

          <Text style={styles.label}>{t("amount")} (₹)</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor={Colors.textMuted}
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
          />

          <Text style={styles.label}>Cash Amount (₹)</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor={Colors.textMuted}
            keyboardType="decimal-pad"
            value={cashAmount}
            onChangeText={setCashAmount}
          />

          {/* Payment Mode */}
          <Text style={styles.label}>{t("paymentMode")}</Text>
          <View style={styles.modeGrid}>
            {PAYMENT_MODES.map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[styles.modeChip, paymentMode === mode && styles.modeChipActive]}
                onPress={() => setPaymentMode(mode)}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.modeChipText, paymentMode === mode && styles.modeChipTextActive]}
                >
                  {MODE_LABELS[mode]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {(paymentMode === "bank_transfer" || paymentMode === "cheque") && (
            <>
              <Text style={styles.label}>Bank Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. State Bank of India"
                placeholderTextColor={Colors.textMuted}
                value={bankName}
                onChangeText={setBankName}
              />
            </>
          )}

          {paymentMode === "cheque" && (
            <>
              <Text style={styles.label}>Cheque No.</Text>
              <TextInput
                style={styles.input}
                placeholder="Cheque number"
                placeholderTextColor={Colors.textMuted}
                keyboardType="number-pad"
                value={chequeNo}
                onChangeText={setChequeNo}
              />
            </>
          )}

          <Text style={styles.label}>Narration</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Payment notes / remarks"
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={3}
            value={narration}
            onChangeText={setNarration}
          />
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
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  balanceCard: {
    backgroundColor: Colors.greenBg,
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: Colors.greenLight,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  balanceTotalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.greenLight,
    marginTop: 8,
    paddingTop: 10,
  },
  balanceLabel: { fontSize: Fonts.sm, color: Colors.textSecondary },
  balanceValue: { fontSize: Fonts.sm, fontWeight: "600", color: Colors.text },
  balanceTotalLabel: { fontSize: Fonts.base, fontWeight: "700", color: Colors.textSecondary },
  balanceTotalValue: { fontSize: Fonts.lg, fontWeight: "800" },
  balanceEmpty: { fontSize: Fonts.sm, color: Colors.textMuted, textAlign: "center" },
  modeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 4,
  },
  modeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  modeChipActive: {
    backgroundColor: Colors.green,
    borderColor: Colors.green,
  },
  modeChipText: { fontSize: Fonts.sm, fontWeight: "600", color: Colors.textSecondary },
  modeChipTextActive: { color: "#fff" },
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
