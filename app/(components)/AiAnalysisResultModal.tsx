import {
  MerriweatherSans_400Regular,
  MerriweatherSans_700Bold,
} from "@expo-google-fonts/merriweather-sans";
import { useFonts } from "@expo-google-fonts/merriweather-sans/useFonts";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import React, { useCallback, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useTranslation } from "../hooks/useTranslation";
import { AiAnalysisResult } from "../services/aiAnalysisService";

interface AiAnalysisResultModalProps {
  visible: boolean;
  onClose: () => void;
  onRetry?: () => void;
  isLoading: boolean;
  error: string | null;
  result: AiAnalysisResult | null;
  player1Name?: string;
  player2Name?: string;
}

const SectionCard: React.FC<{
  icon: string;
  iconColor: string;
  iconBg: string;
  title: string;
  content: string;
  delay: number;
}> = ({ icon, iconColor, iconBg, title, content, delay }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
      ]).start();
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateY }],
      }}
    >
      <View
        className="bg-white rounded-2xl p-5 mb-4"
        style={Platform.select({
          ios: {
            shadowColor: "#1e293b",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
          },
          android: { elevation: 3 },
        })}
      >
        {/* Section Header */}
        <View className="flex-row items-center gap-3 mb-3">
          <View
            className="w-9 h-9 rounded-full items-center justify-center"
            style={{ backgroundColor: iconBg }}
          >
            <FontAwesome6 name={icon} size={15} color={iconColor} />
          </View>
          <Text
            className="text-slate-800 text-base font-bold flex-1"
            style={{ fontFamily: "MerriweatherSans_700Bold" }}
          >
            {title}
          </Text>
        </View>

        {/* Section Content */}
        <Text
          className="text-slate-600 text-[13.5px] leading-[22px]"
          style={{ fontFamily: "MerriweatherSans_400Regular" }}
        >
          {content}
        </Text>
      </View>
    </Animated.View>
  );
};

const AiAnalysisResultModal: React.FC<AiAnalysisResultModalProps> = ({
  visible,
  onClose,
  onRetry,
  isLoading,
  error,
  result,
  player1Name,
  player2Name,
}) => {
  const { t } = useTranslation();

  const handleClose = useCallback(() => {
    // Show confirmation if loading or result is available (coins already spent)
    if (isLoading || result) {
      Alert.alert(
        t("gameFinished.aiResultLeaveTitle"),
        t("gameFinished.aiResultLeaveMessage"),
        [
          {
            text: t("gameFinished.aiResultLeaveCancel"),
            style: "cancel",
          },
          {
            text: t("gameFinished.aiResultLeaveConfirm"),
            style: "destructive",
            onPress: onClose,
          },
        ]
      );
      return;
    }
    onClose();
  }, [isLoading, result, onClose, t]);

  let [fontsLoaded] = useFonts({
    MerriweatherSans_400Regular,
    MerriweatherSans_700Bold,
  });

  // Pulse animation for loading
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isLoading) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isLoading]);

  if (!fontsLoaded) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View className="flex-1 bg-slate-50">
        {/* Header */}
        <View
          className="bg-white pt-14 pb-4 px-6 flex-row items-center justify-between"
          style={Platform.select({
            ios: {
              shadowColor: "#1e293b",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
            },
            android: { elevation: 4 },
          })}
        >
          <View className="flex-1">
            <Text
              className="text-xl text-slate-800"
              style={{ fontFamily: "MerriweatherSans_700Bold" }}
            >
              {t("gameFinished.aiResultTitle")}
            </Text>
            {player1Name && player2Name && (
              <Text
                className="text-slate-400 text-xs mt-1.5"
                style={{ fontFamily: "MerriweatherSans_400Regular" }}
              >
                {player1Name} & {player2Name}
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={handleClose}
            className="bg-slate-100 p-2.5 rounded-full"
            activeOpacity={0.7}
          >
            <FontAwesome6 name="xmark" size={18} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        {isLoading ? (
          /* Loading State */
          <View className="flex-1 items-center justify-center px-8">
            <Animated.View
              style={{ transform: [{ scale: pulseAnim }] }}
              className="w-20 h-20 rounded-full items-center justify-center mb-6"
            >
              <View
                className="w-20 h-20 rounded-full items-center justify-center"
                style={{ backgroundColor: "rgba(255, 128, 128, 0.12)" }}
              >
                <FontAwesome6 name="heart-pulse" size={32} color="#E05A5A" />
              </View>
            </Animated.View>
            <ActivityIndicator size="small" color="#E05A5A" />
            <Text
              className="text-slate-800 text-lg mt-4 text-center"
              style={{ fontFamily: "MerriweatherSans_700Bold" }}
            >
              {t("gameFinished.aiResultLoading")}
            </Text>
            <Text
              className="text-slate-400 text-sm mt-2 text-center"
              style={{ fontFamily: "MerriweatherSans_400Regular" }}
            >
              {t("gameFinished.aiResultLoadingSub")}
            </Text>
            <Text
              className="text-slate-300 text-xs mt-6 text-center"
              style={{ fontFamily: "MerriweatherSans_400Regular" }}
            >
              {t("gameFinished.aiResultLoadingWarn")}
            </Text>
          </View>
        ) : error ? (
          /* Error State */
          <View className="flex-1 items-center justify-center px-8">
            <View
              className="w-16 h-16 rounded-full items-center justify-center mb-5"
              style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
            >
              <FontAwesome6
                name="circle-exclamation"
                size={28}
                color="#EF4444"
              />
            </View>
            <Text
              className="text-slate-800 text-base text-center mb-6"
              style={{ fontFamily: "MerriweatherSans_400Regular" }}
            >
              {t("gameFinished.aiResultError")}
            </Text>
            {onRetry && (
              <TouchableOpacity
                onPress={onRetry}
                className="bg-rose-100 px-8 py-3.5 rounded-2xl"
                activeOpacity={0.8}
              >
                <Text
                  className="text-rose-700 text-sm font-bold"
                  style={{ fontFamily: "MerriweatherSans_700Bold" }}
                >
                  {t("gameFinished.aiResultRetry")}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : result ? (
          /* Result Content */
          <ScrollView
            className="flex-1 px-5 pt-5"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 }}
          >
            <SectionCard
              icon="heart"
              iconColor="#E05A5A"
              iconBg="rgba(255, 128, 128, 0.12)"
              title={t("gameFinished.aiResultStrengths")}
              content={result.strengths}
              delay={100}
            />

            <SectionCard
              icon="shuffle"
              iconColor="#3B82F6"
              iconBg="rgba(59, 130, 246, 0.12)"
              title={t("gameFinished.aiResultDifferences")}
              content={result.differences}
              delay={300}
            />

            <SectionCard
              icon="lightbulb"
              iconColor="#F59E0B"
              iconBg="rgba(245, 158, 11, 0.12)"
              title={t("gameFinished.aiResultTips")}
              content={result.tips}
              delay={500}
            />

            <SectionCard
              icon="heart-pulse"
              iconColor="#E05A5A"
              iconBg="rgba(255, 128, 128, 0.12)"
              title={
                player1Name && player2Name
                  ? t("gameFinished.aiResultCompatibility", {
                      player1: player1Name,
                      player2: player2Name,
                    })
                  : t("gameFinished.aiResultCompatibilityDefault")
              }
              content={result.compatibility}
              delay={700}
            />

          </ScrollView>
        ) : null}

        {/* Bottom Close Button — always visible when not loading */}
        {!isLoading && (
          <View
            className="absolute bottom-0 left-0 right-0 bg-white px-6 pt-4 pb-8"
            style={Platform.select({
              ios: {
                shadowColor: "#1e293b",
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
              },
              android: { elevation: 8 },
            })}
          >
            <TouchableOpacity
              onPress={handleClose}
              activeOpacity={0.8}
              className="py-4 rounded-2xl bg-slate-100 items-center justify-center"
            >
              <Text
                className="text-slate-600 text-sm font-bold"
                style={{ fontFamily: "MerriweatherSans_700Bold" }}
              >
                {t("gameFinished.aiResultClose")}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

export default AiAnalysisResultModal;
