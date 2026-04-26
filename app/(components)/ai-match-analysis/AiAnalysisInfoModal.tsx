import {
  MerriweatherSans_400Regular,
  MerriweatherSans_700Bold,
} from "@expo-google-fonts/merriweather-sans";
import { useFonts } from "@expo-google-fonts/merriweather-sans/useFonts";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Modal,
  Platform,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useCoins } from "../../contexts/CoinContext";
import { useTranslation } from "../../hooks/useTranslation";
import { AI_ANALYSIS_COIN_COST } from "../../services/aiAnalysisService";
import type { AiAnalysisModalContent } from "./aiAnalysisTheme";

interface AiAnalysisInfoModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onBuyCoins?: () => void;
  content: AiAnalysisModalContent;
}

const AiAnalysisInfoModal: React.FC<AiAnalysisInfoModalProps> = ({
  visible,
  onClose,
  onConfirm,
  onBuyCoins,
  content,
}) => {
  const { t } = useTranslation();
  const { coins } = useCoins();

  let [fontsLoaded] = useFonts({
    MerriweatherSans_400Regular,
    MerriweatherSans_700Bold,
  });

  if (!fontsLoaded) return null;

  const softShadowStyle = Platform.select({
    ios: {
      shadowColor: "#1e293b",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
    },
    android: {
      elevation: 8,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable
        className="flex-1 bg-slate-900/60 justify-center items-center px-6"
        onPress={onClose}
      >
        <Pressable
          className="w-full max-w-[420px] bg-white rounded-[28px] p-7 relative"
          style={softShadowStyle}
          onPress={(e) => e.stopPropagation()}
        >
          <TouchableOpacity
            onPress={onClose}
            className="absolute top-5 right-5 z-10 bg-slate-100 p-2 rounded-full"
            activeOpacity={0.7}
          >
            <FontAwesome6 name="xmark" size={16} color="#64748b" />
          </TouchableOpacity>

          <View className="items-center mb-5">
            <View
              className="w-16 h-16 rounded-full items-center justify-center"
              style={{ backgroundColor: content.headerIconBg }}
            >
              <FontAwesome6
                name={content.headerIcon}
                size={28}
                color={content.headerIconColor}
              />
            </View>
          </View>

          <Text
            className="text-xl font-bold text-slate-800 text-center mb-2"
            style={{ fontFamily: "MerriweatherSans_700Bold" }}
          >
            {content.title}
          </Text>

          <Text
            className="text-sm text-slate-500 text-center mb-6 leading-5 px-2"
            style={{ fontFamily: "MerriweatherSans_400Regular" }}
          >
            {content.description}
          </Text>

          <View className="mb-6 gap-3">
            {content.features.map((feature, index) => (
              <View key={index} className="flex-row items-center gap-3">
                <View
                  className="w-9 h-9 rounded-full items-center justify-center"
                  style={{ backgroundColor: feature.bg }}
                >
                  <FontAwesome6
                    name={feature.icon}
                    size={14}
                    color={feature.color}
                  />
                </View>
                <Text
                  className="text-slate-700 text-[13px] flex-1 leading-[18px]"
                  style={{ fontFamily: "MerriweatherSans_400Regular" }}
                >
                  {feature.text}
                </Text>
              </View>
            ))}
          </View>

          <View className="items-center mb-5 gap-2">
            <View className="bg-amber-50 rounded-full px-4 py-1.5 border border-amber-100">
              <Text
                className="text-amber-700 text-xs font-medium"
                style={{ fontFamily: "MerriweatherSans_400Regular" }}
              >
                <FontAwesome6 name="coins" size={12} color="#b45309" />
                {"  "}
                <Text>{t("coins.youHave", { coins })}</Text>
              </Text>
            </View>
            {onBuyCoins && coins < AI_ANALYSIS_COIN_COST && (
              <TouchableOpacity
                onPress={onBuyCoins}
                activeOpacity={0.75}
                className="flex-row items-center gap-1.5 px-4 py-1.5 rounded-full bg-yellow-400"
              >
                <FontAwesome6 name="coins" size={11} color="#713f12" />
                <Text
                  style={{
                    fontFamily: "MerriweatherSans_700Bold",
                    fontSize: 12,
                    color: "#713f12",
                  }}
                >
                  {t("coins.buyCoins")}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            onPress={onConfirm}
            activeOpacity={0.9}
            style={{ borderRadius: 20 }}
          >
            <LinearGradient
              colors={content.confirmGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 20,
                paddingVertical: 15,
                paddingHorizontal: 24,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 10,
                borderWidth: 1.5,
                borderColor: content.confirmBorderColor,
              }}
            >
              <FontAwesome6
                name={content.confirmIcon}
                size={16}
                color={content.headerIconColor}
              />
              <Text
                className="text-slate-800 text-base font-bold"
                style={{
                  fontFamily: "MerriweatherSans_700Bold",
                  letterSpacing: 0.3,
                }}
              >
                {content.confirmLabel}
              </Text>
              <View className="bg-yellow-400 rounded-lg px-2.5 py-1 flex-row items-center shadow-sm ml-1">
                <FontAwesome6 name="coins" size={10} color="#713f12" />
                <Text className="text-yellow-900 text-xs font-bold ml-1.5">
                  {AI_ANALYSIS_COIN_COST}
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.8}
            className="mt-3 py-3 rounded-2xl bg-slate-100 items-center justify-center"
          >
            <Text
              className="text-slate-500 text-sm font-bold"
              style={{ fontFamily: "MerriweatherSans_700Bold" }}
            >
              {content.cancelLabel}
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default AiAnalysisInfoModal;
