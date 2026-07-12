import { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Fonts } from "../../lib/colors";
import { useT } from "../../lib/i18n";
import { offlineGet, offlinePost } from "../../lib/offline-api";
import EntityPicker, { Entity } from "../../components/EntityPicker";
import api from "../../lib/api";

export default function PurchaseEntryScreen() {
  const t = useT();

  const [farmers, setFarmers] = useState<Entity[]>([]);
  const [products, setProducts] = useState<Entity[]>([]);
  const [agents, setAgents] = useState<Entity[]>([]);

  // Form fields
  const [billNo, setBillNo] = useState("");
  const [pDate, setPDate] = useState(new Date().toISOString().split("T")[0]);
  const [supplierId, setSupplierId] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [productId, setProductId] = useState("");
  const [agentId, setAgentId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [rate, setRate] = useState("");
  const [transportCost, setTransportCost] = useState("");
  const [loadingCost, setLoadingCost] = useState("");
  const [unloadingCost, setUnloadingCost] = useState("");
  const [advance, setAdvance] = useState("");
  const [commissionDeduction, setCommissionDeduction] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    offlineGet<Entity[]>("/farmers").then(setFarmers).catch(() => {});
    offlineGet<Entity[]>("/products").then(setProducts).catch(() => {});
    offlineGet<Entity[]>("/agents").then(setAgents).catch(() => {});
  }, []);

  const grossAmount = useMemo(() => {
    const q = parseFloat(quantity) || 0;
    const r = parseFloat(rate) || 0;
    return q * r;
  }, [quantity, rate]);

  const netAmount = useMemo(() => {
    const gross = grossAmount;
    const transport = parseFloat(transportCost) || 0;
    const loading = parseFloat(loadingCost) || 0;
    const unloading = parseFloat(unloadingCost) || 0;
    const adv = parseFloat(advance) || 0;
    const comm = parseFloat(commissionDeduction) || 0;
    return gross + transport + loading + unloading - adv - comm;
  }, [grossAmount, transportCost, loadingCost, unloadingCost, advance, commissionDeduction]);

  const handleSave = async () => {
    if (!supplierId || !productId || !quantity || !rate) {
      Alert.alert(t("error"), t("required") + ": " + t("selectSupplier") + ", " + t("selectProduct") + ", " + t("enterQuantity") + ", " + t("enterBuyRate"));
      return;
    }
    setSaving(true);
    try {
      await offlinePost("/purchases", {
        bill_no: billNo || undefined,
        p_date: pDate,
        supplier_id: supplierId,
        vehicle_no: vehicleNo || undefined,
        product_id: productId,
        agent_id: agentId || undefined,
        quantity: parseFloat(quantity),
        rate: parseFloat(rate),
        gross_amount: grossAmount,
        transport_cost: parseFloat(transportCost) || 0,
        loading_cost: parseFloat(loadingCost) || 0,
        unloading_cost: parseFloat(unloadingCost) || 0,
        advance: parseFloat(advance) || 0,
        net_amount: netAmount,
        commission_deduction: parseFloat(commissionDeduction) || 0,
        notes: notes || undefined,
      });
      Alert.alert(t("success"), t("purchaseSaved"), [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert(t("error"), e.message || t("failedSavePurchase"));
    } finally {
      setSaving(false);
    }
  };

  const addFarmer = async (name: string) => {
    try {
      const f = await api<Entity>("/farmers", { method: "POST", body: { name } });
      setFarmers((prev) => [...prev, f]);
      setSupplierId(f.id);
    } catch {}
  };

  const addProduct = async (name: string) => {
    try {
      const p = await api<Entity>("/products", { method: "POST", body: { name } });
      setProducts((prev) => [...prev, p]);
      setProductId(p.id);
    } catch {}
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.greenBg }} edges={["bottom"]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Purchase Details */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t("purchaseDetails")}</Text>

            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.label}>{t("billNo")}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t("billNo")}
                  value={billNo}
                  onChangeText={setBillNo}
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.label}>{t("purchaseDate")}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={pDate}
                  onChangeText={setPDate}
                />
              </View>
            </View>

            <EntityPicker
              label={t("selectSupplier")}
              placeholder={t("selectSupplier")}
              items={farmers}
              selectedId={supplierId}
              onSelect={(id) => setSupplierId(id)}
              onAddNew={addFarmer}
              addLabel={t("addSupplier")}
            />

            <EntityPicker
              label={t("selectProduct")}
              placeholder={t("selectProduct")}
              items={products}
              selectedId={productId}
              onSelect={(id) => setProductId(id)}
              onAddNew={addProduct}
              addLabel={t("addProduct")}
            />

            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.label}>{t("enterQuantity")}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  keyboardType="numeric"
                  value={quantity}
                  onChangeText={setQuantity}
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.label}>{t("enterBuyRate")}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  keyboardType="numeric"
                  value={rate}
                  onChangeText={setRate}
                />
              </View>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{t("grossAmount")}</Text>
              <Text style={styles.totalValue}>₹{grossAmount.toLocaleString("en-IN")}</Text>
            </View>
          </View>

          {/* Vehicle & Agent */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t("transportDetails")}</Text>

            <Text style={styles.label}>{t("vehicleNo")}</Text>
            <TextInput
              style={styles.input}
              placeholder="MH-12-AB-1234"
              value={vehicleNo}
              onChangeText={setVehicleNo}
              autoCapitalize="characters"
            />

            <EntityPicker
              label={t("selectAgent")}
              placeholder={t("selectAgent")}
              items={agents}
              selectedId={agentId}
              onSelect={(id) => setAgentId(id)}
              onAddNew={() => {}}
              addLabel={t("selectAgent")}
            />
          </View>

          {/* Costs & Charges */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t("costsAndCharges")}</Text>

            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.label}>{t("transportCost")}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  keyboardType="numeric"
                  value={transportCost}
                  onChangeText={setTransportCost}
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.label}>{t("loadingCost")}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  keyboardType="numeric"
                  value={loadingCost}
                  onChangeText={setLoadingCost}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.label}>{t("unloadingCost")}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  keyboardType="numeric"
                  value={unloadingCost}
                  onChangeText={setUnloadingCost}
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.label}>{t("commissionDeduction")}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  keyboardType="numeric"
                  value={commissionDeduction}
                  onChangeText={setCommissionDeduction}
                />
              </View>
            </View>

            <Text style={styles.label}>{t("advances")}</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              keyboardType="numeric"
              value={advance}
              onChangeText={setAdvance}
            />

            <Text style={styles.label}>{t("notes")}</Text>
            <TextInput
              style={[styles.input, { height: 60, textAlignVertical: "top" }]}
              placeholder={t("notes")}
              multiline
              value={notes}
              onChangeText={setNotes}
            />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{t("netAmount")}</Text>
              <Text style={[styles.totalValue, { color: Colors.green }]}>
                ₹{netAmount.toLocaleString("en-IN")}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.7}
          >
            <Ionicons name="checkmark-circle" size={22} color={Colors.textWhite} />
            <Text style={styles.saveBtnText}>{saving ? t("saving") : t("save")}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.greenBg },
  scroll: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: Fonts.lg,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 12,
  },
  label: {
    fontSize: Fonts.sm,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.greenBg,
    borderRadius: 10,
    padding: 12,
    fontSize: Fonts.base,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  totalLabel: { fontSize: Fonts.base, fontWeight: "600", color: Colors.text },
  totalValue: { fontSize: Fonts.xl, fontWeight: "800", color: Colors.text },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.green,
    borderRadius: 14,
    paddingVertical: 16,
    gap: 8,
  },
  saveBtnText: { color: Colors.textWhite, fontSize: Fonts.lg, fontWeight: "700" },
});
