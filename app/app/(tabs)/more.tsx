import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from "react-native";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts } from "../../lib/colors";
import { fullSync } from "../../lib/sync";
import { useT, useLanguage } from "../../lib/i18n";
import api from "../../lib/api";

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle: string;
  onPress: () => void;
  color?: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export default function MoreScreen() {
  const t = useT();
  const { lang, setLang } = useLanguage();
  const [userRole, setUserRole] = useState<string>("owner");

  useEffect(() => {
    api<{ role: string }>("/auth/profile")
      .then((p) => setUserRole(p.role))
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    Alert.alert(t("logout"), t("logoutConfirm"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("logout"),
        style: "destructive",
        onPress: async () => {
          await SecureStore.deleteItemAsync("token");
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const sections: MenuSection[] = [
    {
      title: "Masters",
      items: [
        { icon: "leaf-outline", label: t("headerSuppliers"), subtitle: "Manage suppliers (farmers)", onPress: () => router.push("/screens/suppliers") },
        { icon: "person-outline", label: t("headerCustomers"), subtitle: "Manage customers (buyers)", onPress: () => router.push("/screens/customers") },
        { icon: "cube-outline", label: t("inventory"), subtitle: t("manageProducts"), onPress: () => router.push("/screens/inventory") },
        { icon: "car-outline", label: t("transporters"), subtitle: t("manageTransportPartners"), onPress: () => router.push("/screens/transporters") },
        { icon: "people-outline", label: t("headerAgents"), subtitle: "Manage commission agents", onPress: () => router.push("/screens/agents") },
        { icon: "business-outline", label: t("headerBanks"), subtitle: "Manage bank accounts", onPress: () => router.push("/screens/banks") },
        { icon: "bus-outline", label: t("vehicleMaster"), subtitle: "Manage vehicles", onPress: () => router.push("/screens/vehicle-master") },
        { icon: "location-outline", label: t("deliveryPlaces"), subtitle: "Delivery locations", onPress: () => router.push("/screens/delivery-places") },
        { icon: "storefront-outline", label: t("kharidarMaster"), subtitle: "Manage kharidars", onPress: () => router.push("/screens/kharidar-master") },
      ],
    },
    {
      title: "Purchase",
      items: [
        { icon: "cart-outline", label: t("purchaseEntry"), subtitle: t("purchaseEntryDesc"), onPress: () => router.push("/screens/purchase-entry") },
        { icon: "arrow-up-circle-outline", label: t("paymentVoucher"), subtitle: t("paymentVoucherDesc"), onPress: () => router.push("/screens/payment-voucher") },
      ],
    },
    {
      title: "Sales",
      items: [
        { icon: "pricetag-outline", label: t("saleEntry"), subtitle: t("saleEntryDesc"), onPress: () => router.push("/screens/sale-entry") },
        { icon: "arrow-down-circle-outline", label: t("receiptVoucher"), subtitle: t("receiptVoucherDesc"), onPress: () => router.push("/screens/receipt-voucher") },
      ],
    },
    {
      title: "Farmer",
      items: [
        { icon: "leaf-outline", label: t("farmerEntry"), subtitle: t("farmerEntryDesc"), onPress: () => router.push("/screens/farmer-entry") },
        { icon: "calculator-outline", label: t("farmerSale"), subtitle: t("farmerSaleDesc"), onPress: () => router.push("/screens/farmer-sale") },
        { icon: "wallet-outline", label: t("farmerPayment"), subtitle: "Pay farmer", onPress: () => router.push("/screens/farmer-payment") },
        { icon: "document-text-outline", label: t("naveBill"), subtitle: t("naveBillDesc"), onPress: () => router.push("/screens/nave-bill") },
      ],
    },
    {
      title: "Money",
      items: [
        { icon: "cash-outline", label: t("cashEntry"), subtitle: t("cashEntryDesc"), onPress: () => router.push("/screens/cash-entry") },
        { icon: "business-outline", label: t("bankTxn"), subtitle: t("bankTxnDesc"), onPress: () => router.push("/screens/bank-txn") },
        { icon: "receipt-outline", label: t("expenseEntry"), subtitle: t("expenseEntryDesc"), onPress: () => router.push("/screens/expense-entry") },
        { icon: "pie-chart-outline", label: t("balanceCheck"), subtitle: "Cash & bank balances", onPress: () => router.push("/screens/balance-check") },
        { icon: "cash-outline", label: t("advances"), subtitle: t("farmerAdvanceTracking"), onPress: () => router.push("/screens/advances") },
        { icon: "ribbon-outline", label: t("agentCommission"), subtitle: "Agent commission tracking", onPress: () => router.push("/screens/agent-payment") },
      ],
    },
    {
      title: "Reports",
      items: [
        { icon: "documents-outline", label: t("reportsHub"), subtitle: "All reports", onPress: () => router.push("/screens/reports-hub") },
        { icon: "book-outline", label: t("ledger"), subtitle: t("ledgerDesc"), onPress: () => router.push("/screens/ledger") },
        { icon: "today-outline", label: t("dayBook"), subtitle: t("dayBookDesc"), onPress: () => router.push("/screens/daybook") },
        { icon: "layers-outline", label: t("stockRegister"), subtitle: t("stockRegisterDesc"), onPress: () => router.push("/screens/stock-register") },
        { icon: "time-outline", label: t("outstanding"), subtitle: t("outstandingDesc"), onPress: () => router.push("/screens/outstanding") },
        { icon: "receipt-outline", label: t("gstReport"), subtitle: t("gstReportDesc"), onPress: () => router.push("/screens/gst-report") },
        { icon: "bar-chart-outline", label: t("weeklyPnl"), subtitle: t("profitLossReport"), onPress: () => router.push("/screens/weekly-pnl") },
        { icon: "analytics-outline", label: t("analytics"), subtitle: t("performanceInsights"), onPress: () => router.push("/screens/analytics") },
        { icon: "leaf-outline", label: t("mandiRates"), subtitle: t("marketPrices"), onPress: () => router.push("/screens/mandi-rates") },
      ],
    },
    ...(userRole === "superadmin" ? [{
      title: "Admin",
      items: [
        { icon: "shield-checkmark-outline" as keyof typeof Ionicons.glyphMap, label: "Admin Panel", subtitle: "View all orgs & activity", onPress: () => router.push("/screens/admin-panel") },
      ],
    }] : []),
    {
      title: "Settings",
      items: [
        { icon: "person-outline", label: t("profile"), subtitle: t("yourAccountDetails"), onPress: () => router.push("/screens/profile") },
        { icon: "language-outline", label: `${t("language")}: ${lang === "hi" ? "हिंदी" : lang === "mr" ? "मराठी" : "English"}`, subtitle: t("changeLanguage"), onPress: () => setLang(lang === "en" ? "hi" : lang === "hi" ? "mr" : "en") },
        {
          icon: "sync-outline", label: t("syncData"), subtitle: t("downloadLatest"),
          onPress: async () => {
            try { await fullSync(); Alert.alert(t("synced"), t("allDataUpToDate")); }
            catch { Alert.alert(t("error"), t("syncFailed")); }
          },
        },
        { icon: "log-out-outline", label: t("logout"), subtitle: t("signOut"), onPress: handleLogout, color: Colors.red },
      ],
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      {sections.map((section) => (
        <View key={section.title}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.card}>
            {section.items.map((item, index) => (
              <View key={item.label}>
                {index > 0 && <View style={styles.divider} />}
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuLeft}>
                    <View
                      style={[
                        styles.iconContainer,
                        item.color
                          ? { backgroundColor: Colors.redLight }
                          : { backgroundColor: Colors.greenLight },
                      ]}
                    >
                      <Ionicons name={item.icon} size={20} color={item.color || Colors.green} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.menuLabel, item.color && { color: item.color }]}>
                        {item.label}
                      </Text>
                      <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.greenBg,
    padding: 16,
  },
  sectionTitle: {
    fontSize: Fonts.sm,
    fontWeight: "700",
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    minHeight: 56,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  menuLabel: {
    fontSize: Fonts.sm,
    fontWeight: "600",
    color: Colors.text,
  },
  menuSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginHorizontal: 14,
  },
});
