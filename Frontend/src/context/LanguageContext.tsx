import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type LanguageMode = "en" | "hi" | "both";

interface LanguageContextType {
  language: LanguageMode;
  setLanguage: (lang: LanguageMode) => void;
  t: (enText: string, hiText: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "agrisense_lang_mode";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "hi" || saved === "both") {
        return saved;
      }
    } catch {
      // fallback
    }
    return "en";
  });

  const setLanguage = (mode: LanguageMode) => {
    setLanguageState(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // ignore
    }
  };

  /**
   * Helper function to return text based on selected language mode:
   * - 'en' -> enText
   * - 'hi' -> hiText
   * - 'both' -> "enText (hiText)" (or combined)
   */
  const t = (enText: string, hiText: string): string => {
    if (language === "hi") return hiText || enText;
    if (language === "both") {
      if (!hiText) return enText;
      if (!enText) return hiText;
      return `${enText} (${hiText})`;
    }
    return enText || hiText;
  };

  useEffect(() => {
    document.documentElement.lang = language === "hi" ? "hi" : "en";
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
