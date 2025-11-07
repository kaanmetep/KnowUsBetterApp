import React, { createContext, ReactNode, useContext, useState } from "react";

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

  return (
    <LanguageContext.Provider
      value={{ selectedLanguage, setSelectedLanguage, languages }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
