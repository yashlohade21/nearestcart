import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Colors, Fonts } from "../lib/colors";
import { formatRupees, formatDate } from "./formatters";

export interface DealCardData {
  id: string;
  farmer_name: string | null;
  buyer_name: string | null;
  product_name: string | null;
  quantity: number;
  unit: string;
  buy_rate: number;
  sell_rate: number;
  net_profit: number;
  deal_date: string;
}

export default function DealCard({
  deal,
  onPress,
}: {
  deal: DealCardData;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.dealCard}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={styles.dealHeader}>
        <Text style={styles.dealProduct}>
          {deal.product_name || "—"}
        </Text>
        <Text
          style={[
            styles.dealProfit,
            {
              color: deal.net_profit >= 0 ? Colors.green : Colors.red,
            },
          ]}
        >
          {deal.net_profit >= 0 ? "+" : ""}
          {formatRupees(deal.net_profit)}
        </Text>
      </View>
      <Text style={styles.dealParties}>
        {deal.farmer_name || "—"} → {deal.buyer_name || "—"}
      </Text>
      <View style={styles.dealFooter}>
        <Text style={styles.dealDetails}>
          {deal.quantity} {deal.unit} | Buy {formatRupees(deal.buy_rate)}/{deal.unit} | Sell{" "}
          {formatRupees(deal.sell_rate)}/{deal.unit}
        </Text>
        <Text style={styles.dealDate}>{formatDate(deal.deal_date)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  dealCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  dealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  dealProduct: {
    fontSize: Fonts.base,
    fontWeight: "700",
    color: Colors.text,
  },
  dealProfit: {
    fontSize: Fonts.base,
    fontWeight: "700",
  },
  dealParties: {
    fontSize: Fonts.sm,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  dealFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dealDetails: {
    fontSize: Fonts.xs,
    color: Colors.textMuted,
    flex: 1,
  },
  dealDate: {
    fontSize: Fonts.xs,
    color: Colors.textMuted,
    marginLeft: 8,
  },
});
