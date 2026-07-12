import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Fonts } from "../../lib/colors";
import { useT } from "../../lib/i18n";
import api from "../../lib/api";
import CompanyPicker from "../../components/CompanyPicker";

interface UserInfo {
  id: string;
  phone: string;
  name: string;
  role?: string;
}

export default function UserManagementScreen() {
  const t = useT();
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("branch_user");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const list = await api<UserInfo[]>("/admin/users");
      setUsers(list);
    } catch {}
  };

  const createUser = async () => {
    if (!newPhone.trim() || !newName.trim()) {
      Alert.alert(t("error"), t("required"));
      return;
    }
    setLoading(true);
    try {
      const u = await api<UserInfo>("/admin/users", {
        method: "POST",
        body: { phone: newPhone.trim(), name: newName.trim(), role: newRole },
      });
      setUsers((prev) => [...prev, u]);
      setNewPhone("");
      setNewName("");
      setShowAdd(false);
    } catch (e: any) {
      Alert.alert(t("error"), e.message || t("failedToSave"));
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { key: "super_admin", label: t("superAdmin") },
    { key: "branch_user", label: t("branchUser") },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.greenBg }} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Company Selector */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t("company")}</Text>
          <CompanyPicker />
        </View>

        {/* Users List */}
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.sectionTitle}>{t("headerUserManagement")}</Text>
            <TouchableOpacity onPress={() => setShowAdd(!showAdd)}>
              <Ionicons
                name={showAdd ? "close-circle" : "add-circle"}
                size={28}
                color={Colors.green}
              />
            </TouchableOpacity>
          </View>

          {showAdd && (
            <View style={styles.addForm}>
              <TextInput
                style={styles.input}
                placeholder={t("name")}
                value={newName}
                onChangeText={setNewName}
              />
              <TextInput
                style={styles.input}
                placeholder={t("phone")}
                keyboardType="phone-pad"
                value={newPhone}
                onChangeText={setNewPhone}
              />

              <Text style={styles.label}>{t("role")}</Text>
              <View style={styles.roleRow}>
                {roles.map((r) => (
                  <TouchableOpacity
                    key={r.key}
                    style={[styles.roleChip, newRole === r.key && styles.roleChipActive]}
                    onPress={() => setNewRole(r.key)}
                  >
                    <Text
                      style={[
                        styles.roleChipText,
                        newRole === r.key && styles.roleChipTextActive,
                      ]}
                    >
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.saveBtn, loading && { opacity: 0.6 }]}
                onPress={createUser}
                disabled={loading}
              >
                <Text style={styles.saveBtnText}>
                  {loading ? t("saving") : t("createUser")}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {users.map((u) => (
            <View key={u.id} style={styles.userRow}>
              <Ionicons name="person-circle-outline" size={36} color={Colors.green} />
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>{u.name}</Text>
                <Text style={styles.userPhone}>{u.phone}</Text>
              </View>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>{u.role || "User"}</Text>
              </View>
            </View>
          ))}

          {users.length === 0 && !showAdd && (
            <Text style={styles.emptyText}>{t("noData")}</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  sectionTitle: {
    fontSize: Fonts.lg,
    fontWeight: "700",
    color: Colors.text,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  label: {
    fontSize: Fonts.sm,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginTop: 10,
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
    marginBottom: 8,
  },
  addForm: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  roleRow: {
    flexDirection: "row",
    gap: 10,
  },
  roleChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  roleChipActive: {
    backgroundColor: Colors.green,
    borderColor: Colors.green,
  },
  roleChipText: {
    fontSize: Fonts.sm,
    color: Colors.textSecondary,
  },
  roleChipTextActive: {
    color: Colors.textWhite,
    fontWeight: "600",
  },
  saveBtn: {
    backgroundColor: Colors.green,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 14,
  },
  saveBtnText: {
    color: Colors.textWhite,
    fontSize: Fonts.base,
    fontWeight: "700",
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  userName: {
    fontSize: Fonts.base,
    fontWeight: "600",
    color: Colors.text,
  },
  userPhone: {
    fontSize: Fonts.xs,
    color: Colors.textSecondary,
  },
  roleBadge: {
    backgroundColor: Colors.greenLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeText: {
    fontSize: Fonts.xs,
    fontWeight: "600",
    color: Colors.green,
  },
  emptyText: {
    textAlign: "center",
    color: Colors.textMuted,
    fontSize: Fonts.base,
    paddingVertical: 20,
  },
});
