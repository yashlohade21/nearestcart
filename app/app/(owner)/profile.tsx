import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import Button from "../../components/Button";

export default function OwnerProfileScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>O</Text>
        </View>
        <Text style={styles.name}>Shop Owner</Text>
        <Text style={styles.role}>Owner Mode</Text>
      </View>

      <View style={styles.actions}>
        <Button
          title="Switch to Shopper"
          onPress={() => router.replace("/(shopper)/search")}
          style={styles.switchButton}
        />
        <Button
          title="Sign Out"
          onPress={() => router.replace("/")}
          style={styles.signOutButton}
          textStyle={styles.signOutText}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginTop: 32,
    marginBottom: 48,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
  },
  role: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  actions: {
    gap: 12,
  },
  switchButton: {
    backgroundColor: "#10b981",
  },
  signOutButton: {
    backgroundColor: "#fee2e2",
  },
  signOutText: {
    color: "#dc2626",
  },
});
