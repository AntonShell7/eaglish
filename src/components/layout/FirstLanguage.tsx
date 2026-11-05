import { useTranslation } from "react-i18next";
import { availableLanguages, changeFirstLanguage, firstLanguage, type InterfaceLanguage } from "@/i18n/content";
import "./first-language.css";

const LANGUAGE_CHOICES: { code: InterfaceLanguage; name: string; english: string }[] = [
  { code: "ru", name: "Русский", english: "Russian" },
  { code: "ar", name: "العربية", english: "Arabic" },
  { code: "en", name: "English", english: "English" },
];

export function LanguageChoices() {
  return <div className="first-language__choices" role="group" aria-label="First language">
    {LANGUAGE_CHOICES.filter(item => availableLanguages.includes(item.code)).map(item => <button
      type="button" key={item.code} className={`first-language__choice${firstLanguage() === item.code ? " is-selected" : ""}`}
      aria-pressed={firstLanguage() === item.code} onClick={() => changeFirstLanguage(item.code)}>
      <span className="first-language__code" dir="ltr">{item.code.toUpperCase()}</span>
      <span className="first-language__name" lang={item.code} dir="auto">{item.name}</span>
      <span className="first-language__english" lang="en" dir="ltr">{item.english}</span>
      <span className="first-language__check" aria-hidden="true">{firstLanguage() === item.code ? "✓" : "→"}</span>
    </button>)}
  </div>;
}

export function FirstLanguageSetting() {
  const { t } = useTranslation();
  return <section className="first-language card mt-6" aria-labelledby="first-language-title">
    <span className="first-language__eyebrow" lang="en" dir="ltr">First language</span>
    <h2 id="first-language-title">{t("language.firstTitle")}</h2>
    <p>{t("language.firstHint")}</p>
    <LanguageChoices />
    <p className="first-language__note">{t("language.englishStays")}</p>
  </section>;
}
