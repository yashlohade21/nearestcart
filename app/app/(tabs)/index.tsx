import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Fonts } from "../../lib/colors";
import { useT } from "../../lib/i18n";
import api from "../../lib/api";

interface DashboardData {
  today_deals: number;
  today_buy_total: number;
  today_sell_total: number;
  today_net_profit: number;
  pending_from_buyers: number;
  pending_to_farmers: number;
  net_position: number;
  active_advances: number;
  cash_balance?: number;
  total_bank_balance?: number;
}

const fmt = (n: number) =>
  `₹${Math.abs(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export default function HomeScreen() {
  const t = useT();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const d = await api<DashboardData>("/dashboard/overview");
      setData(d);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.greenBg }} edges={["bottom"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchDashboard} colors={[Colors.green]} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* ── Today's Summary ── */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <Text style={styles.heroTitle}>{t("todaysBusiness")}</Text>
            <View style={styles.dealsBadge}>
              <Text style={styles.dealsBadgeText}>
                {data?.today_deals ?? 0} {t("deals")}
              </Text>
            </View>
          </View>

          <View style={styles.heroRow}>
            <View style={styles.heroItem}>
              <Text style={styles.heroLabel}>{t("purchases")}</Text>
              <Text style={styles.heroValue}>{fmt(data?.today_buy_total ?? 0)}</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroItem}>
              <Text style={styles.heroLabel}>{t("sales")}</Text>
              <Text style={styles.heroValue}>{fmt(data?.today_sell_total ?? 0)}</Text>
            </View>
          </View>

          <View style={styles.profitRow}>
            <View style={styles.profitIconWrap}>
              <Ionicons
                name={(data?.today_net_profit ?? 0) >= 0 ? "trending-up" : "trending-down"}
                size={20}
                color={Colors.white}
              />
            </View>
            <View>
              <Text style={styles.profitLabel}>{t("netProfit")}</Text>
              <Text style={[styles.profitValue, (data?.today_net_profit ?? 0) < 0 && { color: "#fca5a5" }]}>
                {(data?.today_net_profit ?? 0) < 0 ? "-" : ""}
                {fmt(data?.today_net_profit ?? 0)}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Cash & Bank Balance ── */}
        <View style={styles.outstandingRow}>
          <View style={[styles.miniCard]}>
            <Ionicons name="wallet-outline" size={20} color="#059669" />
            <Text style={styles.miniLabel}>{t("cashInHand")}</Text>
            <Text style={[styles.miniValue, { color: Colors.green }]}>
              {fmt(data?.cash_balance ?? 0)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.miniCard}
            onPress={() => router.push("/screens/banks" as any)}
            activeOpacity={0.7}
          >
            <Ionicons name="business-outline" size={20} color="#2563eb" />
            <Text style={styles.miniLabel}>{t("bankBalance")}</Text>
            <Text style={[styles.miniValue, { color: "#2563eb" }]}>
              {fmt(data?.total_bank_balance ?? 0)}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Outstanding Cards ── */}
        <View style={styles.outstandingRow}>
          <TouchableOpacity
            style={[styles.outstandingCard, { borderLeftColor: Colors.green }]}
            onPress={() => router.push("/screens/outstanding" as any)}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-down-circle" size={22} color={Colors.green} />
            <Text style={styles.outLabel}>{t("milnaHai")}</Text>
            <Text style={[styles.outValue, { color: Colors.green }]}>
              {fmt(data?.pending_from_buyers ?? 0)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.outstandingCard, { borderLeftColor: Colors.red }]}
            onPress={() => router.push("/screens/outstanding" as any)}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-up-circle" size={22} color={Colors.red} />
            <Text style={styles.outLabel}>{t("denaHai")}</Text>
            <Text style={[styles.outValue, { color: Colors.red }]}>
              {fmt(data?.pending_to_farmers ?? 0)}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Net Position + Advances ── */}
        <View style={styles.outstandingRow}>
          <View style={[styles.miniCard]}>
            <Ionicons name="swap-horizontal" size={20} color="#7c3aed" />
            <Text style={styles.miniLabel}>{t("netPosition")}</Text>
            <Text style={[styles.miniValue, { color: (data?.net_position ?? 0) >= 0 ? Colors.green : Colors.red }]}>
              {(data?.net_position ?? 0) < 0 ? "-" : "+"}
              {fmt(data?.net_position ?? 0)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.miniCard}
            onPress={() => router.push("/screens/advances" as any)}
            activeOpacity={0.7}
          >
            <Ionicons name="cash-outline" size={20} color="#d97706" />
            <Text style={styles.miniLabel}>{t("advances")}</Text>
            <Text style={[styles.miniValue, { color: "#d97706" }]}>
              {fmt(data?.active_advances ?? 0)}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Quick Actions ── */}
        <Text style={styles.sectionTitle}>{t("quickActions")}</Text>
        <View style={styles.quickRow}>
          <QuickAction
            icon="cart-outline"
            label={t("purchases")}
            color="#059669"
            bg="#d1fae5"
            onPress={() => router.push("/screens/purchase-entry" as any)}
          />
          <QuickAction
            icon="pricetag-outline"
            label={t("sales")}
            color="#2563eb"
            bg="#dbeafe"
            onPress={() => router.push("/screens/sale-entry" as any)}
          />
          <QuickAction
            icon="arrow-down-circle-outline"
            label={t("receipt")}
            color="#059669"
            bg="#d1fae5"
            onPress={() => router.push("/screens/receipt-voucher" as any)}
          />
          <QuickAction
            icon="arrow-up-circle-outline"
            label={t("payment")}
            color="#dc2626"
            bg="#fee2e2"
            onPress={() => router.push("/screens/payment-voucher" as any)}
          />
        </View>

        {/* ── Reports Grid ── */}
        <Text style={styles.sectionTitle}>{t("reports")}</Text>
        <View style={styles.reportsGrid}>
          <ReportTile
            icon="today-outline"
            label="Day Book"
            color="#0891b2"
            route="/screens/daybook"
          />
          <ReportTile
            icon="book-outline"
            label="Ledger"
            color="#7c3aed"
            route="/screens/ledger"
          />
          <ReportTile
            icon="layers-outline"
            label="Stock"
            color="#d97706"
            route="/screens/stock-register"
          />
          <ReportTile
            icon="bar-chart-outline"
            label="P&L"
            color="#059669"
            route="/screens/weekly-pnl"
          />
          <ReportTile
            icon="time-outline"
            label="Outstanding"
            color="#dc2626"
            route="/screens/outstanding"
          />
          <ReportTile
            icon="receipt-outline"
            label="GST"
            color="#059669"
            route="/screens/gst-report"
          />
        </View>

        {/* ── All Features ── */}
        <Text style={styles.sectionTitle}>{t("allFeatures")}</Text>
        <View style={styles.shortcutsWrap}>
          <ShortcutRow icon="add-circle-outline" label="New Deal" route="/screens/new-deal" />
          <ShortcutRow icon="document-text-outline" label="All Deals" route="/(tabs)/deals" />
          <ShortcutRow icon="cart-outline" label="Purchase Entry" route="/screens/purchase-entry" />
          <ShortcutRow icon="pricetag-outline" label="Sale Entry" route="/screens/sale-entry" />
          <ShortcutRow icon="arrow-down-circle-outline" label="Receipt Voucher" route="/screens/receipt-voucher" />
          <ShortcutRow icon="arrow-up-circle-outline" label="Payment Voucher" route="/screens/payment-voucher" />
          <ShortcutRow icon="wallet-outline" label="Payments" route="/(tabs)/payments" />
          <ShortcutRow icon="cash-outline" label="Advances" route="/screens/advances" />
          <ShortcutRow icon="leaf-outline" label="Suppliers" route="/screens/suppliers" />
          <ShortcutRow icon="person-outline" label="Customers" route="/screens/customers" />
          <ShortcutRow icon="people-outline" label="Agents" route="/screens/agents" />
          <ShortcutRow icon="cube-outline" label="Inventory" route="/screens/inventory" />
          <ShortcutRow icon="business-outline" label="Banks" route="/screens/banks" />
          <ShortcutRow icon="car-outline" label="Transporters" route="/screens/transporters" />
          <ShortcutRow icon="today-outline" label="Day Book" route="/screens/daybook" />
          <ShortcutRow icon="book-outline" label="Ledger" route="/screens/ledger" />
          <ShortcutRow icon="layers-outline" label="Stock Register" route="/screens/stock-register" />
          <ShortcutRow icon="bar-chart-outline" label="Weekly P&L" route="/screens/weekly-pnl" />
          <ShortcutRow icon="time-outline" label="Outstanding" route="/screens/outstanding" />
          <ShortcutRow icon="receipt-outline" label="GST Report" route="/screens/gst-report" />
          <ShortcutRow icon="analytics-outline" label="Analytics" route="/screens/analytics" />
          <ShortcutRow icon="leaf-outline" label="Mandi Rates" route="/screens/mandi-rates" />
          <ShortcutRow icon="calculator-outline" label="Calculator" route="/(tabs)/calculator" />
          <ShortcutRow icon="person-circle-outline" label="Profile" route="/screens/profile" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ── Sub-components ── */

function QuickAction({
  icon,
  label,
  color,
  bg,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  bg: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.quickItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.quickIcon, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function ReportTile({
  icon,
  label,
  color,
  route,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  route: string;
}) {
  return (
    <TouchableOpacity
      style={styles.reportTile}
      onPress={() => router.push(route as any)}
      activeOpacity={0.7}
    >
      <Ionicons name={icon} size={22} color={color} />
      <Text style={styles.reportLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function ShortcutRow({
  icon,
  label,
  route,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: string;
}) {
  return (
    <TouchableOpacity
      style={styles.shortcutRow}
      onPress={() => router.push(route as any)}
      activeOpacity={0.7}
    >
      <View style={styles.shortcutLeft}>
        <Ionicons name={icon} size={20} color={Colors.textSecondary} />
        <Text style={styles.shortcutLabel}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}

/* ── Styles ── */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.greenBg },

  // Hero Card
  heroCard: {
    backgroundColor: Colors.green,
    borderRadius: 20,
    padding: 20,
    margin: 16,
    marginBottom: 12,
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: Fonts.lg,
    fontWeight: "700",
    color: Colors.textWhite,
  },
  dealsBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dealsBadgeText: {
    fontSize: Fonts.xs,
    fontWeight: "600",
    color: Colors.textWhite,
  },
  heroRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  heroItem: {
    flex: 1,
  },
  heroDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginHorizontal: 16,
  },
  heroLabel: {
    fontSize: Fonts.xs,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 4,
  },
  heroValue: {
    fontSize: Fonts["2xl"],
    fontWeight: "800",
    color: Colors.textWhite,
  },
  profitRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  profitIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  profitLabel: {
    fontSize: Fonts.xs,
    color: "rgba(255,255,255,0.7)",
  },
  profitValue: {
    fontSize: Fonts.xl,
    fontWeight: "800",
    color: Colors.textWhite,
  },

  // Outstanding Cards
  outstandingRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 10,
  },
  outstandingCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    gap: 6,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  outLabel: {
    fontSize: Fonts.xs,
    color: Colors.textMuted,
  },
  outValue: {
    fontSize: Fonts.xl,
    fontWeight: "800",
  },

  // Mini Cards
  miniCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    gap: 6,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  miniLabel: {
    fontSize: Fonts.xs,
    color: Colors.textMuted,
  },
  miniValue: {
    fontSize: Fonts.lg,
    fontWeight: "700",
  },

  // Section title
  sectionTitle: {
    fontSize: Fonts.base,
    fontWeight: "700",
    color: Colors.text,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 10,
  },

  // Quick Actions
  quickRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 6,
  },
  quickItem: {
    flex: 1,
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 14,
    paddingVertical: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  quickIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  quickLabel: {
    fontSize: Fonts.xs,
    fontWeight: "600",
    color: Colors.text,
  },

  // Reports Grid
  reportsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 6,
  },
  reportTile: {
    width: "31%",
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    gap: 6,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  reportLabel: {
    fontSize: Fonts.xs,
    fontWeight: "600",
    color: Colors.text,
  },

  // Shortcuts
  shortcutsWrap: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: "hidden",
  },
  shortcutRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  shortcutLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  shortcutLabel: {
    fontSize: Fonts.sm,
    fontWeight: "500",
    color: Colors.text,
  },
});
