import { useEffect } from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Colors } from "../lib/colors";
import { startNetworkMonitor, fullSync } from "../lib/sync";
import OfflineBanner from "../components/OfflineBanner";
import { LanguageProvider } from "../lib/i18n";

export default function RootLayout() {
  useEffect(() => {
    startNetworkMonitor();
    fullSync().catch(() => {});
  }, []);

  return (
    <LanguageProvider>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor={Colors.green} />
        <SafeAreaView
          style={{ flex: 1, backgroundColor: Colors.green }}
          edges={["top"]}
        >
          <OfflineBanner />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: Colors.greenBg },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="screens" />
          </Stack>
        </SafeAreaView>
      </SafeAreaProvider>
    </LanguageProvider>
  );
}
