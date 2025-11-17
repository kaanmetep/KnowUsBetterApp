import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useLanguage } from "../contexts/LanguageContext";

interface LanguageSelectorProps {
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "none";
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
  };

  const dropdownPositionClasses = {
    "top-right": "absolute top-[52px] right-0 w-[140px]",
    "top-left": "absolute top-[52px] left-0 w-[140px]",
    "bottom-right": "absolute bottom-[52px] right-0 w-[140px]",
    "bottom-left": "absolute bottom-[52px] left-0 w-[140px]",
    none: "",
  };

  return (
    <View className={positionClasses[position]}>
      <View className="relative">
        {/* Shadow */}
        <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-lg" />
        {/* Language Button */}
        <TouchableOpacity
          onPress={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
          activeOpacity={0.8}
          className="relative bg-white border-2 border-gray-900 rounded-lg px-3 py-2 flex-row items-center gap-1"
        >
          <Text style={{ fontSize: 18 }}>
            {languages[selectedLanguage].flag}
          </Text>
          <Text
            style={{ fontFamily: "MerriweatherSans_700Bold", fontSize: 12 }}
            className="text-gray-900"
          >
            {selectedLanguage.toUpperCase()}
          </Text>
        </TouchableOpacity>

        {/* Dropdown Menu */}
        {isLanguageMenuOpen && (
          <View className={dropdownPositionClasses[position]}>
            <View className="relative">
              {/* Shadow */}
              <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-lg" />
              {/* Menu Container */}
              <View className="relative bg-white border-2 border-gray-900 rounded-lg overflow-hidden">
                {(Object.keys(languages) as Array<keyof typeof languages>).map(
                  (lang, index) => (
                    <TouchableOpacity
                      key={lang}
                      onPress={() => {
                        setSelectedLanguage(lang);
                        setIsLanguageMenuOpen(false);
                      }}
                      activeOpacity={0.8}
                      className={`flex-row items-center gap-1 px-3 py-3 ${
                        index !== Object.keys(languages).length - 1
                          ? "border-b-2 border-gray-900"
                          : ""
                      } ${selectedLanguage === lang ? "bg-[#ffe4e6]" : ""}`}
                    >
                      <Text style={{ fontSize: 16 }}>
                        {languages[lang].flag}
                      </Text>
                      <Text
                        style={{
                          fontFamily: "MerriweatherSans_400Regular",
                          fontSize: 13,
                        }}
                        className="text-gray-900"
                      >
                        {languages[lang].label}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default LanguageSelector;
