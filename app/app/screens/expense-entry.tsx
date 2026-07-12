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
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Colors, Fonts } from "../../lib/colors";
import { useT } from "../../lib/i18n";
import api from "../../lib/api";

interface BankAccount {
  id: string;
  bank_name: string;
  account_no: string;
}

const EXPENSE_CATEGORIES = [
  "Office",
  "Transport",
  "Labour",
  "Market Fees",
  "Other",
] as const;

const PAYMENT_MODES = ["cash", "bank", "cheque"] as const;
type PaymentMode = typeof PAYMENT_MODES[number];

export default function ExpenseEntryScreen() {
  const t = useT();

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [expenseDate, setExpenseDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [category, setCategory] = useState<string>("");
  const [narration, setNarration] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("cash");
  const [bankAccountId, setBankAccountId] = useState("");
  const [chequeNo, setChequeNo] = useState("");
  const [partyName, setPartyName] = useState("");
  const [farmerBillRef, setFarmerBillRef] = useState("");
  const [saving, setSaving] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showBankPicker, setShowBankPicker] = useState(false);

  useEffect(() => {
    api<BankAccount[]>("/bank-accounts")
      .then(setBankAccounts)
      .catch(() => {});
  }, []);

  const selectedBank = bankAccounts.find((b) => b.id === bankAccountId);
  const showBankField = paymentMode === "bank";
  const showChequeField = paymentMode === "cheque" || paymentMode === "bank";

  const handleSubmit = async () => {
    if (!category) {
      Alert.alert(t("error"), "Please select an expense category");
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert(t("error"), t("invalidAmount"));
      return;
    }
    if (paymentMode === "bank" && !bankAccountId) {
      Alert.alert(t("error"), "Please select a bank account");
      return;
    }
    setSaving(true);
    try {
      const body: Record<string, string | number> = {
        expense_date: expenseDate.toISOString().split("T")[0],
        category,
        amount: parsedAmount,
        payment_mode: paymentMode,
      };
      if (narration.trim()) body.narration = narration.trim();
      if (partyName.trim()) body.party_name = partyName.trim();
      if (farmerBillRef.trim()) body.farmer_bill_ref = farmerBillRef.trim();
      if (bankAccountId) body.bank_account_id = bankAccountId;
      if (chequeNo.trim()) body.cheque_no = chequeNo.trim();
      await api("/expenses", { method: "POST", body });
      Alert.alert(t("success"), t("done"), [
        { text: t("ok"), onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert(t("error"), "Failed to save expense");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.greenBg }} edges={["bottom"]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll}>

          {/* Date + Category */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t("expenseEntry")}</Text>

            <Text style={styles.label}>Expense Date *</Text>
            <TouchableOpacity
              style={styles.dateBtn}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="calendar-outline" size={18} color={Colors.green} />
              <Text style={styles.dateText}>{expenseDate.toISOString().split("T")[0]}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={expenseDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(_, d) => {
                  setShowDatePicker(false);
                  if (d) setExpenseDate(d);
                }}
              />
            )}

            <Text style={styles.label}>{t("expenseCategory")} *</Text>
            <TouchableOpacity
              style={styles.pickerBtn}
              onPress={() => setShowCategoryPicker(!showCategoryPicker)}
              activeOpacity={0.7}
            >
              <Text style={[styles.pickerText, !category && { color: Colors.textMuted }]}>
                {category || "Select category"}
              </Text>
              <Ionicons name="chevron-down" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
            {showCategoryPicker && (
              <View style={styles.dropdownList}>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.dropdownItem,
                      category === cat && styles.dropdownItemSelected,
                    ]}
                    onPress={() => {
                      setCategory(cat);
                      setShowCategoryPicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        category === cat && { color: Colors.green, fontWeight: "700" },
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Amount + Narration */}
          <View style={styles.card}>
            <Text style={styles.label}>{t("amount")} *</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="0"
              keyboardType="decimal-pad"
            />

            <Text style={styles.label}>{t("narration")}</Text>
            <TextInput
              style={[styles.input, { height: 70, textAlignVertical: "top" }]}
              value={narration}
              onChangeText={setNarration}
              placeholder="Description / narration"
              multiline
            />

            <Text style={styles.label}>{t("partyName")}</Text>
            <TextInput
              style={styles.input}
              value={partyName}
              onChangeText={setPartyName}
              placeholder="Vendor / party name"
            />

            <Text style={styles.label}>Farmer Bill Ref</Text>
            <TextInput
              style={styles.input}
              value={farmerBillRef}
              onChangeText={setFarmerBillRef}
              placeholder="Farmer bill reference (optional)"
            />
          </View>

          {/* Payment Mode */}
          <View style={styles.card}>
            <Text style={styles.label}>{t("paymentMode")}</Text>
            <View style={styles.modeRow}>
              {PAYMENT_MODES.map((mode) => (
                <TouchableOpacity
                  key={mode}
                  style={[
                    styles.modeBtn,
                    paymentMode === mode && { backgroundColor: Colors.green },
                  ]}
                  onPress={() => {
                    setPaymentMode(mode);
                    if (mode !== "bank") setBankAccountId("");
                    if (mode === "cash") setChequeNo("");
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.modeBtnText,
                      paymentMode === mode && { color: Colors.textWhite, fontWeight: "700" },
                    ]}
                  >
                    {mode === "cash" ? t("cash") : mode === "bank" ? t("bankTransfer") : t("cheque")}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {showBankField && (
              <>
                <Text style={styles.label}>Bank Account *</Text>
                <TouchableOpacity
                  style={styles.pickerBtn}
                  onPress={() => setShowBankPicker(!showBankPicker)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pickerText, !selectedBank && { color: Colors.textMuted }]}>
                    {selectedBank
                      ? `${selectedBank.bank_name} — ${selectedBank.account_no}`
                      : "Select bank account"}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color={Colors.textMuted} />
                </TouchableOpacity>
                {showBankPicker && (
                  <View style={styles.dropdownList}>
                    {bankAccounts.length === 0 ? (
                      <Text style={styles.dropdownEmpty}>No bank accounts found</Text>
                    ) : (
                      bankAccounts.map((b) => (
                        <TouchableOpacity
                          key={b.id}
                          style={[
                            styles.dropdownItem,
                            bankAccountId === b.id && styles.dropdownItemSelected,
                          ]}
                          onPress={() => {
                            setBankAccountId(b.id);
                            setShowBankPicker(false);
                          }}
                        >
                          <Text
                            style={[
                              styles.dropdownItemText,
                              bankAccountId === b.id && { color: Colors.green, fontWeight: "700" },
                            ]}
                          >
                            {b.bank_name} — {b.account_no}
                          </Text>
                        </TouchableOpacity>
                      ))
                    )}
                  </View>
                )}
              </>
            )}

            {showChequeField && (
              <>
                <Text style={styles.label}>{t("chequeNo")}</Text>
                <TextInput
                  style={styles.input}
                  value={chequeNo}
                  onChangeText={setChequeNo}
                  placeholder="Cheque number"
                  keyboardType="default"
                />
              </>
            )}
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={saving}
            activeOpacity={0.7}
          >
            <Ionicons name="checkmark-circle" size={22} color={Colors.textWhite} />
            <Text style={styles.saveBtnText}>{saving ? t("saving") : t("save")}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.greenBg },
  scroll: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: Fonts.lg,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  label: {
    fontSize: Fonts.sm,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.greenBg,
    borderRadius: 10,
    padding: 12,
    fontSize: Fonts.base,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.greenBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
  },
  pickerText: { fontSize: Fonts.base, color: Colors.text, flex: 1 },
  dropdownList: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 4,
    overflow: "hidden",
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  dropdownItemSelected: { backgroundColor: Colors.greenBg },
  dropdownItemText: { fontSize: Fonts.base, color: Colors.text },
  dropdownEmpty: {
    padding: 12,
    fontSize: Fonts.sm,
    color: Colors.textMuted,
    textAlign: "center",
  },
  dateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.greenBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
  },
  dateText: { fontSize: Fonts.base, color: Colors.text, fontWeight: "500" },
  modeRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: Colors.greenBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modeBtnText: { fontSize: Fonts.sm, color: Colors.textSecondary },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.green,
    borderRadius: 14,
    paddingVertical: 16,
    gap: 8,
  },
  saveBtnText: { color: Colors.textWhite, fontSize: Fonts.lg, fontWeight: "700" },
});
