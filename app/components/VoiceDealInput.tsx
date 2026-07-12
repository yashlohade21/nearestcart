import { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts } from "../lib/colors";
import { useT } from "../lib/i18n";
import { parseDealFromSpeech, type ParsedDeal } from "../lib/voice-parser";
import api from "../lib/api";

/**
 * Parse transcript via backend Gemini endpoint, fallback to local regex on failure.
 */
async function parseTranscript(transcript: string): Promise<ParsedDeal> {
  if (!transcript.trim()) return {};
  try {
    const result = await api<ParsedDeal>("/voice/parse", {
      method: "POST",
      body: { transcript },
    });
    // If backend returned nothing useful, fall back to regex
    if (
      !result.farmerName &&
      !result.buyerName &&
      !result.productName &&
      result.quantity == null &&
      result.buyRate == null &&
      result.sellRate == null
    ) {
      return parseDealFromSpeech(transcript);
    }
    return result;
  } catch {
    return parseDealFromSpeech(transcript);
  }
}

// Attempt to import expo-speech-recognition; gracefully degrade if missing
let ExpoSpeechRecognitionModule: any = null;
let useSpeechRecognitionEvent: any = null;
try {
  const mod = require("expo-speech-recognition");
  ExpoSpeechRecognitionModule = mod.ExpoSpeechRecognitionModule;
  useSpeechRecognitionEvent = mod.useSpeechRecognitionEvent;
} catch {
  // expo-speech-recognition not installed — voice will be unavailable
}

interface Props {
  onResult: (result: ParsedDeal) => void;
}

export default function VoiceDealInput({ onResult }: Props) {
  const t = useT();
  const [modalVisible, setModalVisible] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [parsed, setParsed] = useState<ParsedDeal | null>(null);
  const [parsing, setParsing] = useState(false);
  const recognizingRef = useRef(false);

  const runParse = async (text: string) => {
    if (!text.trim()) return;
    setParsing(true);
    try {
      const result = await parseTranscript(text);
      setParsed(result);
    } finally {
      setParsing(false);
    }
  };

  // If expo-speech-recognition is available, set up event listeners
  useEffect(() => {
    if (!useSpeechRecognitionEvent || !modalVisible) return;

    // These are set up as effects — they auto-cleanup when modal closes
  }, [modalVisible]);

  const startListening = async () => {
    if (!ExpoSpeechRecognitionModule) {
      Alert.alert(t("error"), "Speech recognition not available. Install expo-speech-recognition.");
      return;
    }

    try {
      const status = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!status.granted) {
        Alert.alert(t("permissionRequired"), "Microphone permission is required for voice input.");
        return;
      }

      setTranscript("");
      setParsed(null);
      setListening(true);
      recognizingRef.current = true;

      ExpoSpeechRecognitionModule.start({
        lang: "hi-IN",
        interimResults: true,
        maxAlternatives: 1,
      });
    } catch {
      setListening(false);
      Alert.alert(t("error"), t("voiceError"));
    }
  };

  const stopListening = () => {
    if (ExpoSpeechRecognitionModule && recognizingRef.current) {
      ExpoSpeechRecognitionModule.stop();
    }
    recognizingRef.current = false;
    setListening(false);
    runParse(transcript);
  };

  const handleUseResult = () => {
    if (parsed) {
      onResult(parsed);
      setModalVisible(false);
      setTranscript("");
      setParsed(null);
    }
  };

  const handleRetry = () => {
    setTranscript("");
    setParsed(null);
    setParsing(false);
    startListening();
  };

  // Register speech recognition events when the module is available
  if (useSpeechRecognitionEvent) {
    useSpeechRecognitionEvent("result", (event: any) => {
      const text = event.results?.[0]?.transcript || "";
      setTranscript(text);
      if (event.isFinal) {
        setListening(false);
        recognizingRef.current = false;
        runParse(text);
      }
    });

    useSpeechRecognitionEvent("error", () => {
      setListening(false);
      recognizingRef.current = false;
    });

    useSpeechRecognitionEvent("end", () => {
      if (recognizingRef.current) {
        setListening(false);
        recognizingRef.current = false;
        runParse(transcript);
      }
    });
  }

  const hasResult = parsed && (parsed.farmerName || parsed.buyerName || parsed.quantity || parsed.buyRate || parsed.sellRate);

  return (
    <>
      <TouchableOpacity
        style={styles.micButton}
        onPress={() => { setModalVisible(true); setTranscript(""); setParsed(null); }}
        activeOpacity={0.7}
      >
        <Ionicons name="mic" size={22} color={Colors.green} />
        <Text style={styles.micText}>{t("voiceInput")}</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("voiceInput")}</Text>
              <TouchableOpacity onPress={() => { setModalVisible(false); stopListening(); }}>
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.hint}>{t("voiceHint")}</Text>

            {/* Mic circle */}
            <TouchableOpacity
              style={[styles.micCircle, listening && styles.micCircleActive]}
              onPress={listening ? stopListening : startListening}
              activeOpacity={0.7}
            >
              <Ionicons name={listening ? "stop" : "mic"} size={48} color={listening ? Colors.red : Colors.green} />
            </TouchableOpacity>
            <Text style={styles.micStatus}>
              {listening ? t("tapToStop") : t("tapToSpeak")}
            </Text>

            {/* Transcript */}
            {transcript ? (
              <View style={styles.transcriptBox}>
                <Text style={styles.transcriptText}>{transcript}</Text>
              </View>
            ) : null}

            {/* Parsing indicator */}
            {parsing && (
              <View style={styles.parsingBox}>
                <ActivityIndicator size="small" color={Colors.green} />
                <Text style={styles.parsingText}>{t("parsing")}</Text>
              </View>
            )}

            {/* Parsed result */}
            {hasResult && (
              <View style={styles.resultCard}>
                {parsed!.farmerName && <ResultRow label={t("farmer")} value={parsed!.farmerName} />}
                {parsed!.buyerName && <ResultRow label={t("buyer")} value={parsed!.buyerName} />}
                {parsed!.productName && <ResultRow label={t("product")} value={parsed!.productName} />}
                {parsed!.quantity != null && <ResultRow label={t("quantity")} value={`${parsed!.quantity} ${parsed!.unit || ""}`} />}
                {parsed!.buyRate != null && <ResultRow label={t("buyRate")} value={`₹${parsed!.buyRate}`} />}
                {parsed!.sellRate != null && <ResultRow label={t("sellRate")} value={`₹${parsed!.sellRate}`} />}
              </View>
            )}

            {/* Action buttons */}
            {parsed && !listening && (
              <View style={styles.actions}>
                <TouchableOpacity style={styles.retryBtn} onPress={handleRetry} activeOpacity={0.7}>
                  <Ionicons name="refresh" size={20} color={Colors.textSecondary} />
                  <Text style={styles.retryText}>{t("tryAgain")}</Text>
                </TouchableOpacity>
                {hasResult && (
                  <TouchableOpacity style={styles.useBtn} onPress={handleUseResult} activeOpacity={0.7}>
                    <Ionicons name="checkmark" size={20} color={Colors.textWhite} />
                    <Text style={styles.useText}>{t("useResult")}</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {parsed && !hasResult && !listening && (
              <Text style={styles.errorText}>{t("voiceError")}</Text>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.resultRow}>
      <Text style={styles.resultLabel}>{label}</Text>
      <Text style={styles.resultValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  micButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: Colors.greenLight, borderRadius: 12, paddingVertical: 14, marginBottom: 16,
    borderWidth: 1, borderColor: Colors.green, minHeight: 48,
  },
  micText: { fontSize: Fonts.base, fontWeight: "700", color: Colors.green },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modal: {
    backgroundColor: Colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, maxHeight: "85%",
  },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  modalTitle: { fontSize: Fonts.lg, fontWeight: "700", color: Colors.text },
  hint: { fontSize: Fonts.sm, color: Colors.textSecondary, textAlign: "center", marginBottom: 20, lineHeight: 20 },
  micCircle: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.greenLight,
    alignSelf: "center", alignItems: "center", justifyContent: "center",
    borderWidth: 3, borderColor: Colors.green,
  },
  micCircleActive: { backgroundColor: "#fef2f2", borderColor: Colors.red },
  micStatus: { fontSize: Fonts.sm, color: Colors.textSecondary, textAlign: "center", marginTop: 10, marginBottom: 16 },
  transcriptBox: {
    backgroundColor: Colors.greenBg, borderRadius: 12, padding: 14, marginBottom: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  transcriptText: { fontSize: Fonts.base, color: Colors.text, lineHeight: 22 },
  resultCard: {
    backgroundColor: Colors.greenBg, borderRadius: 12, padding: 14, marginBottom: 12,
  },
  resultRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6 },
  resultLabel: { fontSize: Fonts.sm, color: Colors.textSecondary },
  resultValue: { fontSize: Fonts.base, fontWeight: "700", color: Colors.text },
  actions: { flexDirection: "row", gap: 12 },
  retryBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    backgroundColor: Colors.greenBg, borderRadius: 12, paddingVertical: 14, minHeight: 48,
    borderWidth: 1, borderColor: Colors.border,
  },
  retryText: { fontSize: Fonts.base, fontWeight: "600", color: Colors.textSecondary },
  useBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    backgroundColor: Colors.green, borderRadius: 12, paddingVertical: 14, minHeight: 48,
  },
  useText: { fontSize: Fonts.base, fontWeight: "700", color: Colors.textWhite },
  errorText: { fontSize: Fonts.sm, color: Colors.red, textAlign: "center", marginTop: 8 },
  parsingBox: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    paddingVertical: 12, marginBottom: 12,
  },
  parsingText: { fontSize: Fonts.sm, color: Colors.textSecondary, fontWeight: "600" },
});
