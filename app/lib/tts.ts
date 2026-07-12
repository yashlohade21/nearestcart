/**
 * Text-to-speech wrapper using expo-speech.
 * Offline, free, uses the device's installed TTS engine.
 */

import * as Speech from "expo-speech";

// Map app locale to BCP-47 language tag for TTS
const LOCALE_TO_TTS: Record<string, string> = {
  en: "en-IN",
  hi: "hi-IN",
  mr: "mr-IN",
  pa: "pa-IN",
  gu: "gu-IN",
  ta: "ta-IN",
};

export function speak(text: string, locale: string = "en") {
  if (!text) return;
  // Stop anything currently speaking
  Speech.stop();
  Speech.speak(text, {
    language: LOCALE_TO_TTS[locale] || "en-IN",
    rate: 0.9,
    pitch: 1.0,
  });
}

export function stopSpeaking() {
  Speech.stop();
}

export async function isSpeaking(): Promise<boolean> {
  return Speech.isSpeakingAsync();
}

/**
 * Format an amount for TTS in natural language.
 * 12500 → "twelve thousand five hundred rupees" / "bara hazar panch sau rupay"
 */
export function formatAmountForSpeech(amount: number, locale: string): string {
  const rounded = Math.round(amount);
  if (locale === "hi") {
    return `${rounded} रुपए`;
  }
  return `${rounded} rupees`;
}
