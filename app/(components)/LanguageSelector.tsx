import Feather from "@expo/vector-icons/Feather";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useLanguage } from "../contexts/LanguageContext";

interface LanguageSelectorProps {
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "none"
    | "onboarding";
}

const LanguageSelector = ({
  position = "top-right",
}: LanguageSelectorProps) => {
  const { selectedLanguage, setSelectedLanguage, languages } = useLanguage();
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

  const positionClasses = {
    "top-right": "absolute top-20 right-6 z-50",
    "top-left": "absolute top-20 left-6 z-50",
    "bottom-right": "absolute bottom-20 right-6 z-50",
    "bottom-left": "absolute bottom-20 left-6 z-50",
    none: "",
    onboarding: "",
  };

  const dropdownPositionClasses = {
    "top-right": "absolute top-14 right-0 w-[150px]",
    "top-left": "absolute top-14 left-0 w-[150px]",
    "bottom-right": "absolute bottom-14 right-0 w-[150px]",
    "bottom-left": "absolute bottom-14 left-0 w-[150px]",
    none: "absolute top-12 right-0 w-[150px]",
    onboarding: "absolute top-12 right-0 w-[150px]",
  };

  return (
    <View className={positionClasses[position]}>
      <View className="relative z-50">
        {/* Main Language Button */}
        <TouchableOpacity
          onPress={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
          activeOpacity={0.7}
          className="bg-white border border-slate-200 rounded-full px-4 py-2.5 flex-row items-center gap-2 shadow-sm shadow-slate-200"
        >
          <Text style={{ fontSize: 16 }}>
            {languages[selectedLanguage].flag}
          </Text>
          <Text
            className="text-slate-600 font-bold text-xs tracking-wide"
            style={{ fontFamily: "MerriweatherSans_700Bold" }}
          >
            {selectedLanguage.toUpperCase()}
          </Text>
          <Feather
            name={isLanguageMenuOpen ? "chevron-up" : "chevron-down"}
            size={14}
            color="#94A3B8" // Slate-400
          />
        </TouchableOpacity>

        {/* Dropdown Menu */}
        {isLanguageMenuOpen && (
          <View className={dropdownPositionClasses[position]}>
            <View className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-50 overflow-hidden py-1.5">
              {(Object.keys(languages) as Array<keyof typeof languages>).map(
                (lang) => (
                  <TouchableOpacity
                    key={lang}
                    onPress={() => {
                      setSelectedLanguage(lang);
                      setIsLanguageMenuOpen(false);
                    }}
                    activeOpacity={0.7}
                    className={`flex-row items-center gap-3 px-4 py-3 ${
                      selectedLanguage === lang
                        ? "bg-blue-50"
                        : "bg-transparent"
                    }`}
                  >
                    <Text style={{ fontSize: 18 }}>{languages[lang].flag}</Text>
                    <Text
                      className={`text-sm ${
                        selectedLanguage === lang
                          ? "text-blue-600 font-bold"
                          : "text-slate-500 font-medium"
                      }`}
                      style={{
                        fontFamily:
                          selectedLanguage === lang
                            ? "MerriweatherSans_700Bold"
                            : "MerriweatherSans_400Regular",
                      }}
                    >
                      {languages[lang].label}
                    </Text>

                    {/* Checkmark */}
                    {selectedLanguage === lang && (
                      <View className="ml-auto">
                        <View className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      </View>
                    )}
                  </TouchableOpacity>
                )
              )}
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default LanguageSelector;
