import { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Ionicons } from "@expo/vector-icons";
import api, { getApiHost } from "../../lib/api";
import { Colors, Fonts } from "../../lib/colors";
import { formatRupees } from "../../components/formatters";
import LoadingScreen from "../../components/LoadingScreen";
import * as SecureStore from "expo-secure-store";
import { useT, useLanguage } from "../../lib/i18n";
import { speak } from "../../lib/tts";

interface WeeklyData {
  week_start: string; week_end: string; total_deals: number;
  total_bought: number; total_sold: number; gross_margin: number;
  total_costs: number; net_profit: number; total_spoilage_qty: number; avg_spoilage_pct: number;
}

function InfoRow({ label, value, color, bold }: { label: string; value: string; color?: string; bold?: boolean }) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, bold && { fontWeight: "700" }]}>{label}</Text>
      <Text style={[bold ? styles.infoValueBold : styles.infoValue, color ? { color } : {}]}>{value}</Text>
    </View>
  );
}

export default function WeeklyPnLScreen() {
  const t = useT();
  const { lang } = useLanguage();
  const [data, setData] = useState<WeeklyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try { const result = await api<WeeklyData>("/dashboard/weekly"); setData(result); }
    catch {} finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <LoadingScreen />;
  if (!data) return null;

  const profitColor = data.net_profit >= 0 ? Colors.green : Colors.red;

  const speakWeekly = () => {
    const profit = Math.round(data.net_profit);
    const bought = Math.round(data.total_bought);
    const sold = Math.round(data.total_sold);
    const text =
      lang === "hi"
        ? `इस हफ्ते ${data.total_deals} सौदे हुए। कुल खरीद ${bought} रुपए। कुल बिक्री ${sold} रुपए। शुद्ध मुनाफा ${profit} रुपए।`
        : `This week ${data.total_deals} deals. Total bought ${bought} rupees. Total sold ${sold} rupees. Net profit ${profit} rupees.`;
    speak(text, lang);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.greenBg }} edges={["bottom"]}>
    <ScrollView style={styles.container} contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} colors={[Colors.green]} />}>
      <Text style={styles.dateRange}>{data.week_start} — {data.week_end}</Text>
      <View style={styles.heroCard}>
        <TouchableOpacity
          style={styles.heroSpeaker}
          onPress={speakWeekly}
          activeOpacity={0.7}
          accessibilityLabel={t("listen")}
        >
          <Ionicons name="volume-high" size={22} color={Colors.green} />
        </TouchableOpacity>
        <Text style={styles.heroLabel}>{t("netProfit")}</Text>
        <Text style={[styles.heroValue, { color: profitColor }]}>{formatRupees(data.net_profit)}</Text>
        <Text style={styles.heroSub}>{data.total_deals} {data.total_deals !== 1 ? t("dealsThisWeek") : t("dealThisWeek")}</Text>
      </View>
      <View style={styles.card}>
        <View style={styles.cardHeader}><Ionicons name="swap-vertical" size={18} color={Colors.green} /><Text style={styles.cardTitle}>{t("volume")}</Text></View>
        <InfoRow label={t("totalBought")} value={formatRupees(data.total_bought)} />
        <InfoRow label={t("totalSold")} value={formatRupees(data.total_sold)} />
      </View>
      <View style={styles.card}>
        <View style={styles.cardHeader}><Ionicons name="trending-up" size={18} color={Colors.green} /><Text style={styles.cardTitle}>{t("marginBreakdown")}</Text></View>
        <InfoRow label={t("grossMargin")} value={formatRupees(data.gross_margin)} color={data.gross_margin >= 0 ? Colors.green : Colors.red} />
        <InfoRow label={t("totalCosts")} value={formatRupees(data.total_costs)} />
        <View style={styles.divider} />
        <InfoRow label={t("netProfit")} value={formatRupees(data.net_profit)} color={profitColor} bold />
      </View>
      <TouchableOpacity style={styles.exportButton} onPress={async () => {
        try {
          let token: string | null = null; try { token = await SecureStore.getItemAsync("token"); } catch {}
          const BASE_URL = `http://${getApiHost()}:8000/api`;
          const fileUri = FileSystem.cacheDirectory + `pnl_${data.week_start}.pdf`;
          const res = await FileSystem.downloadAsync(`${BASE_URL}/export/pnl/pdf?date_from=${data.week_start}&date_to=${data.week_end}`, fileUri, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
          if (res.status === 200 && await Sharing.isAvailableAsync()) { await Sharing.shareAsync(res.uri, { mimeType: "application/pdf" }); }
          else { Alert.alert(t("error"), t("sharingNotAvailable")); }
        } catch { Alert.alert(t("error"), t("exportError")); }
      }} activeOpacity={0.7}>
        <Ionicons name="download-outline" size={18} color={Colors.textWhite} />
        <Text style={styles.exportText}>{t("exportPdf")}</Text>
      </TouchableOpacity>
      {data.total_spoilage_qty > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}><Ionicons name="warning" size={18} color={Colors.amber} /><Text style={styles.cardTitle}>{t("spoilage")}</Text></View>
          <InfoRow label={t("totalSpoilage")} value={`${data.total_spoilage_qty} kg`} color={Colors.red} />
          <InfoRow label={t("avgSpoilagePct")} value={`${data.avg_spoilage_pct.toFixed(1)}%`} color={Colors.amber} />
        </View>
      )}
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.greenBg },
  content: { padding: 16, paddingBottom: 40 },
  dateRange: { fontSize: Fonts.sm, color: Colors.textSecondary, textAlign: "center", marginBottom: 16 },
  heroCard: { backgroundColor: Colors.card, borderRadius: 16, padding: 24, alignItems: "center", marginBottom: 12, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2, position: "relative" },
  heroSpeaker: { position: "absolute", top: 12, right: 12, width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.greenLight, alignItems: "center", justifyContent: "center" },
  heroLabel: { fontSize: Fonts.sm, color: Colors.textSecondary, marginBottom: 4 },
  heroValue: { fontSize: Fonts["4xl"], fontWeight: "800" },
  heroSub: { fontSize: Fonts.sm, color: Colors.textMuted, marginTop: 6 },
  card: { backgroundColor: Colors.card, borderRadius: 16, padding: 20, marginBottom: 12, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  cardTitle: { fontSize: Fonts.base, fontWeight: "700", color: Colors.textSecondary },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 8 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6 },
  infoLabel: { fontSize: Fonts.sm, color: Colors.textSecondary },
  infoValue: { fontSize: Fonts.base, fontWeight: "600", color: Colors.text },
  infoValueBold: { fontSize: Fonts.lg, fontWeight: "800" },
  exportButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: Colors.green, borderRadius: 14, paddingVertical: 14, marginBottom: 12 },
  exportText: { fontSize: Fonts.base, fontWeight: "700", color: Colors.textWhite },
});
