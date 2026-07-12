import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Fonts } from "../../lib/colors";
import { useT } from "../../lib/i18n";

interface FeatureTile {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  bg: string;
  route: string;
  params?: Record<string, string>;
}

export default function FeaturesScreen() {
  const t = useT();

  const sections: { title: string; items: FeatureTile[] }[] = [
    {
      title: "Masters",
      items: [
        { icon: "people", label: t("headerAgents"), color: "#7c3aed", bg: "#ede9fe", route: "/screens/agents" },
        { icon: "person", label: t("headerCustomers"), color: "#2563eb", bg: "#dbeafe", route: "/screens/customers" },
        { icon: "leaf", label: t("headerSuppliers"), color: "#059669", bg: "#d1fae5", route: "/screens/suppliers" },
        { icon: "cube", label: t("inventory"), color: "#d97706", bg: "#fef3c7", route: "/screens/inventory" },
        { icon: "business", label: t("headerBanks"), color: "#0891b2", bg: "#cffafe", route: "/screens/banks" },
        { icon: "car", label: t("transporters"), color: "#dc2626", bg: "#fee2e2", route: "/screens/transporters" },
      ],
    },
    {
      title: "Transactions",
      items: [
        { icon: "cart", label: t("purchaseEntry"), color: "#059669", bg: "#d1fae5", route: "/screens/purchase-entry" },
        { icon: "pricetag", label: t("saleEntry"), color: "#2563eb", bg: "#dbeafe", route: "/screens/sale-entry" },
        { icon: "arrow-down-circle", label: t("receiptVoucher"), color: "#059669", bg: "#d1fae5", route: "/screens/receipt-voucher" },
        { icon: "arrow-up-circle", label: t("paymentVoucher"), color: "#dc2626", bg: "#fee2e2", route: "/screens/payment-voucher" },
        { icon: "cash", label: t("advances"), color: "#d97706", bg: "#fef3c7", route: "/screens/advances" },
        { icon: "add-circle", label: t("headerNewDeal"), color: "#059669", bg: "#d1fae5", route: "/screens/new-deal" },
      ],
    },
    {
      title: "Invoice & Print",
      items: [
        { icon: "receipt", label: "Invoice", color: "#059669", bg: "#d1fae5", route: "/screens/print-deals", params: { mode: "invoice" } },
        { icon: "car", label: "Transport Invoice", color: "#d97706", bg: "#fef3c7", route: "/screens/print-deals", params: { mode: "transport" } },
      ],
    },
    {
      title: "Reports",
      items: [
        { icon: "today", label: t("dayBook"), color: "#0891b2", bg: "#cffafe", route: "/screens/daybook" },
        { icon: "book", label: t("ledger"), color: "#7c3aed", bg: "#ede9fe", route: "/screens/ledger" },
        { icon: "layers", label: t("stockRegister"), color: "#d97706", bg: "#fef3c7", route: "/screens/stock-register" },
        { icon: "bar-chart", label: t("weeklyPnl"), color: "#059669", bg: "#d1fae5", route: "/screens/weekly-pnl" },
        { icon: "time", label: t("outstanding"), color: "#dc2626", bg: "#fee2e2", route: "/screens/outstanding" },
        { icon: "receipt", label: t("gstReport"), color: "#059669", bg: "#d1fae5", route: "/screens/gst-report" },
        { icon: "analytics", label: t("analytics"), color: "#2563eb", bg: "#dbeafe", route: "/screens/analytics" },
        { icon: "leaf", label: t("mandiRates"), color: "#059669", bg: "#d1fae5", route: "/screens/mandi-rates" },
      ],
    },
    {
      title: "Settings",
      items: [
        { icon: "person-circle", label: t("profile"), color: "#7c3aed", bg: "#ede9fe", route: "/screens/profile" },
        { icon: "calculator", label: "Calculator", color: "#0891b2", bg: "#cffafe", route: "/(tabs)/calculator" },
      ],
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.greenBg }} edges={["bottom"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {sections.map((section) => (
          <View key={section.title}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.grid}>
              {section.items.map((item) => (
                <TouchableOpacity
                  key={item.label}
                  style={styles.tile}
                  onPress={() => item.params
                    ? router.push({ pathname: item.route as any, params: item.params })
                    : router.push(item.route as any)
                  }
                  activeOpacity={0.7}
                >
                  <View style={[styles.tileIcon, { backgroundColor: item.bg }]}>
                    <Ionicons name={item.icon} size={28} color={item.color} />
                  </View>
                  <Text style={styles.tileLabel} numberOfLines={2}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.greenBg,
  },
  sectionTitle: {
    fontSize: Fonts.xs,
    fontWeight: "700",
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    gap: 0,
  },
  tile: {
    width: "33.33%",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  tileIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  tileLabel: {
    fontSize: Fonts.xs,
    fontWeight: "600",
    color: Colors.text,
    textAlign: "center",
    lineHeight: 16,
  },
});
