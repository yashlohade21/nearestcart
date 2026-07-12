import { Tabs } from "expo-router";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts } from "../../lib/colors";
import { useT } from "../../lib/i18n";

export default function TabsLayout() {
  const t = useT();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.green,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.border,
          height: 70,
          paddingBottom: 10,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: "600",
        },
        headerStyle: {
          backgroundColor: Colors.green,
        },
        headerTintColor: Colors.textWhite,
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 18,
        },
        headerStatusBarHeight: 0,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabHome"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          headerTitle: "Dashboard",
        }}
      />
      <Tabs.Screen
        name="deals"
        options={{
          title: t("tabDeals"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text" size={size} color={color} />
          ),
          headerTitle: t("headerDeals"),
        }}
      />
      <Tabs.Screen
        name="print"
        options={{
          title: t("tabFeatures"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid" size={size} color={color} />
          ),
          headerTitle: t("headerFeatures"),
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          title: t("tabPay"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet" size={size} color={color} />
          ),
          headerTitle: t("headerPayments"),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: t("tabMore"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="menu" size={size} color={color} />
          ),
          headerTitle: t("headerMore"),
        }}
      />
      {/* Hide calculator from tabs but keep the file */}
      <Tabs.Screen
        name="calculator"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
