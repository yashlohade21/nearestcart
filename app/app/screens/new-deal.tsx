import { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import api, { uploadFile } from "../../lib/api";
import { offlineGet, offlinePost } from "../../lib/offline-api";
import { Colors, Fonts } from "../../lib/colors";
import { formatRupees } from "../../components/formatters";
import EntityPicker, { Entity } from "../../components/EntityPicker";
import { useT } from "../../lib/i18n";
import VoiceDealInput from "../../components/VoiceDealInput";

export default function NewDealScreen() {
  const t = useT();
  const params = useLocalSearchParams<{
    quantity?: string;
    unit?: string;
    buyRate?: string;
    sellRate?: string;
    transportCost?: string;
  }>();

  const [farmerId, setFarmerId] = useState("");
  const [buyerId, setBuyerId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(params.quantity || "");
  const [unit, setUnit] = useState(params.unit || "kg");
  const [buyRate, setBuyRate] = useState(params.buyRate || "");
  const [sellRate, setSellRate] = useState(params.sellRate || "");
  const [transportCost, setTransportCost] = useState(params.transportCost || "");
  const [loading, setLoading] = useState(false);

  const [farmers, setFarmers] = useState<Entity[]>([]);
  const [buyers, setBuyers] = useState<Entity[]>([]);
  const [products, setProducts] = useState<Entity[]>([]);
  const [stagedPhotos, setStagedPhotos] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [f, b, p] = await Promise.all([
          offlineGet<Entity[]>("/farmers").catch(() => []),
          offlineGet<Entity[]>("/buyers").catch(() => []),
          offlineGet<Entity[]>("/products").catch(() => []),
        ]);
        setFarmers(f);
        setBuyers(b);
        setProducts(p);
      } catch {
        // data is optional, can add inline
      }
    }
    loadData();
  }, []);

  const addFarmer = async (name: string) => {
    try {
      const f = await api<Entity>("/farmers", {
        method: "POST",
        body: { name },
      });
      setFarmers((prev) => [...prev, f]);
      setFarmerId(f.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("failedAddFarmer");
      Alert.alert(t("error"), msg);
    }
  };

  const addBuyer = async (name: string) => {
    try {
      const b = await api<Entity>("/buyers", {
        method: "POST",
        body: { name },
      });
      setBuyers((prev) => [...prev, b]);
      setBuyerId(b.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("failedAddBuyer");
      Alert.alert(t("error"), msg);
    }
  };

  const addProduct = async (name: string) => {
    try {
      const p = await api<Entity>("/products", {
        method: "POST",
        body: { name },
      });
      setProducts((prev) => [...prev, p]);
      setProductId(p.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("failedAddProduct");
      Alert.alert(t("error"), msg);
    }
  };

  const calculations = useMemo(() => {
    const qty = parseFloat(quantity) || 0;
    const buy = parseFloat(buyRate) || 0;
    const sell = parseFloat(sellRate) || 0;
    const transport = parseFloat(transportCost) || 0;

    const buyTotal = buy * qty;
    const sellTotal = sell * qty;
    const grossMargin = sellTotal - buyTotal;
    const netProfit = grossMargin - transport;

    return { buyTotal, sellTotal, grossMargin, netProfit };
  }, [quantity, buyRate, sellRate, transportCost]);

  const handleVoiceResult = (result: {
    farmerName?: string;
    buyerName?: string;
    productName?: string;
    quantity?: number;
    unit?: string;
    buyRate?: number;
    sellRate?: number;
  }) => {
    // Match farmer
    if (result.farmerName) {
      const match = farmers.find(
        (f) => f.name.toLowerCase() === result.farmerName!.toLowerCase()
      );
      if (match) setFarmerId(match.id);
    }
    // Match buyer
    if (result.buyerName) {
      const match = buyers.find(
        (b) => b.name.toLowerCase() === result.buyerName!.toLowerCase()
      );
      if (match) setBuyerId(match.id);
    }
    // Match product
    if (result.productName) {
      const match = products.find(
        (p) => p.name.toLowerCase() === result.productName!.toLowerCase()
      );
      if (match) setProductId(match.id);
    }
    if (result.quantity) setQuantity(String(result.quantity));
    if (result.unit) setUnit(result.unit);
    if (result.buyRate) setBuyRate(String(result.buyRate));
    if (result.sellRate) setSellRate(String(result.sellRate));
  };

  const pickPhoto = async (useCamera: boolean) => {
    const permResult = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permResult.granted) {
      Alert.alert(
        t("permissionRequired"),
        useCamera ? t("allowCameraAccess") : t("allowGalleryAccess")
      );
      return;
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.7, allowsEditing: false })
      : await ImagePicker.launchImageLibraryAsync({
          quality: 0.7,
          allowsEditing: false,
          mediaTypes: ["images"],
        });

    if (result.canceled || !result.assets?.[0]) return;
    setStagedPhotos((prev) => [...prev, result.assets[0].uri]);
  };

  const showPhotoOptions = () => {
    Alert.alert(t("addPhoto"), "", [
      { text: t("camera"), onPress: () => pickPhoto(true) },
      { text: t("gallery"), onPress: () => pickPhoto(false) },
      { text: t("cancel"), style: "cancel" },
    ]);
  };

  const removeStagedPhoto = (idx: number) => {
    setStagedPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const saveDeal = async () => {
    if (!farmerId || !buyerId || !productId) {
      Alert.alert(t("error"), t("selectFarmerBuyerProduct"));
      return;
    }
    if (!quantity || !buyRate || !sellRate) {
      Alert.alert(t("error"), t("fillQuantityRates"));
      return;
    }

    setLoading(true);
    try {
      const result = await offlinePost<{ id: string; _offline?: boolean }>("/deals", {
        farmer_id: farmerId,
        buyer_id: buyerId,
        product_id: productId,
        quantity: parseFloat(quantity),
        unit,
        buy_rate: parseFloat(buyRate),
        sell_rate: parseFloat(sellRate),
        transport_cost: parseFloat(transportCost) || 0,
      });

      // Upload staged photos if deal was created online (need real deal_id)
      if (!result._offline && result.id && stagedPhotos.length > 0) {
        for (const uri of stagedPhotos) {
          try {
            await uploadFile(uri, "deal", result.id, "photo");
          } catch {
            // Continue uploading rest even if one fails
          }
        }
      }

      const msg = result._offline ? t("dealSavedOffline") : t("dealSaved");
      Alert.alert(t("done"), msg, [
        { text: t("ok"), onPress: () => router.replace("/(tabs)") },
      ]);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : t("failedSaveDeal");
      Alert.alert(t("error"), message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.greenBg }} edges={["bottom"]}>
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Voice Input */}
        <VoiceDealInput onResult={handleVoiceResult} />

        <EntityPicker
          label={t("farmer")}
          placeholder={t("selectFarmer")}
          items={farmers}
          selectedId={farmerId}
          onSelect={(id) => setFarmerId(id)}
          onAddNew={addFarmer}
          addLabel={t("addFarmer")}
        />

        <EntityPicker
          label={t("buyer")}
          placeholder={t("selectBuyer")}
          items={buyers}
          selectedId={buyerId}
          onSelect={(id) => setBuyerId(id)}
          onAddNew={addBuyer}
          addLabel={t("addBuyer")}
        />

        <EntityPicker
          label={t("product")}
          placeholder={t("selectProduct")}
          items={products}
          selectedId={productId}
          onSelect={(id) => setProductId(id)}
          onAddNew={addProduct}
          addLabel={t("addProduct")}
        />

        <View style={styles.row}>
          <View style={[styles.fieldContainer, { flex: 2 }]}>
            <Text style={styles.label}>{t("quantity")}</Text>
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
            <Text style={styles.label}>{t("unit")}</Text>
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
            <Text style={styles.label}>{t("buyRate")} (/{unit})</Text>
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
            <Text style={styles.label}>{t("sellRate")} (/{unit})</Text>
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

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>{t("transportCost")}</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor={Colors.textMuted}
            keyboardType="decimal-pad"
            value={transportCost}
            onChangeText={setTransportCost}
          />
        </View>

        {/* Calculation Preview */}
        <View style={styles.calcCard}>
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>{t("buyTotal")}</Text>
            <Text style={styles.calcValue}>{formatRupees(calculations.buyTotal)}</Text>
          </View>
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>{t("sellTotal")}</Text>
            <Text style={styles.calcValue}>{formatRupees(calculations.sellTotal)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>{t("grossMargin")}</Text>
            <Text
              style={[
                styles.calcValue,
                {
                  color:
                    calculations.grossMargin >= 0 ? Colors.green : Colors.red,
                },
              ]}
            >
              {formatRupees(calculations.grossMargin)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.calcRow}>
            <Text style={[styles.calcLabel, { fontWeight: "700" }]}>
              {t("netProfit")}
            </Text>
            <Text
              style={[
                styles.calcValueBig,
                {
                  color:
                    calculations.netProfit >= 0 ? Colors.green : Colors.red,
                },
              ]}
            >
              {formatRupees(calculations.netProfit)}
            </Text>
          </View>
        </View>

        {/* Photo Attachments (staged before deal exists) */}
        <View style={styles.photoCard}>
          <View style={styles.photoHeader}>
            <Text style={styles.photoTitle}>{t("photos")}</Text>
            <TouchableOpacity
              style={styles.photoAddBtn}
              onPress={showPhotoOptions}
              activeOpacity={0.7}
            >
              <Ionicons name="camera" size={18} color={Colors.green} />
              <Text style={styles.photoAddText}>{t("attachPhoto")}</Text>
            </TouchableOpacity>
          </View>
          {stagedPhotos.length === 0 ? (
            <Text style={styles.photoEmpty}>{t("noPhotosYet")}</Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photoList}
            >
              {stagedPhotos.map((uri, idx) => (
                <View key={`${uri}-${idx}`} style={styles.photoThumbWrap}>
                  <Image source={{ uri }} style={styles.photoThumb} />
                  <TouchableOpacity
                    style={styles.photoRemove}
                    onPress={() => removeStagedPhoto(idx)}
                  >
                    <Ionicons name="close-circle" size={22} color={Colors.red} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={saveDeal}
          disabled={loading}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator color={Colors.textWhite} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={22} color={Colors.textWhite} />
              <Text style={styles.saveButtonText}>{t("saveDeal")}</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
  calcCard: {
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
  calcRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  calcLabel: {
    fontSize: Fonts.sm,
    color: Colors.textSecondary,
  },
  calcValue: {
    fontSize: Fonts.lg,
    fontWeight: "700",
    color: Colors.text,
  },
  calcValueBig: {
    fontSize: Fonts["2xl"],
    fontWeight: "800",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 10,
  },
  photoCard: {
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
  photoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  photoTitle: {
    fontSize: Fonts.base,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  photoAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.greenLight,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    minHeight: 48,
  },
  photoAddText: {
    fontSize: Fonts.sm,
    fontWeight: "700",
    color: Colors.green,
  },
  photoEmpty: {
    textAlign: "center",
    color: Colors.textMuted,
    fontSize: Fonts.sm,
    paddingVertical: 8,
  },
  photoList: {
    gap: 10,
    paddingVertical: 4,
  },
  photoThumbWrap: {
    position: "relative",
  },
  photoThumb: {
    width: 96,
    height: 96,
    borderRadius: 12,
  },
  photoRemove: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: Colors.card,
    borderRadius: 12,
  },
  saveButton: {
    backgroundColor: Colors.green,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: Colors.textWhite,
    fontSize: Fonts.lg,
    fontWeight: "700",
  },
});
