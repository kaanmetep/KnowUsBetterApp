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
  AppState,
  AppStateStatus,
  Easing,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLanguage } from "../contexts/LanguageContext";
import { useTranslation } from "../hooks/useTranslation";
import { getQuestionText } from "../utils/questionUtils";

interface GameFinishedProps {
  matchScore: number;
  totalQuestions: number;
  percentage: number;
  completedRounds: any[];
  displayDuration: number;
  currentPlayerName: string;
  opponentPlayerName: string;
  onComplete: () => void;
}

const GameFinished: React.FC<GameFinishedProps> = ({
  matchScore,
  totalQuestions,
  percentage,
  completedRounds,
  displayDuration,
  currentPlayerName,
  opponentPlayerName,
  onComplete,
}) => {
  const { selectedLanguage } = useLanguage();
  const { t } = useTranslation();
  const [timeRemaining, setTimeRemaining] = useState(displayDuration);
  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<number | null>(null);
  const isCompletedRef = useRef<boolean>(false);
  const durationRef = useRef<number>(displayDuration);
  const onCompleteRef = useRef(onComplete);
  const countdownTranslateY = useRef(new Animated.Value(0)).current;
  const countdownScale = useRef(new Animated.Value(1)).current;

  // Card entrance animations
  const matchCardOpacity = useRef(new Animated.Value(0)).current;
  const matchCardScale = useRef(new Animated.Value(0.4)).current;
  const matchCardTranslateY = useRef(new Animated.Value(30)).current;
  const roundsCardOpacity = useRef(new Animated.Value(0)).current;
  const roundsCardScale = useRef(new Animated.Value(0.4)).current;
  const roundsCardTranslateY = useRef(new Animated.Value(30)).current;

  // Percentage text blur animation
  const blurOverlayOpacity = useRef(new Animated.Value(1)).current;
  const blurIntensity = useRef(new Animated.Value(20)).current;
  const [currentBlurIntensity, setCurrentBlurIntensity] = useState(20);

  let [fontsLoaded] = useFonts({
    MerriweatherSans_400Regular,
    MerriweatherSans_700Bold,
    LibreBaskerville_700Bold,
  });

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    setTimeRemaining(displayDuration);
    durationRef.current = displayDuration;
    startTimeRef.current = Date.now();
    isCompletedRef.current = false;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (displayDuration <= 0) {
      onCompleteRef.current();
      return;
    }

    const updateTimer = () => {
      if (isCompletedRef.current) return;

      const now = Date.now();
      const elapsedMs = now - startTimeRef.current;
      const elapsedSeconds = Math.floor(elapsedMs / 1000);
      const remaining = Math.max(0, durationRef.current - elapsedSeconds);

      setTimeRemaining((prev) => (prev !== remaining ? remaining : prev));

      if (remaining <= 0 && !isCompletedRef.current) {
        isCompletedRef.current = true;
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setTimeout(() => {
          onCompleteRef.current();
        }, 100);
      }
    };

    updateTimer();
    timerRef.current = setInterval(updateTimer, 100);

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active" && !isCompletedRef.current) {
        updateTimer();
        setTimeout(() => updateTimer(), 10);
      }
    };

    const appStateSubscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      appStateSubscription.remove();
    };
  }, [displayDuration]);

  // Floating Animation
  useEffect(() => {
    const floatingAnimation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(countdownTranslateY, {
            toValue: -3,
            duration: 2200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(countdownScale, {
            toValue: 1.02,
            duration: 2200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(countdownTranslateY, {
            toValue: 0,
            duration: 2200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(countdownScale, {
            toValue: 1,
            duration: 2200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    floatingAnimation.start();
    return () => floatingAnimation.stop();
  }, [countdownTranslateY, countdownScale]);

  // Card Entrance
  useEffect(() => {
    const initialDelay = setTimeout(() => {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(matchCardOpacity, {
            toValue: 0.3,
            duration: 600,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(matchCardScale, {
            toValue: 0.5,
            duration: 600,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(matchCardOpacity, {
            toValue: 1,
            duration: 1200,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(matchCardScale, {
            toValue: 1,
            duration: 1200,
            easing: Easing.out(Easing.back(1.5)),
            useNativeDriver: true,
          }),
          Animated.timing(matchCardTranslateY, {
            toValue: 0,
            duration: 1200,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      const roundsDelay = setTimeout(() => {
        Animated.sequence([
          Animated.parallel([
            Animated.timing(roundsCardOpacity, {
              toValue: 0.3,
              duration: 600,
              easing: Easing.in(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(roundsCardScale, {
              toValue: 0.5,
              duration: 600,
              easing: Easing.in(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(roundsCardOpacity, {
              toValue: 1,
              duration: 1200,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(roundsCardScale, {
              toValue: 1,
              duration: 1200,
              easing: Easing.out(Easing.back(1.5)),
              useNativeDriver: true,
            }),
            Animated.timing(roundsCardTranslateY, {
              toValue: 0,
              duration: 1200,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      }, 500);

      return () => clearTimeout(roundsDelay);
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
        bgColor: "#f87171",
        // Note: Using very subtle backgrounds for the card, the text will carry the color
        gradientColors: ["#fff1f2", "#ffe4e6"],
        romanticQuote: t("gameFinished.quotes.perfect"),
        heartColor: "#dc2626", // Strong Red
        borderColor: "#fca5a5",
        shadowColor: "#fee2e2",
      };
    } else if (percentage >= 80) {
      return {
        bgColor: "#fca5a5",
        gradientColors: ["#fff7ed", "#ffedd5"],
        romanticQuote: t("gameFinished.quotes.great"),
        heartColor: "#ea580c", // Orange/Red
        borderColor: "#fecaca",
        shadowColor: "#fef2f2",
      };
    } else if (percentage >= 70) {
      return {
        bgColor: "#fecaca",
        gradientColors: ["#fffaff", "#f3e8ff"],
        romanticQuote: t("gameFinished.quotes.good"),
        heartColor: "#9333ea", // Purple
        borderColor: "#fdd5d5",
        shadowColor: "#fef2f2",
      };
    } else if (percentage >= 60) {
      return {
        bgColor: "#93c5fd",
        gradientColors: ["#f0f9ff", "#e0f2fe"],
        romanticQuote: t("gameFinished.quotes.midHigh"),
        heartColor: "#0284c7", // Sky Blue
        borderColor: "#bfdbfe",
        shadowColor: "#eff6ff",
      };
    } else if (percentage >= 50) {
      return {
        bgColor: "#bfdbfe",
        gradientColors: ["#eff6ff", "#dbeafe"],
        romanticQuote: t("gameFinished.quotes.mid"),
        heartColor: "#2563eb", // Blue
        borderColor: "#dbeafe",
        shadowColor: "#f0f9ff",
      };
    } else {
      return {
        bgColor: "#e2e8f0",
        gradientColors: ["#f8fafc", "#f1f5f9"],
        romanticQuote: t("gameFinished.quotes.low"),
        heartColor: "#475569", // Slate
        borderColor: "#e2e8f0",
        shadowColor: "#f8fafc",
      };
    }
  };

  const resultStyle = getResultStyle();

  return (
    <View className="flex-1 bg-[#F8FAFC] pt-16">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 mt-8 mb-6">
          <TouchableOpacity
            onPress={onComplete}
            activeOpacity={0.8}
            className="bg-white border border-slate-200 rounded-full px-4 py-2 flex-row items-center gap-2 shadow-sm"
          >
            <FontAwesome6 name="arrow-left" size={12} color="#475569" />
            <Text
              className="text-slate-600 text-xs font-bold"
              style={{ fontFamily: "MerriweatherSans_700Bold" }}
            >
              {t("gameFinished.backToRoom")}
            </Text>
          </TouchableOpacity>

          <Animated.View
            style={{
              transform: [
                { translateY: countdownTranslateY },
                { scale: countdownScale },
              ],
            }}
          >
            <View className="bg-white border border-slate-200 rounded-full px-4 py-2 shadow-sm">
              <Text
                className="text-slate-600 text-sm font-bold"
                style={{ fontFamily: "MerriweatherSans_700Bold" }}
              >
                {t("gameFinished.returningCountdown", {
                  seconds: timeRemaining,
                })}
              </Text>
            </View>
          </Animated.View>
        </View>

        <View className="px-6">
          {/* Match Score Card */}
          <Animated.View
            className="mb-4"
            style={{
              opacity: matchCardOpacity,
              transform: [
                { scale: matchCardScale },
                { translateY: matchCardTranslateY },
              ],
            }}
          >
            <View
              className="bg-white rounded-[32px] overflow-hidden shadow-xl shadow-slate-200/60"
              style={{ elevation: 5 }}
            >
              {/* Subtle Background Gradient for whole card */}
              <LinearGradient
                colors={resultStyle.gradientColors as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  opacity: 0.6,
                }}
              />

              <View className="p-8">
                <View className="items-center mb-6 pt-4">
                  <View className="bg-white/60 px-10 py-1.5 rounded-full border border-white/40 mb-2 items-center justify-center">
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

                  <View className="flex-row items-start justify-center">
                    <Text
                      className="font-bold"
                      style={{
                        fontFamily: "MerriweatherSans_700Bold",
                        fontSize: 96,
                        lineHeight: 100,
                        color: resultStyle.heartColor,
                        textShadowColor: "rgba(255, 255, 255, 0.5)",
                        textShadowOffset: { width: 0, height: 2 },
                        textShadowRadius: 4,
                        includeFontPadding: false,
                      }}
                    >
                      {percentage}
                    </Text>
                    <Text
                      className="font-bold mt-4 ml-1"
                      style={{
                        fontFamily: "MerriweatherSans_700Bold",
                        fontSize: 32,
                        color: resultStyle.heartColor,
                        opacity: 0.5,
                      }}
                    >
                      %
                    </Text>
                  </View>

                  <Animated.View
                    style={{
                      position: "absolute",
                      top: -20,
                      left: -50,
                      right: -50,
                      bottom: -20,
                      opacity: blurOverlayOpacity,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "rgba(255,255,255,0.2)",
                    }}
                    pointerEvents="none"
                  >
                    <BlurView
                      intensity={currentBlurIntensity}
                      tint="light"
                      style={{
                        width: "120%",
                        height: "120%",
                      }}
                    />
                  </Animated.View>
                </View>

                <View className="mb-6">
                  <Text
                    className="text-center text-slate-700 text-lg italic leading-7 px-4"
                    style={{ fontFamily: "MerriweatherSans_400Regular" }}
                  >
                    "{resultStyle.romanticQuote}"
                  </Text>
                </View>

                <View className="flex-row items-center justify-center mb-6 opacity-30">
                  <View className="h-px bg-slate-400 flex-1" />
                  <View className="mx-3">
                    <FontAwesome6
                      name="heart"
                      size={14}
                      color={resultStyle.heartColor}
                      solid
                    />
                  </View>
                  <View className="h-px bg-slate-400 flex-1" />
                </View>

                <View className="bg-white/50 rounded-2xl p-4 mb-2 border border-white/60">
                  <View className="items-center">
                    <Text
                      className="text-gray-900 text-base font-bold mb-1"
                      style={{ fontFamily: "MerriweatherSans_700Bold" }}
                    >
                      {t("gameFinished.matchesSummary", {
                        matchScore,
                        totalQuestions,
                      })}
                    </Text>
                    <Text
                      className="text-gray-500 text-xs font-bold uppercase tracking-wide"
                      style={{ fontFamily: "MerriweatherSans_700Bold" }}
                    >
                      {currentPlayerName} & {opponentPlayerName}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Completed Rounds Summary */}
          {completedRounds && completedRounds.length > 0 && (
            <Animated.View
              className="mb-6"
              style={{
                opacity: roundsCardOpacity,
                transform: [
                  { scale: roundsCardScale },
                  { translateY: roundsCardTranslateY },
                ],
              }}
            >
              <View className="bg-white rounded-2xl p-4 shadow-lg shadow-slate-200/50">
                <View className="gap-3">
                  {completedRounds.map((round: any, index: number) => (
                    <View
                      key={index}
                      className="flex-row items-center justify-between gap-3 pb-3 border-b border-slate-50 last:border-0 last:pb-0"
                    >
                      <Text
                        className="text-slate-600 text-xs flex-1 font-medium"
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
                      <View className="flex-shrink-0">
                        <View
                          className={`rounded-full px-2.5 py-1 flex-row items-center gap-1.5 ${
                            round.isMatched
                              ? "bg-green-50 border border-green-100"
                              : "bg-red-50 border border-red-100"
                          }`}
                        >
                          <FontAwesome6
                            name={round.isMatched ? "check" : "xmark"}
                            size={10}
                            color={round.isMatched ? "#16a34a" : "#dc2626"}
                          />
                          <Text
                            className={`text-[10px] font-bold uppercase ${
                              round.isMatched
                                ? "text-green-700"
                                : "text-red-700"
                            }`}
                            style={{
                              fontFamily: "MerriweatherSans_700Bold",
                            }}
                          >
                            {round.isMatched
                              ? t("gameFinished.matchTag")
                              : t("gameFinished.noMatchTag")}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </Animated.View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default GameFinished;
