import { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Modal, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "../../lib/api";
import { Colors, Fonts } from "../../lib/colors";
import { formatRupees } from "../../components/formatters";
import LoadingScreen from "../../components/LoadingScreen";
import EmptyState from "../../components/EmptyState";
import { useT } from "../../lib/i18n";

interface BankAccount {
  id: string; bank_name: string; account_holder_name: string | null; account_no: string | null;
  account_type: string | null; ifsc_code: string | null; branch: string | null;
  opening_balance: number | null; current_balance: number | null;
  notes: string | null; is_active: boolean;
}

export default function BanksScreen() {
  const t = useT();
  const [banks, setBanks] = useState<BankAccount[]>([]); const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false); const [saving, setSaving] = useState(false);
  const [bankName, setBankName] = useState(""); const [holderName, setHolderName] = useState("");
  const [accountNo, setAccountNo] = useState(""); const [accountType, setAccountType] = useState("current");
  const [ifscCode, setIfscCode] = useState(""); const [branch, setBranch] = useState("");
  const [openingBalance, setOpeningBalance] = useState(""); const [notes, setNotes] = useState("");

  const fetchBanks = useCallback(async () => {
    try { const data = await api<BankAccount[]>("/bank-accounts"); setBanks(data); }
    catch { Alert.alert(t("error"), t("failedLoadBanks")); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchBanks(); }, [fetchBanks]);

  const handleCreate = async () => {
    if (!bankName.trim()) { Alert.alert(t("error"), t("nameRequired")); return; }
    setSaving(true);
    try {
      const body: Record<string, string | number> = { bank_name: bankName.trim() };
      if (holderName.trim()) body.account_holder_name = holderName.trim();
      if (accountNo.trim()) body.account_no = accountNo.trim();
      if (accountType) body.account_type = accountType;
      if (ifscCode.trim()) body.ifsc_code = ifscCode.trim().toUpperCase();
      if (branch.trim()) body.branch = branch.trim();
      if (openingBalance.trim()) body.opening_balance = parseFloat(openingBalance.trim());
      if (notes.trim()) body.notes = notes.trim();
      await api("/bank-accounts", { method: "POST", body }); setShowModal(false); resetForm(); fetchBanks();
    } catch { Alert.alert(t("error"), t("failedCreateBank")); } finally { setSaving(false); }
  };

  const handleDelete = (id: string, bName: string) => {
    Alert.alert(t("deleteBank"), `${t("archiveConfirm")} "${bName}"?`, [
      { text: t("cancel"), style: "cancel" },
      { text: t("archiveConfirm"), style: "destructive", onPress: async () => { try { await api(`/bank-accounts/${id}`, { method: "DELETE" }); fetchBanks(); } catch { Alert.alert(t("error"), t("failedDeleteBank")); } } },
    ]);
  };

  const resetForm = () => { setBankName(""); setHolderName(""); setAccountNo(""); setAccountType("current"); setIfscCode(""); setBranch(""); setOpeningBalance(""); setNotes(""); };

  if (loading) return <LoadingScreen />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.greenBg }} edges={["bottom"]}>
    <View style={styles.container}>
      <FlatList data={banks} keyExtractor={(item) => item.id} contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState title={t("noBanks")} subtitle={t("addFirstBank")} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onLongPress={() => handleDelete(item.id, item.bank_name)} activeOpacity={0.7}>
            <View style={styles.cardRow}>
              <Text style={styles.cardName}>{item.bank_name}</Text>
              {item.account_type && <View style={styles.badge}><Text style={styles.badgeText}>{item.account_type}</Text></View>}
            </View>
            {item.account_holder_name && <Text style={styles.cardSub}>{item.account_holder_name}</Text>}
            {item.account_no && <Text style={styles.cardSub}>A/C: {item.account_no}</Text>}
            {item.ifsc_code && <Text style={styles.cardSub}>IFSC: {item.ifsc_code}</Text>}
            {item.branch && <Text style={styles.cardSub}>{item.branch}</Text>}
            {item.current_balance != null && (
              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabel}>{t("currentBalance")}:</Text>
                <Text style={[styles.balanceText, { color: (item.current_balance ?? 0) >= 0 ? Colors.green : Colors.red }]}>{formatRupees(item.current_balance)}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)} activeOpacity={0.8}>
        <Ionicons name="add" size={28} color={Colors.textWhite} />
      </TouchableOpacity>
      <Modal visible={showModal} animationType="slide" transparent>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}><Text style={styles.modalTitle}>{t("newBank")}</Text>
              <TouchableOpacity onPress={() => { setShowModal(false); resetForm(); }}><Ionicons name="close" size={24} color={Colors.textSecondary} /></TouchableOpacity>
            </View>
            <ScrollView>
              <Text style={styles.label}>{t("bankName")} *</Text><TextInput style={styles.input} value={bankName} onChangeText={setBankName} placeholder={t("bankNamePlaceholder")} />
              <Text style={styles.label}>Account Holder Name</Text><TextInput style={styles.input} value={holderName} onChangeText={setHolderName} placeholder="Account holder name" />
              <Text style={styles.label}>{t("accountNo")}</Text><TextInput style={styles.input} value={accountNo} onChangeText={setAccountNo} placeholder={t("accountNoPlaceholder")} keyboardType="number-pad" />
              <Text style={styles.label}>Account Type</Text>
              <View style={styles.typeRow}>
                {["current", "savings"].map((type) => (
                  <TouchableOpacity key={type} style={[styles.typeBtn, accountType === type && styles.typeBtnActive]} onPress={() => setAccountType(type)}>
                    <Text style={[styles.typeBtnText, accountType === type && styles.typeBtnTextActive]}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.label}>{t("ifscCode")}</Text><TextInput style={styles.input} value={ifscCode} onChangeText={setIfscCode} placeholder={t("ifscCodePlaceholder")} autoCapitalize="characters" />
              <Text style={styles.label}>{t("branch")}</Text><TextInput style={styles.input} value={branch} onChangeText={setBranch} placeholder={t("branchPlaceholder")} />
              <Text style={styles.label}>{t("openingBalance")}</Text><TextInput style={styles.input} value={openingBalance} onChangeText={setOpeningBalance} placeholder={t("openingBalancePlaceholder")} keyboardType="decimal-pad" />
              <Text style={styles.label}>{t("notes")}</Text><TextInput style={[styles.input, { height: 60 }]} value={notes} onChangeText={setNotes} placeholder={t("optionalNotes")} multiline />
              <TouchableOpacity style={[styles.saveButton, saving && { opacity: 0.6 }]} onPress={handleCreate} disabled={saving}>
                <Text style={styles.saveText}>{saving ? t("saving") : t("addBank")}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.greenBg },
  list: { padding: 16, paddingBottom: 80 },
  card: { backgroundColor: Colors.card, borderRadius: 14, padding: 16, marginBottom: 10, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  cardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  cardName: { fontSize: Fonts.base, fontWeight: "700", color: Colors.text },
  cardSub: { fontSize: Fonts.xs, color: Colors.textSecondary, marginTop: 2 },
  badge: { backgroundColor: Colors.greenLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  badgeText: { fontSize: Fonts.xs, fontWeight: "700", color: Colors.green },
  balanceRow: { flexDirection: "row", alignItems: "center", marginTop: 8, gap: 6 },
  balanceLabel: { fontSize: Fonts.xs, color: Colors.textSecondary },
  balanceText: { fontSize: Fonts.base, fontWeight: "800" },
  fab: { position: "absolute", right: 20, bottom: 24, width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.green, alignItems: "center", justifyContent: "center", shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" },
  modalContent: { backgroundColor: Colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: "85%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: Fonts.lg, fontWeight: "700", color: Colors.text },
  label: { fontSize: Fonts.sm, fontWeight: "600", color: Colors.textSecondary, marginTop: 12, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: 10, padding: 12, fontSize: Fonts.base, color: Colors.text, backgroundColor: Colors.greenBg },
  typeRow: { flexDirection: "row", gap: 10 },
  typeBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, alignItems: "center", backgroundColor: Colors.greenBg },
  typeBtnActive: { borderColor: Colors.green, backgroundColor: Colors.greenLight },
  typeBtnText: { fontSize: Fonts.base, color: Colors.textSecondary, fontWeight: "600" },
  typeBtnTextActive: { color: Colors.green },
  saveButton: { backgroundColor: Colors.green, borderRadius: 12, paddingVertical: 16, alignItems: "center", marginTop: 20, marginBottom: 20 },
  saveText: { fontSize: Fonts.base, fontWeight: "700", color: Colors.textWhite },
});
