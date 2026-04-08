import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts } from "../../lib/colors";
import { fullSync } from "../../lib/sync";

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle: string;
  onPress: () => void;
  color?: string;
}

export default function MoreScreen() {
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await SecureStore.deleteItemAsync("token");
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const items: MenuItem[] = [
    {
      icon: "person-outline",
      label: "Profile",
      subtitle: "Your account details",
      onPress: () => router.push("/screens/profile"),
    },
    {
      icon: "cube-outline",
      label: "Inventory",
      subtitle: "Manage products",
      onPress: () => router.push("/screens/inventory"),
    },
    {
      icon: "bar-chart-outline",
      label: "Weekly P&L",
      subtitle: "Profit & loss report",
      onPress: () => router.push("/screens/weekly-pnl"),
    },
    {
      icon: "cash-outline",
      label: "Advances",
      subtitle: "Farmer advance tracking",
      onPress: () => router.push("/screens/advances"),
    },
    {
      icon: "car-outline",
      label: "Transporters",
      subtitle: "Manage transport partners",
      onPress: () => router.push("/screens/transporters"),
    },
    {
      icon: "analytics-outline",
      label: "Analytics",
      subtitle: "Performance insights",
      onPress: () => router.push("/screens/analytics"),
    },
    {
      icon: "leaf-outline",
      label: "Mandi Rates",
      subtitle: "Market prices",
      onPress: () => router.push("/screens/mandi-rates"),
    },
    {
      icon: "sync-outline",
      label: "Sync Data",
      subtitle: "Download latest from server",
      onPress: async () => {
        try {
          await fullSync();
          Alert.alert("Synced", "All data is up to date");
        } catch {
          Alert.alert("Error", "Sync failed. Check your connection.");
        }
      },
    },
    {
      icon: "log-out-outline",
      label: "Logout",
      subtitle: "Sign out of your account",
      onPress: handleLogout,
      color: Colors.red,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {items.map((item, index) => (
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
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={item.color || Colors.green}
                  />
                </View>
                <View>
                  <Text
                    style={[
                      styles.menuLabel,
                      item.color && { color: item.color },
                    ]}
                  >
                    {item.label}
                  </Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.textMuted}
              />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.greenBg,
    padding: 16,
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
    padding: 16,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  menuLabel: {
    fontSize: Fonts.base,
    fontWeight: "600",
    color: Colors.text,
  },
  menuSubtitle: {
    fontSize: Fonts.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginHorizontal: 16,
  },
});
