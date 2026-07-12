import { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Modal, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "../../lib/api";
import { Colors, Fonts } from "../../lib/colors";
import LoadingScreen from "../../components/LoadingScreen";
import EmptyState from "../../components/EmptyState";
import { useT } from "../../lib/i18n";

interface Transporter {
  id: string; name: string; phone: string | null; vehicle_type: string | null;
  vehicle_number: string | null; base_city: string | null; total_trips: number;
  rating: number | null; notes: string | null; is_active: boolean;
}

export default function TransportersScreen() {
  const t = useT();
  const [transporters, setTransporters] = useState<Transporter[]>([]); const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false); const [name, setName] = useState(""); const [phone, setPhone] = useState("");
  const [vehicleType, setVehicleType] = useState(""); const [vehicleNumber, setVehicleNumber] = useState("");
  const [baseCity, setBaseCity] = useState(""); const [notes, setNotes] = useState(""); const [saving, setSaving] = useState(false);

  const fetchTransporters = useCallback(async () => {
    try { const data = await api<Transporter[]>("/transporters"); setTransporters(data); }
    catch { Alert.alert(t("error"), t("failedLoadTransporters")); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTransporters(); }, [fetchTransporters]);

  const handleCreate = async () => {
    if (!name.trim()) { Alert.alert(t("error"), t("nameRequired")); return; }
    setSaving(true);
    try {
      const body: Record<string, string> = { name: name.trim() };
      if (phone.trim()) body.phone = phone.trim(); if (vehicleType.trim()) body.vehicle_type = vehicleType.trim();
      if (vehicleNumber.trim()) body.vehicle_number = vehicleNumber.trim(); if (baseCity.trim()) body.base_city = baseCity.trim();
      if (notes.trim()) body.notes = notes.trim();
      await api("/transporters", { method: "POST", body }); setShowModal(false); resetForm(); fetchTransporters();
    } catch { Alert.alert(t("error"), t("failedCreateTransporter")); } finally { setSaving(false); }
  };

  const handleDelete = (id: string, tName: string) => {
    Alert.alert(t("deleteTransporter"), `${t("archiveConfirm")} "${tName}"?`, [
      { text: t("cancel"), style: "cancel" },
      { text: t("archiveConfirm"), style: "destructive", onPress: async () => { try { await api(`/transporters/${id}`, { method: "DELETE" }); fetchTransporters(); } catch { Alert.alert(t("error"), t("failedDeleteTransporter")); } } },
    ]);
  };

  const resetForm = () => { setName(""); setPhone(""); setVehicleType(""); setVehicleNumber(""); setBaseCity(""); setNotes(""); };

  if (loading) return <LoadingScreen />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.greenBg }} edges={["bottom"]}>
    <View style={styles.container}>
      <FlatList data={transporters} keyExtractor={(item) => item.id} contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState title={t("noTransporters")} subtitle={t("addFirstTransporter")} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onLongPress={() => handleDelete(item.id, item.name)} activeOpacity={0.7}>
            <View style={styles.cardRow}><Text style={styles.cardName}>{item.name}</Text>
              {item.rating && <View style={styles.ratingBadge}><Ionicons name="star" size={12} color={Colors.amber} /><Text style={styles.ratingText}>{item.rating}</Text></View>}
            </View>
            {item.vehicle_number && <Text style={styles.cardSub}>{item.vehicle_type ? `${item.vehicle_type} · ` : ""}{item.vehicle_number}</Text>}
            {item.phone && <Text style={styles.cardSub}>{item.phone}</Text>}
            {item.base_city && <Text style={styles.cardSub}>{item.base_city}</Text>}
            <Text style={styles.cardSub}>{item.total_trips} {t("trips")}</Text>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)} activeOpacity={0.8}>
        <Ionicons name="add" size={28} color={Colors.textWhite} />
      </TouchableOpacity>
      <Modal visible={showModal} animationType="slide" transparent>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}><Text style={styles.modalTitle}>{t("newTransporter")}</Text>
              <TouchableOpacity onPress={() => { setShowModal(false); resetForm(); }}><Ionicons name="close" size={24} color={Colors.textSecondary} /></TouchableOpacity>
            </View>
            <ScrollView>
              <Text style={styles.label}>{t("name")} *</Text><TextInput style={styles.input} value={name} onChangeText={setName} placeholder={t("transporterName")} />
              <Text style={styles.label}>{t("phone")}</Text><TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder={t("phoneNumber")} keyboardType="phone-pad" />
              <Text style={styles.label}>{t("vehicleType")}</Text><TextInput style={styles.input} value={vehicleType} onChangeText={setVehicleType} placeholder={t("vehicleTypePlaceholder")} />
              <Text style={styles.label}>{t("vehicleNumber")}</Text><TextInput style={styles.input} value={vehicleNumber} onChangeText={setVehicleNumber} placeholder={t("vehicleNumberPlaceholder")} autoCapitalize="characters" />
              <Text style={styles.label}>{t("baseCity")}</Text><TextInput style={styles.input} value={baseCity} onChangeText={setBaseCity} placeholder={t("cityName")} />
              <Text style={styles.label}>{t("notes")}</Text><TextInput style={[styles.input, { height: 60 }]} value={notes} onChangeText={setNotes} placeholder={t("optionalNotes")} multiline />
              <TouchableOpacity style={[styles.saveButton, saving && { opacity: 0.6 }]} onPress={handleCreate} disabled={saving}>
                <Text style={styles.saveText}>{saving ? t("saving") : t("addTransporter")}</Text>
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
  ratingBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: Colors.amberLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  ratingText: { fontSize: Fonts.xs, fontWeight: "700", color: Colors.amber },
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
