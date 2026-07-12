import { useEffect, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput,
  Modal, Switch, Alert, RefreshControl, KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import api from "../../lib/api";
import { Colors, Fonts, getProductEmoji } from "../../lib/colors";
import { formatRupees } from "../../components/formatters";
import LoadingScreen from "../../components/LoadingScreen";
import EmptyState from "../../components/EmptyState";
import { useT } from "../../lib/i18n";

interface Product {
  id: string; name: string; name_local: string | null;
  category: string | null; unit: string; hsn_code: string | null;
  purchase_price: number | null; selling_price: number | null;
  min_stock: number | null; current_stock: number | null;
  is_perishable: boolean;
}

export default function InventoryScreen() {
  const t = useT();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [formName, setFormName] = useState("");
  const [formNameLocal, setFormNameLocal] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formUnit, setFormUnit] = useState("kg");
  const [formHsnCode, setFormHsnCode] = useState("");
  const [formPurchasePrice, setFormPurchasePrice] = useState("");
  const [formSellingPrice, setFormSellingPrice] = useState("");
  const [formMinStock, setFormMinStock] = useState("");
  const [formCurrentStock, setFormCurrentStock] = useState("");
  const [formPerishable, setFormPerishable] = useState(true);

  const fetchProducts = useCallback(async () => {
    try { const data = await api<Product[]>("/products"); setProducts(data); }
    catch {} finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.name_local || "").toLowerCase().includes(search.toLowerCase())
  );

  const openAddModal = () => {
    setEditProduct(null); setFormName(""); setFormNameLocal(""); setFormCategory(""); setFormUnit("kg");
    setFormHsnCode(""); setFormPurchasePrice(""); setFormSellingPrice("");
    setFormMinStock(""); setFormCurrentStock(""); setFormPerishable(true); setModalVisible(true);
  };

  const openEditModal = (product: Product) => {
    setEditProduct(product); setFormName(product.name); setFormNameLocal(product.name_local || "");
    setFormCategory(product.category || ""); setFormUnit(product.unit);
    setFormHsnCode(product.hsn_code || "");
    setFormPurchasePrice(product.purchase_price != null ? String(product.purchase_price) : "");
    setFormSellingPrice(product.selling_price != null ? String(product.selling_price) : "");
    setFormMinStock(product.min_stock != null ? String(product.min_stock) : "");
    setFormCurrentStock(product.current_stock != null ? String(product.current_stock) : "");
    setFormPerishable(product.is_perishable); setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) { Alert.alert(t("error"), t("productNameRequired")); return; }
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        name: formName.trim(), name_local: formNameLocal.trim() || null,
        category: formCategory.trim() || null, unit: formUnit.trim() || "kg",
        is_perishable: formPerishable,
      };
      if (formHsnCode.trim()) body.hsn_code = formHsnCode.trim();
      if (formPurchasePrice.trim()) body.purchase_price = parseFloat(formPurchasePrice.trim());
      if (formSellingPrice.trim()) body.selling_price = parseFloat(formSellingPrice.trim());
      if (formMinStock.trim()) body.min_stock = parseFloat(formMinStock.trim());
      if (formCurrentStock.trim()) body.current_stock = parseFloat(formCurrentStock.trim());
      if (editProduct) { await api(`/products/${editProduct.id}`, { method: "PATCH", body }); }
      else { await api("/products", { method: "POST", body }); }
      setModalVisible(false); fetchProducts();
    } catch (err: unknown) { const msg = err instanceof Error ? err.message : t("failedSaveProduct"); Alert.alert(t("error"), msg); }
    finally { setSaving(false); }
  };

  const handleDelete = (product: Product) => {
    Alert.alert(t("deleteProduct"), `${t("confirmDeleteProduct")} "${product.name}"?`, [
      { text: t("cancel"), style: "cancel" },
      { text: t("delete"), style: "destructive", onPress: async () => { try { await api(`/products/${product.id}`, { method: "DELETE" }); fetchProducts(); } catch { Alert.alert(t("error"), t("failedDeleteProduct")); } } },
    ]);
  };

  if (loading) return <LoadingScreen />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.greenBg }} edges={["bottom"]}>
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={Colors.textMuted} />
        <TextInput style={styles.searchInput} placeholder={t("searchProducts")} placeholderTextColor={Colors.textMuted} value={search} onChangeText={setSearch} />
      </View>

      <FlatList data={filtered} keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.productCard} onPress={() => openEditModal(item)} onLongPress={() => handleDelete(item)} activeOpacity={0.7}>
            <View style={styles.productLeft}>
              <Text style={styles.productName}>{getProductEmoji(item.name)} {item.name}</Text>
              {item.name_local && <Text style={styles.productLocal}>{item.name_local}</Text>}
              <View style={styles.tagRow}>
                <View style={styles.tag}><Text style={styles.tagText}>{item.unit}</Text></View>
                {item.category && <View style={styles.tag}><Text style={styles.tagText}>{item.category}</Text></View>}
                {item.hsn_code && <View style={styles.tag}><Text style={styles.tagText}>HSN: {item.hsn_code}</Text></View>}
                {item.is_perishable && <View style={[styles.tag, { backgroundColor: Colors.amberLight }]}><Text style={[styles.tagText, { color: Colors.amber }]}>{t("perishable")}</Text></View>}
              </View>
              {(item.purchase_price != null || item.selling_price != null) && (
                <View style={styles.priceRow}>
                  {item.purchase_price != null && <Text style={styles.priceText}>Buy: {formatRupees(item.purchase_price)}/{item.unit}</Text>}
                  {item.selling_price != null && <Text style={[styles.priceText, { color: Colors.green }]}>Sell: {formatRupees(item.selling_price)}/{item.unit}</Text>}
                </View>
              )}
              {item.current_stock != null && item.current_stock > 0 && (
                <Text style={[styles.stockText, (item.min_stock != null && item.current_stock < item.min_stock) ? { color: Colors.red } : {}]}>
                  Stock: {item.current_stock} {item.unit} {item.min_stock != null && item.current_stock < item.min_stock ? "(Low!)" : ""}
                </Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchProducts(); }} colors={[Colors.green]} />}
        ListEmptyComponent={<EmptyState icon="cube-outline" title={t("noProducts")} subtitle={t("addProductsHint")} />}
      />

      <TouchableOpacity style={styles.fab} onPress={openAddModal} activeOpacity={0.8}>
        <Ionicons name="add" size={28} color={Colors.textWhite} />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editProduct ? t("editProduct") : t("addProductBtn")}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><Ionicons name="close" size={24} color={Colors.text} /></TouchableOpacity>
            </View>
            <ScrollView>
              <View style={styles.formField}><Text style={styles.formLabel}>{t("name")} *</Text><TextInput style={styles.formInput} placeholder={t("productName")} placeholderTextColor={Colors.textMuted} value={formName} onChangeText={setFormName} autoFocus /></View>
              <View style={styles.formField}><Text style={styles.formLabel}>{t("localName")}</Text><TextInput style={styles.formInput} placeholder={t("hindiLocalName")} placeholderTextColor={Colors.textMuted} value={formNameLocal} onChangeText={setFormNameLocal} /></View>
              <View style={styles.formRow}>
                <View style={[styles.formField, { flex: 1 }]}><Text style={styles.formLabel}>{t("category")}</Text><TextInput style={styles.formInput} placeholder={t("vegCategory")} placeholderTextColor={Colors.textMuted} value={formCategory} onChangeText={setFormCategory} /></View>
                <View style={[styles.formField, { flex: 1, marginLeft: 12 }]}><Text style={styles.formLabel}>{t("unit")}</Text><TextInput style={styles.formInput} placeholder="kg" placeholderTextColor={Colors.textMuted} value={formUnit} onChangeText={setFormUnit} /></View>
              </View>
              <View style={styles.formField}><Text style={styles.formLabel}>HSN Code</Text><TextInput style={styles.formInput} placeholder="e.g. 07099990" placeholderTextColor={Colors.textMuted} value={formHsnCode} onChangeText={setFormHsnCode} keyboardType="number-pad" maxLength={8} /></View>
              <View style={styles.formRow}>
                <View style={[styles.formField, { flex: 1 }]}><Text style={styles.formLabel}>Purchase Price</Text><TextInput style={styles.formInput} placeholder="0" placeholderTextColor={Colors.textMuted} value={formPurchasePrice} onChangeText={setFormPurchasePrice} keyboardType="decimal-pad" /></View>
                <View style={[styles.formField, { flex: 1, marginLeft: 12 }]}><Text style={styles.formLabel}>Selling Price</Text><TextInput style={styles.formInput} placeholder="0" placeholderTextColor={Colors.textMuted} value={formSellingPrice} onChangeText={setFormSellingPrice} keyboardType="decimal-pad" /></View>
              </View>
              <View style={styles.formRow}>
                <View style={[styles.formField, { flex: 1 }]}><Text style={styles.formLabel}>Min Stock</Text><TextInput style={styles.formInput} placeholder="0" placeholderTextColor={Colors.textMuted} value={formMinStock} onChangeText={setFormMinStock} keyboardType="decimal-pad" /></View>
                <View style={[styles.formField, { flex: 1, marginLeft: 12 }]}><Text style={styles.formLabel}>Current Stock</Text><TextInput style={styles.formInput} placeholder="0" placeholderTextColor={Colors.textMuted} value={formCurrentStock} onChangeText={setFormCurrentStock} keyboardType="decimal-pad" /></View>
              </View>
              <View style={styles.switchRow}><Text style={styles.formLabel}>{t("perishable")}</Text><Switch value={formPerishable} onValueChange={setFormPerishable} trackColor={{ true: Colors.greenLight, false: Colors.border }} thumbColor={formPerishable ? Colors.green : Colors.textMuted} /></View>
              <TouchableOpacity style={[styles.saveButton, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving} activeOpacity={0.7}>
                <Text style={styles.saveText}>{saving ? t("saving") : editProduct ? t("updateProduct") : t("addProductBtn")}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.greenBg },
  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.card, margin: 16, marginBottom: 8, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, gap: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: Fonts.base, color: Colors.text },
  listContent: { paddingHorizontal: 16, paddingBottom: 80 },
  productCard: { backgroundColor: Colors.card, borderRadius: 12, padding: 16, marginBottom: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between", shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  productLeft: { flex: 1 },
  productName: { fontSize: Fonts.base, fontWeight: "600", color: Colors.text },
  productLocal: { fontSize: Fonts.sm, color: Colors.textSecondary, marginTop: 2 },
  tagRow: { flexDirection: "row", gap: 6, marginTop: 8, flexWrap: "wrap" },
  tag: { backgroundColor: Colors.greenBg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tagText: { fontSize: Fonts.xs, fontWeight: "600", color: Colors.green },
  priceRow: { flexDirection: "row", gap: 16, marginTop: 6 },
  priceText: { fontSize: Fonts.xs, fontWeight: "600", color: Colors.textSecondary },
  stockText: { fontSize: Fonts.xs, fontWeight: "600", color: Colors.textSecondary, marginTop: 4 },
  fab: { position: "absolute", bottom: 20, right: 20, width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.green, justifyContent: "center", alignItems: "center", shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: Colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: "90%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontSize: Fonts.lg, fontWeight: "700", color: Colors.text },
  formField: { marginBottom: 14 },
  formLabel: { fontSize: Fonts.sm, fontWeight: "600", color: Colors.textSecondary, marginBottom: 6 },
  formInput: { backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: Fonts.base, color: Colors.text },
  formRow: { flexDirection: "row" },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  saveButton: { backgroundColor: Colors.green, borderRadius: 14, paddingVertical: 16, alignItems: "center", marginBottom: 20 },
  saveText: { color: Colors.textWhite, fontSize: Fonts.base, fontWeight: "700" },
});
