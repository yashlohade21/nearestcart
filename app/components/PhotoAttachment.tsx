import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  FlatList,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import api, { uploadFile, getApiHost } from "../lib/api";
import { Colors, Fonts } from "../lib/colors";

interface FileRecord {
  id: string;
  file_url: string;
  file_type: string;
  original_name: string | null;
  mime_type: string | null;
  created_at: string;
  notes: string | null;
}

interface Props {
  entityType: string;
  entityId: string;
  fileType?: string;
}

export default function PhotoAttachment({ entityType, entityId, fileType = "photo" }: Props) {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const BASE_HOST = `http://${getApiHost()}:8000`;

  const fetchFiles = async () => {
    try {
      const data = await api<FileRecord[]>(
        `/files?entity_type=${entityType}&entity_id=${entityId}&file_type=${fileType}`
      );
      setFiles(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (entityId) fetchFiles();
  }, [entityId]);

  const pickImage = async (useCamera: boolean) => {
    const permResult = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permResult.granted) {
      Alert.alert("Permission required", `Please allow ${useCamera ? "camera" : "gallery"} access.`);
      return;
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.7, allowsEditing: false })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.7, allowsEditing: false, mediaTypes: ["images"] });

    if (result.canceled || !result.assets?.[0]) return;

    setUploading(true);
    try {
      await uploadFile(result.assets[0].uri, entityType, entityId, fileType);
      fetchFiles();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed";
      Alert.alert("Upload Error", message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (fileId: string) => {
    Alert.alert("Delete Photo", "Remove this photo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api(`/files/${fileId}`, { method: "DELETE" });
            fetchFiles();
          } catch {
            Alert.alert("Error", "Failed to delete photo");
          }
        },
      },
    ]);
  };

  const showOptions = () => {
    Alert.alert("Add Photo", "Choose source", [
      { text: "Camera", onPress: () => pickImage(true) },
      { text: "Gallery", onPress: () => pickImage(false) },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Photos</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={showOptions}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color={Colors.green} />
          ) : (
            <>
              <Ionicons name="camera" size={16} color={Colors.green} />
              <Text style={styles.addText}>Add</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="small" color={Colors.green} style={{ paddingVertical: 12 }} />
      ) : files.length === 0 ? (
        <Text style={styles.emptyText}>No photos yet</Text>
      ) : (
        <FlatList
          data={files}
          horizontal
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.imageList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.imageCard}
              onLongPress={() => handleDelete(item.id)}
            >
              <Image
                source={{ uri: `${BASE_HOST}${item.file_url}` }}
                style={styles.image}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: Fonts.base,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.greenLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addText: {
    fontSize: Fonts.sm,
    fontWeight: "600",
    color: Colors.green,
  },
  emptyText: {
    textAlign: "center",
    color: Colors.textMuted,
    fontSize: Fonts.sm,
    paddingVertical: 8,
  },
  imageList: {
    gap: 8,
  },
  imageCard: {
    borderRadius: 10,
    overflow: "hidden",
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
});
