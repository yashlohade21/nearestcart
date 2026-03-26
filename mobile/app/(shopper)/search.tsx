import { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

export default function SearchScreen() {
  const [query, setQuery] = useState("");

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search products near you..."
        placeholderTextColor="#9ca3af"
        value={query}
        onChangeText={setQuery}
      />

      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>
          {query
            ? `Searching for "${query}"...`
            : "Start typing to search for products in nearby shops."}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  searchBar: {
    fontSize: 16,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#111827",
  },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 15,
    color: "#9ca3af",
    textAlign: "center",
  },
});
