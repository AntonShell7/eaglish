import type { ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";
import { isArabic } from "@/i18n/content";

const adminI18n = isArabic() ? i18n.cloneInstance({ lng: "ru", fallbackLng: "ru" }) : i18n;

/** The learner's Arabic preference must not translate the owner's console. */
export function AdminLocale({ children }: { children: ReactNode }) {
  return <I18nextProvider i18n={adminI18n}><div lang={adminI18n.language} dir="ltr">{children}</div></I18nextProvider>;
}
