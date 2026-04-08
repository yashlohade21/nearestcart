import { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts } from "../../lib/colors";
import { formatRupees } from "../../components/formatters";

export default function CalculatorScreen() {
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [buyRate, setBuyRate] = useState("");
  const [sellRate, setSellRate] = useState("");
  const [transportCost, setTransportCost] = useState("");
  const [labourCost, setLabourCost] = useState("");

  const calc = useMemo(() => {
    const qty = parseFloat(quantity) || 0;
    const buy = parseFloat(buyRate) || 0;
    const sell = parseFloat(sellRate) || 0;
    const transport = parseFloat(transportCost) || 0;
    const labour = parseFloat(labourCost) || 0;

    const buyTotal = buy * qty;
    const sellTotal = sell * qty;
    const grossMargin = sellTotal - buyTotal;
    const totalCosts = transport + labour;
    const netProfit = grossMargin - totalCosts;
    const marginPct = sellTotal > 0 ? (netProfit / sellTotal) * 100 : 0;
    const perQuintal = qty > 0 ? (netProfit / qty) * 100 : 0; // per 100 units

    return { buyTotal, sellTotal, grossMargin, totalCosts, netProfit, marginPct, perQuintal };
  }, [quantity, buyRate, sellRate, transportCost, labourCost]);

  const clearAll = () => {
    setQuantity("");
    setUnit("kg");
    setBuyRate("");
    setSellRate("");
    setTransportCost("");
    setLabourCost("");
  };

  const useInNewDeal = () => {
    router.push({
      pathname: "/screens/new-deal",
      params: {
        quantity,
        unit,
        buyRate,
        sellRate,
        transportCost,
      },
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.row}>
          <View style={[styles.fieldContainer, { flex: 2 }]}>
            <Text style={styles.label}>Quantity</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor={Colors.textMuted}
              keyboardType="decimal-pad"
              value={quantity}
              onChangeText={setQuantity}
            />
          </View>
          <View style={[styles.fieldContainer, { flex: 1, marginLeft: 12 }]}>
            <Text style={styles.label}>Unit</Text>
            <TextInput
              style={styles.input}
              placeholder="kg"
              placeholderTextColor={Colors.textMuted}
              value={unit}
              onChangeText={setUnit}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.fieldContainer, { flex: 1 }]}>
            <Text style={styles.label}>Buy Rate (/{unit})</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor={Colors.textMuted}
              keyboardType="decimal-pad"
              value={buyRate}
              onChangeText={setBuyRate}
            />
          </View>
          <View style={[styles.fieldContainer, { flex: 1, marginLeft: 12 }]}>
            <Text style={styles.label}>Sell Rate (/{unit})</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor={Colors.textMuted}
              keyboardType="decimal-pad"
              value={sellRate}
              onChangeText={setSellRate}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.fieldContainer, { flex: 1 }]}>
            <Text style={styles.label}>Transport Cost</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor={Colors.textMuted}
              keyboardType="decimal-pad"
              value={transportCost}
              onChangeText={setTransportCost}
            />
          </View>
          <View style={[styles.fieldContainer, { flex: 1, marginLeft: 12 }]}>
            <Text style={styles.label}>Labour Cost</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor={Colors.textMuted}
              keyboardType="decimal-pad"
              value={labourCost}
              onChangeText={setLabourCost}
            />
          </View>
        </View>

        {/* Results */}
        <View style={styles.resultCard}>
          <ResultRow label="Buy Total" value={formatRupees(calc.buyTotal)} />
          <ResultRow label="Sell Total" value={formatRupees(calc.sellTotal)} />
          <View style={styles.divider} />
          <ResultRow
            label="Gross Margin"
            value={formatRupees(calc.grossMargin)}
            color={calc.grossMargin >= 0 ? Colors.green : Colors.red}
          />
          <ResultRow label="Total Costs" value={formatRupees(calc.totalCosts)} />
          <View style={styles.divider} />
          <ResultRow
            label="Net Profit"
            value={formatRupees(calc.netProfit)}
            color={calc.netProfit >= 0 ? Colors.green : Colors.red}
            bold
          />
          <View style={styles.divider} />
          <ResultRow
            label="Margin %"
            value={`${calc.marginPct.toFixed(1)}%`}
            color={calc.marginPct >= 0 ? Colors.green : Colors.red}
          />
          <ResultRow
            label="Per Quintal Profit"
            value={formatRupees(calc.perQuintal)}
            color={calc.perQuintal >= 0 ? Colors.green : Colors.red}
          />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearAll}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh" size={20} color={Colors.textSecondary} />
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.useButton}
            onPress={useInNewDeal}
            activeOpacity={0.7}
          >
            <Text style={styles.useButtonText}>Use in New Deal</Text>
            <Ionicons name="arrow-forward" size={20} color={Colors.textWhite} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function ResultRow({
  label,
  value,
  color,
  bold,
}: {
  label: string;
  value: string;
  color?: string;
  bold?: boolean;
}) {
  return (
    <View style={rstyles.row}>
      <Text style={[rstyles.label, bold && { fontWeight: "700" }]}>{label}</Text>
      <Text
        style={[
          bold ? rstyles.valueBig : rstyles.value,
          color ? { color } : {},
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const rstyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  label: {
    fontSize: Fonts.sm,
    color: Colors.textSecondary,
  },
  value: {
    fontSize: Fonts.lg,
    fontWeight: "700",
    color: Colors.text,
  },
  valueBig: {
    fontSize: Fonts["2xl"],
    fontWeight: "800",
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.greenBg,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  fieldContainer: {
    marginBottom: 14,
  },
  label: {
    fontSize: Fonts.sm,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: Fonts.base,
    color: Colors.text,
  },
  row: {
    flexDirection: "row",
  },
  resultCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 10,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  clearButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingVertical: 16,
  },
  clearText: {
    fontSize: Fonts.base,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  useButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.green,
    borderRadius: 14,
    paddingVertical: 16,
  },
  useButtonText: {
    color: Colors.textWhite,
    fontSize: Fonts.base,
    fontWeight: "700",
  },
});
