import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
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
          setSelectedLanguage(savedLanguage as Language);
        }
      } catch (error) {
        console.warn("⚠️ Failed to load saved language:", error);
      }
    };

    loadSavedLanguage();
  }, []);

  // Save language preference when it changes
  const handleSetSelectedLanguage = async (language: Language) => {
    setSelectedLanguage(language);
    try {
      await UserPreferencesService.saveLanguage(language);
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
