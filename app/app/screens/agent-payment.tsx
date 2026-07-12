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

interface AgentCommission {
  id: string;
  agent_id: string;
  bill_no: string | null;
  supplier_name: string | null;
  vehicle_no: string | null;
  bill_total: number;
  commission_pct: number;
  commission_amount: number;
  payment_date: string | null;
  paid: boolean;
}

interface Agent {
  id: string;
  name: string;
  commission_rate: number | null;
}

export default function AgentPaymentScreen() {
  const t = useT();
  const [commissions, setCommissions] = useState<AgentCommission[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<"all" | "unpaid" | "paid">("unpaid");

  // Form state
  const [agentId, setAgentId] = useState("");
  const [billNo, setBillNo] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [billTotal, setBillTotal] = useState("");
  const [commissionPct, setCommissionPct] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [c, a] = await Promise.all([
        api<AgentCommission[]>(`/agent-commissions?paid=${filter === "paid"}`),
        api<Agent[]>("/agents"),
      ]);
      setCommissions(c);
      setAgents(a);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const commissionAmount = (() => {
    const total = parseFloat(billTotal) || 0;
    const pct = parseFloat(commissionPct) || 0;
    return (total * pct) / 100;
  })();

  const handleSave = async () => {
    if (!agentId || !billTotal || !commissionPct) {
      Alert.alert(t("error"), "Please fill agent, bill total, and commission %");
      return;
    }
    setSaving(true);
    try {
      await api("/agent-commissions", {
        method: "POST",
        body: {
          agent_id: agentId,
          bill_no: billNo || null,
          supplier_name: supplierName || null,
          vehicle_no: vehicleNo || null,
          bill_total: parseFloat(billTotal),
          commission_pct: parseFloat(commissionPct),
          commission_amount: commissionAmount,
          paid: false,
        },
      });
      setShowModal(false);
      resetForm();
      fetchData();
    } catch {
      Alert.alert(t("error"), "Failed to save commission");
    } finally {
      setSaving(false);
    }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      await api(`/agent-commissions/${id}`, {
        method: "PATCH",
        body: { paid: true, payment_date: new Date().toISOString().split("T")[0] },
      });
      fetchData();
    } catch {
      Alert.alert(t("error"), "Failed to mark as paid");
    }
  };

  const resetForm = () => {
    setAgentId("");
    setBillNo("");
    setSupplierName("");
    setVehicleNo("");
    setBillTotal("");
    setCommissionPct("");
  };

  const totalUnpaid = commissions
    .filter((c) => !c.paid)
    .reduce((sum, c) => sum + c.commission_amount, 0);

  const getAgentName = (id: string) => agents.find((a) => a.id === id)?.name || "—";

  const renderItem = ({ item }: { item: AgentCommission }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.agentName}>{getAgentName(item.agent_id)}</Text>
          <Text style={styles.billInfo}>
            {item.bill_no ? `Bill: ${item.bill_no}` : ""}{" "}
            {item.supplier_name ? `| ${item.supplier_name}` : ""}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.commAmount}>
            ₹{item.commission_amount.toLocaleString("en-IN")}
          </Text>
          <Text style={styles.pctText}>{item.commission_pct}% of ₹{item.bill_total.toLocaleString("en-IN")}</Text>
        </View>
      </View>
      {!item.paid && (
        <TouchableOpacity
          style={styles.payBtn}
          onPress={() =>
            Alert.alert("Mark Paid", "Mark this commission as paid?", [
              { text: t("cancel"), style: "cancel" },
              { text: t("yes"), onPress: () => handleMarkPaid(item.id) },
            ])
          }
        >
          <Ionicons name="checkmark-circle-outline" size={16} color={Colors.green} />
          <Text style={styles.payBtnText}>Mark Paid</Text>
        </TouchableOpacity>
      )}
      {item.paid && item.payment_date && (
        <Text style={styles.paidDate}>Paid on {item.payment_date}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {/* Summary */}
      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>Unpaid Commission</Text>
        <Text style={styles.summaryValue}>₹{totalUnpaid.toLocaleString("en-IN")}</Text>
      </View>

      {/* Filter tabs */}
      <View style={styles.tabs}>
        {(["unpaid", "paid", "all"] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.tab, filter === f && styles.tabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.tabText, filter === f && styles.tabTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={commissions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="ribbon-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No commissions found</Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Add Modal */}
      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowModal(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <TouchableOpacity activeOpacity={1} style={styles.sheet}>
              <View style={styles.handle} />
              <Text style={styles.sheetTitle}>{t("agentCommission")}</Text>
              <ScrollView keyboardShouldPersistTaps="handled">
                {/* Agent Picker */}
                <Text style={styles.label}>Agent *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                  {agents.map((a) => (
                    <TouchableOpacity
                      key={a.id}
                      style={[styles.chip, agentId === a.id && styles.chipActive]}
                      onPress={() => {
                        setAgentId(a.id);
                        if (a.commission_rate) setCommissionPct(String(a.commission_rate));
                      }}
                    >
                      <Text style={[styles.chipText, agentId === a.id && styles.chipTextActive]}>
                        {a.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.label}>{t("billNo")}</Text>
                <TextInput style={styles.input} value={billNo} onChangeText={setBillNo} placeholder="e.g. PUR-001" />

                <Text style={styles.label}>Supplier Name</Text>
                <TextInput style={styles.input} value={supplierName} onChangeText={setSupplierName} />

                <Text style={styles.label}>Vehicle No</Text>
                <TextInput style={styles.input} value={vehicleNo} onChangeText={setVehicleNo} placeholder="e.g. MH 12 AB 1234" />

                <View style={styles.row}>
                  <View style={styles.half}>
                    <Text style={styles.label}>{t("billTotal")} *</Text>
                    <TextInput style={styles.input} value={billTotal} onChangeText={setBillTotal} keyboardType="numeric" placeholder="₹" />
                  </View>
                  <View style={styles.half}>
                    <Text style={styles.label}>{t("commissionPct")} *</Text>
                    <TextInput style={styles.input} value={commissionPct} onChangeText={setCommissionPct} keyboardType="numeric" placeholder="%" />
                  </View>
                </View>

                {commissionAmount > 0 && (
                  <View style={styles.calcCard}>
                    <Text style={styles.calcLabel}>{t("commissionAmount")}</Text>
                    <Text style={styles.calcValue}>₹{commissionAmount.toLocaleString("en-IN")}</Text>
                  </View>
                )}

                <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                  <Text style={styles.saveBtnText}>{saving ? t("saving") : t("save")}</Text>
                </TouchableOpacity>
              </ScrollView>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.greenBg },
  summary: { backgroundColor: Colors.green, padding: 20, alignItems: "center" },
  summaryLabel: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
  summaryValue: { color: "#fff", fontSize: 28, fontWeight: "800", marginTop: 4 },
  tabs: { flexDirection: "row", padding: 12, gap: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "#f0f0f0" },
  tabActive: { backgroundColor: Colors.green },
  tabText: { fontSize: 13, fontWeight: "600", color: "#666" },
  tabTextActive: { color: "#fff" },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 10, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  agentName: { fontSize: 15, fontWeight: "700", color: "#1a1a1a" },
  billInfo: { fontSize: 12, color: "#888", marginTop: 2 },
  commAmount: { fontSize: 16, fontWeight: "700", color: Colors.green },
  pctText: { fontSize: 11, color: "#999", marginTop: 2 },
  payBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#f0f0f0" },
  payBtnText: { fontSize: 13, fontWeight: "600", color: Colors.green },
  paidDate: { fontSize: 12, color: "#999", marginTop: 8, fontStyle: "italic" },
  empty: { alignItems: "center", marginTop: 60 },
  emptyText: { fontSize: 14, color: "#999", marginTop: 12 },
  fab: { position: "absolute", bottom: 20, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.green, alignItems: "center", justifyContent: "center", elevation: 4 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: "80%" },
  handle: { width: 40, height: 4, backgroundColor: "#ddd", borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  sheetTitle: { fontSize: 18, fontWeight: "700", marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "600", color: "#555", marginTop: 12, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: "#e0e0e0", borderRadius: 8, padding: 12, fontSize: 15, backgroundColor: "#fafafa" },
  row: { flexDirection: "row", gap: 12 },
  half: { flex: 1 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: "#f0f0f0", marginRight: 8 },
  chipActive: { backgroundColor: Colors.green },
  chipText: { fontSize: 13, fontWeight: "600", color: "#666" },
  chipTextActive: { color: "#fff" },
  calcCard: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "#f0fdf4", padding: 14, borderRadius: 8, marginTop: 12 },
  calcLabel: { fontSize: 14, color: "#555" },
  calcValue: { fontSize: 18, fontWeight: "700", color: Colors.green },
  saveBtn: { backgroundColor: Colors.green, padding: 16, borderRadius: 8, alignItems: "center", marginTop: 20, marginBottom: 20 },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
