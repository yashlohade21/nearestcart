import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts } from "../../lib/colors";
import { useT } from "../../lib/i18n";
import api from "../../lib/api";

interface DeliveryPlace {
  id: string;
  place_name: string;
  district: string | null;
  state: string | null;
}

export default function DeliveryPlacesScreen() {
  const t = useT();
  const [places, setPlaces] = useState<DeliveryPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [placeName, setPlaceName] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");

  const fetchPlaces = useCallback(async () => {
    try {
      const data = await api<DeliveryPlace[]>("/delivery-places");
      setPlaces(data);
    } catch {
      Alert.alert(t("error"), "Failed to load delivery places");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPlaces(); }, [fetchPlaces]);

  const resetForm = () => {
    setPlaceName("");
    setDistrict("");
    setState("");
  };

  const handleCreate = async () => {
    if (!placeName.trim()) {
      Alert.alert(t("error"), `${t("placeName")} is required`);
      return;
    }
    setSaving(true);
    try {
      const body: Record<string, string> = { place_name: placeName.trim() };
      if (district.trim()) body.district = district.trim();
      if (state.trim()) body.state = state.trim();
      await api("/delivery-places", { method: "POST", body });
      setShowModal(false);
      resetForm();
      fetchPlaces();
    } catch {
      Alert.alert(t("error"), "Failed to add delivery place");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      "Delete Place",
      `Delete "${name}"?`,
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("delete"),
          style: "destructive",
          onPress: async () => {
            try {
              await api(`/delivery-places/${id}`, { method: "DELETE" });
              fetchPlaces();
            } catch {
              Alert.alert(t("error"), "Failed to delete place");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.greenBg }} edges={["bottom"]}>
      <View style={styles.container}>
        <FlatList
          data={places}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyState}>
                <Ionicons name="location-outline" size={56} color={Colors.textMuted} />
                <Text style={styles.emptyTitle}>No delivery places</Text>
                <Text style={styles.emptySubtitle}>Add your first delivery location</Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onLongPress={() => handleDelete(item.id, item.place_name)}
              activeOpacity={0.75}
            >
              <View style={styles.cardHeader}>
                <Ionicons name="location" size={18} color={Colors.green} style={{ marginRight: 8 }} />
                <Text style={styles.placeName}>{item.place_name}</Text>
              </View>
              {(item.district || item.state) && (
                <Text style={styles.cardSub}>
                  {[item.district, item.state].filter(Boolean).join(", ")}
                </Text>
              )}
              <Text style={styles.longPressHint}>Long press to delete</Text>
            </TouchableOpacity>
          )}
        />

        {/* FAB */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowModal(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color={Colors.textWhite} />
        </TouchableOpacity>

        {/* Add Modal */}
        <Modal visible={showModal} animationType="slide" transparent>
          <KeyboardAvoidingView
            style={styles.modalOverlay}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t("deliveryPlaces")}</Text>
                <TouchableOpacity
                  onPress={() => { setShowModal(false); resetForm(); }}
                >
                  <Ionicons name="close" size={24} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.label}>{t("placeName")} *</Text>
                <TextInput
                  style={styles.input}
                  value={placeName}
                  onChangeText={setPlaceName}
                  placeholder="e.g. Indore Mandi, Ujjain"
                />

                <Text style={styles.label}>{t("district")}</Text>
                <TextInput
                  style={styles.input}
                  value={district}
                  onChangeText={setDistrict}
                  placeholder={t("districtPlaceholder")}
                />

                <Text style={styles.label}>{t("state")}</Text>
                <TextInput
                  style={styles.input}
                  value={state}
                  onChangeText={setState}
                  placeholder={t("statePlaceholder")}
                />

                <TouchableOpacity
                  style={[styles.saveButton, saving && { opacity: 0.6 }]}
                  onPress={handleCreate}
                  disabled={saving}
                >
                  <Text style={styles.saveText}>{saving ? t("saving") : t("add")}</Text>
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
  list: { padding: 16, paddingBottom: 100 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  placeName: {
    fontSize: Fonts.base,
    fontWeight: "700",
    color: Colors.text,
    flex: 1,
  },
  cardSub: { fontSize: Fonts.xs, color: Colors.textSecondary, marginTop: 2, marginLeft: 26 },
  longPressHint: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 8,
    textAlign: "right",
    fontStyle: "italic",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: Fonts.lg,
    fontWeight: "700",
    color: Colors.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: Fonts.sm,
    color: Colors.textMuted,
    marginTop: 6,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.green,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: { fontSize: Fonts.lg, fontWeight: "700", color: Colors.text },
  label: {
    fontSize: Fonts.sm,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: Fonts.base,
    color: Colors.text,
    backgroundColor: Colors.greenBg,
  },
  saveButton: {
    backgroundColor: Colors.green,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  saveText: { fontSize: Fonts.base, fontWeight: "700", color: Colors.textWhite },
});
