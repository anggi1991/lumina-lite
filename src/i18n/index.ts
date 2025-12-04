import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import en from "./locales/en";
import id from "./locales/id";
import es from "./locales/es";
import fr from "./locales/fr";
import de from "./locales/de";
import zh from "./locales/zh";
import ja from "./locales/ja";
import ko from "./locales/ko";
import hi from "./locales/hi";
import ar from "./locales/ar";
import pt from "./locales/pt";
import ru from "./locales/ru";

// Get the device's locale
const getLocales = () => {
  try {
    return Localization.getLocales();
  } catch {
    return [{ languageCode: "en" }];
  }
};

const locales = getLocales();
const languageCode = locales[0]?.languageCode || "en";

console.log("[i18n] Detected system language:", languageCode);

// eslint-disable-next-line import/no-named-as-default-member
i18next.use(initReactI18next).init({
  resources: {
    en: en,
    id: id,
    es: es,
    fr: fr,
    de: de,
    zh: zh,
    ja: ja,
    ko: ko,
    hi: hi,
    ar: ar,
    pt: pt,
    ru: ru,
  },
  lng: languageCode, // Use detected language
  fallbackLng: "en", // Fallback to English if language not supported
  interpolation: {
    escapeValue: false, // React already safes from xss
  },
  compatibilityJSON: "v3" as any, // For Android compatibility
});

export default i18next;
