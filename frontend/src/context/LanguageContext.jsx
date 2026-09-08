import { createContext, useContext, useEffect, useState } from "react";
import { TRANSLATIONS, STRING_TO_KEY } from "./translations.js";

export const LANGUAGES = [
  { code: "en", name: "English", nativeName: "English", dir: "ltr" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", dir: "ltr" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", dir: "ltr" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", dir: "ltr" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", dir: "ltr" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", dir: "ltr" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", dir: "ltr" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", dir: "ltr" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", dir: "ltr" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", dir: "ltr" },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ", dir: "ltr" },
  { code: "ur", name: "Urdu", nativeName: "اردو", dir: "rtl" },
];

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem("skillsetu_language") || "en";
  });

  useEffect(() => {
    localStorage.setItem("skillsetu_language", language);
    const langObj = LANGUAGES.find((l) => l.code === language);
    if (langObj?.dir === "rtl") {
      document.documentElement.setAttribute("dir", "rtl");
    } else {
      document.documentElement.setAttribute("dir", "ltr");
    }
  }, [language]);

  function setLanguage(code) {
    if (LANGUAGES.some((l) => l.code === code)) {
      setLanguageState(code);
    }
  }

  function t(key, fallback = "") {
    if (!key && key !== 0) return "";
    const strKey = String(key).trim();
    const mappedKey = STRING_TO_KEY[strKey] || strKey;

    const langDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    if (langDict) {
      if (langDict[mappedKey] !== undefined) return langDict[mappedKey];
      if (langDict[strKey] !== undefined) return langDict[strKey];
    }

    const enDict = TRANSLATIONS.en;
    if (enDict) {
      if (enDict[mappedKey] !== undefined) return enDict[mappedKey];
      if (enDict[strKey] !== undefined) return enDict[strKey];
    }

    return fallback || key;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages: LANGUAGES }}>
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
