import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import Button from "../components/Button";

export default function RoleSelectScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NearKart</Text>
      <Text style={styles.subtitle}>How would you like to use NearKart?</Text>

      <View style={styles.buttonGroup}>
        <Button
          title="I'm a Shopper"
          onPress={() => router.push("/(shopper)/search")}
          style={styles.shopperButton}
        />
        <Button
          title="I'm a Shop Owner"
          onPress={() => router.push("/(owner)/products")}
          style={styles.ownerButton}
        />
      </View>

      <Text style={styles.footer}>You can switch roles anytime from your profile.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 36,
    fontWeight: "700",
    color: "#10b981",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#374151",
    marginBottom: 48,
    textAlign: "center",
  },
  buttonGroup: {
    width: "100%",
    gap: 16,
  },
  shopperButton: {
    backgroundColor: "#10b981",
  },
  ownerButton: {
    backgroundColor: "#3b82f6",
  },
  footer: {
    marginTop: 32,
    fontSize: 13,
    color: "#9ca3af",
    textAlign: "center",
  },
});
