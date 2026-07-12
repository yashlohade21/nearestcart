import { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Modal, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "../../lib/api";
import { Colors, Fonts } from "../../lib/colors";
import LoadingScreen from "../../components/LoadingScreen";
import EmptyState from "../../components/EmptyState";
import { useT } from "../../lib/i18n";

interface Supplier {
  id: string; name: string; phone: string | null; email: string | null;
  village: string | null; district: string | null; state: string | null;
  address: string | null; pan_number: string | null; opening_balance: number | null;
  credit_days: number | null; notes: string | null; is_active: boolean;
}

export default function SuppliersScreen() {
  const t = useT();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]); const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false); const [saving, setSaving] = useState(false);
  const [name, setName] = useState(""); const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(""); const [village, setVillage] = useState("");
  const [district, setDistrict] = useState(""); const [state, setState] = useState("");
  const [address, setAddress] = useState(""); const [panNumber, setPanNumber] = useState("");
  const [openingBalance, setOpeningBalance] = useState(""); const [creditDays, setCreditDays] = useState("");
  const [notes, setNotes] = useState("");

  const fetchSuppliers = useCallback(async () => {
    try { const data = await api<Supplier[]>("/farmers"); setSuppliers(data); }
    catch { Alert.alert(t("error"), t("failedLoadSuppliers")); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);

  const handleCreate = async () => {
    if (!name.trim()) { Alert.alert(t("error"), t("nameRequired")); return; }
    setSaving(true);
    try {
      const body: Record<string, string | number> = { name: name.trim() };
      if (phone.trim()) body.phone = phone.trim();
      if (email.trim()) body.email = email.trim();
      if (village.trim()) body.village = village.trim();
      if (district.trim()) body.district = district.trim();
      if (state.trim()) body.state = state.trim();
      if (address.trim()) body.address = address.trim();
      if (panNumber.trim()) body.pan_number = panNumber.trim().toUpperCase();
      if (openingBalance.trim()) body.opening_balance = parseFloat(openingBalance.trim());
      if (creditDays.trim()) body.credit_days = parseInt(creditDays.trim());
      if (notes.trim()) body.notes = notes.trim();
      await api("/farmers", { method: "POST", body }); setShowModal(false); resetForm(); fetchSuppliers();
    } catch { Alert.alert(t("error"), t("failedCreateSupplier")); } finally { setSaving(false); }
  };

  const handleDelete = (id: string, sName: string) => {
    Alert.alert(t("deleteSupplier"), `${t("archiveConfirm")} "${sName}"?`, [
      { text: t("cancel"), style: "cancel" },
      { text: t("archiveConfirm"), style: "destructive", onPress: async () => { try { await api(`/farmers/${id}`, { method: "DELETE" }); fetchSuppliers(); } catch { Alert.alert(t("error"), t("failedDeleteSupplier")); } } },
    ]);
  };

  const resetForm = () => { setName(""); setPhone(""); setEmail(""); setVillage(""); setDistrict(""); setState(""); setAddress(""); setPanNumber(""); setOpeningBalance(""); setCreditDays(""); setNotes(""); };

  if (loading) return <LoadingScreen />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.greenBg }} edges={["bottom"]}>
    <View style={styles.container}>
      <FlatList data={suppliers} keyExtractor={(item) => item.id} contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState title={t("noSuppliers")} subtitle={t("addFirstSupplier")} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onLongPress={() => handleDelete(item.id, item.name)} activeOpacity={0.7}>
            <Text style={styles.cardName}>{item.name}</Text>
            {item.phone && <Text style={styles.cardSub}>{item.phone}</Text>}
            {item.email && <Text style={styles.cardSub}>{item.email}</Text>}
            {(item.village || item.district) && <Text style={styles.cardSub}>{[item.village, item.district].filter(Boolean).join(", ")}</Text>}
            {item.state && <Text style={styles.cardSub}>{item.state}</Text>}
            {item.pan_number && <Text style={styles.cardSub}>PAN: {item.pan_number}</Text>}
            {item.credit_days ? <Text style={styles.cardSub}>Credit: {item.credit_days} days</Text> : null}
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)} activeOpacity={0.8}>
        <Ionicons name="add" size={28} color={Colors.textWhite} />
      </TouchableOpacity>
      <Modal visible={showModal} animationType="slide" transparent>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}><Text style={styles.modalTitle}>{t("newSupplier")}</Text>
              <TouchableOpacity onPress={() => { setShowModal(false); resetForm(); }}><Ionicons name="close" size={24} color={Colors.textSecondary} /></TouchableOpacity>
            </View>
            <ScrollView>
              <Text style={styles.label}>{t("name")} *</Text><TextInput style={styles.input} value={name} onChangeText={setName} placeholder={t("supplierName")} />
              <Text style={styles.label}>{t("phone")}</Text><TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder={t("phoneNumber")} keyboardType="phone-pad" />
              <Text style={styles.label}>Email</Text><TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="email@example.com" keyboardType="email-address" autoCapitalize="none" />
              <Text style={styles.label}>{t("village")}</Text><TextInput style={styles.input} value={village} onChangeText={setVillage} placeholder={t("villagePlaceholder")} />
              <Text style={styles.label}>{t("district")}</Text><TextInput style={styles.input} value={district} onChangeText={setDistrict} placeholder={t("districtPlaceholder")} />
              <Text style={styles.label}>{t("state")}</Text><TextInput style={styles.input} value={state} onChangeText={setState} placeholder={t("statePlaceholder")} />
              <Text style={styles.label}>{t("address")}</Text><TextInput style={[styles.input, { height: 60 }]} value={address} onChangeText={setAddress} placeholder="Full address" multiline />
              <Text style={styles.label}>PAN Number</Text><TextInput style={styles.input} value={panNumber} onChangeText={setPanNumber} placeholder="ABCDE1234F" autoCapitalize="characters" maxLength={10} />
              <Text style={styles.label}>{t("openingBalance")}</Text><TextInput style={styles.input} value={openingBalance} onChangeText={setOpeningBalance} placeholder="0" keyboardType="decimal-pad" />
              <Text style={styles.label}>Credit Days</Text><TextInput style={styles.input} value={creditDays} onChangeText={setCreditDays} placeholder="e.g. 30" keyboardType="number-pad" />
              <Text style={styles.label}>{t("notes")}</Text><TextInput style={[styles.input, { height: 60 }]} value={notes} onChangeText={setNotes} placeholder={t("optionalNotes")} multiline />
              <TouchableOpacity style={[styles.saveButton, saving && { opacity: 0.6 }]} onPress={handleCreate} disabled={saving}>
                <Text style={styles.saveText}>{saving ? t("saving") : t("addSupplier")}</Text>
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
  cardName: { fontSize: Fonts.base, fontWeight: "700", color: Colors.text, marginBottom: 4 },
  cardSub: { fontSize: Fonts.xs, color: Colors.textSecondary, marginTop: 2 },
  fab: { position: "absolute", right: 20, bottom: 24, width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.green, alignItems: "center", justifyContent: "center", shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" },
  modalContent: { backgroundColor: Colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: "85%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: Fonts.lg, fontWeight: "700", color: Colors.text },
  label: { fontSize: Fonts.sm, fontWeight: "600", color: Colors.textSecondary, marginTop: 12, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: 10, padding: 12, fontSize: Fonts.base, color: Colors.text, backgroundColor: Colors.greenBg },
  saveButton: { backgroundColor: Colors.green, borderRadius: 12, paddingVertical: 16, alignItems: "center", marginTop: 20, marginBottom: 20 },
  saveText: { fontSize: Fonts.base, fontWeight: "700", color: Colors.textWhite },
});
