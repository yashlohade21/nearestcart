import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import api, { getApiHost } from "../../lib/api";
import { Colors, Fonts } from "../../lib/colors";

interface UserProfile {
  id: string;
  name: string;
  phone: string;
  city: string | null;
  business_name: string | null;
  state: string | null;
  mandi_name: string | null;
  gst_number: string | null;
  address: string | null;
  logo_url: string | null;
  upi_id: string | null;
  role: string;
  plan: string;
}

const API_HOST = `http://${getApiHost()}:8000`;

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [mandiName, setMandiName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [upiId, setUpiId] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const data = await api<UserProfile>("/auth/profile");
      setProfile(data);
      populateForm(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  function populateForm(data: UserProfile) {
    setName(data.name || "");
    setBusinessName(data.business_name || "");
    setAddress(data.address || "");
    setCity(data.city || "");
    setState(data.state || "");
    setMandiName(data.mandi_name || "");
    setGstNumber(data.gst_number || "");
    setUpiId(data.upi_id || "");
  }

  function handleEdit() {
    if (profile) populateForm(profile);
    setIsEditing(true);
  }

  function handleCancel() {
    if (profile) populateForm(profile);
    setIsEditing(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await api<UserProfile>("/auth/profile", {
        method: "PUT",
        body: {
          name: name.trim() || undefined,
          business_name: businessName.trim() || undefined,
          address: address.trim() || undefined,
          city: city.trim() || undefined,
          state: state.trim() || undefined,
          mandi_name: mandiName.trim() || undefined,
          gst_number: gstNumber.trim() || undefined,
          upi_id: upiId.trim() || undefined,
        },
      });
      setProfile(updated);
      setIsEditing(false);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  async function handlePickLogo() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const uri = asset.uri;
    const ext = uri.split(".").pop() || "jpg";

    try {
      const token = await SecureStore.getItemAsync("token");
      const formData = new FormData();
      formData.append("file", {
        uri,
        name: `logo.${ext}`,
        type: `image/${ext === "jpg" ? "jpeg" : ext}`,
      } as any);

      const response = await fetch(`${API_HOST}/api/auth/profile/logo`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || "Upload failed");
      }

      const updated: UserProfile = await response.json();
      setProfile(updated);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Logo upload failed");
    }
  }

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await SecureStore.deleteItemAsync("token");
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.green} />
      </View>
    );
  }

  const logoUri = profile?.logo_url ? `${API_HOST}${profile.logo_url}` : null;

  // ── EDIT MODE ──
  if (isEditing) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.content}>
          {/* Logo picker */}
          <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={handlePickLogo} activeOpacity={0.7}>
              <View style={styles.avatarEditWrapper}>
                {logoUri ? (
                  <Image source={{ uri: logoUri }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {name?.charAt(0)?.toUpperCase() || "?"}
                    </Text>
                  </View>
                )}
                <View style={styles.cameraOverlay}>
                  <Ionicons name="camera" size={16} color={Colors.textWhite} />
                </View>
              </View>
            </TouchableOpacity>
            <Text style={styles.logoHint}>Tap to change logo</Text>
          </View>

          {/* Edit form */}
          <View style={styles.card}>
            <EditField label="Name" value={name} onChangeText={setName} />
            <View style={styles.divider} />
            <EditField
              label="Business Name"
              value={businessName}
              onChangeText={setBusinessName}
            />
            <View style={styles.divider} />
            <EditField
              label="Address"
              value={address}
              onChangeText={setAddress}
              multiline
            />
            <View style={styles.divider} />
            <EditField label="City" value={city} onChangeText={setCity} />
            <View style={styles.divider} />
            <EditField label="State" value={state} onChangeText={setState} />
            <View style={styles.divider} />
            <EditField
              label="Mandi"
              value={mandiName}
              onChangeText={setMandiName}
            />
            <View style={styles.divider} />
            <EditField
              label="GST Number"
              value={gstNumber}
              onChangeText={setGstNumber}
              autoCapitalize="characters"
              maxLength={15}
            />
            <Text style={styles.gstHint}>15-character GSTIN</Text>
            <View style={styles.divider} />
            <EditField
              label="UPI ID"
              value={upiId}
              onChangeText={setUpiId}
              autoCapitalize="none"
            />
            <Text style={styles.gstHint}>e.g. yourname@upi or 9876543210@paytm</Text>
          </View>

          {/* Save / Cancel */}
          <View style={styles.editActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, saving && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.7}
            >
              {saving ? (
                <ActivityIndicator size="small" color={Colors.textWhite} />
              ) : (
                <Text style={styles.saveText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ── VIEW MODE ──
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {logoUri ? (
          <Image source={{ uri: logoUri }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile?.name?.charAt(0)?.toUpperCase() || "?"}
            </Text>
          </View>
        )}
        <Text style={styles.nameText}>{profile?.name || "User"}</Text>
        <Text style={styles.phoneText}>{profile?.phone || ""}</Text>
      </View>

      {/* Info Card */}
      <View style={styles.card}>
        <ProfileRow
          icon="business-outline"
          label="Business"
          value={profile?.business_name || "—"}
        />
        <View style={styles.divider} />
        <ProfileRow
          icon="location-outline"
          label="Address"
          value={profile?.address || "—"}
        />
        <View style={styles.divider} />
        <ProfileRow
          icon="map-outline"
          label="City"
          value={profile?.city || "—"}
        />
        <View style={styles.divider} />
        <ProfileRow
          icon="navigate-outline"
          label="State"
          value={profile?.state || "—"}
        />
        <View style={styles.divider} />
        <ProfileRow
          icon="storefront-outline"
          label="Mandi"
          value={profile?.mandi_name || "—"}
        />
        <View style={styles.divider} />
        <ProfileRow
          icon="document-text-outline"
          label="GSTIN"
          value={profile?.gst_number || "—"}
        />
        <View style={styles.divider} />
        <ProfileRow
          icon="card-outline"
          label="UPI ID"
          value={profile?.upi_id || "—"}
        />
        <View style={styles.divider} />
        <ProfileRow
          icon="people-outline"
          label="Role"
          value={(profile?.role || "owner").toUpperCase()}
        />
        <View style={styles.divider} />
        <ProfileRow
          icon="shield-checkmark-outline"
          label="Plan"
          value={(profile?.plan || "free").toUpperCase()}
        />
      </View>

      {/* Edit Profile */}
      <TouchableOpacity
        style={styles.editButton}
        onPress={handleEdit}
        activeOpacity={0.7}
      >
        <Ionicons name="create-outline" size={20} color={Colors.green} />
        <Text style={styles.editText}>Edit Profile</Text>
      </TouchableOpacity>

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <Ionicons name="log-out-outline" size={20} color={Colors.red} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function ProfileRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={18} color={Colors.textSecondary} />
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function EditField({
  label,
  value,
  onChangeText,
  multiline,
  autoCapitalize,
  maxLength,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  multiline?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  maxLength?: number;
}) {
  return (
    <View style={styles.editFieldContainer}>
      <Text style={styles.editFieldLabel}>{label}</Text>
      <TextInput
        style={[styles.editFieldInput, multiline && { minHeight: 60, textAlignVertical: "top" }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={`Enter ${label.toLowerCase()}`}
        placeholderTextColor={Colors.textMuted}
        multiline={multiline}
        autoCapitalize={autoCapitalize}
        maxLength={maxLength}
      />
    </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.greenBg,
  },
  avatarContainer: {
    alignItems: "center",
    marginVertical: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.green,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarEditWrapper: {
    position: "relative",
  },
  cameraOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.green,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.textWhite,
  },
  logoHint: {
    marginTop: 8,
    fontSize: Fonts.xs,
    color: Colors.textMuted,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.textWhite,
  },
  nameText: {
    fontSize: Fonts.xl,
    fontWeight: "700",
    color: Colors.text,
    marginTop: 12,
  },
  phoneText: {
    fontSize: Fonts.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rowLabel: {
    fontSize: Fonts.sm,
    color: Colors.textSecondary,
  },
  rowValue: {
    fontSize: Fonts.base,
    fontWeight: "600",
    color: Colors.text,
    maxWidth: "55%",
    textAlign: "right",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginHorizontal: 16,
  },
  editButton: {
    marginTop: 20,
    backgroundColor: Colors.greenLight,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  editText: {
    color: Colors.green,
    fontSize: Fonts.base,
    fontWeight: "700",
  },
  logoutButton: {
    marginTop: 12,
    backgroundColor: Colors.redLight,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  logoutText: {
    color: Colors.red,
    fontSize: Fonts.base,
    fontWeight: "700",
  },
  // Edit mode styles
  editFieldContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  editFieldLabel: {
    fontSize: Fonts.xs,
    color: Colors.textSecondary,
    marginBottom: 6,
    fontWeight: "600",
  },
  editFieldInput: {
    fontSize: Fonts.base,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.greenBg,
  },
  gstHint: {
    fontSize: Fonts.xs,
    color: Colors.textMuted,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  editActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelText: {
    color: Colors.textSecondary,
    fontSize: Fonts.base,
    fontWeight: "700",
  },
  saveButton: {
    flex: 1,
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
