import * as Localization from "expo-localization";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { AnalyticsService } from "../services/analyticsService";
import { UserPreferencesService } from "../services/userPreferencesService";

export type Language = "en" | "tr" | "es";

interface LanguageContextType {
  selectedLanguage: Language;
  setSelectedLanguage: (language: Language) => void;
  languages: Record<Language, { flag: string; label: string }>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("en");

  const languages: Record<Language, { flag: string; label: string }> = {
    en: { flag: "🇺🇸", label: "English" },
    tr: { flag: "🇹🇷", label: "Turkish" },
    es: { flag: "🇪🇸", label: "Español" },
  };

  // Get device locale and determine default language
  const getDefaultLanguage = (): Language => {
    try {
      // Get device locales using expo-localization
      const locales = Localization.getLocales();
      
      // Get the first (primary) locale
      const primaryLocale = locales[0];
      if (primaryLocale) {
        const languageCode = primaryLocale.languageCode?.toLowerCase() || "";
        const regionCode = primaryLocale.regionCode?.toUpperCase() || "";
        
        // If device language is Turkish OR device is from Turkey, default to Turkish
        if (languageCode === "tr" || regionCode === "TR") {
          return "tr";
        }
      }
      
      // Fallback: Check Intl API
      try {
        const locale = Intl.DateTimeFormat().resolvedOptions().locale;
        const languageCode = locale.split("-")[0].toLowerCase();
        const countryCode = locale.split("-")[1]?.toUpperCase() || "";
        
        if (languageCode === "tr" || countryCode === "TR") {
          return "tr";
        }
      } catch (intlError) {
        // Silent fallback
      }
      
      // Otherwise default to English
      return "en";
    } catch (error) {
      console.warn("⚠️ Failed to detect device locale:", error);
      return "en"; // Fallback to English
    }
  };

  // Load saved language preference on mount
  useEffect(() => {
    const loadSavedLanguage = async () => {
      try {
        const savedLanguage = await UserPreferencesService.getLanguage();
        if (
          savedLanguage &&
          (savedLanguage === "en" ||
            savedLanguage === "tr" ||
            savedLanguage === "es")
        ) {
          // User has previously selected a language, use it
          setSelectedLanguage(savedLanguage as Language);
        } else {
          // No saved language, detect from device locale
          const defaultLanguage = getDefaultLanguage();
          setSelectedLanguage(defaultLanguage);
          // Save the detected language so it persists
          await UserPreferencesService.saveLanguage(defaultLanguage);
        }
      } catch (error) {
        console.warn("⚠️ Failed to load saved language:", error);
        // Fallback to device locale detection
        const defaultLanguage = getDefaultLanguage();
        setSelectedLanguage(defaultLanguage);
      }
    };

    loadSavedLanguage();
  }, []);

  // Save language preference when it changes
  const handleSetSelectedLanguage = async (language: Language) => {
    const previousLanguage = selectedLanguage;
    setSelectedLanguage(language);
    try {
      await UserPreferencesService.saveLanguage(language);
      // Log language change to analytics (only if language actually changed)
      if (previousLanguage !== language) {
        await AnalyticsService.logLanguageChange(language);
      }
    } catch (error) {
      console.warn("⚠️ Failed to save language:", error);
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        selectedLanguage,
        setSelectedLanguage: handleSetSelectedLanguage,
        languages,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
