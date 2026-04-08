import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Switch,
  Alert,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../../lib/api";
import { Colors, Fonts } from "../../lib/colors";
import LoadingScreen from "../../components/LoadingScreen";
import EmptyState from "../../components/EmptyState";

interface Product {
  id: string;
  name: string;
  name_local: string | null;
  category: string | null;
  unit: string;
  is_perishable: boolean;
}

export default function InventoryScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formNameLocal, setFormNameLocal] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formUnit, setFormUnit] = useState("kg");
  const [formPerishable, setFormPerishable] = useState(true);

  const fetchProducts = useCallback(async () => {
    try {
      const data = await api<Product[]>("/products");
      setProducts(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.name_local || "").toLowerCase().includes(search.toLowerCase())
  );

  const openAddModal = () => {
    setEditProduct(null);
    setFormName("");
    setFormNameLocal("");
    setFormCategory("");
    setFormUnit("kg");
    setFormPerishable(true);
    setModalVisible(true);
  };

  const openEditModal = (product: Product) => {
    setEditProduct(product);
    setFormName(product.name);
    setFormNameLocal(product.name_local || "");
    setFormCategory(product.category || "");
    setFormUnit(product.unit);
    setFormPerishable(product.is_perishable);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      Alert.alert("Error", "Product name is required");
      return;
    }

    setSaving(true);
    try {
      const body = {
        name: formName.trim(),
        name_local: formNameLocal.trim() || null,
        category: formCategory.trim() || null,
        unit: formUnit.trim() || "kg",
        is_perishable: formPerishable,
      };

      if (editProduct) {
        await api(`/products/${editProduct.id}`, {
          method: "PATCH",
          body,
        });
      } else {
        await api("/products", {
          method: "POST",
          body,
        });
      }

      setModalVisible(false);
      fetchProducts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save";
      Alert.alert("Error", msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (product: Product) => {
    Alert.alert(
      "Delete Product",
      `Are you sure you want to remove "${product.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api(`/products/${product.id}`, { method: "DELETE" });
              fetchProducts();
            } catch {
              Alert.alert("Error", "Failed to delete product");
            }
          },
        },
      ]
    );
  };

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.productCard}
            onPress={() => openEditModal(item)}
            onLongPress={() => handleDelete(item)}
            activeOpacity={0.7}
          >
            <View style={styles.productLeft}>
              <Text style={styles.productName}>{item.name}</Text>
              {item.name_local && (
                <Text style={styles.productLocal}>{item.name_local}</Text>
              )}
              <View style={styles.tagRow}>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{item.unit}</Text>
                </View>
                {item.category && (
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>{item.category}</Text>
                  </View>
                )}
                {item.is_perishable && (
                  <View style={[styles.tag, { backgroundColor: Colors.amberLight }]}>
                    <Text style={[styles.tagText, { color: Colors.amber }]}>
                      Perishable
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchProducts();
            }}
            colors={[Colors.green]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="cube-outline"
            title="No products"
            subtitle="Add products to track in your deals"
          />
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={openAddModal}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={Colors.textWhite} />
      </TouchableOpacity>

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editProduct ? "Edit Product" : "Add Product"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Name *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Product name"
                placeholderTextColor={Colors.textMuted}
                value={formName}
                onChangeText={setFormName}
                autoFocus
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Local Name</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Hindi/local name"
                placeholderTextColor={Colors.textMuted}
                value={formNameLocal}
                onChangeText={setFormNameLocal}
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formField, { flex: 1 }]}>
                <Text style={styles.formLabel}>Category</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Vegetable"
                  placeholderTextColor={Colors.textMuted}
                  value={formCategory}
                  onChangeText={setFormCategory}
                />
              </View>
              <View style={[styles.formField, { flex: 1, marginLeft: 12 }]}>
                <Text style={styles.formLabel}>Unit</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="kg"
                  placeholderTextColor={Colors.textMuted}
                  value={formUnit}
                  onChangeText={setFormUnit}
                />
              </View>
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.formLabel}>Perishable</Text>
              <Switch
                value={formPerishable}
                onValueChange={setFormPerishable}
                trackColor={{ true: Colors.greenLight, false: Colors.border }}
                thumbColor={formPerishable ? Colors.green : Colors.textMuted}
              />
            </View>

            <TouchableOpacity
              style={[styles.saveButton, saving && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.7}
            >
              <Text style={styles.saveText}>
                {saving ? "Saving..." : editProduct ? "Update Product" : "Add Product"}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.greenBg,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: Fonts.base,
    color: Colors.text,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  productCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  productLeft: {
    flex: 1,
  },
  productName: {
    fontSize: Fonts.base,
    fontWeight: "600",
    color: Colors.text,
  },
  productLocal: {
    fontSize: Fonts.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tagRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8,
  },
  tag: {
    backgroundColor: Colors.greenBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: Fonts.xs,
    fontWeight: "600",
    color: Colors.green,
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.green,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: Fonts.lg,
    fontWeight: "700",
    color: Colors.text,
  },
  formField: {
    marginBottom: 14,
  },
  formLabel: {
    fontSize: Fonts.sm,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: Fonts.base,
    color: Colors.text,
  },
  formRow: {
    flexDirection: "row",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: Colors.green,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveText: {
    color: Colors.textWhite,
    fontSize: Fonts.base,
    fontWeight: "700",
  },
});
