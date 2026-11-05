/** Language is fixed for one document lifetime; switching reloads all course data. */
export type InterfaceLanguage = "ru" | "en" | "ar";
export const arabicEnabled = import.meta.env.DEV || import.meta.env.VITE_ENABLE_ARABIC === "true";
export const availableLanguages: InterfaceLanguage[] = arabicEnabled ? ["en", "ru", "ar"] : ["en", "ru"];
export function firstLanguage(): InterfaceLanguage | null {
  try {
    const value = localStorage.getItem("firstLanguage");
    return availableLanguages.includes(value as InterfaceLanguage) ? value as InterfaceLanguage : null;
  } catch { return null; }
}
export function changeFirstLanguage(value: InterfaceLanguage) {
  try {
    localStorage.setItem("firstLanguage", value);
    localStorage.setItem("interfaceLanguage", value);
  } catch { return; }
  window.location.reload();
}
function readLanguage(): InterfaceLanguage {
  try {
    const value = localStorage.getItem("interfaceLanguage");
    return value === "en" ? "en" : value === "ar" && arabicEnabled ? "ar" : "ru";
  } catch { return "ru"; }
}
const language = readLanguage();
export const selectedLanguage = () => language;
export const isArabic = () => (firstLanguage() ?? selectedLanguage()) === "ar";
export const learnerLanguage = () => isArabic() ? "Arabic" : "Russian";
let translations: Record<string, string> = {};
let interfaceTranslations: Record<string, unknown> = {};
export const arabicInterface = () => interfaceTranslations;
export async function prepareContent() {
  if (!isArabic()) return;
  const [content, ui, legal] = await Promise.all([import("./locales/ar-content.json"), import("./locales/ar.json"), import("./locales/ar-legal.json")]);
  translations = { ...content.default, ...legal.default };
  interfaceTranslations = ui.default;
}
/** Legacy course field names (titleRu, translationRu) remain stable for saved progress. */
export function localize(text: string): string {
  return isArabic() ? translations[text] ?? text : text;
}
export function localizeData<T>(value: T): T {
  if (!isArabic()) return value;
  if (typeof value === "string") return localize(value) as T;
  if (Array.isArray(value)) return value.map(localizeData) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, localizeData(item)])) as T;
  }
  return value;
}
export function changeInterfaceLanguage(language: InterfaceLanguage) {
  if (selectedLanguage() === language) return;
  try { localStorage.setItem("interfaceLanguage", language); } catch { return; }
  window.location.reload();
}

export function localizeTemplate(pattern: string, values: unknown[]): string {
  return localize(pattern).replace(/\{\{p(\d+)\}\}/g, (_, index: string) => String(values[Number(index)] ?? ""));
}

/** Adapt authored AI instructions, never learner input or JSON field names. */
export function localizeAiInstructions(instructions: string): string {
  if (!isArabic()) return instructions;
  return instructions.replace(/Russian/g, "Arabic").replace(/Cyrillic/g, "Arabic script");
}
