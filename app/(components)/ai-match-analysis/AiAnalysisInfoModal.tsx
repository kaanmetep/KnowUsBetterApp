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

interface AiAnalysisInfoModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const AI_COST = 3;

const AiAnalysisInfoModal: React.FC<AiAnalysisInfoModalProps> = ({
  visible,
  onClose,
  onConfirm,
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

  const features = [
    {
      icon: "heart" as const,
      color: "#E05A5A",
      bg: "rgba(255, 128, 128, 0.12)",
      text: t("gameFinished.aiModalFeature1"),
    },
    {
      icon: "shuffle" as const,
      color: "#3B82F6",
      bg: "rgba(59, 130, 246, 0.12)",
      text: t("gameFinished.aiModalFeature2"),
    },
    {
      icon: "lightbulb" as const,
      color: "#F59E0B",
      bg: "rgba(245, 158, 11, 0.12)",
      text: t("gameFinished.aiModalFeature3"),
    },
  ];

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
          {/* Close Button */}
          <TouchableOpacity
            onPress={onClose}
            className="absolute top-5 right-5 z-10 bg-slate-100 p-2 rounded-full"
            activeOpacity={0.7}
          >
            <FontAwesome6 name="xmark" size={16} color="#64748b" />
          </TouchableOpacity>

          {/* Header Icon */}
          <View className="items-center mb-5">
            <View
              className="w-16 h-16 rounded-full items-center justify-center"
              style={{ backgroundColor: "rgba(255, 128, 128, 0.15)" }}
            >
              <FontAwesome6 name="heart-pulse" size={28} color="#E05A5A" />
            </View>
          </View>

          {/* Title */}
          <Text
            className="text-xl font-bold text-slate-800 text-center mb-2"
            style={{ fontFamily: "MerriweatherSans_700Bold" }}
          >
            {t("gameFinished.aiModalTitle")}
          </Text>

          {/* Description */}
          <Text
            className="text-sm text-slate-500 text-center mb-6 leading-5 px-2"
            style={{ fontFamily: "MerriweatherSans_400Regular" }}
          >
            {t("gameFinished.aiModalDesc")}
          </Text>

          {/* Feature List */}
          <View className="mb-6 gap-3">
            {features.map((feature, index) => (
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

          {/* Coin Balance */}
          <View className="items-center mb-5">
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
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            onPress={onConfirm}
            activeOpacity={0.9}
            style={{ borderRadius: 20 }}
          >
            <LinearGradient
              colors={["#FFF5F5", "#FFE8E8", "#FFDCDC"]}
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
                borderColor: "#FFBDBD",
              }}
            >
              <FontAwesome6 name="heart-pulse" size={16} color="#E05A5A" />
              <Text
                className="text-slate-800 text-base font-bold"
                style={{
                  fontFamily: "MerriweatherSans_700Bold",
                  letterSpacing: 0.3,
                }}
              >
                {t("gameFinished.aiModalConfirm")}
              </Text>
              <View className="bg-yellow-400 rounded-lg px-2.5 py-1 flex-row items-center shadow-sm ml-1">
                <FontAwesome6 name="coins" size={10} color="#713f12" />
                <Text className="text-yellow-900 text-xs font-bold ml-1.5">
                  {AI_COST}
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.8}
            className="mt-3 py-3 rounded-2xl bg-slate-100 items-center justify-center"
          >
            <Text
              className="text-slate-500 text-sm font-bold"
              style={{ fontFamily: "MerriweatherSans_700Bold" }}
            >
              {t("gameFinished.aiModalCancel")}
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default AiAnalysisInfoModal;
