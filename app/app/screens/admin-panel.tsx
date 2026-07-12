import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  Modal,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api, { getApiHost } from "../../lib/api";
import { Colors, Fonts } from "../../lib/colors";
import LoadingScreen from "../../components/LoadingScreen";

const API_HOST = `http://${getApiHost()}:8000`;
const fmt = (n: number) => `₹${Math.abs(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

interface OrgSummary {
  id: string;
  phone: string;
  name: string;
  business_name: string | null;
  city: string | null;
  state: string | null;
  gst_number: string | null;
  logo_url: string | null;
  plan: string;
  is_active: boolean;
  created_at: string;
  total_deals: number;
  total_revenue: number;
  total_profit: number;
  team_size: number;
  last_active: string | null;
}

interface OrgDetail extends OrgSummary {
  address: string | null;
  mandi_name: string | null;
  upi_id: string | null;
  deals_today: number;
  deals_this_week: number;
  deals_this_month: number;
  pending_from_buyers: number;
  pending_to_farmers: number;
}

interface AdminDashboard {
  total_orgs: number;
  active_orgs: number;
  total_deals_today: number;
  total_revenue_today: number;
  total_deals_this_month: number;
  total_revenue_this_month: number;
}

interface AuditEntry {
  id: string;
  user_name: string | null;
  user_business: string | null;
  action: string;
  entity_type: string;
  changes: Record<string, unknown> | null;
  created_at: string;
}

type Tab = "orgs" | "activity";

export default function AdminPanelScreen() {
  const [tab, setTab] = useState<Tab>("orgs");
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [orgs, setOrgs] = useState<OrgSummary[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Org detail modal
  const [selectedOrg, setSelectedOrg] = useState<OrgDetail | null>(null);
  const [showOrgModal, setShowOrgModal] = useState(false);

  const fetchAll = async () => {
    try {
      const [d, o, a] = await Promise.all([
        api<AdminDashboard>("/admin/dashboard"),
        api<OrgSummary[]>("/admin/orgs"),
        api<AuditEntry[]>("/admin/audit?limit=100"),
      ]);
      setDashboard(d);
      setOrgs(o);
      setAudit(a);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const openOrgDetail = async (orgId: string) => {
    try {
      const detail = await api<OrgDetail>(`/admin/orgs/${orgId}`);
      setSelectedOrg(detail);
      setShowOrgModal(true);
    } catch {}
  };

  const toggleOrg = async (orgId: string) => {
    try {
      await api(`/admin/orgs/${orgId}/toggle`, { method: "PATCH" });
      fetchAll();
      setShowOrgModal(false);
    } catch {}
  };

  if (loading) return <LoadingScreen />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.greenBg }} edges={["bottom"]}>
      <View style={styles.container}>
        {/* Dashboard Summary */}
        {dashboard && (
          <View style={styles.summaryRow}>
            <StatCard label="Organizations" value={String(dashboard.active_orgs)} sub={`of ${dashboard.total_orgs}`} color="#7c3aed" />
            <StatCard label="Today" value={String(dashboard.total_deals_today)} sub={fmt(dashboard.total_revenue_today)} color={Colors.green} />
            <StatCard label="This Month" value={String(dashboard.total_deals_this_month)} sub={fmt(dashboard.total_revenue_this_month)} color="#2563eb" />
          </View>
        )}

        {/* Tab Toggle */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggle, tab === "orgs" && styles.toggleActive]}
            onPress={() => setTab("orgs")}
          >
            <Ionicons name="business-outline" size={16} color={tab === "orgs" ? Colors.textWhite : Colors.textSecondary} />
            <Text style={[styles.toggleText, tab === "orgs" && styles.toggleTextActive]}>
              Organizations ({orgs.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggle, tab === "activity" && styles.toggleActive]}
            onPress={() => setTab("activity")}
          >
            <Ionicons name="time-outline" size={16} color={tab === "activity" ? Colors.textWhite : Colors.textSecondary} />
            <Text style={[styles.toggleText, tab === "activity" && styles.toggleTextActive]}>
              Activity Log
            </Text>
          </TouchableOpacity>
        </View>

        {/* Orgs List */}
        {tab === "orgs" && (
          <FlatList
            data={orgs}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.orgCard}
                onPress={() => openOrgDetail(item.id)}
                activeOpacity={0.7}
              >
                <View style={styles.orgHeader}>
                  <View style={styles.orgLeft}>
                    {item.logo_url ? (
                      <Image source={{ uri: `${API_HOST}${item.logo_url}` }} style={styles.orgLogo} />
                    ) : (
                      <View style={styles.orgAvatar}>
                        <Text style={styles.orgAvatarText}>{item.name.charAt(0).toUpperCase()}</Text>
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.orgName}>{item.business_name || item.name}</Text>
                      <Text style={styles.orgSub}>{item.phone} {item.city ? `· ${item.city}` : ""}</Text>
                    </View>
                  </View>
                  <View style={styles.orgRight}>
                    <View style={[styles.planBadge, item.plan === "pro" && { backgroundColor: "#dbeafe" }]}>
                      <Text style={[styles.planText, item.plan === "pro" && { color: "#2563eb" }]}>
                        {item.plan.toUpperCase()}
                      </Text>
                    </View>
                    {!item.is_active && (
                      <View style={[styles.planBadge, { backgroundColor: Colors.redLight }]}>
                        <Text style={[styles.planText, { color: Colors.red }]}>INACTIVE</Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.orgStats}>
                  <OrgStat label="Deals" value={String(item.total_deals)} />
                  <OrgStat label="Revenue" value={fmt(item.total_revenue)} />
                  <OrgStat label="Profit" value={fmt(item.total_profit)} color={item.total_profit >= 0 ? Colors.green : Colors.red} />
                  <OrgStat label="Team" value={String(item.team_size)} />
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingBottom: 24 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAll(); }} colors={[Colors.green]} />
            }
          />
        )}

        {/* Activity Log */}
        {tab === "activity" && (
          <FlatList
            data={audit}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.auditRow}>
                <View style={[styles.auditDot, { backgroundColor: actionColor(item.action) }]} />
                <View style={{ flex: 1 }}>
                  <View style={styles.auditHeader}>
                    <Text style={styles.auditUser}>
                      {item.user_business || item.user_name || "Unknown"}
                    </Text>
                    <Text style={styles.auditTime}>{formatTime(item.created_at)}</Text>
                  </View>
                  <Text style={styles.auditAction}>
                    {item.action.toUpperCase()} {item.entity_type}
                  </Text>
                  {item.changes && Object.keys(item.changes).length > 0 && (
                    <Text style={styles.auditChanges} numberOfLines={2}>
                      {Object.entries(item.changes).map(([k, v]) => `${k}: ${v}`).join(", ")}
                    </Text>
                  )}
                </View>
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 24 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAll(); }} colors={[Colors.green]} />
            }
          />
        )}

        {/* Org Detail Modal */}
        <Modal
          visible={showOrgModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowOrgModal(false)}
        >
          <TouchableOpacity
            style={modalStyles.overlay}
            activeOpacity={1}
            onPress={() => setShowOrgModal(false)}
          >
            <TouchableOpacity activeOpacity={1} style={modalStyles.sheet}>
              <View style={modalStyles.handle} />
              {selectedOrg && (
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={modalStyles.orgHeader}>
                    {selectedOrg.logo_url ? (
                      <Image source={{ uri: `${API_HOST}${selectedOrg.logo_url}` }} style={modalStyles.logo} />
                    ) : (
                      <View style={[styles.orgAvatar, { width: 56, height: 56, borderRadius: 14 }]}>
                        <Text style={[styles.orgAvatarText, { fontSize: 22 }]}>{selectedOrg.name.charAt(0).toUpperCase()}</Text>
                      </View>
                    )}
                    <View style={{ flex: 1, marginLeft: 14 }}>
                      <Text style={modalStyles.orgName}>{selectedOrg.business_name || selectedOrg.name}</Text>
                      <Text style={modalStyles.orgPhone}>{selectedOrg.phone}</Text>
                      {selectedOrg.city && <Text style={modalStyles.orgCity}>{selectedOrg.city}, {selectedOrg.state}</Text>}
                    </View>
                  </View>

                  {/* Detail Stats */}
                  <View style={modalStyles.statsGrid}>
                    <DetailStat label="Today" value={String(selectedOrg.deals_today)} />
                    <DetailStat label="This Week" value={String(selectedOrg.deals_this_week)} />
                    <DetailStat label="This Month" value={String(selectedOrg.deals_this_month)} />
                    <DetailStat label="All Time" value={String(selectedOrg.total_deals)} />
                  </View>

                  <View style={modalStyles.finRow}>
                    <View style={modalStyles.finItem}>
                      <Text style={modalStyles.finLabel}>Revenue</Text>
                      <Text style={modalStyles.finValue}>{fmt(selectedOrg.total_revenue)}</Text>
                    </View>
                    <View style={modalStyles.finItem}>
                      <Text style={modalStyles.finLabel}>Profit</Text>
                      <Text style={[modalStyles.finValue, { color: selectedOrg.total_profit >= 0 ? Colors.green : Colors.red }]}>
                        {fmt(selectedOrg.total_profit)}
                      </Text>
                    </View>
                  </View>

                  <View style={modalStyles.finRow}>
                    <View style={modalStyles.finItem}>
                      <Text style={modalStyles.finLabel}>Milna Hai</Text>
                      <Text style={[modalStyles.finValue, { color: Colors.green }]}>{fmt(selectedOrg.pending_from_buyers)}</Text>
                    </View>
                    <View style={modalStyles.finItem}>
                      <Text style={modalStyles.finLabel}>Dena Hai</Text>
                      <Text style={[modalStyles.finValue, { color: Colors.red }]}>{fmt(selectedOrg.pending_to_farmers)}</Text>
                    </View>
                  </View>

                  {selectedOrg.gst_number && (
                    <View style={modalStyles.infoRow}>
                      <Text style={modalStyles.infoLabel}>GSTIN</Text>
                      <Text style={modalStyles.infoValue}>{selectedOrg.gst_number}</Text>
                    </View>
                  )}
                  {selectedOrg.mandi_name && (
                    <View style={modalStyles.infoRow}>
                      <Text style={modalStyles.infoLabel}>Mandi</Text>
                      <Text style={modalStyles.infoValue}>{selectedOrg.mandi_name}</Text>
                    </View>
                  )}
                  <View style={modalStyles.infoRow}>
                    <Text style={modalStyles.infoLabel}>Plan</Text>
                    <Text style={modalStyles.infoValue}>{selectedOrg.plan.toUpperCase()}</Text>
                  </View>
                  <View style={modalStyles.infoRow}>
                    <Text style={modalStyles.infoLabel}>Team Size</Text>
                    <Text style={modalStyles.infoValue}>{selectedOrg.team_size} members</Text>
                  </View>
                  <View style={modalStyles.infoRow}>
                    <Text style={modalStyles.infoLabel}>Joined</Text>
                    <Text style={modalStyles.infoValue}>{formatTime(selectedOrg.created_at)}</Text>
                  </View>

                  {/* Actions */}
                  <TouchableOpacity
                    style={[modalStyles.actionBtn, !selectedOrg.is_active && { backgroundColor: Colors.green }]}
                    onPress={() => toggleOrg(selectedOrg.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={selectedOrg.is_active ? "close-circle" : "checkmark-circle"}
                      size={20}
                      color={Colors.textWhite}
                    />
                    <Text style={modalStyles.actionText}>
                      {selectedOrg.is_active ? "Deactivate Organization" : "Activate Organization"}
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              )}
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statSub}>{sub}</Text>
    </View>
  );
}

function OrgStat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.orgStatItem}>
      <Text style={styles.orgStatLabel}>{label}</Text>
      <Text style={[styles.orgStatValue, color ? { color } : {}]}>{value}</Text>
    </View>
  );
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={modalStyles.statBox}>
      <Text style={modalStyles.statBoxValue}>{value}</Text>
      <Text style={modalStyles.statBoxLabel}>{label}</Text>
    </View>
  );
}

function actionColor(action: string): string {
  switch (action) {
    case "create": return Colors.green;
    case "update": return "#2563eb";
    case "delete": return Colors.red;
    default: return Colors.textMuted;
  }
}

function formatTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.greenBg },
  summaryRow: { flexDirection: "row", paddingHorizontal: 16, paddingTop: 12, gap: 8 },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  statLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: "600", textTransform: "uppercase" },
  statValue: { fontSize: Fonts.xl, fontWeight: "800", marginVertical: 2 },
  statSub: { fontSize: 11, color: Colors.textSecondary },
  toggleRow: {
    flexDirection: "row",
    margin: 16,
    marginBottom: 8,
    backgroundColor: Colors.card,
    borderRadius: 12,
    overflow: "hidden",
  },
  toggle: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12 },
  toggleActive: { backgroundColor: Colors.green },
  toggleText: { fontSize: Fonts.xs, fontWeight: "600", color: Colors.textSecondary },
  toggleTextActive: { color: Colors.textWhite },
  orgCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  orgHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  orgLeft: { flexDirection: "row", alignItems: "center", flex: 1, gap: 10 },
  orgRight: { alignItems: "flex-end", gap: 4 },
  orgLogo: { width: 40, height: 40, borderRadius: 10 },
  orgAvatar: { width: 40, height: 40, borderRadius: 10, backgroundColor: Colors.green, justifyContent: "center", alignItems: "center" },
  orgAvatarText: { fontSize: Fonts.lg, fontWeight: "700", color: Colors.textWhite },
  orgName: { fontSize: Fonts.base, fontWeight: "700", color: Colors.text },
  orgSub: { fontSize: Fonts.xs, color: Colors.textMuted, marginTop: 2 },
  planBadge: { backgroundColor: Colors.greenBg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  planText: { fontSize: 10, fontWeight: "700", color: Colors.green },
  orgStats: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 10 },
  orgStatItem: { alignItems: "center" },
  orgStatLabel: { fontSize: 10, color: Colors.textMuted },
  orgStatValue: { fontSize: Fonts.sm, fontWeight: "700", color: Colors.text },
  auditRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  auditDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  auditHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  auditUser: { fontSize: Fonts.sm, fontWeight: "600", color: Colors.text },
  auditTime: { fontSize: 11, color: Colors.textMuted },
  auditAction: { fontSize: Fonts.xs, color: Colors.textSecondary, marginTop: 2 },
  auditChanges: { fontSize: 11, color: Colors.textMuted, marginTop: 2, fontStyle: "italic" },
});

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: { backgroundColor: Colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 32, maxHeight: "85%" },
  handle: { width: 40, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  orgHeader: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  logo: { width: 56, height: 56, borderRadius: 14 },
  orgName: { fontSize: Fonts.xl, fontWeight: "700", color: Colors.text },
  orgPhone: { fontSize: Fonts.sm, color: Colors.textSecondary, marginTop: 2 },
  orgCity: { fontSize: Fonts.xs, color: Colors.textMuted, marginTop: 2 },
  statsGrid: { flexDirection: "row", gap: 8, marginBottom: 12 },
  statBox: { flex: 1, backgroundColor: Colors.greenBg, borderRadius: 10, padding: 10, alignItems: "center" },
  statBoxValue: { fontSize: Fonts.lg, fontWeight: "800", color: Colors.text },
  statBoxLabel: { fontSize: 10, color: Colors.textMuted, marginTop: 2 },
  finRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  finItem: { flex: 1, backgroundColor: "#f8fafc", borderRadius: 10, padding: 12 },
  finLabel: { fontSize: Fonts.xs, color: Colors.textMuted, marginBottom: 4 },
  finValue: { fontSize: Fonts.lg, fontWeight: "700", color: Colors.text },
  infoRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  infoLabel: { fontSize: Fonts.sm, color: Colors.textSecondary },
  infoValue: { fontSize: Fonts.sm, fontWeight: "600", color: Colors.text },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.red,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 20,
  },
  actionText: { fontSize: Fonts.base, fontWeight: "700", color: Colors.textWhite },
});
