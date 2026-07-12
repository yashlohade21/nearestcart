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
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Fonts } from "../../lib/colors";
import { useT } from "../../lib/i18n";
import api from "../../lib/api";
import EntityPicker, { Entity } from "../../components/EntityPicker";

export default function FarmerEntryScreen() {
  const t = useT();

  const [farmerId, setFarmerId] = useState("");
  const [kharidarId, setKhariddarId] = useState("");
  const [productId, setProductId] = useState("");
  const [village, setVillage] = useState("");
  const [weight, setWeight] = useState("");
  const [rate, setRate] = useState("");
  const [hamali, setHamali] = useState("");
  const [tawali, setTawali] = useState("");
  const [warai, setWarai] = useState("");
  const [autoCharge, setAutoCharge] = useState("");
  const [kharcha, setKharcha] = useState("");
  const [mobileNo, setMobileNo] = useState("");

  const [farmers, setFarmers] = useState<Entity[]>([]);
  const [kharidars, setKharidars] = useState<Entity[]>([]);
  const [products, setProducts] = useState<Entity[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [f, k, p] = await Promise.all([
          api<Entity[]>("/farmers").catch(() => []),
          api<Entity[]>("/kharidars").catch(() => []),
          api<Entity[]>("/products").catch(() => []),
        ]);
        setFarmers(f);
        setKharidars(k);
        setProducts(p);
      } catch {}
    }
    loadData();
  }, []);

  const amount = useMemo(() => {
    const w = parseFloat(weight) || 0;
    const r = parseFloat(rate) || 0;
    return w * r;
  }, [weight, rate]);

  const addFarmer = async (name: string) => {
    try {
      const f = await api<Entity>("/farmers", { method: "POST", body: { name } });
      setFarmers((prev) => [...prev, f]);
      setFarmerId(f.id);
    } catch (err: unknown) {
      Alert.alert(t("error"), err instanceof Error ? err.message : t("failedAddFarmer"));
    }
  };

  const addProduct = async (name: string) => {
    try {
      const p = await api<Entity>("/products", { method: "POST", body: { name } });
      setProducts((prev) => [...prev, p]);
      setProductId(p.id);
    } catch (err: unknown) {
      Alert.alert(t("error"), err instanceof Error ? err.message : t("failedAddProduct"));
    }
  };

  const handleSave = async () => {
    if (!farmerId) {
      Alert.alert(t("error"), t("selectFarmerError"));
      return;
    }
    if (!productId) {
      Alert.alert(t("error"), "Please select a product");
      return;
    }
    if (!weight || parseFloat(weight) <= 0) {
      Alert.alert(t("error"), "Please enter weight");
      return;
    }
    if (!rate || parseFloat(rate) <= 0) {
      Alert.alert(t("error"), "Please enter rate");
      return;
    }

    setSaving(true);
    try {
      await api("/farmer-entries", {
        method: "POST",
        body: {
          farmer_id: farmerId,
          kharidar_id: kharidarId || null,
          product_id: productId,
          village: village.trim() || null,
          weight: parseFloat(weight),
          rate: parseFloat(rate),
          amount,
          hamali: parseFloat(hamali) || 0,
          tawali: parseFloat(tawali) || 0,
          warai: parseFloat(warai) || 0,
          auto_charge: parseFloat(autoCharge) || 0,
          kharcha: parseFloat(kharcha) || 0,
          mobile_no: mobileNo.trim() || null,
        },
      });
      Alert.alert(t("done"), "Farmer entry saved!", [
        { text: t("ok"), onPress: () => router.back() },
      ]);
    } catch (err: unknown) {
      Alert.alert(t("error"), err instanceof Error ? err.message : "Failed to save farmer entry");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <EntityPicker
            label={t("farmer")}
            placeholder={t("selectFarmer")}
            items={farmers}
            selectedId={farmerId}
            onSelect={setFarmerId}
            onAddNew={addFarmer}
            addLabel={t("addFarmer")}
          />

          <EntityPicker
            label="Kharidar"
            placeholder="Select kharidar"
            items={kharidars}
            selectedId={kharidarId}
            onSelect={setKhariddarId}
            onAddNew={async (name) => {
              try {
                const k = await api<Entity>("/kharidars", { method: "POST", body: { name } });
                setKharidars((prev) => [...prev, k]);
                setKhariddarId(k.id);
              } catch (err: unknown) {
                Alert.alert(t("error"), err instanceof Error ? err.message : "Failed to add kharidar");
              }
            }}
            addLabel="Add Kharidar"
          />

          <EntityPicker
            label={t("product")}
            placeholder={t("selectProduct")}
            items={products}
            selectedId={productId}
            onSelect={setProductId}
            onAddNew={addProduct}
            addLabel={t("addProduct")}
          />

          <Text style={styles.label}>{t("village")}</Text>
          <TextInput
            style={styles.input}
            placeholder={t("villagePlaceholder")}
            placeholderTextColor={Colors.textMuted}
            value={village}
            onChangeText={setVillage}
          />

          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
                keyboardType="decimal-pad"
                value={weight}
                onChangeText={setWeight}
              />
            </View>
            <View style={styles.half}>
              <Text style={styles.label}>Rate (₹/kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
                keyboardType="decimal-pad"
                value={rate}
                onChangeText={setRate}
              />
            </View>
          </View>

          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Amount (auto)</Text>
            <Text style={styles.calcValue}>
              ₹{new Intl.NumberFormat("en-IN").format(amount)}
            </Text>
          </View>

          <Text style={styles.sectionHeader}>Charges</Text>

          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.label}>Hamali</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
                keyboardType="decimal-pad"
                value={hamali}
                onChangeText={setHamali}
              />
            </View>
            <View style={styles.half}>
              <Text style={styles.label}>Tawali</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
                keyboardType="decimal-pad"
                value={tawali}
                onChangeText={setTawali}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.label}>Warai</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
                keyboardType="decimal-pad"
                value={warai}
                onChangeText={setWarai}
              />
            </View>
            <View style={styles.half}>
              <Text style={styles.label}>Auto Charge</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
                keyboardType="decimal-pad"
                value={autoCharge}
                onChangeText={setAutoCharge}
              />
            </View>
          </View>

          <Text style={styles.label}>Kharcha</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor={Colors.textMuted}
            keyboardType="decimal-pad"
            value={kharcha}
            onChangeText={setKharcha}
          />

          <Text style={styles.label}>Mobile No.</Text>
          <TextInput
            style={styles.input}
            placeholder="Farmer mobile number"
            placeholderTextColor={Colors.textMuted}
            keyboardType="phone-pad"
            value={mobileNo}
            onChangeText={setMobileNo}
          />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>{t("save")}</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  label: {
    fontSize: Fonts.xs,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: Fonts.base,
    backgroundColor: Colors.card,
    color: Colors.text,
  },
  row: { flexDirection: "row", gap: 12 },
  half: { flex: 1 },
  sectionHeader: {
    fontSize: Fonts.sm,
    fontWeight: "700",
    color: Colors.textSecondary,
    marginTop: 20,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.card,
  },
  saveBtn: {
    backgroundColor: Colors.green,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontSize: Fonts.base, fontWeight: "700" },
  calcRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    backgroundColor: Colors.greenBg,
    borderRadius: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.greenLight,
  },
  calcLabel: { fontSize: Fonts.sm, color: Colors.textSecondary },
  calcValue: { fontSize: Fonts.lg, fontWeight: "700", color: Colors.green },
});
