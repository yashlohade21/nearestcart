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

export default function SaleEntryScreen() {
  const t = useT();

  const [buyers, setBuyers] = useState<Entity[]>([]);
  const [products, setProducts] = useState<Entity[]>([]);

  // Form fields
  const [invoiceNo, setInvoiceNo] = useState("");
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split("T")[0]);
  const [buyerId, setBuyerId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [rate, setRate] = useState("");
  const [transportCost, setTransportCost] = useState("");
  const [lrNo, setLrNo] = useState("");
  const [driverName, setDriverName] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [hsnCode, setHsnCode] = useState("");
  const [tcsAmount, setTcsAmount] = useState("");
  const [addTopay, setAddTopay] = useState("");
  const [lessTopay, setLessTopay] = useState("");
  const [poNo, setPoNo] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    offlineGet<Entity[]>("/buyers").then(setBuyers).catch(() => {});
    offlineGet<Entity[]>("/products").then(setProducts).catch(() => {});
  }, []);

  const grossAmount = useMemo(() => {
    const q = parseFloat(quantity) || 0;
    const r = parseFloat(rate) || 0;
    return q * r;
  }, [quantity, rate]);

  const netAmount = useMemo(() => {
    const gross = grossAmount;
    const transport = parseFloat(transportCost) || 0;
    const tcs = parseFloat(tcsAmount) || 0;
    const addTp = parseFloat(addTopay) || 0;
    const lessTp = parseFloat(lessTopay) || 0;
    return gross + transport + tcs + addTp - lessTp;
  }, [grossAmount, transportCost, tcsAmount, addTopay, lessTopay]);

  const handleSave = async () => {
    if (!buyerId || !productId || !quantity || !rate) {
      Alert.alert(t("error"), t("required") + ": " + t("selectCustomer") + ", " + t("selectProduct") + ", " + t("enterQuantity") + ", " + t("enterSellRate"));
      return;
    }
    setSaving(true);
    try {
      await offlinePost("/sales", {
        invoice_no: invoiceNo || undefined,
        sale_date: saleDate,
        buyer_id: buyerId,
        product_id: productId,
        quantity: parseFloat(quantity),
        rate: parseFloat(rate),
        gross_amount: grossAmount,
        transport_cost: parseFloat(transportCost) || 0,
        lr_no: lrNo || undefined,
        driver_name: driverName || undefined,
        vehicle_no: vehicleNo || undefined,
        owner_name: ownerName || undefined,
        hsn_code: hsnCode || undefined,
        tcs_amount: parseFloat(tcsAmount) || 0,
        add_topay: parseFloat(addTopay) || 0,
        less_topay: parseFloat(lessTopay) || 0,
        net_amount: netAmount,
        po_no: poNo || undefined,
      });
      Alert.alert(t("success"), t("saleSaved"), [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert(t("error"), e.message || t("failedSaveSale"));
    } finally {
      setSaving(false);
    }
  };

  const addBuyer = async (name: string) => {
    try {
      const b = await api<Entity>("/buyers", { method: "POST", body: { name } });
      setBuyers((prev) => [...prev, b]);
      setBuyerId(b.id);
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
          {/* Sale Details */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t("saleDetails")}</Text>

            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.label}>{t("invoiceNo")}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t("invoiceNo")}
                  value={invoiceNo}
                  onChangeText={setInvoiceNo}
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.label}>{t("saleDate")}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={saleDate}
                  onChangeText={setSaleDate}
                />
              </View>
            </View>

            <EntityPicker
              label={t("selectCustomer")}
              placeholder={t("selectCustomer")}
              items={buyers}
              selectedId={buyerId}
              onSelect={(id) => setBuyerId(id)}
              onAddNew={addBuyer}
              addLabel={t("addCustomer")}
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
                <Text style={styles.label}>{t("enterSellRate")}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  keyboardType="numeric"
                  value={rate}
                  onChangeText={setRate}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.label}>{t("hsnCode")}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="HSN"
                  value={hsnCode}
                  onChangeText={setHsnCode}
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.label}>{t("poNo")}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t("poNo")}
                  value={poNo}
                  onChangeText={setPoNo}
                />
              </View>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{t("grossAmount")}</Text>
              <Text style={styles.totalValue}>₹{grossAmount.toLocaleString("en-IN")}</Text>
            </View>
          </View>

          {/* Transport Details */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t("transportDetails")}</Text>

            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.label}>{t("vehicleNo")}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MH-12-AB-1234"
                  value={vehicleNo}
                  onChangeText={setVehicleNo}
                  autoCapitalize="characters"
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.label}>{t("lrNo")}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t("lrNo")}
                  value={lrNo}
                  onChangeText={setLrNo}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.label}>{t("driverName")}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t("driverName")}
                  value={driverName}
                  onChangeText={setDriverName}
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.label}>{t("ownerName")}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t("ownerName")}
                  value={ownerName}
                  onChangeText={setOwnerName}
                />
              </View>
            </View>

            <Text style={styles.label}>{t("transportCost")}</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              keyboardType="numeric"
              value={transportCost}
              onChangeText={setTransportCost}
            />
          </View>

          {/* Adjustments */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t("costsAndCharges")}</Text>

            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.label}>{t("tcsAmount")}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  keyboardType="numeric"
                  value={tcsAmount}
                  onChangeText={setTcsAmount}
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.label}>{t("addTopay")}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  keyboardType="numeric"
                  value={addTopay}
                  onChangeText={setAddTopay}
                />
              </View>
            </View>

            <Text style={styles.label}>{t("lessTopay")}</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              keyboardType="numeric"
              value={lessTopay}
              onChangeText={setLessTopay}
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
