import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en.json";
import ru from "./locales/ru.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru },
    },
    // Russian, unless the person has chosen otherwise. The browser's own
    // language used to decide, which meant an English-configured phone in
    // Moscow opened an English site — a guess that was wrong more often than
    // it was right for this audience.
    fallbackLng: "ru",
    supportedLngs: ["en", "ru"],
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage"],
      caches: ["localStorage"],
      lookupLocalStorage: "interfaceLanguage",
    },
  });

export default i18n;
