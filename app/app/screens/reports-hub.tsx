import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Fonts } from "../../lib/colors";
import { useT } from "../../lib/i18n";

interface ReportCategory {
  key: string;
  titleKey: string;
  description: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  route: string;
  badge?: string;
}

const REPORT_CATEGORIES: ReportCategory[] = [
  {
    key: "invoice",
    titleKey: "invoiceReports",
    description: "Print deal invoices and bills",
    icon: "document-text",
    iconBg: "#eff6ff",
    iconColor: "#3b82f6",
    route: "/screens/print-deals",
  },
  {
    key: "statement",
    titleKey: "statementReports",
    description: "Party-wise account statements",
    icon: "newspaper",
    iconBg: "#fefce8",
    iconColor: "#ca8a04",
    route: "/screens/ledger",
  },
  {
    key: "daybook",
    titleKey: "dateWiseReports",
    description: "Daily transaction summary",
    icon: "calendar",
    iconBg: "#f0fdf4",
    iconColor: Colors.green,
    route: "/screens/daybook",
  },
  {
    key: "outstanding",
    titleKey: "outstanding",
    description: "Aging-wise outstanding report",
    icon: "time",
    iconBg: "#fef2f2",
    iconColor: Colors.red,
    route: "/screens/outstanding",
    badge: "Milna / Dena",
  },
  {
    key: "farmer",
    titleKey: "farmerReports",
    description: "Farmer-wise performance & ledger",
    icon: "leaf",
    iconBg: "#f0fdf4",
    iconColor: "#16a34a",
    route: "/screens/analytics",
  },
  {
    key: "financial",
    titleKey: "financialReports",
    description: "P&L, GST and financial reports",
    icon: "stats-chart",
    iconBg: "#f5f3ff",
    iconColor: "#7c3aed",
    route: "/screens/weekly-pnl",
  },
  {
    key: "gst",
    titleKey: "gstReport",
    description: "GST-wise product summary",
    icon: "receipt",
    iconBg: "#fff7ed",
    iconColor: "#ea580c",
    route: "/screens/gst-report",
  },
  {
    key: "stock",
    titleKey: "stockRegister",
    description: "Product-wise stock register",
    icon: "cube",
    iconBg: "#ecfdf5",
    iconColor: "#059669",
    route: "/screens/stock-register",
  },
  {
    key: "advances",
    titleKey: "advances",
    description: "Active & recovered advances",
    icon: "cash",
    iconBg: "#fefce8",
    iconColor: "#d97706",
    route: "/screens/advances",
  },
  {
    key: "balance",
    titleKey: "balanceCheck",
    description: "Cash & bank balance summary",
    icon: "wallet",
    iconBg: "#f0f9ff",
    iconColor: "#0284c7",
    route: "/screens/balance-check",
  },
];

export default function ReportsHubScreen() {
  const t = useT();

  const handleNavigate = (route: string) => {
    router.push(route as any);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.greenBg }} edges={["bottom"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Banner */}
        <View style={styles.banner}>
          <Ionicons name="bar-chart" size={28} color={Colors.green} />
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>{t("headerReportsHub")}</Text>
            <Text style={styles.bannerSub}>
              {REPORT_CATEGORIES.length} report categories
            </Text>
          </View>
        </View>

        {/* Grid */}
        <View style={styles.grid}>
          {REPORT_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={styles.gridItem}
              onPress={() => handleNavigate(cat.route)}
              activeOpacity={0.75}
            >
              <View style={[styles.iconWrap, { backgroundColor: cat.iconBg }]}>
                <Ionicons name={cat.icon as any} size={26} color={cat.iconColor} />
              </View>
              <Text style={styles.gridTitle} numberOfLines={2}>
                {t(cat.titleKey as any)}
              </Text>
              <Text style={styles.gridDesc} numberOfLines={2}>
                {cat.description}
              </Text>
              {cat.badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cat.badge}</Text>
                </View>
              )}
              <View style={styles.arrowWrap}>
                <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Links */}
        <View style={styles.quickCard}>
          <Text style={styles.quickTitle}>Quick Access</Text>
          {[
            {
              label: "Today's Day Book",
              icon: "today",
              route: "/screens/daybook",
              color: Colors.green,
            },
            {
              label: "Weekly P&L",
              icon: "trending-up",
              route: "/screens/weekly-pnl",
              color: "#7c3aed",
            },
            {
              label: "Outstanding Dues",
              icon: "alert-circle",
              route: "/screens/outstanding",
              color: Colors.red,
            },
            {
              label: "Balance Check",
              icon: "wallet",
              route: "/screens/balance-check",
              color: "#0284c7",
            },
          ].map((item) => (
            <TouchableOpacity
              key={item.route}
              style={styles.quickRow}
              onPress={() => handleNavigate(item.route)}
              activeOpacity={0.7}
            >
              <View style={[styles.quickIcon, { backgroundColor: `${item.color}15` }]}>
                <Ionicons name={item.icon as any} size={18} color={item.color} />
              </View>
              <Text style={styles.quickLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.greenBg },
  scroll: { padding: 16, paddingBottom: 40 },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
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
  bannerText: { flex: 1 },
  bannerTitle: { fontSize: Fonts.xl, fontWeight: "800", color: Colors.text },
  bannerSub: { fontSize: Fonts.sm, color: Colors.textMuted, marginTop: 2 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  gridItem: {
    width: "47%",
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    position: "relative",
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  gridTitle: {
    fontSize: Fonts.base,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  gridDesc: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 16,
  },
  badge: {
    backgroundColor: Colors.amberLight,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  badgeText: { fontSize: 11, color: Colors.amber, fontWeight: "600" },
  arrowWrap: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  quickCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  quickTitle: {
    fontSize: Fonts.base,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 12,
  },
  quickRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  quickIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  quickLabel: {
    flex: 1,
    fontSize: Fonts.base,
    fontWeight: "600",
    color: Colors.text,
  },
});
