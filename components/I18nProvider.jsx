"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { MESSAGES } from "@/components/i18n/messages";

const LANGUAGES = [
  { value: "pt", label: "Português" },
  { value: "es", label: "Español" },
  { value: "en", label: "English" },
];

const I18nContext = createContext(null);

function resolveInitialLang() {
  if (typeof window === "undefined") return "pt";
  const saved = window.localStorage.getItem("lang");
  if (saved && LANGUAGES.some((l) => l.value === saved)) return saved;
  const browser = navigator.language?.slice(0, 2).toLowerCase();
  if (browser && LANGUAGES.some((l) => l.value === browser)) return browser;
  return "pt";
}

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => resolveInitialLang());
  const messages = useMemo(
    () => MESSAGES[lang] || MESSAGES.pt,
    [lang]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("lang", lang);
    document.documentElement.setAttribute("lang", lang);
  }, [lang]);

  const value = useMemo(
    () => ({
      lang,
      setLang,
      languages: LANGUAGES,
      messages,
      t(path, fallback) {
        if (!path) return fallback;
        const parts = Array.isArray(path) ? path : path.split(".");
        let node = messages;
        for (const key of parts) {
          if (node && Object.prototype.hasOwnProperty.call(node, key)) {
            node = node[key];
          } else {
            return fallback;
          }
        }
        return node ?? fallback;
      },
    }),
    [lang, messages]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}

