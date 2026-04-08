import { useEffect } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { startNetworkMonitor, fullSync } from "../lib/sync";
import OfflineBanner from "../components/OfflineBanner";

export default function RootLayout() {
  useEffect(() => {
    // Start network monitoring and initial data sync
    startNetworkMonitor();
    fullSync().catch(() => {});
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <View style={{ flex: 1 }}>
        <OfflineBanner />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="screens" />
        </Stack>
      </View>
    </SafeAreaProvider>
  );
}
