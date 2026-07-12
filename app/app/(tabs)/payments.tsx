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
  Linking,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../../lib/api";
import { Colors, Fonts } from "../../lib/colors";
import { formatRupees } from "../../components/formatters";
import LoadingScreen from "../../components/LoadingScreen";
import { useT } from "../../lib/i18n";

type Tab = "milna" | "dena";

interface PendingPaymentSummary {
  party_id: string;
  party_name: string;
  party_phone: string | null;
  pending_amount: number;
  pending_deals: number;
  oldest_deal_date: string | null;
  max_overdue_days: number | null;
}

interface PendingPayments {
  from_buyers: PendingPaymentSummary[];
  to_farmers: PendingPaymentSummary[];
  total_from_buyers: number;
  total_to_farmers: number;
  net_position: number;
}

function getOverdueColor(days: number | null): string {
  if (!days || days <= 0) return Colors.green;
  if (days > 7) return Colors.red;
  if (days >= 3) return Colors.amber;
  return Colors.green;
}

export default function PaymentsScreen() {
  const t = useT();
  const [activeTab, setActiveTab] = useState<Tab>("milna");
  const [data, setData] = useState<PendingPayments | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Payment modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedParty, setSelectedParty] = useState<PendingPaymentSummary | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payMode, setPayMode] = useState("Cash");
  const [payRef, setPayRef] = useState("");
  const [payNotes, setPayNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);

  const paymentModes = [
    { key: "Cash", label: t("cash") },
    { key: "UPI", label: t("upi") },
    { key: "Bank Transfer", label: t("bankTransfer") },
    { key: "Cheque", label: t("cheque") },
  ];

  const fetchPayments = useCallback(async () => {
    try {
      const result = await api<PendingPayments>("/payments/pending");
      setData(result);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPayments();
  };

  const openRecordModal = (item: PendingPaymentSummary) => {
    setSelectedParty(item);
    setPayAmount(String(item.pending_amount));
    setPayMode("Cash");
    setPayRef("");
    setPayNotes("");
    setModalVisible(true);
  };

  const handleRecordPayment = async () => {
    if (!selectedParty) return;
    const amount = parseFloat(payAmount);
    if (!amount || amount <= 0) {
      Alert.alert(t("error"), t("invalidAmount"));
      return;
    }

    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        direction: activeTab === "milna" ? "incoming" : "outgoing",
        amount,
        payment_mode: payMode,
        reference_no: payRef.trim() || null,
        notes: payNotes.trim() || null,
      };

      if (activeTab === "milna") {
        body.buyer_id = selectedParty.party_id;
      } else {
        body.farmer_id = selectedParty.party_id;
      }

      await api("/payments", { method: "POST", body });
      setModalVisible(false);
      fetchPayments();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("failedRecordPayment");
      Alert.alert(t("error"), msg);
    } finally {
      setSaving(false);
    }
  };

  const items =
    activeTab === "milna"
      ? data?.from_buyers ?? []
      : data?.to_farmers ?? [];

  const totalAmount =
    activeTab === "milna"
      ? data?.total_from_buyers ?? 0
      : data?.total_to_farmers ?? 0;

  const fmt = formatRupees;

  const callPhone = (phone: string | null) => {
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  const sendReminder = async (item: PendingPaymentSummary) => {
    setSendingReminder(item.party_id);
    try {
      await api("/notifications/payment-reminder", {
        method: "POST",
        body: {
          party_type: activeTab === "milna" ? "buyer" : "farmer",
          party_id: item.party_id,
          amount: item.pending_amount,
          include_upi_link: activeTab === "milna",
        },
      });
      Alert.alert(t("sent"), `${t("reminderSent")} ${item.party_name}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("failedSendReminder");
      Alert.alert(t("error"), msg);
    } finally {
      setSendingReminder(null);
    }
  };

  const renderItem = ({ item }: { item: PendingPaymentSummary }) => {
    const overdueColor = getOverdueColor(item.max_overdue_days);

    return (
      <View style={styles.paymentCard}>
        <View style={styles.paymentLeft}>
          <Text style={styles.partyName}>{item.party_name}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.dealCount}>
              {item.pending_deals} {item.pending_deals > 1 ? t("dealsPlural") : t("deal")}
            </Text>
            {item.max_overdue_days != null && item.max_overdue_days > 0 && (
              <View style={styles.overdueRow}>
                <View
                  style={[
                    styles.overdueDot,
                    { backgroundColor: overdueColor },
                  ]}
                />
                <Text style={[styles.overdueText, { color: overdueColor }]}>
                  {item.max_overdue_days}{t("dOverdue")}
                </Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.paymentRight}>
          <Text
            style={[
              styles.paymentAmount,
              {
                color: activeTab === "milna" ? Colors.green : Colors.red,
              },
            ]}
          >
            {fmt(item.pending_amount)}
          </Text>
          <View style={styles.rightActions}>
            <TouchableOpacity
              onPress={() => openRecordModal(item)}
              style={styles.recordButton}
              activeOpacity={0.7}
            >
              <Text style={styles.recordButtonText}>{t("record")}</Text>
            </TouchableOpacity>
            {item.party_phone && (
              <>
                <TouchableOpacity
                  onPress={() => sendReminder(item)}
                  style={styles.callButton}
                  activeOpacity={0.7}
                  disabled={sendingReminder === item.party_id}
                >
                  <Ionicons
                    name="logo-whatsapp"
                    size={16}
                    color={sendingReminder === item.party_id ? Colors.textMuted : Colors.green}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => callPhone(item.party_phone)}
                  style={styles.callButton}
                  activeOpacity={0.7}
                >
                  <Ionicons name="call" size={16} color={Colors.green} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      {/* Tab Toggle */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "milna" && styles.tabActiveGreen]}
          onPress={() => setActiveTab("milna")}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-down-circle"
            size={18}
            color={activeTab === "milna" ? Colors.textWhite : Colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "milna" && styles.tabTextActive,
            ]}
          >
            {t("receivable")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "dena" && styles.tabActiveRed]}
          onPress={() => setActiveTab("dena")}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-up-circle"
            size={18}
            color={activeTab === "dena" ? Colors.textWhite : Colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "dena" && styles.tabTextActive,
            ]}
          >
            {t("payable")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Total */}
      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>
          {activeTab === "milna" ? t("totalReceivable") : t("totalPayable")}
        </Text>
        <Text
          style={[
            styles.totalValue,
            {
              color: activeTab === "milna" ? Colors.green : Colors.red,
            },
          ]}
        >
          {fmt(totalAmount)}
        </Text>
      </View>

      {/* List */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.party_id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.green]}
            tintColor={Colors.green}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="checkmark-circle"
              size={40}
              color={Colors.textMuted}
            />
            <Text style={styles.emptyText}>{t("allClear")}</Text>
            <Text style={styles.emptySubtext}>{t("noPendingPayments")}</Text>
          </View>
        }
      />

      {/* Record Payment Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("recordPayment")}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalPartyName}>{selectedParty?.party_name}</Text>
            <Text style={styles.modalPending}>
              {t("pending")}: {fmt(selectedParty?.pending_amount ?? 0)}
            </Text>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>{t("amount")} *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
                keyboardType="decimal-pad"
                value={payAmount}
                onChangeText={setPayAmount}
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>{t("paymentMode")}</Text>
              <View style={styles.pillRow}>
                {paymentModes.map((mode) => (
                  <TouchableOpacity
                    key={mode.key}
                    style={[
                      styles.pill,
                      payMode === mode.key && styles.pillActive,
                    ]}
                    onPress={() => setPayMode(mode.key)}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        payMode === mode.key && styles.pillTextActive,
                      ]}
                    >
                      {mode.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>{t("referenceNo")}</Text>
              <TextInput
                style={styles.formInput}
                placeholder={t("upiChequeNo")}
                placeholderTextColor={Colors.textMuted}
                value={payRef}
                onChangeText={setPayRef}
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>{t("notes")}</Text>
              <TextInput
                style={styles.formInput}
                placeholder={t("optionalNotes")}
                placeholderTextColor={Colors.textMuted}
                value={payNotes}
                onChangeText={setPayNotes}
              />
            </View>

            <TouchableOpacity
              style={[styles.saveButton, saving && { opacity: 0.6 }]}
              onPress={handleRecordPayment}
              disabled={saving}
              activeOpacity={0.7}
            >
              {saving ? (
                <ActivityIndicator color={Colors.textWhite} />
              ) : (
                <Text style={styles.saveText}>{t("recordPayment")}</Text>
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
  tabBar: {
    flexDirection: "row",
    margin: 16,
    marginBottom: 12,
    backgroundColor: Colors.border,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    minHeight: 48,
  },
  tabActiveGreen: {
    backgroundColor: Colors.green,
  },
  tabActiveRed: {
    backgroundColor: Colors.red,
  },
  tabText: {
    fontSize: Fonts.base,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.textWhite,
  },
  totalCard: {
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  totalLabel: {
    fontSize: Fonts.sm,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 30,
    fontWeight: "800",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  paymentCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  paymentLeft: {
    flex: 1,
  },
  partyName: {
    fontSize: Fonts.base,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dealCount: {
    fontSize: Fonts.xs,
    color: Colors.textMuted,
  },
  overdueRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  overdueDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 5,
  },
  overdueText: {
    fontSize: Fonts.xs,
    fontWeight: "500",
  },
  paymentRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  paymentAmount: {
    fontSize: Fonts.lg,
    fontWeight: "700",
    marginLeft: 12,
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  recordButton: {
    backgroundColor: Colors.greenLight,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    minHeight: 48,
    justifyContent: "center",
  },
  recordButtonText: {
    fontSize: Fonts.xs,
    fontWeight: "700",
    color: Colors.green,
  },
  callButton: {
    backgroundColor: Colors.greenLight,
    borderRadius: 20,
    padding: 12,
    minWidth: 48,
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: Fonts.base,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: Fonts.sm,
    color: Colors.textMuted,
    marginTop: 4,
  },
  // Modal styles
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
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: Fonts.lg,
    fontWeight: "700",
    color: Colors.text,
  },
  modalPartyName: {
    fontSize: Fonts.base,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 2,
  },
  modalPending: {
    fontSize: Fonts.sm,
    color: Colors.textSecondary,
    marginBottom: 16,
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
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 48,
    justifyContent: "center",
  },
  pillActive: {
    backgroundColor: Colors.greenLight,
    borderColor: Colors.green,
  },
  pillText: {
    fontSize: Fonts.sm,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  pillTextActive: {
    color: Colors.green,
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
