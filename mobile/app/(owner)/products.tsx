import { View, Text, StyleSheet } from "react-native";
import Button from "../../components/Button";

export default function ProductsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.placeholder}>
        <Text style={styles.title}>Your Products</Text>
        <Text style={styles.subtitle}>
          Manage your shop's inventory. Add, edit, or remove products.
        </Text>
        <Button
          title="+ Add Product"
          onPress={() => {
            // TODO: navigate to add product screen
          }}
          style={styles.addButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 32,
  },
});
