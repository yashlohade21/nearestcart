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
import { useT } from "../lib/i18n";

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
  const t = useT();
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
      Alert.alert(t("permissionRequired"), useCamera ? t("allowCameraAccess") : t("allowGalleryAccess"));
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
      const message = err instanceof Error ? err.message : t("uploadFailed");
      Alert.alert(t("uploadError"), message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (fileId: string) => {
    Alert.alert(t("deletePhoto"), t("removePhoto"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("delete"),
        style: "destructive",
        onPress: async () => {
          try {
            await api(`/files/${fileId}`, { method: "DELETE" });
            fetchFiles();
          } catch {
            Alert.alert(t("error"), t("failedDeletePhoto"));
          }
        },
      },
    ]);
  };

  const showOptions = () => {
    Alert.alert(t("addPhoto"), "", [
      { text: t("camera"), onPress: () => pickImage(true) },
      { text: t("gallery"), onPress: () => pickImage(false) },
      { text: t("cancel"), style: "cancel" },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("photos")}</Text>
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
              <Text style={styles.addText}>{t("add")}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="small" color={Colors.green} style={{ paddingVertical: 12 }} />
      ) : files.length === 0 ? (
        <Text style={styles.emptyText}>{t("noPhotosYet")}</Text>
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
    paddingVertical: 8,
    borderRadius: 8,
    minHeight: 48,
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
