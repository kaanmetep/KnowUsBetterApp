import { LibreBaskerville_700Bold } from "@expo-google-fonts/libre-baskerville";
import {
  MerriweatherSans_400Regular,
  MerriweatherSans_700Bold,
} from "@expo-google-fonts/merriweather-sans";
import { useFonts } from "@expo-google-fonts/merriweather-sans/useFonts";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLanguage } from "../../contexts/LanguageContext";
import { useTranslation } from "../../hooks/useTranslation";
import { getQuestionText } from "../../utils/questionUtils";

interface GameFinishedProps {
  matchScore: number;
  totalQuestions: number;
  percentage: number;
  completedRounds: any[];
  currentPlayerName: string;
  opponentPlayerName: string;
  onComplete: () => void;
  onAiAnalysisPress: () => void;
}

const GameFinished: React.FC<GameFinishedProps> = ({
  matchScore,
  totalQuestions,
  percentage,
  completedRounds,
  currentPlayerName,
  opponentPlayerName,
  onComplete,
  onAiAnalysisPress,
}) => {
  const { selectedLanguage } = useLanguage();
  const { t } = useTranslation();

  // Content entrance animation
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentScale = useRef(new Animated.Value(0.4)).current;
  const contentTranslateY = useRef(new Animated.Value(30)).current;

  // Bottom section fade in (rounds + AI button)
  const bottomOpacity = useRef(new Animated.Value(0)).current;
  const bottomTranslateY = useRef(new Animated.Value(20)).current;

  // Header fade in
  const headerOpacity = useRef(new Animated.Value(0)).current;

  // Percentage text blur animation
  const blurOverlayOpacity = useRef(new Animated.Value(1)).current;
  const blurIntensity = useRef(new Animated.Value(20)).current;
  const [currentBlurIntensity, setCurrentBlurIntensity] = useState(20);

  let [fontsLoaded] = useFonts({
    MerriweatherSans_400Regular,
    MerriweatherSans_700Bold,
    LibreBaskerville_700Bold,
  });

  // Content Entrance Animation
  useEffect(() => {
    // Fade in header immediately
    Animated.timing(headerOpacity, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();

    const initialDelay = setTimeout(() => {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(contentOpacity, {
            toValue: 0.3,
            duration: 600,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(contentScale, {
            toValue: 0.5,
            duration: 600,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(contentOpacity, {
            toValue: 1,
            duration: 1200,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(contentScale, {
            toValue: 1,
            duration: 1200,
            easing: Easing.out(Easing.back(1.5)),
            useNativeDriver: true,
          }),
          Animated.timing(contentTranslateY, {
            toValue: 0,
            duration: 1200,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        // After main content entrance, fade in the bottom section
        Animated.parallel([
          Animated.timing(bottomOpacity, {
            toValue: 1,
            duration: 800,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(bottomTranslateY, {
            toValue: 0,
            duration: 800,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, 100);

    return () => clearTimeout(initialDelay);
  }, []);

  // Blur Reveal
  useEffect(() => {
    blurOverlayOpacity.setValue(1);
    blurIntensity.setValue(20);
    setCurrentBlurIntensity(20);

    const blurIntensityListener = blurIntensity.addListener(({ value }) => {
      setCurrentBlurIntensity(value);
    });

    const blurDelay = setTimeout(() => {
      Animated.parallel([
        Animated.timing(blurOverlayOpacity, {
          toValue: 0,
          duration: 4000,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(blurIntensity, {
          toValue: 0,
          duration: 4000,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
      ]).start();
    }, 1800);

    return () => {
      clearTimeout(blurDelay);
      blurIntensity.removeListener(blurIntensityListener);
    };
  }, [blurOverlayOpacity, blurIntensity]);

  if (!fontsLoaded) return null;

  const getResultStyle = () => {
    if (percentage >= 90) {
      return {
        gradientColors: ["#fff1f2", "#ffe4e6", "#fecdd3"],
        romanticQuote: t("gameFinished.quotes.perfect"),
        heartColor: "#dc2626",
        accentBg: "rgba(220, 38, 38, 0.06)",
        borderColor: "#fca5a5",
        dividerColor: "rgba(220, 38, 38, 0.12)",
      };
    } else if (percentage >= 80) {
      return {
        gradientColors: ["#fff7ed", "#ffedd5", "#fed7aa"],
        romanticQuote: t("gameFinished.quotes.great"),
        heartColor: "#ea580c",
        accentBg: "rgba(234, 88, 12, 0.06)",
        borderColor: "#fecaca",
        dividerColor: "rgba(234, 88, 12, 0.12)",
      };
    } else if (percentage >= 70) {
      return {
        gradientColors: ["#faf5ff", "#f3e8ff", "#e9d5ff"],
        romanticQuote: t("gameFinished.quotes.good"),
        heartColor: "#9333ea",
        accentBg: "rgba(147, 51, 234, 0.06)",
        borderColor: "#d8b4fe",
        dividerColor: "rgba(147, 51, 234, 0.12)",
      };
    } else if (percentage >= 60) {
      return {
        gradientColors: ["#f0f9ff", "#e0f2fe", "#bae6fd"],
        romanticQuote: t("gameFinished.quotes.midHigh"),
        heartColor: "#0284c7",
        accentBg: "rgba(2, 132, 199, 0.06)",
        borderColor: "#7dd3fc",
        dividerColor: "rgba(2, 132, 199, 0.12)",
      };
    } else if (percentage >= 50) {
      return {
        gradientColors: ["#eff6ff", "#dbeafe", "#bfdbfe"],
        romanticQuote: t("gameFinished.quotes.mid"),
        heartColor: "#2563eb",
        accentBg: "rgba(37, 99, 235, 0.06)",
        borderColor: "#93c5fd",
        dividerColor: "rgba(37, 99, 235, 0.12)",
      };
    } else {
      return {
        gradientColors: ["#f8fafc", "#f1f5f9", "#e2e8f0"],
        romanticQuote: t("gameFinished.quotes.low"),
        heartColor: "#475569",
        accentBg: "rgba(71, 85, 105, 0.06)",
        borderColor: "#cbd5e1",
        dividerColor: "rgba(71, 85, 105, 0.12)",
      };
    }
  };

  const resultStyle = getResultStyle();

  return (
    <View className="flex-1">
      {/* Full screen gradient background */}
      <LinearGradient
        colors={resultStyle.gradientColors as [string, string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        }}
      />

      {/* ===== TOP BAR ===== */}
      <Animated.View
        className="pt-16 px-5 pb-3 flex-row items-center justify-between"
        style={{ opacity: headerOpacity }}
      >
        <TouchableOpacity
          onPress={onComplete}
          activeOpacity={0.7}
          className="flex-row items-center gap-2 px-4 py-2.5 rounded-full"
          style={{ backgroundColor: "rgba(255,255,255,0.6)" }}
        >
          <FontAwesome6 name="arrow-left" size={12} color="#475569" />
          <Text
            className="text-slate-600 text-xs font-bold"
            style={{ fontFamily: "MerriweatherSans_700Bold" }}
          >
            {t("gameFinished.backToRoom")}
          </Text>
        </TouchableOpacity>

        {/* Player names badge */}
        <View
          className="flex-row items-center gap-1.5 px-3.5 py-2 rounded-full"
          style={{ backgroundColor: "rgba(255,255,255,0.5)" }}
        >
          <FontAwesome6
            name="heart"
            size={10}
            color={resultStyle.heartColor}
            solid
            style={{ opacity: 0.6 }}
          />
          <Text
            className="text-slate-500 text-[10px] font-bold uppercase tracking-wide"
            style={{ fontFamily: "MerriweatherSans_700Bold" }}
          >
            {currentPlayerName} & {opponentPlayerName}
          </Text>
        </View>
      </Animated.View>

      {/* ===== SCROLLABLE CONTENT ===== */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ===== SCORE HERO ===== */}
        <Animated.View
          className="items-center px-6 pt-6 pb-4"
          style={{
            opacity: contentOpacity,
            transform: [
              { scale: contentScale },
              { translateY: contentTranslateY },
            ],
          }}
        >
          {/* Match Score Badge */}
          <View
            className="px-8 py-1.5 rounded-full mb-2 items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.55)" }}
          >
            <Text
              className="text-[10px] font-bold uppercase tracking-[3px] text-center"
              style={{
                fontFamily: "MerriweatherSans_700Bold",
                color: resultStyle.heartColor,
                opacity: 0.8,
              }}
            >
              {t("gameFinished.matchScoreLabel")}
            </Text>
          </View>

          {/* Percentage */}
          <View className="items-center justify-center">
            <View className="flex-row items-start justify-center">
              <Text
                className="font-bold"
                style={{
                  fontFamily: "MerriweatherSans_700Bold",
                  fontSize: 100,
                  lineHeight: 105,
                  color: resultStyle.heartColor,
                  textShadowColor: "rgba(255, 255, 255, 0.6)",
                  textShadowOffset: { width: 0, height: 2 },
                  textShadowRadius: 6,
                  includeFontPadding: false,
                }}
              >
                {percentage}
              </Text>
              <Text
                className="font-bold mt-5 ml-1"
                style={{
                  fontFamily: "MerriweatherSans_700Bold",
                  fontSize: 34,
                  color: resultStyle.heartColor,
                  opacity: 0.45,
                }}
              >
                %
              </Text>
            </View>

            {/* Blur Overlay */}
            <Animated.View
              style={{
                position: "absolute",
                top: -30,
                left: -80,
                right: -80,
                bottom: -30,
                opacity: blurOverlayOpacity,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(255,255,255,0.15)",
              }}
              pointerEvents="none"
            >
              <BlurView
                intensity={currentBlurIntensity}
                tint="light"
                style={{
                  width: "130%",
                  height: "130%",
                }}
              />
            </Animated.View>
          </View>

          {/* Score count */}
          <View
            className="rounded-full px-5 py-1.5 mt-1 mb-5"
            style={{ backgroundColor: "rgba(255,255,255,0.45)" }}
          >
            <Text
              className="text-gray-700 text-sm font-bold"
              style={{ fontFamily: "MerriweatherSans_700Bold" }}
            >
              {t("gameFinished.matchesSummary", {
                matchScore,
                totalQuestions,
              })}
            </Text>
          </View>

          {/* Quote */}
          <View className="px-6 mb-2">
            <Text
              className="text-center text-slate-600 text-base italic leading-6"
              style={{ fontFamily: "MerriweatherSans_400Regular" }}
            >
              "{resultStyle.romanticQuote}"
            </Text>
          </View>
        </Animated.View>

        {/* ===== AI ANALYSIS BUTTON (right after score) ===== */}
        <Animated.View
          className="px-5 pt-2 pb-2"
          style={{
            opacity: contentOpacity,
            transform: [{ translateY: contentTranslateY }],
          }}
        >
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onAiAnalysisPress}
            style={{
              borderRadius: 18,
              shadowColor: "#FF8080",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 10,
              elevation: 4,
            }}
          >
            <LinearGradient
              colors={["#FFF5F5", "#FFE8E8", "#FFDCDC"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 18,
                paddingVertical: 16,
                paddingHorizontal: 18,
                borderWidth: 1.5,
                borderColor: "#FFBDBD",
              }}
            >
              <View className="flex-row items-center">
                <View
                  className="w-11 h-11 rounded-full items-center justify-center mr-3"
                  style={{
                    backgroundColor: "rgba(255, 128, 128, 0.15)",
                  }}
                >
                  <FontAwesome6
                    name="heart-pulse"
                    size={17}
                    color="#E05A5A"
                  />
                </View>
                <View className="flex-1 mr-3">
                  <Text
                    className="text-slate-800 text-[13px] leading-[18px]"
                    style={{ fontFamily: "MerriweatherSans_700Bold" }}
                  >
                    {t("gameFinished.aiAnalysisButton")}
                  </Text>
                  <Text
                    className="text-slate-400 text-[10px] mt-0.5"
                    style={{
                      fontFamily: "MerriweatherSans_400Regular",
                      opacity: 0.7,
                    }}
                  >
                    {t("gameFinished.aiAnalysisPowered")}
                  </Text>
                </View>
                <View className="bg-yellow-400 rounded-lg px-2.5 py-1.5 flex-row items-center shadow-sm">
                  <FontAwesome6 name="coins" size={10} color="#713f12" />
                  <Text className="text-yellow-900 text-xs font-bold ml-1.5">
                    3
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* ===== DIVIDER ===== */}
        <Animated.View
          className="flex-row items-center justify-center mx-10 my-4"
          style={{
            opacity: bottomOpacity,
          }}
        >
          <View
            className="h-px flex-1"
            style={{ backgroundColor: resultStyle.dividerColor }}
          />
          <View className="mx-3">
            <FontAwesome6
              name="heart"
              size={10}
              color={resultStyle.heartColor}
              solid
              style={{ opacity: 0.25 }}
            />
          </View>
          <View
            className="h-px flex-1"
            style={{ backgroundColor: resultStyle.dividerColor }}
          />
        </Animated.View>

        {/* ===== ROUNDS LIST ===== */}
        {completedRounds && completedRounds.length > 0 && (
          <Animated.View
            className="px-5 pb-2"
            style={{
              opacity: bottomOpacity,
              transform: [{ translateY: bottomTranslateY }],
            }}
          >
            <View
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: "rgba(255,255,255,0.5)" }}
            >
              {completedRounds.map((round: any, index: number) => (
                <View
                  key={index}
                  className="flex-row items-center gap-3 px-4 py-3.5"
                  style={
                    index !== completedRounds.length - 1
                      ? {
                          borderBottomWidth: 1,
                          borderBottomColor: resultStyle.dividerColor,
                        }
                      : {}
                  }
                >
                  <View
                    className="w-7 h-7 rounded-full items-center justify-center"
                    style={{
                      backgroundColor: round.isMatched
                        ? "rgba(22, 163, 106, 0.12)"
                        : "rgba(220, 38, 38, 0.1)",
                    }}
                  >
                    <FontAwesome6
                      name={round.isMatched ? "check" : "xmark"}
                      size={11}
                      color={round.isMatched ? "#16a34a" : "#dc2626"}
                    />
                  </View>
                  <Text
                    className="text-slate-600 text-xs flex-1"
                    style={{
                      fontFamily: "MerriweatherSans_400Regular",
                    }}
                    numberOfLines={2}
                  >
                    {round.question
                      ? getQuestionText(round.question, selectedLanguage)
                      : round.questionText ||
                        t("gameFinished.questionNumber", {
                          index: index + 1,
                        })}
                  </Text>
                  <Text
                    className={`text-[10px] font-bold uppercase ${
                      round.isMatched ? "text-green-600" : "text-red-500"
                    }`}
                    style={{
                      fontFamily: "MerriweatherSans_700Bold",
                      opacity: 0.7,
                    }}
                  >
                    {round.isMatched
                      ? t("gameFinished.matchTag")
                      : t("gameFinished.noMatchTag")}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
};

export default GameFinished;
