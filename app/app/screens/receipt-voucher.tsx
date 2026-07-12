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
import { Colors, Fonts } from "../../lib/colors";
import { useT } from "../../lib/i18n";
import { offlineGet } from "../../lib/offline-api";
import EntityPicker, { Entity } from "../../components/EntityPicker";
import api from "../../lib/api";

const PAYMENT_MODES = ["Cash", "UPI", "Bank Transfer", "Cheque"];

export default function ReceiptVoucherScreen() {
  const t = useT();

  const [buyers, setBuyers] = useState<Entity[]>([]);
  const [buyerId, setBuyerId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [referenceNo, setReferenceNo] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    offlineGet<Entity[]>("/buyers").then(setBuyers).catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!buyerId || !amount) {
      Alert.alert(t("error"), "Please select customer and enter amount");
      return;
    }
    setSaving(true);
    try {
      await api("/payments", {
        method: "POST",
        body: {
          direction: "incoming",
          buyer_id: buyerId,
          amount: parseFloat(amount),
          payment_mode: paymentMode,
          reference_no: referenceNo || undefined,
          payment_date: new Date().toISOString().split("T")[0],
          notes: notes || undefined,
        },
      });
      Alert.alert(t("success"), t("receiptSaved"), [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert(t("error"), e.message || t("failedSaveReceipt"));
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
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Ionicons name="arrow-down-circle" size={24} color={Colors.green} />
            <Text style={styles.headerTitle}>{t("receiptVoucher")}</Text>
          </View>

          <EntityPicker
            label={t("selectCustomer")}
            placeholder={t("selectCustomer")}
            items={buyers}
            selectedId={buyerId}
            onSelect={(id) => setBuyerId(id)}
            onAddNew={() => {}}
            addLabel={t("addCustomer")}
          />

          <Text style={styles.label}>{t("enterAmount")}</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />

          <Text style={styles.label}>{t("paymentMode")}</Text>
          <View style={styles.pillRow}>
            {PAYMENT_MODES.map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[styles.pill, paymentMode === mode && styles.pillActive]}
                onPress={() => setPaymentMode(mode)}
              >
                <Text
                  style={[
                    styles.pillText,
                    paymentMode === mode && styles.pillTextActive,
                  ]}
                >
                  {mode}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>{t("referenceNo")}</Text>
          <TextInput
            style={styles.input}
            placeholder={t("referenceNoPlaceholder")}
            value={referenceNo}
            onChangeText={setReferenceNo}
          />

          <Text style={styles.label}>{t("notes")}</Text>
          <TextInput
            style={[styles.input, { height: 60, textAlignVertical: "top" }]}
            placeholder={t("notes")}
            multiline
            value={notes}
            onChangeText={setNotes}
          />

          {amount ? (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{t("totalReceipts")}</Text>
              <Text style={[styles.totalValue, { color: Colors.green }]}>
                ₹{parseFloat(amount).toLocaleString("en-IN")}
              </Text>
            </View>
          ) : null}
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave}
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: Fonts.xl,
    fontWeight: "700",
    color: Colors.text,
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
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.greenBg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillActive: {
    backgroundColor: Colors.green,
    borderColor: Colors.green,
  },
  pillText: {
    fontSize: Fonts.sm,
    color: Colors.text,
    fontWeight: "500",
  },
  pillTextActive: {
    color: Colors.textWhite,
    fontWeight: "700",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  totalLabel: { fontSize: Fonts.base, fontWeight: "600", color: Colors.text },
  totalValue: { fontSize: Fonts.xl, fontWeight: "800" },
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
