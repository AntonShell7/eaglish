import { prepareContent, selectedLanguage, firstLanguage } from "./i18n/content";
import { startVisitAnalytics } from "./lib/visitAnalytics";
import "./index.css";
import "./styles/arabic.css";

const language = selectedLanguage();
document.documentElement.lang = language;
document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
// The language welcome is a real entry page too. Existing consent and account
// exclusions still apply inside the analytics client/server.
startVisitAnalytics();
// Load Arabic only for Arabic readers, before evaluating the course modules.
const boot = firstLanguage()
  ? prepareContent().then(() => import("./mount"))
  : import("./language-entry").then(module => module.mountLanguageWelcome());
boot.catch(() => {
  const root = document.getElementById("root");
  if (root) {
    root.textContent = language === "ar" ? "تعذّر تحميل الصفحة. يرجى تحديثها والمحاولة مجددًا." : "Unable to load the page. Please refresh and try again.";
  }
});
