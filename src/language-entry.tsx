import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "./context/ThemeContext";
import { BrandLogo } from "./components/brand/BrandLogo";
import { LanguageChoices } from "./components/layout/FirstLanguage";

export function mountLanguageWelcome() {
  document.documentElement.lang = "en";
  document.documentElement.dir = "ltr";
  createRoot(document.getElementById("root")!).render(<StrictMode><ThemeProvider>
    <main className="language-welcome">
      <div className="language-welcome__brand"><BrandLogo variant="chip" className="h-10 w-10" /><span>Eaglish</span></div>
      <section className="first-language card">
        <span className="first-language__eyebrow">Welcome to Eaglish</span>
        <h1>What is your first language?</h1>
        <p>Choose the language for explanations and translations.</p>
        <p className="language-welcome__native"><span lang="ru">Выбери язык объяснений</span><span lang="ar" dir="rtl">اختر لغة الشرح والترجمة</span></p>
        <LanguageChoices />
        <p className="first-language__note">You’ll learn English. You can change this choice in your profile.</p>
      </section>
    </main>
  </ThemeProvider></StrictMode>);
}
