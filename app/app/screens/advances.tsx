import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../../lib/api";
import { Colors, Fonts } from "../../lib/colors";
import { formatRupees, formatDate } from "../../components/formatters";
import LoadingScreen from "../../components/LoadingScreen";
import EmptyState from "../../components/EmptyState";
import EntityPicker, { Entity } from "../../components/EntityPicker";

interface Advance {
  id: string;
  farmer_id: string;
  farmer_name: string | null;
  amount: number;
  recovered: number;
  balance: number;
  purpose: string | null;
  given_date: string;
  expected_recovery_date: string | null;
  status: string;
  notes: string | null;
}

function statusBadgeStyle(status: string) {
  switch (status) {
    case "recovered":
      return { bg: Colors.greenLight, text: Colors.green };
    case "partial":
      return { bg: Colors.amberLight, text: Colors.amber };
    default:
      return { bg: Colors.amberLight, text: Colors.amber };
  }
}

export default function AdvancesScreen() {
  const [advances, setAdvances] = useState<Advance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"active" | "all">("active");
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [farmers, setFarmers] = useState<Entity[]>([]);
  const [formFarmerId, setFormFarmerId] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formPurpose, setFormPurpose] = useState("");
  const [formNotes, setFormNotes] = useState("");

  const fetchAdvances = useCallback(async () => {
    try {
      const endpoint =
        filter === "active" ? "/advances/active" : "/advances";
      const result = await api<Advance[]>(endpoint);
      setAdvances(result);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  const fetchFarmers = async () => {
    try {
      const f = await api<Entity[]>("/farmers");
      setFarmers(f);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchAdvances();
  }, [fetchAdvances]);

  const openModal = () => {
    setFormFarmerId("");
    setFormAmount("");
    setFormPurpose("");
    setFormNotes("");
    fetchFarmers();
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formFarmerId) {
      Alert.alert("Error", "Please select a farmer");
      return;
    }
    if (!formAmount || parseFloat(formAmount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    setSaving(true);
    try {
      await api("/advances", {
        method: "POST",
        body: {
          farmer_id: formFarmerId,
          amount: parseFloat(formAmount),
          purpose: formPurpose.trim() || null,
          notes: formNotes.trim() || null,
        },
      });
      setModalVisible(false);
      fetchAdvances();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save";
      Alert.alert("Error", msg);
    } finally {
      setSaving(false);
    }
  };

  const renderItem = ({ item }: { item: Advance }) => {
    const badge = statusBadgeStyle(item.status);
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <Text style={styles.farmerName}>{item.farmer_name || "—"}</Text>
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.badgeText, { color: badge.text }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>
        <View style={styles.cardRow}>
          <View>
            <Text style={styles.amountLabel}>Amount</Text>
            <Text style={styles.amountValue}>{formatRupees(item.amount)}</Text>
          </View>
          <View>
            <Text style={styles.amountLabel}>Recovered</Text>
            <Text style={[styles.amountValue, { color: Colors.green }]}>
              {formatRupees(item.recovered)}
            </Text>
          </View>
          <View>
            <Text style={styles.amountLabel}>Balance</Text>
            <Text
              style={[
                styles.amountValue,
                { color: item.balance > 0 ? Colors.red : Colors.green },
              ]}
            >
              {formatRupees(item.balance)}
            </Text>
          </View>
        </View>
        <View style={styles.cardFooter}>
          {item.purpose && (
            <Text style={styles.purposeText}>{item.purpose}</Text>
          )}
          <Text style={styles.dateText}>{formatDate(item.given_date)}</Text>
        </View>
      </View>
    );
  };

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      {/* Filter Toggle */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterBtn, filter === "active" && styles.filterActive]}
          onPress={() => setFilter("active")}
        >
          <Text
            style={[
              styles.filterText,
              filter === "active" && styles.filterTextActive,
            ]}
          >
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, filter === "all" && styles.filterActive]}
          onPress={() => setFilter("all")}
        >
          <Text
            style={[
              styles.filterText,
              filter === "all" && styles.filterTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={advances}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchAdvances();
            }}
            colors={[Colors.green]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="cash-outline"
            title="No advances"
            subtitle="Tap + to record a new advance"
          />
        }
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={openModal} activeOpacity={0.8}>
        <Ionicons name="add" size={28} color={Colors.textWhite} />
      </TouchableOpacity>

      {/* Create Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Advance</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <EntityPicker
              label="Farmer"
              placeholder="Select farmer"
              items={farmers}
              selectedId={formFarmerId}
              onSelect={(id) => setFormFarmerId(id)}
              onAddNew={async (name) => {
                const f = await api<Entity>("/farmers", { method: "POST", body: { name } });
                setFarmers((prev) => [...prev, f]);
                setFormFarmerId(f.id);
              }}
              addLabel="Add Farmer"
            />

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Amount *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
                keyboardType="decimal-pad"
                value={formAmount}
                onChangeText={setFormAmount}
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Purpose</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Seeds, Fertilizer"
                placeholderTextColor={Colors.textMuted}
                value={formPurpose}
                onChangeText={setFormPurpose}
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Notes</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Optional notes"
                placeholderTextColor={Colors.textMuted}
                value={formNotes}
                onChangeText={setFormNotes}
              />
            </View>

            <TouchableOpacity
              style={[styles.saveButton, saving && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.7}
            >
              {saving ? (
                <ActivityIndicator color={Colors.textWhite} />
              ) : (
                <Text style={styles.saveText}>Save Advance</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.greenBg,
  },
  filterRow: {
    flexDirection: "row",
    margin: 16,
    marginBottom: 8,
    backgroundColor: Colors.border,
    borderRadius: 10,
    padding: 3,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  filterActive: {
    backgroundColor: Colors.green,
  },
  filterText: {
    fontSize: Fonts.sm,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.textWhite,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  farmerName: {
    fontSize: Fonts.base,
    fontWeight: "700",
    color: Colors.text,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: Fonts.xs,
    fontWeight: "700",
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  amountLabel: {
    fontSize: Fonts.xs,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  amountValue: {
    fontSize: Fonts.base,
    fontWeight: "700",
    color: Colors.text,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  purposeText: {
    fontSize: Fonts.xs,
    color: Colors.textSecondary,
    flex: 1,
  },
  dateText: {
    fontSize: Fonts.xs,
    color: Colors.textMuted,
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.green,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: Fonts.lg,
    fontWeight: "700",
    color: Colors.text,
  },
  formField: {
    marginBottom: 14,
  },
  formLabel: {
    fontSize: Fonts.sm,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: Fonts.base,
    color: Colors.text,
  },
  saveButton: {
    backgroundColor: Colors.green,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
  },
  saveText: {
    color: Colors.textWhite,
    fontSize: Fonts.base,
    fontWeight: "700",
  },
});
