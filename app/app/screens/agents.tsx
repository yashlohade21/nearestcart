import { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Modal, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "../../lib/api";
import { Colors, Fonts } from "../../lib/colors";
import LoadingScreen from "../../components/LoadingScreen";
import EmptyState from "../../components/EmptyState";
import { useT } from "../../lib/i18n";

interface Agent {
  id: string; name: string; phone: string | null; email: string | null;
  pan_number: string | null; commission_rate: number | null;
  city: string | null; state: string | null; address: string | null;
  notes: string | null; is_active: boolean;
}

export default function AgentsScreen() {
  const t = useT();
  const [agents, setAgents] = useState<Agent[]>([]); const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false); const [saving, setSaving] = useState(false);
  const [name, setName] = useState(""); const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(""); const [panNumber, setPanNumber] = useState("");
  const [commissionRate, setCommissionRate] = useState(""); const [city, setCity] = useState("");
  const [state, setState] = useState(""); const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const fetchAgents = useCallback(async () => {
    try { const data = await api<Agent[]>("/agents"); setAgents(data); }
    catch { Alert.alert(t("error"), t("failedLoadAgents")); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAgents(); }, [fetchAgents]);

  const handleCreate = async () => {
    if (!name.trim()) { Alert.alert(t("error"), t("nameRequired")); return; }
    setSaving(true);
    try {
      const body: Record<string, string | number> = { name: name.trim() };
      if (phone.trim()) body.phone = phone.trim();
      if (email.trim()) body.email = email.trim();
      if (panNumber.trim()) body.pan_number = panNumber.trim().toUpperCase();
      if (commissionRate.trim()) body.commission_rate = parseFloat(commissionRate.trim());
      if (city.trim()) body.city = city.trim();
      if (state.trim()) body.state = state.trim();
      if (address.trim()) body.address = address.trim();
      if (notes.trim()) body.notes = notes.trim();
      await api("/agents", { method: "POST", body }); setShowModal(false); resetForm(); fetchAgents();
    } catch { Alert.alert(t("error"), t("failedCreateAgent")); } finally { setSaving(false); }
  };

  const handleDelete = (id: string, aName: string) => {
    Alert.alert(t("deleteAgent"), `${t("archiveConfirm")} "${aName}"?`, [
      { text: t("cancel"), style: "cancel" },
      { text: t("archiveConfirm"), style: "destructive", onPress: async () => { try { await api(`/agents/${id}`, { method: "DELETE" }); fetchAgents(); } catch { Alert.alert(t("error"), t("failedDeleteAgent")); } } },
    ]);
  };

  const resetForm = () => { setName(""); setPhone(""); setEmail(""); setPanNumber(""); setCommissionRate(""); setCity(""); setState(""); setAddress(""); setNotes(""); };

  if (loading) return <LoadingScreen />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.greenBg }} edges={["bottom"]}>
    <View style={styles.container}>
      <FlatList data={agents} keyExtractor={(item) => item.id} contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState title={t("noAgents")} subtitle={t("addFirstAgent")} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onLongPress={() => handleDelete(item.id, item.name)} activeOpacity={0.7}>
            <View style={styles.cardRow}><Text style={styles.cardName}>{item.name}</Text>
              {item.commission_rate != null && <View style={styles.badge}><Text style={styles.badgeText}>{item.commission_rate}%</Text></View>}
            </View>
            {item.phone && <Text style={styles.cardSub}>{item.phone}</Text>}
            {item.email && <Text style={styles.cardSub}>{item.email}</Text>}
            {(item.city || item.state) && <Text style={styles.cardSub}>{[item.city, item.state].filter(Boolean).join(", ")}</Text>}
            {item.pan_number && <Text style={styles.cardSub}>PAN: {item.pan_number}</Text>}
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)} activeOpacity={0.8}>
        <Ionicons name="add" size={28} color={Colors.textWhite} />
      </TouchableOpacity>
      <Modal visible={showModal} animationType="slide" transparent>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}><Text style={styles.modalTitle}>{t("newAgent")}</Text>
              <TouchableOpacity onPress={() => { setShowModal(false); resetForm(); }}><Ionicons name="close" size={24} color={Colors.textSecondary} /></TouchableOpacity>
            </View>
            <ScrollView>
              <Text style={styles.label}>{t("name")} *</Text><TextInput style={styles.input} value={name} onChangeText={setName} placeholder={t("agentName")} />
              <Text style={styles.label}>{t("phone")}</Text><TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder={t("phoneNumber")} keyboardType="phone-pad" />
              <Text style={styles.label}>Email</Text><TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="email@example.com" keyboardType="email-address" autoCapitalize="none" />
              <Text style={styles.label}>PAN Number</Text><TextInput style={styles.input} value={panNumber} onChangeText={setPanNumber} placeholder="ABCDE1234F" autoCapitalize="characters" maxLength={10} />
              <Text style={styles.label}>{t("commissionRate")}</Text><TextInput style={styles.input} value={commissionRate} onChangeText={setCommissionRate} placeholder={t("commissionRatePlaceholder")} keyboardType="decimal-pad" />
              <Text style={styles.label}>{t("city")}</Text><TextInput style={styles.input} value={city} onChangeText={setCity} placeholder={t("cityName")} />
              <Text style={styles.label}>{t("state")}</Text><TextInput style={styles.input} value={state} onChangeText={setState} placeholder={t("statePlaceholder")} />
              <Text style={styles.label}>{t("address")}</Text><TextInput style={[styles.input, { height: 60 }]} value={address} onChangeText={setAddress} placeholder="Full address" multiline />
              <Text style={styles.label}>{t("notes")}</Text><TextInput style={[styles.input, { height: 60 }]} value={notes} onChangeText={setNotes} placeholder={t("optionalNotes")} multiline />
              <TouchableOpacity style={[styles.saveButton, saving && { opacity: 0.6 }]} onPress={handleCreate} disabled={saving}>
                <Text style={styles.saveText}>{saving ? t("saving") : t("addAgent")}</Text>
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
