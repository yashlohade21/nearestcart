import { useState } from "react";
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

type EntryType = "receipt" | "payment";
type PartyType = "farmer" | "buyer" | "agent" | "other";

const ENTRY_TYPES: { value: EntryType; label: string; icon: string; color: string }[] = [
  { value: "receipt", label: "Receipt", icon: "arrow-down-circle-outline", color: Colors.green },
  { value: "payment", label: "Payment", icon: "arrow-up-circle-outline", color: Colors.red },
];

const PARTY_TYPES: { value: PartyType; label: string }[] = [
  { value: "farmer", label: "Farmer" },
  { value: "buyer", label: "Buyer" },
  { value: "agent", label: "Agent" },
  { value: "other", label: "Other" },
];

export default function CashEntryScreen() {
  const t = useT();

  const [entryDate, setEntryDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [entryType, setEntryType] = useState<EntryType>("receipt");
  const [narration, setNarration] = useState("");
  const [amount, setAmount] = useState("");
  const [partyName, setPartyName] = useState("");
  const [partyType, setPartyType] = useState<PartyType>("other");
  const [referenceNo, setReferenceNo] = useState("");

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert(t("error"), t("validAmountError"));
      return;
    }
    if (!narration.trim()) {
      Alert.alert(t("error"), "Please enter narration");
      return;
    }

    setSaving(true);
    try {
      await api("/cash-book", {
        method: "POST",
        body: {
          entry_date: entryDate,
          type: entryType,
          narration: narration.trim(),
          amount: parseFloat(amount),
          party_name: partyName.trim() || null,
          party_type: partyType,
          reference_no: referenceNo.trim() || null,
        },
      });
      Alert.alert(t("done"), "Cash entry saved!", [
        { text: t("ok"), onPress: () => router.back() },
      ]);
    } catch (err: unknown) {
      Alert.alert(t("error"), err instanceof Error ? err.message : "Failed to save cash entry");
    } finally {
      setSaving(false);
    }
  };

  const isReceipt = entryType === "receipt";

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
          {/* Entry Type Toggle */}
          <View style={styles.typeToggleRow}>
            {ENTRY_TYPES.map((et) => {
              const active = entryType === et.value;
              return (
                <TouchableOpacity
                  key={et.value}
                  style={[
                    styles.typeToggleBtn,
                    active && { backgroundColor: et.color, borderColor: et.color },
                  ]}
                  onPress={() => setEntryType(et.value)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={et.icon as "arrow-down-circle-outline" | "arrow-up-circle-outline"}
                    size={20}
                    color={active ? "#fff" : Colors.textSecondary}
                  />
                  <Text style={[styles.typeToggleBtnText, active && { color: "#fff" }]}>
                    {et.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Amount highlight */}
          <View
            style={[
              styles.amountHighlight,
              { backgroundColor: isReceipt ? Colors.greenBg : Colors.redBg },
            ]}
          >
            <Text style={styles.amountHighlightLabel}>
              {isReceipt ? "Amount Received" : "Amount Paid"}
            </Text>
            <Text
              style={[
                styles.amountHighlightValue,
                { color: isReceipt ? Colors.green : Colors.red },
              ]}
            >
              {amount
                ? `₹${new Intl.NumberFormat("en-IN").format(parseFloat(amount) || 0)}`
                : "₹0"}
            </Text>
          </View>

          {/* Date */}
          <Text style={styles.label}>Date</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={Colors.textMuted}
            value={entryDate}
            onChangeText={setEntryDate}
          />

          {/* Amount */}
          <Text style={styles.label}>{t("amount")} (₹)</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor={Colors.textMuted}
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
          />

          {/* Narration */}
          <Text style={styles.label}>Narration</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe this cash transaction..."
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={3}
            value={narration}
            onChangeText={setNarration}
          />

          {/* Party Details */}
          <Text style={styles.sectionHeader}>Party Details</Text>

          <Text style={styles.label}>Party Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter party name"
            placeholderTextColor={Colors.textMuted}
            value={partyName}
            onChangeText={setPartyName}
          />

          <Text style={styles.label}>Party Type</Text>
          <View style={styles.partyTypeGrid}>
            {PARTY_TYPES.map((pt) => {
              const active = partyType === pt.value;
              return (
                <TouchableOpacity
                  key={pt.value}
                  style={[styles.partyTypeChip, active && styles.partyTypeChipActive]}
                  onPress={() => setPartyType(pt.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[styles.partyTypeChipText, active && styles.partyTypeChipTextActive]}
                  >
                    {pt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Reference */}
          <Text style={styles.label}>Reference No.</Text>
          <TextInput
            style={styles.input}
            placeholder="Cheque / UTR / Transaction ID"
            placeholderTextColor={Colors.textMuted}
            value={referenceNo}
            onChangeText={setReferenceNo}
          />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.saveBtn,
              { backgroundColor: isReceipt ? Colors.green : Colors.red },
              saving && { opacity: 0.6 },
            ]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons
                  name={isReceipt ? "arrow-down-circle" : "arrow-up-circle"}
                  size={20}
                  color="#fff"
                />
                <Text style={styles.saveBtnText}>
                  {isReceipt ? "Save Receipt" : "Save Payment"}
                </Text>
              </>
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
  sectionHeader: {
    fontSize: Fonts.xs,
    fontWeight: "700",
    color: Colors.textSecondary,
    marginTop: 20,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  typeToggleRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  typeToggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  typeToggleBtnText: {
    fontSize: Fonts.base,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  amountHighlight: {
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 4,
    marginTop: 8,
  },
  amountHighlightLabel: {
    fontSize: Fonts.sm,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  amountHighlightValue: {
    fontSize: Fonts["2xl"],
    fontWeight: "800",
  },
  partyTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 4,
  },
  partyTypeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  partyTypeChipActive: {
    backgroundColor: Colors.green,
    borderColor: Colors.green,
  },
  partyTypeChipText: { fontSize: Fonts.sm, fontWeight: "600", color: Colors.textSecondary },
  partyTypeChipTextActive: { color: "#fff" },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.card,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 10,
  },
  saveBtnText: { color: "#fff", fontSize: Fonts.base, fontWeight: "700" },
});
