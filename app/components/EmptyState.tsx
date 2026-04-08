import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts } from "../lib/colors";

export default function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={40} color={Colors.textMuted} />
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 40,
    alignItems: "center",
  },
  title: {
    fontSize: Fonts.base,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginTop: 12,
  },
  subtitle: {
    fontSize: Fonts.sm,
    color: Colors.textMuted,
    marginTop: 4,
    textAlign: "center",
  },
});
