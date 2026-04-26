import {
  MerriweatherSans_400Regular,
  MerriweatherSans_700Bold,
} from "@expo-google-fonts/merriweather-sans";
import { useFonts } from "@expo-google-fonts/merriweather-sans/useFonts";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { AI_ANALYSIS_COIN_COST } from "../../services/aiAnalysisService";
import {
  AI_ANALYSIS_BUTTON_VISUAL,
  type AiAnalysisUiVariant,
} from "./aiAnalysisTheme";

type AiAnalysisEntryButtonProps = {
  variant: AiAnalysisUiVariant;
  title: string;
  subtitle: string;
  onPress: () => void;
};

const AiAnalysisEntryButton: React.FC<AiAnalysisEntryButtonProps> = ({
  variant,
  title,
  subtitle,
  onPress,
}) => {
  const theme = AI_ANALYSIS_BUTTON_VISUAL[variant];
  const [fontsLoaded] = useFonts({
    MerriweatherSans_400Regular,
    MerriweatherSans_700Bold,
  });
  if (!fontsLoaded) return null;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        borderRadius: 18,
        shadowColor: theme.shadowColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.14,
        shadowRadius: 10,
        elevation: 4,
      }}
    >
      <LinearGradient
        colors={theme.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 18,
          paddingVertical: 16,
          paddingHorizontal: 18,
          borderWidth: 1.5,
          borderColor: theme.borderColor,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: theme.iconBackground,
              marginRight: 12,
            }}
          >
            <FontAwesome6
              name={theme.icon}
              size={17}
              color={theme.iconColor}
            />
          </View>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text
              style={{
                fontFamily: "MerriweatherSans_700Bold",
                fontSize: 13,
                color: "#1e293b",
                lineHeight: 18,
              }}
            >
              {title}
            </Text>
            <Text
              style={{
                fontFamily: "MerriweatherSans_400Regular",
                fontSize: 10,
                color: "#94a3b8",
                marginTop: 2,
              }}
            >
              {subtitle}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: "#FBBF24",
              borderRadius: 10,
              paddingHorizontal: 10,
              paddingVertical: 6,
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
            }}
          >
            <FontAwesome6 name="coins" size={10} color="#713f12" />
            <Text
              style={{
                fontFamily: "MerriweatherSans_700Bold",
                fontSize: 12,
                color: "#713f12",
              }}
            >
              {AI_ANALYSIS_COIN_COST}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default AiAnalysisEntryButton;
