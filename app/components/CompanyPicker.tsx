import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts } from "../lib/colors";
import { useT } from "../lib/i18n";
import api from "../lib/api";

interface Company {
  id: string;
  name: string;
  address?: string;
  gst_no?: string;
  is_default?: boolean;
}

export default function CompanyPicker() {
  const t = useT();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [active, setActive] = useState<Company | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [addMode, setAddMode] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newGst, setNewGst] = useState("");

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const list = await api<Company[]>("/companies");
      setCompanies(list);
      const def = list.find((c) => c.is_default) || list[0];
      if (def) setActive(def);
    } catch {}
  };

  const switchCompany = async (company: Company) => {
    try {
      await api(`/companies/${company.id}/activate`, { method: "POST" });
      setActive(company);
      setModalVisible(false);
    } catch {
      Alert.alert(t("error"), t("failedToSave"));
    }
  };

  const addCompany = async () => {
    if (!newName.trim()) return;
    try {
      const c = await api<Company>("/companies", {
        method: "POST",
        body: { name: newName.trim(), address: newAddress || undefined, gst_no: newGst || undefined },
      });
      setCompanies((prev) => [...prev, c]);
      setNewName("");
      setNewAddress("");
      setNewGst("");
      setAddMode(false);
      switchCompany(c);
    } catch {
      Alert.alert(t("error"), t("failedToSave"));
    }
  };

  if (!active) return null;

  return (
    <>
      <TouchableOpacity style={styles.picker} onPress={() => setModalVisible(true)}>
        <Ionicons name="business-outline" size={18} color={Colors.green} />
        <Text style={styles.pickerText} numberOfLines={1}>
          {active.name}
        </Text>
        <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("company")}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={companies}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.companyRow, item.id === active.id && styles.activeRow]}
                  onPress={() => switchCompany(item)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.companyName}>{item.name}</Text>
                    {item.address ? (
                      <Text style={styles.companyAddress}>{item.address}</Text>
                    ) : null}
                  </View>
                  {item.id === active.id && (
                    <Ionicons name="checkmark-circle" size={22} color={Colors.green} />
                  )}
                </TouchableOpacity>
              )}
            />

            {addMode ? (
              <View style={styles.addForm}>
                <TextInput
                  style={styles.input}
                  placeholder={t("companyName")}
                  value={newName}
                  onChangeText={setNewName}
                />
                <TextInput
                  style={styles.input}
                  placeholder={t("address")}
                  value={newAddress}
                  onChangeText={setNewAddress}
                />
                <TextInput
                  style={styles.input}
                  placeholder="GST No."
                  value={newGst}
                  onChangeText={setNewGst}
                />
                <View style={styles.addActions}>
                  <TouchableOpacity onPress={() => setAddMode(false)}>
                    <Text style={styles.cancelText}>{t("cancel")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.addBtn} onPress={addCompany}>
                    <Text style={styles.addBtnText}>{t("save")}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity style={styles.newCompanyBtn} onPress={() => setAddMode(true)}>
                <Ionicons name="add-circle-outline" size={20} color={Colors.green} />
                <Text style={styles.newCompanyText}>{t("addCompany")}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  picker: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pickerText: {
    flex: 1,
    fontSize: Fonts.sm,
    fontWeight: "600",
    color: Colors.text,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: Fonts.lg,
    fontWeight: "700",
    color: Colors.text,
  },
  companyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  activeRow: {
    backgroundColor: Colors.greenBg,
  },
  companyName: {
    fontSize: Fonts.base,
    fontWeight: "600",
    color: Colors.text,
  },
  companyAddress: {
    fontSize: Fonts.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  addForm: {
    marginTop: 12,
    gap: 10,
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
  addActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
    alignItems: "center",
  },
  cancelText: {
    fontSize: Fonts.base,
    color: Colors.textSecondary,
  },
  addBtn: {
    backgroundColor: Colors.green,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  addBtnText: {
    color: Colors.textWhite,
    fontWeight: "700",
    fontSize: Fonts.base,
  },
  newCompanyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  newCompanyText: {
    fontSize: Fonts.base,
    fontWeight: "600",
    color: Colors.green,
  },
});
