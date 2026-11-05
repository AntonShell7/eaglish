import type { ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";
import { createInstance } from "i18next";
import ru from "@/i18n/locales/ru.json";
import { isArabic } from "@/i18n/content";

// The isolated instance must not persist the console's Russian locale as the
// learner's preference. Otherwise visiting any page resets Arabic on reload.
const adminI18n = isArabic() ? createInstance() : i18n;
if (isArabic()) void adminI18n.init({
  lng: "ru", fallbackLng: "ru", resources: { ru: { translation: ru } },
  interpolation: { escapeValue: false }, initAsync: false,
});

/** The learner's Arabic preference must not translate the owner's console. */
export function AdminLocale({ children }: { children: ReactNode }) {
  return <I18nextProvider i18n={adminI18n}><div lang={adminI18n.language} dir="ltr">{children}</div></I18nextProvider>;
}
