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

const TXN_TYPES = ["deposit", "withdrawal"] as const;
type TxnType = typeof TXN_TYPES[number];

export default function BankTxnScreen() {
  const t = useT();

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [bankAccountId, setBankAccountId] = useState("");
  const [txnDate, setTxnDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [type, setType] = useState<TxnType>("deposit");
  const [amount, setAmount] = useState("");
  const [partyName, setPartyName] = useState("");
  const [chequeNo, setChequeNo] = useState("");
  const [chequeDate, setChequeDate] = useState(new Date());
  const [showChequeDatePicker, setShowChequeDatePicker] = useState(false);
  const [narration, setNarration] = useState("");
  const [saving, setSaving] = useState(false);
  const [showBankPicker, setShowBankPicker] = useState(false);
  const [showChequeDateField, setShowChequeDateField] = useState(false);

  useEffect(() => {
    api<BankAccount[]>("/bank-accounts")
      .then(setBankAccounts)
      .catch(() => {});
  }, []);

  const selectedBank = bankAccounts.find((b) => b.id === bankAccountId);

  const handleSubmit = async () => {
    if (!bankAccountId) {
      Alert.alert(t("error"), "Please select a bank account");
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert(t("error"), t("invalidAmount"));
      return;
    }
    setSaving(true);
    try {
      const body: Record<string, string | number> = {
        bank_account_id: bankAccountId,
        txn_date: txnDate.toISOString().split("T")[0],
        type,
        amount: parsedAmount,
      };
      if (partyName.trim()) body.party_name = partyName.trim();
      if (chequeNo.trim()) body.cheque_no = chequeNo.trim();
      if (chequeNo.trim() && showChequeDateField) {
        body.cheque_date = chequeDate.toISOString().split("T")[0];
      }
      if (narration.trim()) body.narration = narration.trim();
      await api("/bank-transactions", { method: "POST", body });
      Alert.alert(t("success"), t("done"), [
        { text: t("ok"), onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert(t("error"), "Failed to save bank transaction");
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

          {/* Bank Account Picker */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t("headerBankTxn")}</Text>

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
          </View>

          {/* Transaction Details */}
          <View style={styles.card}>
            <Text style={styles.label}>{t("deposit")} / {t("withdrawal")}</Text>
            <View style={styles.toggleRow}>
              {TXN_TYPES.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.toggleBtn,
                    type === opt && {
                      backgroundColor: opt === "deposit" ? Colors.green : Colors.red,
                    },
                  ]}
                  onPress={() => setType(opt)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      type === opt && { color: Colors.textWhite, fontWeight: "700" },
                    ]}
                  >
                    {opt === "deposit" ? t("deposit") : t("withdrawal")}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Transaction Date *</Text>
            <TouchableOpacity
              style={styles.dateBtn}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="calendar-outline" size={18} color={Colors.green} />
              <Text style={styles.dateText}>{txnDate.toISOString().split("T")[0]}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={txnDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(_, d) => {
                  setShowDatePicker(false);
                  if (d) setTxnDate(d);
                }}
              />
            )}

            <Text style={styles.label}>{t("amount")} *</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="0"
              keyboardType="decimal-pad"
            />

            <Text style={styles.label}>{t("partyName")}</Text>
            <TextInput
              style={styles.input}
              value={partyName}
              onChangeText={setPartyName}
              placeholder="Party / person name"
            />

            <Text style={styles.label}>{t("chequeNo")}</Text>
            <TextInput
              style={styles.input}
              value={chequeNo}
              onChangeText={(v) => {
                setChequeNo(v);
                setShowChequeDateField(v.trim().length > 0);
              }}
              placeholder="Cheque number (optional)"
              keyboardType="default"
            />

            {showChequeDateField && (
              <>
                <Text style={styles.label}>{t("chequeDate")}</Text>
                <TouchableOpacity
                  style={styles.dateBtn}
                  onPress={() => setShowChequeDatePicker(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="calendar-outline" size={18} color={Colors.green} />
                  <Text style={styles.dateText}>{chequeDate.toISOString().split("T")[0]}</Text>
                </TouchableOpacity>
                {showChequeDatePicker && (
                  <DateTimePicker
                    value={chequeDate}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(_, d) => {
                      setShowChequeDatePicker(false);
                      if (d) setChequeDate(d);
                    }}
                  />
                )}
              </>
            )}

            <Text style={styles.label}>{t("narration")}</Text>
            <TextInput
              style={[styles.input, { height: 70, textAlignVertical: "top" }]}
              value={narration}
              onChangeText={setNarration}
              placeholder="Optional narration / remarks"
              multiline
            />
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
  toggleRow: {
    flexDirection: "row",
    backgroundColor: Colors.greenBg,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 9,
  },
  toggleText: { fontSize: Fonts.sm, color: Colors.textSecondary },
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
