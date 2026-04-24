import React from "react";
import { Image, ImageSourcePropType, View } from "react-native";
import { Language } from "../../contexts/LanguageContext";

interface LanguageFlagProps {
  language: Language;
  size?: "sm" | "md" | "lg";
}

const dimensions = {
  sm: { width: 18, height: 12, borderRadius: 2 },
  md: { width: 22, height: 14, borderRadius: 3 },
  lg: { width: 26, height: 16, borderRadius: 3 },
};

const flagSources: Record<Language, ImageSourcePropType> = {
  en: require("../../../assets/flags/flag-en.png"),
  tr: require("../../../assets/flags/flag-tr.png"),
  es: require("../../../assets/flags/flag-es.png"),
};

const LanguageFlag = ({ language, size = "md" }: LanguageFlagProps) => {
  const d = dimensions[size];

  return (
    <View
      style={{
        width: d.width,
        height: d.height,
        borderRadius: d.borderRadius,
        overflow: "hidden",
        backgroundColor: "transparent",
      }}
    >
      <Image
        source={flagSources[language]}
        resizeMode="cover"
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    </View>
  );
};

export default LanguageFlag;
