import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import * as SecureStore from "expo-secure-store";
import { getLocales } from "expo-localization";
import { en, hi, mr, type TranslationKey } from "./translations";

type Lang = "en" | "hi" | "mr";
type TranslateFn = (key: TranslationKey) => string;

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: TranslateFn;
}

const dictionaries: Record<Lang, Record<string, string>> = { en, hi, mr };
const STORAGE_KEY = "app_language";

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  setLang: () => {},
  t: (key) => en[key] ?? key,
});

function detectLanguage(): Lang {
  try {
    const locales = getLocales();
    const code = locales?.[0]?.languageCode;
    if (code === "hi") return "hi";
    if (code === "mr") return "mr";
  } catch {}
  return "en";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await SecureStore.getItemAsync(STORAGE_KEY);
        if (saved === "hi" || saved === "en" || saved === "mr") {
          setLangState(saved);
        } else {
          setLangState(detectLanguage());
        }
      } catch {
        setLangState(detectLanguage());
      }
      setReady(true);
    })();
  }, []);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    SecureStore.setItemAsync(STORAGE_KEY, newLang).catch(() => {});
  }, []);

  const t: TranslateFn = useCallback(
    (key) => dictionaries[lang][key] ?? dictionaries.en[key] ?? key,
    [lang]
  );

  if (!ready) return null;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useT(): TranslateFn {
  return useContext(LanguageContext).t;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
