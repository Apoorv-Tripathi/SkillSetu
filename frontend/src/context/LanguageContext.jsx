import { createContext, useContext } from "react";
import { TRANSLATIONS, STRING_TO_KEY } from "./translations.js";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  function t(key, fallback = "") {
    if (!key && key !== 0) return "";
    const strKey = String(key).trim();
    const mappedKey = STRING_TO_KEY[strKey] || strKey;

    const enDict = TRANSLATIONS.en;
    if (enDict) {
      if (enDict[mappedKey] !== undefined) return enDict[mappedKey];
      if (enDict[strKey] !== undefined) return enDict[strKey];
    }

    return fallback || key;
  }

  return (
    <LanguageContext.Provider value={{ language: "en", t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}
