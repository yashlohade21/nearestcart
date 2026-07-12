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

interface Kharidar {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
}

export default function KharidarMasterScreen() {
  const t = useT();
  const [kharidars, setKharidars] = useState<Kharidar[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const fetchKharidars = useCallback(async () => {
    try {
      const data = await api<Kharidar[]>("/kharidars");
      setKharidars(data);
    } catch {
      Alert.alert(t("error"), "Failed to load kharidars");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchKharidars(); }, [fetchKharidars]);

  const resetForm = () => {
    setName("");
    setPhone("");
    setAddress("");
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert(t("error"), t("nameRequired"));
      return;
    }
    setSaving(true);
    try {
      const body: Record<string, string> = { name: name.trim() };
      if (phone.trim()) body.phone = phone.trim();
      if (address.trim()) body.address = address.trim();
      await api("/kharidars", { method: "POST", body });
      setShowModal(false);
      resetForm();
      fetchKharidars();
    } catch {
      Alert.alert(t("error"), "Failed to add kharidar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string, kName: string) => {
    Alert.alert(
      "Delete Kharidar",
      `Delete "${kName}"?`,
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("delete"),
          style: "destructive",
          onPress: async () => {
            try {
              await api(`/kharidars/${id}`, { method: "DELETE" });
              fetchKharidars();
            } catch {
              Alert.alert(t("error"), "Failed to delete kharidar");
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
          data={kharidars}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={56} color={Colors.textMuted} />
                <Text style={styles.emptyTitle}>{t("noKharidars")}</Text>
                <Text style={styles.emptySubtitle}>{t("addFirstKharidar")}</Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onLongPress={() => handleDelete(item.id, item.name)}
              activeOpacity={0.75}
            >
              <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  {item.phone && (
                    <Text style={styles.cardSub}>{item.phone}</Text>
                  )}
                  {item.address && (
                    <Text style={styles.cardSub} numberOfLines={1}>{item.address}</Text>
                  )}
                </View>
              </View>
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
                <Text style={styles.modalTitle}>{t("kharidarMaster")}</Text>
                <TouchableOpacity
                  onPress={() => { setShowModal(false); resetForm(); }}
                >
                  <Ionicons name="close" size={24} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.label}>{t("name")} *</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Kharidar name"
                />

                <Text style={styles.label}>{t("phone")}</Text>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder={t("phoneNumber")}
                  keyboardType="phone-pad"
                />

                <Text style={styles.label}>{t("address")}</Text>
                <TextInput
                  style={[styles.input, { height: 70, textAlignVertical: "top" }]}
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Full address"
                  multiline
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
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.greenLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: Fonts.lg,
    fontWeight: "800",
    color: Colors.green,
  },
  cardInfo: { flex: 1 },
  cardName: {
    fontSize: Fonts.base,
    fontWeight: "700",
    color: Colors.text,
  },
  cardSub: { fontSize: Fonts.xs, color: Colors.textSecondary, marginTop: 2 },
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
