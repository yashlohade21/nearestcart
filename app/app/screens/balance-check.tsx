import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Fonts } from "../../lib/colors";
import { useT } from "../../lib/i18n";
import api from "../../lib/api";

interface BankAccount {
  id: string;
  bank_name: string;
  account_no: string;
  current_balance: number;
}

interface CashSummary {
  cash_balance: number;
}

interface PendingPayments {
  total_receivable: number;
  total_payable: number;
}

interface BalanceData {
  cashBalance: number;
  bankAccounts: BankAccount[];
  totalReceivable: number;
  totalPayable: number;
}

export default function BalanceCheckScreen() {
  const t = useT();
  const [data, setData] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bankAccounts, cashSummary, pending] = await Promise.allSettled([
        api<BankAccount[]>("/bank-accounts"),
        api<CashSummary>("/cash-book?summary=true"),
        api<PendingPayments>("/payments/pending"),
      ]);

      const banks =
        bankAccounts.status === "fulfilled" ? bankAccounts.value : [];
      const cash =
        cashSummary.status === "fulfilled"
          ? (cashSummary.value as CashSummary).cash_balance ?? 0
          : 0;
      const recv =
        pending.status === "fulfilled"
          ? (pending.value as PendingPayments).total_receivable ?? 0
          : 0;
      const pay =
        pending.status === "fulfilled"
          ? (pending.value as PendingPayments).total_payable ?? 0
          : 0;

      setData({
        cashBalance: cash,
        bankAccounts: banks,
        totalReceivable: recv,
        totalPayable: pay,
      });
    } catch {
      // partial data already set above
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const fmt = (n: number) =>
    `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const totalBankBalance =
    data?.bankAccounts.reduce((sum, b) => sum + (b.current_balance ?? 0), 0) ?? 0;
  const netPosition =
    (data?.cashBalance ?? 0) +
    totalBankBalance +
    (data?.totalReceivable ?? 0) -
    (data?.totalPayable ?? 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.greenBg }} edges={["bottom"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchData}
            colors={[Colors.green]}
          />
        }
      >
        {/* Net Position Hero */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Net Position</Text>
          <Text
            style={[
              styles.heroValue,
              { color: netPosition >= 0 ? Colors.green : Colors.red },
            ]}
          >
            {fmt(netPosition)}
          </Text>
          <Text style={styles.heroSub}>Cash + Bank + Receivable − Payable</Text>
        </View>

        {/* Cash Balance */}
        <View style={styles.sectionHeader}>
          <Ionicons name="cash-outline" size={18} color={Colors.green} />
          <Text style={styles.sectionTitle}>{t("cashBalance")}</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.balanceRow}>
            <View style={styles.balanceIcon}>
              <Ionicons name="wallet" size={22} color={Colors.green} />
            </View>
            <View style={styles.balanceInfo}>
              <Text style={styles.balanceLabel}>Cash in Hand</Text>
              <Text style={[styles.balanceValue, { color: Colors.green }]}>
                {fmt(data?.cashBalance ?? 0)}
              </Text>
            </View>
          </View>
        </View>

        {/* Bank Balances */}
        <View style={styles.sectionHeader}>
          <Ionicons name="business-outline" size={18} color={Colors.green} />
          <Text style={styles.sectionTitle}>{t("bankBalance")}</Text>
        </View>
        {data?.bankAccounts.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No bank accounts</Text>
          </View>
        )}
        {data?.bankAccounts.map((bank) => (
          <View key={bank.id} style={styles.card}>
            <View style={styles.balanceRow}>
              <View style={[styles.balanceIcon, { backgroundColor: "#eff6ff" }]}>
                <Ionicons name="card" size={22} color="#3b82f6" />
              </View>
              <View style={styles.balanceInfo}>
                <Text style={styles.balanceLabel}>{bank.bank_name}</Text>
                <Text style={styles.balanceSub}>A/C: {bank.account_no}</Text>
              </View>
              <Text style={[styles.balanceValue, { color: "#3b82f6" }]}>
                {fmt(bank.current_balance ?? 0)}
              </Text>
            </View>
          </View>
        ))}
        {(data?.bankAccounts?.length ?? 0) > 1 && (
          <View style={[styles.card, styles.totalCard]}>
            <View style={styles.balanceRow}>
              <Text style={styles.totalLabel}>Total Bank Balance</Text>
              <Text style={[styles.balanceValue, { color: "#3b82f6" }]}>
                {fmt(totalBankBalance)}
              </Text>
            </View>
          </View>
        )}

        {/* Receivable / Payable */}
        <View style={styles.sectionHeader}>
          <Ionicons name="swap-horizontal-outline" size={18} color={Colors.green} />
          <Text style={styles.sectionTitle}>Outstanding</Text>
        </View>
        <View style={styles.splitCard}>
          <View style={styles.splitItem}>
            <Ionicons name="arrow-down-circle" size={24} color={Colors.green} />
            <Text style={styles.splitLabel}>{t("totalReceivable")}</Text>
            <Text style={[styles.splitValue, { color: Colors.green }]}>
              {fmt(data?.totalReceivable ?? 0)}
            </Text>
            <Text style={styles.splitSub}>Milna Hai</Text>
          </View>
          <View style={styles.splitDivider} />
          <View style={styles.splitItem}>
            <Ionicons name="arrow-up-circle" size={24} color={Colors.red} />
            <Text style={styles.splitLabel}>{t("totalPayable")}</Text>
            <Text style={[styles.splitValue, { color: Colors.red }]}>
              {fmt(data?.totalPayable ?? 0)}
            </Text>
            <Text style={styles.splitSub}>Dena Hai</Text>
          </View>
        </View>

        {/* Summary Row */}
        <View style={styles.summaryCard}>
          <SummaryRow
            label="Cash Balance"
            value={fmt(data?.cashBalance ?? 0)}
            icon="wallet"
            color={Colors.green}
          />
          <SummaryRow
            label="Bank Balance"
            value={fmt(totalBankBalance)}
            icon="card"
            color="#3b82f6"
          />
          <SummaryRow
            label={t("totalReceivable")}
            value={fmt(data?.totalReceivable ?? 0)}
            icon="arrow-down-circle"
            color={Colors.green}
          />
          <SummaryRow
            label={t("totalPayable")}
            value={fmt(data?.totalPayable ?? 0)}
            icon="arrow-up-circle"
            color={Colors.red}
          />
          <View style={styles.divider} />
          <View style={styles.summaryNetRow}>
            <Text style={styles.summaryNetLabel}>Net Position</Text>
            <Text
              style={[
                styles.summaryNetValue,
                { color: netPosition >= 0 ? Colors.green : Colors.red },
              ]}
            >
              {fmt(netPosition)}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryRow({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: string;
  color: string;
}) {
  return (
    <View style={srStyles.row}>
      <Ionicons name={icon as any} size={16} color={color} />
      <Text style={srStyles.label}>{label}</Text>
      <Text style={[srStyles.value, { color }]}>{value}</Text>
    </View>
  );
}

const srStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 8,
  },
  label: { flex: 1, fontSize: Fonts.sm, color: Colors.textSecondary },
  value: { fontSize: Fonts.base, fontWeight: "700" },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.greenBg },
  scroll: { padding: 16, paddingBottom: 40 },
  heroCard: {
    backgroundColor: Colors.green,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: Colors.green,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  heroLabel: {
    fontSize: Fonts.sm,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "600",
    marginBottom: 8,
  },
  heroValue: {
    fontSize: Fonts["3xl"],
    fontWeight: "800",
    color: Colors.textWhite,
    marginBottom: 4,
  },
  heroSub: {
    fontSize: Fonts.xs,
    color: "rgba(255,255,255,0.65)",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: Fonts.base,
    fontWeight: "700",
    color: Colors.text,
  },
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
  totalCard: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  totalLabel: {
    fontSize: Fonts.base,
    fontWeight: "700",
    color: Colors.text,
    flex: 1,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  balanceIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.greenLight,
    alignItems: "center",
    justifyContent: "center",
  },
  balanceInfo: { flex: 1 },
  balanceLabel: {
    fontSize: Fonts.base,
    fontWeight: "600",
    color: Colors.text,
  },
  balanceSub: {
    fontSize: Fonts.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  balanceValue: {
    fontSize: Fonts.lg,
    fontWeight: "800",
  },
  emptyCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
    marginBottom: 10,
  },
  emptyText: { fontSize: Fonts.sm, color: Colors.textMuted },
  splitCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    flexDirection: "row",
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  splitItem: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    gap: 4,
  },
  splitLabel: { fontSize: Fonts.xs, color: Colors.textSecondary, fontWeight: "600", textAlign: "center" },
  splitValue: { fontSize: Fonts.lg, fontWeight: "800" },
  splitSub: { fontSize: 11, color: Colors.textMuted },
  splitDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  summaryCard: {
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
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  summaryNetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 4,
  },
  summaryNetLabel: { fontSize: Fonts.base, fontWeight: "700", color: Colors.text },
  summaryNetValue: { fontSize: Fonts.xl, fontWeight: "800" },
});
