import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import api from "../../lib/api";
import { Colors, Fonts } from "../../lib/colors";

type Step = "phone" | "otp" | "name";

export default function LoginScreen() {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    const cleaned = phone.replace(/\s+/g, "");
    if (cleaned.length < 7 || cleaned.length > 15) {
      Alert.alert("Error", "Please enter a valid phone number");
      return;
    }
    setLoading(true);
    try {
      await api("/auth/otp/send", {
        method: "POST",
        body: { phone: cleaned },
      });
      setStep("otp");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send OTP";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) {
      Alert.alert("Error", "Please enter the 6-digit OTP");
      return;
    }
    const cleaned = phone.replace(/\s+/g, "");
    setLoading(true);
    try {
      const data = await api<{
        access_token: string;
        is_new_user?: boolean;
      }>("/auth/otp/verify", {
        method: "POST",
        body: { phone: cleaned, otp },
      });

      await SecureStore.setItemAsync("token", data.access_token);
      router.replace("/(tabs)");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid OTP";
      if (message.includes("Name required")) {
        setStep("name");
      } else {
        Alert.alert("Error", message);
      }
    } finally {
      setLoading(false);
    }
  };

  const saveName = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }
    const cleaned = phone.replace(/\s+/g, "");
    setLoading(true);
    try {
      const data = await api<{
        access_token: string;
        is_new_user?: boolean;
      }>("/auth/otp/verify", {
        method: "POST",
        body: { phone: cleaned, otp, name: name.trim() },
      });

      await SecureStore.setItemAsync("token", data.access_token);
      router.replace("/(tabs)");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to register";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.logo}>Dalla</Text>
          <Text style={styles.subtitle}>Deal Tracker</Text>
        </View>

        {step === "phone" && (
          <View style={styles.card}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter phone number with country code"
              placeholderTextColor={Colors.textMuted}
              keyboardType="phone-pad"
              maxLength={15}
              value={phone}
              onChangeText={setPhone}
              autoFocus
            />
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={sendOtp}
              disabled={loading}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator color={Colors.textWhite} />
              ) : (
                <Text style={styles.buttonText}>Send OTP</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {step === "otp" && (
          <View style={styles.card}>
            <Text style={styles.label}>Enter OTP</Text>
            <Text style={styles.helperText}>Sent to {phone}</Text>
            <TextInput
              style={styles.input}
              placeholder="6-digit OTP"
              placeholderTextColor={Colors.textMuted}
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={setOtp}
              autoFocus
            />
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={verifyOtp}
              disabled={loading}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator color={Colors.textWhite} />
              ) : (
                <Text style={styles.buttonText}>Verify</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => {
                setStep("phone");
                setOtp("");
              }}
            >
              <Text style={styles.linkText}>Change Number</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === "name" && (
          <View style={styles.card}>
            <Text style={styles.label}>Welcome! What's your name?</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor={Colors.textMuted}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoFocus
            />
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={saveName}
              disabled={loading}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator color={Colors.textWhite} />
              ) : (
                <Text style={styles.buttonText}>Continue</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.greenBg,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    fontSize: Fonts["4xl"],
    fontWeight: "800",
    color: Colors.green,
  },
  subtitle: {
    fontSize: Fonts.lg,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    fontSize: Fonts.base,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  helperText: {
    fontSize: Fonts.sm,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  input: {
    fontSize: Fonts.base,
    color: Colors.text,
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
  },
  button: {
    backgroundColor: Colors.green,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.textWhite,
    fontSize: Fonts.base,
    fontWeight: "700",
  },
  linkButton: {
    alignItems: "center",
    marginTop: 16,
  },
  linkText: {
    color: Colors.green,
    fontSize: Fonts.sm,
    fontWeight: "600",
  },
});
