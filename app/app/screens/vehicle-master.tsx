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

interface Vehicle {
  id: string;
  vehicle_no: string;
  owner_name: string | null;
  driver_name: string | null;
  phone: string | null;
  vehicle_type: string | null;
}

const VEHICLE_TYPES = ["Truck", "Tempo", "Pickup", "Tractor"] as const;

export default function VehicleMasterScreen() {
  const t = useT();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [vehicleNo, setVehicleNo] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [driverName, setDriverName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [showTypePicker, setShowTypePicker] = useState(false);

  const fetchVehicles = useCallback(async () => {
    try {
      const data = await api<Vehicle[]>("/vehicles");
      setVehicles(data);
    } catch {
      Alert.alert(t("error"), "Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

  const resetForm = () => {
    setVehicleNo("");
    setOwnerName("");
    setDriverName("");
    setPhone("");
    setVehicleType("");
    setShowTypePicker(false);
  };

  const handleCreate = async () => {
    if (!vehicleNo.trim()) {
      Alert.alert(t("error"), "Vehicle number is required");
      return;
    }
    setSaving(true);
    try {
      const body: Record<string, string> = { vehicle_no: vehicleNo.trim().toUpperCase() };
      if (ownerName.trim()) body.owner_name = ownerName.trim();
      if (driverName.trim()) body.driver_name = driverName.trim();
      if (phone.trim()) body.phone = phone.trim();
      if (vehicleType) body.vehicle_type = vehicleType;
      await api("/vehicles", { method: "POST", body });
      setShowModal(false);
      resetForm();
      fetchVehicles();
    } catch {
      Alert.alert(t("error"), "Failed to add vehicle");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string, vNo: string) => {
    Alert.alert(
      "Delete Vehicle",
      `Delete vehicle "${vNo}"?`,
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("delete"),
          style: "destructive",
          onPress: async () => {
            try {
              await api(`/vehicles/${id}`, { method: "DELETE" });
              fetchVehicles();
            } catch {
              Alert.alert(t("error"), "Failed to delete vehicle");
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
          data={vehicles}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyState}>
                <Ionicons name="car-outline" size={56} color={Colors.textMuted} />
                <Text style={styles.emptyTitle}>{t("noVehicles")}</Text>
                <Text style={styles.emptySubtitle}>{t("addFirstVehicle")}</Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onLongPress={() => handleDelete(item.id, item.vehicle_no)}
              activeOpacity={0.75}
            >
              <View style={styles.cardHeader}>
                <View style={styles.vehicleBadge}>
                  <Ionicons name="car" size={16} color={Colors.green} />
                  <Text style={styles.vehicleNo}>{item.vehicle_no}</Text>
                </View>
                {item.vehicle_type && (
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeText}>{item.vehicle_type}</Text>
                  </View>
                )}
              </View>
              {item.owner_name && (
                <Text style={styles.cardSub}>
                  <Text style={styles.subLabel}>{t("ownerName")}: </Text>
                  {item.owner_name}
                </Text>
              )}
              {item.driver_name && (
                <Text style={styles.cardSub}>
                  <Text style={styles.subLabel}>{t("driverName")}: </Text>
                  {item.driver_name}
                </Text>
              )}
              {item.phone && (
                <Text style={styles.cardSub}>
                  <Text style={styles.subLabel}>{t("phone")}: </Text>
                  {item.phone}
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
                <Text style={styles.modalTitle}>{t("vehicleMaster")}</Text>
                <TouchableOpacity
                  onPress={() => { setShowModal(false); resetForm(); }}
                >
                  <Ionicons name="close" size={24} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.label}>{t("vehicleNumber")} *</Text>
                <TextInput
                  style={styles.input}
                  value={vehicleNo}
                  onChangeText={setVehicleNo}
                  placeholder="e.g. MP 09 AB 1234"
                  autoCapitalize="characters"
                />

                <Text style={styles.label}>{t("vehicleType")}</Text>
                <TouchableOpacity
                  style={styles.pickerBtn}
                  onPress={() => setShowTypePicker(!showTypePicker)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pickerText, !vehicleType && { color: Colors.textMuted }]}>
                    {vehicleType || "Select vehicle type"}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color={Colors.textMuted} />
                </TouchableOpacity>
                {showTypePicker && (
                  <View style={styles.dropdownList}>
                    {VEHICLE_TYPES.map((vt) => (
                      <TouchableOpacity
                        key={vt}
                        style={[
                          styles.dropdownItem,
                          vehicleType === vt && styles.dropdownItemSelected,
                        ]}
                        onPress={() => { setVehicleType(vt); setShowTypePicker(false); }}
                      >
                        <Text
                          style={[
                            styles.dropdownItemText,
                            vehicleType === vt && { color: Colors.green, fontWeight: "700" },
                          ]}
                        >
                          {vt}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <Text style={styles.label}>{t("ownerName")}</Text>
                <TextInput
                  style={styles.input}
                  value={ownerName}
                  onChangeText={setOwnerName}
                  placeholder="Vehicle owner name"
                />

                <Text style={styles.label}>{t("driverName")}</Text>
                <TextInput
                  style={styles.input}
                  value={driverName}
                  onChangeText={setDriverName}
                  placeholder="Driver name"
                />

                <Text style={styles.label}>{t("phone")}</Text>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Contact number"
                  keyboardType="phone-pad"
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
    justifyContent: "space-between",
    marginBottom: 6,
  },
  vehicleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  vehicleNo: {
    fontSize: Fonts.base,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: 1,
  },
  typeBadge: {
    backgroundColor: Colors.greenLight,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  typeText: { fontSize: Fonts.xs, fontWeight: "600", color: Colors.green },
  cardSub: { fontSize: Fonts.xs, color: Colors.textSecondary, marginTop: 2 },
  subLabel: { fontWeight: "600", color: Colors.textMuted },
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
    maxHeight: "85%",
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
  pickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    backgroundColor: Colors.greenBg,
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
