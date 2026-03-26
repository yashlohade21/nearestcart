import { useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Button from "../../components/Button";

export default function OtpVerifyScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (otp.length < 6) {
      Alert.alert("Invalid OTP", "Please enter the 6-digit code.");
      return;
    }

    setLoading(true);
    try {
      // TODO: verify OTP with Firebase and get auth token
      // On success, navigate to the role select / home screen
      router.replace("/");
    } catch (error) {
      Alert.alert("Error", "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Verify your number</Text>
      <Text style={styles.description}>
        Enter the 6-digit code sent to +91 {phone}
      </Text>

      <TextInput
        style={styles.otpInput}
        placeholder="000000"
        keyboardType="number-pad"
        maxLength={6}
        value={otp}
        onChangeText={setOtp}
        autoFocus
        textAlign="center"
      />

      <Button
        title={loading ? "Verifying..." : "Verify"}
        onPress={handleVerify}
        disabled={loading || otp.length < 6}
      />

      <Text style={styles.resend}>
        Didn't receive a code? Tap to resend.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: "#6b7280",
    marginBottom: 32,
  },
  otpInput: {
    fontSize: 28,
    fontWeight: "600",
    letterSpacing: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginBottom: 24,
    color: "#111827",
  },
  resend: {
    marginTop: 24,
    fontSize: 14,
    color: "#10b981",
    textAlign: "center",
  },
});
