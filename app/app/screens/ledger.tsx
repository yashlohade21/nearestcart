import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Fonts } from "../../lib/colors";
import { useT } from "../../lib/i18n";
import { offlineGet } from "../../lib/offline-api";
import EntityPicker, { Entity } from "../../components/EntityPicker";
import api from "../../lib/api";

interface LedgerEntry {
  date: string;
  type: string;
  description: string;
  debit: number;
  credit: number;
  running_balance: number;
}

interface LedgerData {
  party_name: string;
  party_type: string;
  opening_balance: number;
  entries: LedgerEntry[];
  closing_balance: number;
  total_debit: number;
  total_credit: number;
}

export default function LedgerScreen() {
  const t = useT();

  const [partyType, setPartyType] = useState<"farmer" | "buyer">("farmer");
  const [partyId, setPartyId] = useState("");
  const [farmers, setFarmers] = useState<Entity[]>([]);
  const [buyers, setBuyers] = useState<Entity[]>([]);
  const [data, setData] = useState<LedgerData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    offlineGet<Entity[]>("/farmers").then(setFarmers).catch(() => {});
    offlineGet<Entity[]>("/buyers").then(setBuyers).catch(() => {});
  }, []);

  useEffect(() => {
    setPartyId("");
    setData(null);
  }, [partyType]);

  const fetchLedger = async () => {
    if (!partyId) return;
    setLoading(true);
    try {
      const d = await api<LedgerData>(
        `/reports/ledger?party_type=${partyType}&party_id=${partyId}`
      );
      setData(d);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    if (partyId) fetchLedger();
  }, [partyId]);

  const fmt = (n: number) => `₹${Math.abs(n).toLocaleString("en-IN")}`;

  const renderEntry = ({ item }: { item: LedgerEntry }) => (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowDate}>{item.date}</Text>
        <Text style={styles.rowDesc} numberOfLines={2}>{item.description}</Text>
      </View>
      <View style={styles.rowAmounts}>
        <Text style={[styles.rowAmt, item.debit > 0 && { color: Colors.red }]}>
          {item.debit > 0 ? fmt(item.debit) : "-"}
        </Text>
        <Text style={[styles.rowAmt, item.credit > 0 && { color: Colors.green }]}>
          {item.credit > 0 ? fmt(item.credit) : "-"}
        </Text>
        <Text style={styles.rowBal}>{fmt(item.running_balance)}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.greenBg }} edges={["bottom"]}>
    <View style={styles.container}>
      {/* Party Type Toggle */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggle, partyType === "farmer" && styles.toggleActive]}
          onPress={() => setPartyType("farmer")}
        >
          <Text style={[styles.toggleText, partyType === "farmer" && styles.toggleTextActive]}>
            {t("farmer")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggle, partyType === "buyer" && styles.toggleActive]}
          onPress={() => setPartyType("buyer")}
        >
          <Text style={[styles.toggleText, partyType === "buyer" && styles.toggleTextActive]}>
            {t("buyer")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Party Picker */}
      <View style={styles.pickerCard}>
        <EntityPicker
          label={t("selectParty")}
          placeholder={t("selectParty")}
          items={partyType === "farmer" ? farmers : buyers}
          selectedId={partyId}
          onSelect={(id) => setPartyId(id)}
          onAddNew={() => {}}
          addLabel=""
        />
      </View>

      {/* Summary Card */}
      {data && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>{data.party_name}</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>{t("totalDebit")}</Text>
              <Text style={[styles.summaryValue, { color: Colors.red }]}>{fmt(data.total_debit)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>{t("totalCredit")}</Text>
              <Text style={[styles.summaryValue, { color: Colors.green }]}>{fmt(data.total_credit)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>{t("closingBalance")}</Text>
              <Text style={styles.summaryValue}>{fmt(data.closing_balance)}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Header Row */}
      {data && data.entries.length > 0 && (
        <View style={styles.headerRow}>
          <Text style={[styles.headerCell, { flex: 1 }]}>Details</Text>
          <Text style={styles.headerCellAmt}>{t("debit")}</Text>
          <Text style={styles.headerCellAmt}>{t("credit")}</Text>
          <Text style={styles.headerCellAmt}>{t("runningBalance")}</Text>
        </View>
      )}

      {/* Entries */}
      <FlatList
        data={data?.entries || []}
        renderItem={renderEntry}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchLedger} colors={[Colors.green]} />
        }
        ListEmptyComponent={
          partyId ? (
            <View style={styles.empty}>
              <Ionicons name="document-text-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyText}>{t("noLedgerEntries")}</Text>
            </View>
          ) : null
        }
      />
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.greenBg },
  toggleRow: {
    flexDirection: "row",
    margin: 16,
    marginBottom: 0,
    backgroundColor: Colors.card,
    borderRadius: 12,
    overflow: "hidden",
  },
  toggle: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  toggleActive: {
    backgroundColor: Colors.green,
  },
  toggleText: {
    fontSize: Fonts.sm,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  toggleTextActive: {
    color: Colors.textWhite,
  },
  pickerCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    margin: 16,
    marginBottom: 0,
  },
  summaryCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    margin: 16,
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: Fonts.lg,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryItem: { alignItems: "center" },
  summaryLabel: { fontSize: Fonts.xs, color: Colors.textMuted, marginBottom: 4 },
  summaryValue: { fontSize: Fonts.lg, fontWeight: "700", color: Colors.text },
  headerRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.greenLight,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  headerCell: { fontSize: Fonts.xs, fontWeight: "700", color: Colors.textSecondary },
  headerCellAmt: { fontSize: Fonts.xs, fontWeight: "700", color: Colors.textSecondary, width: 70, textAlign: "right" },
  row: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowDate: { fontSize: Fonts.xs, color: Colors.textMuted },
  rowDesc: { fontSize: Fonts.sm, color: Colors.text, marginTop: 2 },
  rowAmounts: { flexDirection: "row", alignItems: "center" },
  rowAmt: { width: 70, textAlign: "right", fontSize: Fonts.sm, color: Colors.textMuted },
  rowBal: { width: 70, textAlign: "right", fontSize: Fonts.sm, fontWeight: "600", color: Colors.text },
  empty: { alignItems: "center", marginTop: 60 },
  emptyText: { fontSize: Fonts.base, color: Colors.textMuted, marginTop: 12 },
});
