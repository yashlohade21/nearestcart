import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts } from "../lib/colors";

export interface Entity {
  id: string;
  name: string;
}

export default function EntityPicker({
  label,
  placeholder,
  items,
  selectedId,
  onSelect,
  onAddNew,
  addLabel,
}: {
  label: string;
  placeholder: string;
  items: Entity[];
  selectedId: string;
  onSelect: (id: string, name: string) => void;
  onAddNew: (name: string) => void;
  addLabel: string;
}) {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");
  const selectedName = items.find((i) => i.id === selectedId)?.name || "";

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!search.trim()) return;
    onAddNew(search.trim());
    setSearch("");
    setVisible(false);
  };

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.pickerText,
            !selectedName && { color: Colors.textMuted },
          ]}
        >
          {selectedName || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color={Colors.textMuted} />
      </TouchableOpacity>

      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select {label}</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder={`Search or add new ${label.toLowerCase()}...`}
              placeholderTextColor={Colors.textMuted}
              value={search}
              onChangeText={setSearch}
              autoFocus
            />
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    item.id === selectedId && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    onSelect(item.id, item.name);
                    setSearch("");
                    setVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      item.id === selectedId && { color: Colors.green },
                    ]}
                  >
                    {item.name}
                  </Text>
                  {item.id === selectedId && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={Colors.green}
                    />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                search.trim() ? (
                  <TouchableOpacity
                    style={styles.addNewButton}
                    onPress={handleAdd}
                  >
                    <Ionicons
                      name="add-circle"
                      size={22}
                      color={Colors.green}
                    />
                    <Text style={styles.addNewText}>
                      {addLabel} "{search.trim()}"
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.emptyText}>
                    No {label.toLowerCase()} yet
                  </Text>
                )
              }
              style={{ maxHeight: 300 }}
            />
            {search.trim() && filtered.length > 0 && (
              <TouchableOpacity
                style={styles.addNewButton}
                onPress={handleAdd}
              >
                <Ionicons
                  name="add-circle"
                  size={22}
                  color={Colors.green}
                />
                <Text style={styles.addNewText}>
                  {addLabel} "{search.trim()}"
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  fieldContainer: {
    marginBottom: 14,
  },
  label: {
    fontSize: Fonts.sm,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  pickerButton: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pickerText: {
    fontSize: Fonts.base,
    color: Colors.text,
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
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: Fonts.lg,
    fontWeight: "700",
    color: Colors.text,
  },
  searchInput: {
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: Fonts.base,
    color: Colors.text,
    marginBottom: 12,
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  modalItemSelected: {
    backgroundColor: Colors.greenBg,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  modalItemText: {
    fontSize: Fonts.base,
    color: Colors.text,
  },
  addNewButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  addNewText: {
    fontSize: Fonts.base,
    color: Colors.green,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: Fonts.sm,
    color: Colors.textMuted,
    textAlign: "center",
    paddingVertical: 20,
  },
});
