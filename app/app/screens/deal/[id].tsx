import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import api from "../../../lib/api";
import { Colors, Fonts } from "../../../lib/colors";
import { formatRupees, formatDate } from "../../../components/formatters";
import LoadingScreen from "../../../components/LoadingScreen";
import PhotoAttachment from "../../../components/PhotoAttachment";

interface DealDetail {
  id: string;
  farmer_name: string | null;
  buyer_name: string | null;
  product_name: string | null;
  quantity: number;
  unit: string;
  buy_rate: number;
  sell_rate: number;
  buy_total: number;
  sell_total: number;
  gross_margin: number;
  transport_cost: number;
  labour_cost: number;
  other_cost: number;
  total_cost: number;
  net_profit: number;
  deal_date: string;
  status: string;
  notes: string | null;
  buyer_paid: number;
  farmer_paid: number;
  created_at: string;
}

export default function DealDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [deal, setDeal] = useState<DealDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDeal = async () => {
    try {
      const data = await api<DealDetail>(`/deals/${id}`);
      setDeal(data);
    } catch {
      Alert.alert("Error", "Failed to load deal");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDeal();
  }, [id]);

  const markComplete = async () => {
    try {
      await api(`/deals/${id}`, {
        method: "PATCH",
        body: { status: "completed" },
      });
      fetchDeal();
    } catch {
      Alert.alert("Error", "Failed to update deal");
    }
  };

  if (loading) return <LoadingScreen />;
  if (!deal) return null;

  const buyerPending = (deal.sell_total || 0) - (deal.buyer_paid || 0);
  const farmerPending = (deal.buy_total || 0) - (deal.farmer_paid || 0);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchDeal();
          }}
          colors={[Colors.green]}
        />
      }
    >
      {/* Status Badge */}
      <View style={styles.statusRow}>
        <View
          style={[
            styles.statusBadge,
            deal.status === "completed"
              ? { backgroundColor: Colors.greenLight }
              : { backgroundColor: Colors.amberLight },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              deal.status === "completed"
                ? { color: Colors.green }
                : { color: Colors.amber },
            ]}
          >
            {deal.status.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.dateText}>{formatDate(deal.deal_date)}</Text>
      </View>

      {/* Parties */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Parties</Text>
        <InfoRow label="Product" value={deal.product_name || "—"} />
        <InfoRow label="Farmer" value={deal.farmer_name || "—"} />
        <InfoRow label="Buyer" value={deal.buyer_name || "—"} />
        <InfoRow label="Quantity" value={`${deal.quantity} ${deal.unit}`} />
      </View>

      {/* Financials */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Financials</Text>
        <InfoRow label="Buy Rate" value={`${formatRupees(deal.buy_rate)}/${deal.unit}`} />
        <InfoRow label="Sell Rate" value={`${formatRupees(deal.sell_rate)}/${deal.unit}`} />
        <View style={styles.divider} />
        <InfoRow label="Buy Total" value={formatRupees(deal.buy_total || deal.buy_rate * deal.quantity)} />
        <InfoRow label="Sell Total" value={formatRupees(deal.sell_total || deal.sell_rate * deal.quantity)} />
        <View style={styles.divider} />
        <InfoRow
          label="Gross Margin"
          value={formatRupees(deal.gross_margin || (deal.sell_rate - deal.buy_rate) * deal.quantity)}
          color={(deal.gross_margin || 0) >= 0 ? Colors.green : Colors.red}
        />
        {(deal.transport_cost || 0) > 0 && (
          <InfoRow label="Transport" value={formatRupees(deal.transport_cost)} />
        )}
        {(deal.labour_cost || 0) > 0 && (
          <InfoRow label="Labour" value={formatRupees(deal.labour_cost)} />
        )}
        {(deal.other_cost || 0) > 0 && (
          <InfoRow label="Other Cost" value={formatRupees(deal.other_cost)} />
        )}
        <View style={styles.divider} />
        <InfoRow
          label="Net Profit"
          value={formatRupees(deal.net_profit)}
          color={deal.net_profit >= 0 ? Colors.green : Colors.red}
          bold
        />
      </View>

      {/* Payment Status */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Payment Status</Text>
        <InfoRow
          label="Buyer Paid"
          value={formatRupees(deal.buyer_paid || 0)}
          color={Colors.green}
        />
        <InfoRow
          label="Buyer Pending"
          value={formatRupees(buyerPending)}
          color={buyerPending > 0 ? Colors.amber : Colors.green}
        />
        <View style={styles.divider} />
        <InfoRow
          label="Farmer Paid"
          value={formatRupees(deal.farmer_paid || 0)}
          color={Colors.green}
        />
        <InfoRow
          label="Farmer Pending"
          value={formatRupees(farmerPending)}
          color={farmerPending > 0 ? Colors.amber : Colors.green}
        />
      </View>

      {/* Photos */}
      <PhotoAttachment entityType="deal" entityId={id!} />

      {/* Notes */}
      {deal.notes && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Notes</Text>
          <Text style={styles.notesText}>{deal.notes}</Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        {deal.status !== "completed" && deal.status !== "cancelled" && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() =>
              router.push({
                pathname: "/screens/deal/edit",
                params: { id: deal.id },
              })
            }
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={20} color={Colors.green} />
            <Text style={styles.completeText}>Edit Deal</Text>
          </TouchableOpacity>
        )}
        {deal.status !== "completed" && (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={markComplete}
            activeOpacity={0.7}
          >
            <Ionicons name="checkmark-circle" size={20} color={Colors.green} />
            <Text style={styles.completeText}>Mark Complete</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.invoiceButton}
          onPress={() =>
            router.push({
              pathname: "/screens/deal/invoice",
              params: { dealId: deal.id },
            })
          }
          activeOpacity={0.7}
        >
          <Ionicons name="document-text" size={20} color={Colors.textWhite} />
          <Text style={styles.invoiceText}>Generate Invoice</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function InfoRow({
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
    <View style={infoStyles.row}>
      <Text style={[infoStyles.label, bold && { fontWeight: "700" }]}>
        {label}
      </Text>
      <Text
        style={[
          bold ? infoStyles.valueBold : infoStyles.value,
          color ? { color } : {},
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  label: {
    fontSize: Fonts.sm,
    color: Colors.textSecondary,
  },
  value: {
    fontSize: Fonts.base,
    fontWeight: "600",
    color: Colors.text,
  },
  valueBold: {
    fontSize: Fonts.lg,
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
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: Fonts.xs,
    fontWeight: "700",
  },
  dateText: {
    fontSize: Fonts.sm,
    color: Colors.textSecondary,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: {
    fontSize: Fonts.base,
    fontWeight: "700",
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  notesText: {
    fontSize: Fonts.base,
    color: Colors.text,
    lineHeight: 22,
  },
  actions: {
    gap: 10,
    marginTop: 8,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.greenLight,
    borderRadius: 14,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Colors.green,
  },
  completeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.greenLight,
    borderRadius: 14,
    paddingVertical: 16,
  },
  completeText: {
    fontSize: Fonts.base,
    fontWeight: "700",
    color: Colors.green,
  },
  invoiceButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.green,
    borderRadius: 14,
    paddingVertical: 16,
  },
  invoiceText: {
    fontSize: Fonts.base,
    fontWeight: "700",
    color: Colors.textWhite,
  },
});
