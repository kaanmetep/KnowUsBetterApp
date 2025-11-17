import { useLanguage } from "../contexts/LanguageContext";
import * as enTranslations from "../locales/en.json";
import * as esTranslations from "../locales/es.json";
import * as trTranslations from "../locales/tr.json";

type Translations = typeof enTranslations;

const translations: Record<"en" | "tr" | "es", Translations> = {
  en: enTranslations,
  tr: trTranslations,
  es: esTranslations,
};

/**
 * Hook to get translations based on selected language
 * @param key - Translation key in dot notation (e.g., "startScreen.createNewRoom")
 * @param params - Optional parameters for string interpolation (e.g., {name: "John"} for "Hello {{name}}")
 * @returns Translated string
 *
 * @example
 * const { t } = useTranslation();
 * const text = t("startScreen.createNewRoom");
 * const greeting = t("welcome.message", { name: "John" });
 */
export const useTranslation = () => {
  const { selectedLanguage } = useLanguage();

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split(".");
    let value: any = translations[selectedLanguage];

    // Navigate through nested object
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k as keyof typeof value];
      } else {
        // Fallback to English if key not found
        console.warn(
          `Translation key "${key}" not found for language "${selectedLanguage}", falling back to English`
        );
        value = translations.en;
        for (const fallbackKey of keys) {
          if (value && typeof value === "object" && fallbackKey in value) {
            value = value[fallbackKey as keyof typeof value];
          } else {
            return key; // Return key itself if not found
          }
        }
        break;
      }
    }

    // If value is not a string, return the key
    if (typeof value !== "string") {
      console.warn(`Translation value for "${key}" is not a string`);
      return key;
    }

    // Simple parameter replacement: {{paramName}}
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, paramName) => {
        return params[paramName]?.toString() || match;
      });
    }

    return value;
  };

  return { t, selectedLanguage };
};
