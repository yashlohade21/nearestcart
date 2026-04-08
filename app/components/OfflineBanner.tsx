import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { addSyncListener, processSyncQueue, SyncStatus } from "../lib/sync";
import { Colors, Fonts } from "../lib/colors";

export default function OfflineBanner() {
  const [status, setStatus] = useState<SyncStatus>({
    isOnline: true,
    isSyncing: false,
    pendingCount: 0,
    lastSyncAt: null,
  });

  useEffect(() => {
    const unsub = addSyncListener(setStatus);
    return unsub;
  }, []);

  // Don't show anything when online and no pending items
  if (status.isOnline && status.pendingCount === 0 && !status.isSyncing) {
    return null;
  }

  return (
    <View
      style={[
        styles.banner,
        status.isOnline ? styles.syncBanner : styles.offlineBanner,
      ]}
    >
      {!status.isOnline ? (
        <>
          <Ionicons name="cloud-offline-outline" size={16} color="#fff" />
          <Text style={styles.bannerText}>
            Offline{status.pendingCount > 0 ? ` (${status.pendingCount} pending)` : ""}
          </Text>
        </>
      ) : status.isSyncing ? (
        <>
          <Ionicons name="sync-outline" size={16} color="#fff" />
          <Text style={styles.bannerText}>Syncing...</Text>
        </>
      ) : status.pendingCount > 0 ? (
        <>
          <Ionicons name="cloud-upload-outline" size={16} color="#fff" />
          <Text style={styles.bannerText}>
            {status.pendingCount} pending
          </Text>
          <TouchableOpacity
            onPress={() => processSyncQueue()}
            style={styles.syncBtn}
          >
            <Text style={styles.syncBtnText}>Sync Now</Text>
          </TouchableOpacity>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 8,
  },
  offlineBanner: {
    backgroundColor: "#dc2626",
  },
  syncBanner: {
    backgroundColor: Colors.amber,
  },
  bannerText: {
    color: "#fff",
    fontSize: Fonts.xs,
    fontWeight: "600",
  },
  syncBtn: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  syncBtnText: {
    color: "#fff",
    fontSize: Fonts.xs,
    fontWeight: "700",
  },
});
