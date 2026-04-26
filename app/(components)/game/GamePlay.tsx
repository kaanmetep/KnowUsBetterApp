import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLanguage } from "../../contexts/LanguageContext";
import { useTranslation } from "../../hooks/useTranslation";
import {
  Category,
  getCategoryById,
  getCategoryLabel,
} from "../../services/categoryService";
import {
  getQuestionAnswers,
  getResolvedQuestionText,
  resolvePlayerName,
} from "../../utils/questionUtils";
import Countdown from "../ui/Countdown";
import LanguageFlag from "../settings/LanguageFlag";
import Logo from "../ui/Logo";
import RateAppFeedbackModal from "../profile/RateAppFeedbackModal";
import RoundResult from "./RoundResult";
import SettingsButton from "../settings/SettingsButton";
import SettingsModal from "../settings/SettingsModal";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const GlassPill: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <View
    className={`bg-white/80 rounded-full px-4 py-2 border border-blue-50 shadow-sm ${className}`}
    style={{ shadowColor: "#93C5FD", shadowOpacity: 0.2, shadowRadius: 8 }}
  >
    {children}
  </View>
);

const SelectedIcon: React.FC<{ type: "yes" | "no" | "custom" }> = ({ type }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <Feather
        name={type === "no" ? "x" : "check"}
        size={18}
        color={type === "yes" ? "#10B981" : type === "no" ? "#F43F5E" : "#64748B"}
      />
    </Animated.View>
  );
};

const AnimatedAnswerButton: React.FC<{
  onPress: () => void;
  disabled: boolean;
  children: React.ReactNode;
}> = ({ onPress, disabled, children }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  return (
    <TouchableOpacity
      onPress={(e) => {
        e.stopPropagation();
        onPress();
      }}
      onPressIn={() => {
        Animated.spring(scaleAnim, {
          toValue: 0.96,
          friction: 8,
          tension: 200,
          useNativeDriver: true,
        }).start();
      }}
      onPressOut={() => {
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 200,
          useNativeDriver: true,
        }).start();
      }}
      disabled={disabled}
      activeOpacity={1}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

const ThinkingDots: React.FC = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const bounce = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: -5, duration: 280, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 280, useNativeDriver: true }),
          Animated.delay(560),
        ])
      );
    Animated.parallel([bounce(dot1, 0), bounce(dot2, 140), bounce(dot3, 280)]).start();
  }, []);

  return (
    <View style={{ flexDirection: "row", gap: 4, alignItems: "center" }}>
      {[dot1, dot2, dot3].map((anim, i) => (
        <Animated.View
          key={i}
          style={{
            width: 5,
            height: 5,
            borderRadius: 3,
            backgroundColor: "#94A3B8",
            transform: [{ translateY: anim }],
          }}
        />
      ))}
    </View>
  );
};

const PartnerStatusWidget: React.FC<{
  hasSubmitted: boolean;
  opponentAnswered: boolean;
  waitingText: string;
  answeredText: string;
}> = ({ hasSubmitted, opponentAnswered, waitingText, answeredText }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!hasSubmitted) return;
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 7, useNativeDriver: true }),
    ]).start();
  }, [hasSubmitted]);

  useEffect(() => {
    if (!opponentAnswered) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.6, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, [opponentAnswered]);

  if (!hasSubmitted) return null;

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        marginTop: 16,
        alignItems: "center",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          backgroundColor: "white",
          borderRadius: 20,
          paddingVertical: 9,
          paddingHorizontal: 16,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.07,
          shadowRadius: 8,
          elevation: 4,
          borderWidth: 1,
          borderColor: opponentAnswered ? "#D1FAE5" : "#F1F5F9",
        }}
      >
        {opponentAnswered ? (
          <>
            <View
              style={{
                width: 14,
                height: 14,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Animated.View
                style={{
                  position: "absolute",
                  width: 14,
                  height: 14,
                  borderRadius: 7,
                  backgroundColor: "#10B981",
                  opacity: 0.25,
                  transform: [{ scale: pulseAnim }],
                }}
              />
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "#10B981",
                }}
              />
            </View>
            <Text
              style={{
                fontFamily: "MerriweatherSans_400Regular",
                fontSize: 12,
                color: "#1E293B",
              }}
            >
              {answeredText}
            </Text>
          </>
        ) : (
          <>
            <ThinkingDots />
            <Text
              style={{
                fontFamily: "MerriweatherSans_400Regular",
                fontSize: 12,
                color: "#64748B",
              }}
            >
              {waitingText}
            </Text>
          </>
        )}
      </View>
    </Animated.View>
  );
};

interface GamePlayProps {
  currentQuestion: any;
  currentQuestionIndex: number;
  totalQuestions: number;
  questionDuration: number;
  selectedAnswer: string | null;
  hasSubmitted: boolean;
  opponentAnswered: boolean;
  opponentName: string | null;
  notifications: string[];
  roundResult: any;
  onSelectAnswer: (answer: string) => void;
  onLeaveRoom?: () => void;
  roomCode: string;
  currentPlayerId?: string;
  categoryId?: string;
  player1Name?: string;
  player2Name?: string;
}

const GamePlay: React.FC<GamePlayProps> = ({
  currentQuestion,
  currentQuestionIndex,
  totalQuestions,
  questionDuration,
  selectedAnswer,
  hasSubmitted,
  opponentAnswered,
  opponentName,
  roundResult,
  onSelectAnswer,
  onLeaveRoom,
  categoryId,
  player1Name,
  player2Name,
}) => {
  const { selectedLanguage, setSelectedLanguage, languages } = useLanguage();
  const { t } = useTranslation();
  const [timerKey, setTimerKey] = useState(0);
  const [categoryInfo, setCategoryInfo] = useState<Category | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showRateAppModal, setShowRateAppModal] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const cardSlideAnim = useRef(new Animated.Value(0)).current;
  const cardFadeAnim = useRef(new Animated.Value(1)).current;
  const isFirstQuestion = useRef(true);

  useEffect(() => {
    setTimerKey((prev) => prev + 1);
  }, [currentQuestionIndex, questionDuration]);

  useEffect(() => {
    const target = totalQuestions > 0 ? (currentQuestionIndex + 1) / totalQuestions : 0;
    Animated.timing(progressAnim, {
      toValue: target,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [currentQuestionIndex, totalQuestions]);

  useEffect(() => {
    if (isFirstQuestion.current) {
      isFirstQuestion.current = false;
      return;
    }
    cardSlideAnim.setValue(SCREEN_WIDTH);
    cardFadeAnim.setValue(0);
    Animated.parallel([
      Animated.spring(cardSlideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(cardFadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentQuestionIndex]);

  useEffect(() => {
    let isMounted = true;
    const loadCategoryInfo = async () => {
      if (!categoryId) {
        if (isMounted) setCategoryInfo(null);
        return;
      }
      try {
        const info = await getCategoryById(categoryId);
        if (isMounted) setCategoryInfo(info);
      } catch (error) {
        if (isMounted) setCategoryInfo(null);
      }
    };
    loadCategoryInfo();
    return () => {
      isMounted = false;
    };
  }, [categoryId]);

  const displayCategoryInfo = categoryInfo || {
    id: categoryId || "just_friends",
    labels: {},
    color: "#EFF6FF",
    iconName: "heart",
    iconType: "FontAwesome6" as const,
    coinsRequired: 0,
    isPremium: false,
    orderIndex: 0,
  };

  const progressColor = categoryInfo?.color || "#C94B6A";

  const currentPlayerName =
    categoryId === "know_me_well" && player1Name && player2Name
      ? resolvePlayerName(currentQuestionIndex, player1Name, player2Name)
      : undefined;

  const getButtonStyles = (
    type: "yes" | "no" | "custom",
    isSelected: boolean,
    isDisabled: boolean
  ) => {
    if (isDisabled && !isSelected) return "bg-slate-100 border-slate-200";

    if (type === "yes") {
      return isSelected
        ? "bg-emerald-100 border-emerald-200"
        : "bg-emerald-50 border-emerald-100";
    }

    if (type === "no") {
      return isSelected
        ? "bg-rose-100 border-rose-200"
        : "bg-rose-50 border-rose-100";
    }

    return isSelected
      ? "bg-slate-200 border-slate-300"
      : "bg-white border-slate-100";
  };

  const getButtonTextStyles = (isSelected: boolean, isDisabled: boolean) => {
    if (isDisabled && !isSelected) return "text-slate-300";
    if (isSelected) return "text-slate-900";
    return "text-slate-600";
  };

  return (
    <View className="flex-1 bg-[#F8FAFC]" style={{ flexDirection: "column" }}>
      <SettingsModal
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onRequestRateApp={() => setShowRateAppModal(true)}
      />

      {/* --- Header Section --- */}
      <View className="pt-16 pb-4 px-6 flex-row justify-between items-center z-50">
        {onLeaveRoom && (
          <TouchableOpacity
            onPress={onLeaveRoom}
            className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm shadow-slate-200 border border-slate-100"
            activeOpacity={0.7}
          >
            <FontAwesome5 name="arrow-left" size={14} color="#64748B" />
          </TouchableOpacity>
        )}

        <View className="flex-row gap-3">
          <View className="relative z-50">
            <TouchableOpacity
              onPress={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
              activeOpacity={0.7}
              className="bg-white border border-slate-100 rounded-full px-4 py-2 flex-row items-center gap-2 shadow-sm shadow-slate-200"
            >
              <LanguageFlag language={selectedLanguage} size="md" />
              <Text
                className="text-slate-600 text-xs"
                style={{ fontFamily: "System", fontWeight: "700" }}
              >
                {selectedLanguage.toUpperCase()}
              </Text>
              <Feather
                name={isLanguageMenuOpen ? "chevron-up" : "chevron-down"}
                size={14}
                color="#94A3B8"
              />
            </TouchableOpacity>

            {isLanguageMenuOpen && (
              <View className="absolute top-12 right-0 w-[140px] bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-50 overflow-hidden py-1">
                {(Object.keys(languages) as Array<keyof typeof languages>).map(
                  (lang) => (
                    <TouchableOpacity
                      key={lang}
                      onPress={() => {
                        setSelectedLanguage(lang);
                        setIsLanguageMenuOpen(false);
                      }}
                      className={`flex-row items-center gap-3 px-4 py-3 ${
                        selectedLanguage === lang ? "bg-blue-50" : ""
                      }`}
                    >
                      <LanguageFlag language={lang} size="md" />
                      <Text
                        className={`text-sm ${
                          selectedLanguage === lang
                            ? "text-blue-600 font-bold"
                            : "text-slate-500"
                        }`}
                        style={{ fontFamily: "MerriweatherSans_400Regular" }}
                      >
                        {languages[lang].label}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            )}
          </View>

          <SettingsButton
            onPress={() => setShowSettingsModal(true)}
            variant="modern"
          />
        </View>
      </View>

      {/* --- Main Game Area --- */}
      <View className="flex-1 px-6 pt-4">
        {/* Category Badge */}
        <View className="items-center mb-4">
          <GlassPill className="flex-row items-center gap-2">
            {displayCategoryInfo.iconType === "MaterialCommunityIcons" ? (
              <MaterialCommunityIcons
                name={displayCategoryInfo.iconName as any}
                size={14}
                color="#64748B"
              />
            ) : (
              <FontAwesome6
                name={displayCategoryInfo.iconName as any}
                size={12}
                color="#64748B"
              />
            )}
            <Text
              className="text-slate-500 text-xs font-semibold tracking-wide uppercase"
              style={{ fontFamily: "MerriweatherSans_400Regular" }}
            >
              {getCategoryLabel(displayCategoryInfo, selectedLanguage)}
            </Text>
          </GlassPill>
        </View>

        {/* Progress Bar */}
        {!roundResult && (
          <View
            style={{
              height: 4,
              backgroundColor: "#F1F5F9",
              borderRadius: 2,
              marginBottom: 16,
              overflow: "hidden",
            }}
          >
            <Animated.View
              style={{
                height: 4,
                borderRadius: 2,
                backgroundColor: progressColor,
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, SCREEN_WIDTH - 48],
                }),
              }}
            />
          </View>
        )}

        {roundResult && (
          <RoundResult
            roundResult={roundResult}
            currentQuestion={currentQuestion}
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={totalQuestions}
            selectedLanguage={selectedLanguage}
            playerName={currentPlayerName}
            categoryId={categoryId}
            player1Name={player1Name}
            player2Name={player2Name}
          />
        )}

        {!roundResult && (
          <Animated.View
            style={{
              flex: 1,
              transform: [{ translateX: cardSlideAnim }],
              opacity: cardFadeAnim,
            }}
          >
            <Pressable className="flex-1" onPress={(e) => e.stopPropagation()}>
              {/* THE CARD */}
              <View
                className="bg-white rounded-[32px] p-6 w-full shadow-2xl shadow-blue-100/50"
                style={{ elevation: 10 }}
              >
                {/* Card Header: Timer & Progress */}
                <View className="flex-row items-center justify-between mb-8">
                  <View style={{ width: 48, height: 48 }}>
                    <View key={timerKey}>
                      <Countdown
                        duration={questionDuration}
                        showFullScreen={false}
                        onComplete={() => {
                          if (!hasSubmitted && currentQuestion) {
                            if (!currentQuestion.haveAnswers) {
                              onSelectAnswer("yes");
                            } else {
                              const answers = getQuestionAnswers(
                                currentQuestion,
                                selectedLanguage
                              );
                              if (answers.length > 0) onSelectAnswer(answers[0]);
                            }
                          }
                        }}
                      />
                    </View>
                  </View>

                  {/* Question Counter */}
                  <View className="bg-slate-50 px-4 py-2 rounded-2xl">
                    <Text className="text-slate-400 font-bold text-xs tracking-widest">
                      <Text className="text-slate-800 text-lg">
                        {currentQuestionIndex + 1}
                      </Text>
                      /{totalQuestions}
                    </Text>
                  </View>
                </View>

                {/* Question Text */}
                <View className="mb-10 min-h-[120px] justify-center">
                  <Text
                    className="text-[28px] text-slate-800 text-center leading-9"
                    style={{ fontFamily: "MerriweatherSans_700Bold" }}
                  >
                    {getResolvedQuestionText(currentQuestion, selectedLanguage, currentPlayerName)}
                  </Text>
                </View>

                {/* Answers Section */}
                <View className="gap-4">
                  {!currentQuestion.haveAnswers ? (
                    <>
                      <AnimatedAnswerButton
                        onPress={() => {
                          if (!hasSubmitted) onSelectAnswer("yes");
                        }}
                        disabled={hasSubmitted}
                      >
                        <View
                          className={`w-full py-4 rounded-2xl border-b-4 ${getButtonStyles(
                            "yes",
                            selectedAnswer === "yes",
                            hasSubmitted
                          )}`}
                          style={{ position: "relative", alignItems: "center", justifyContent: "center" }}
                        >
                          <Text
                            className={`text-center text-lg font-bold ${getButtonTextStyles(
                              selectedAnswer === "yes",
                              hasSubmitted
                            )}`}
                            style={{ fontFamily: "MerriweatherSans_700Bold" }}
                          >
                            {t("gamePlay.yes")}
                          </Text>
                          {selectedAnswer === "yes" && (
                            <View style={{ position: "absolute", right: 16 }}>
                              <SelectedIcon type="yes" />
                            </View>
                          )}
                        </View>
                      </AnimatedAnswerButton>

                      <AnimatedAnswerButton
                        onPress={() => {
                          if (!hasSubmitted) onSelectAnswer("no");
                        }}
                        disabled={hasSubmitted}
                      >
                        <View
                          className={`w-full py-4 rounded-2xl border-b-4 ${getButtonStyles(
                            "no",
                            selectedAnswer === "no",
                            hasSubmitted
                          )}`}
                          style={{ position: "relative", alignItems: "center", justifyContent: "center" }}
                        >
                          <Text
                            className={`text-center text-lg font-bold ${getButtonTextStyles(
                              selectedAnswer === "no",
                              hasSubmitted
                            )}`}
                            style={{ fontFamily: "MerriweatherSans_700Bold" }}
                          >
                            {t("gamePlay.no")}
                          </Text>
                          {selectedAnswer === "no" && (
                            <View style={{ position: "absolute", right: 16 }}>
                              <SelectedIcon type="no" />
                            </View>
                          )}
                        </View>
                      </AnimatedAnswerButton>
                    </>
                  ) : (
                    getQuestionAnswers(currentQuestion, selectedLanguage).map(
                      (answer: string, index: number) => (
                        <AnimatedAnswerButton
                          key={index}
                          onPress={() => {
                            if (!hasSubmitted) onSelectAnswer(answer);
                          }}
                          disabled={hasSubmitted}
                        >
                          <View
                            className={`w-full py-4 px-6 rounded-2xl border-b-4 ${getButtonStyles(
                              "custom",
                              selectedAnswer === answer,
                              hasSubmitted
                            )}`}
                            style={{ position: "relative", alignItems: "center", justifyContent: "center" }}
                          >
                            <Text
                              className={`text-center text-lg font-bold ${getButtonTextStyles(
                                selectedAnswer === answer,
                                hasSubmitted
                              )}`}
                              style={{ fontFamily: "MerriweatherSans_700Bold" }}
                            >
                              {answer}
                            </Text>
                            {selectedAnswer === answer && (
                              <View style={{ position: "absolute", right: 16 }}>
                                <SelectedIcon type="custom" />
                              </View>
                            )}
                          </View>
                        </AnimatedAnswerButton>
                      )
                    )
                  )}
                </View>
              </View>
            </Pressable>
          </Animated.View>
        )}
      </View>

      {/* Partner Status Widget */}
      {!roundResult && (
        <View className="px-6 pb-16">
          <PartnerStatusWidget
            hasSubmitted={hasSubmitted}
            opponentAnswered={opponentAnswered}
            waitingText={t("gamePlay.waitingForPartner")}
            answeredText={
              opponentName
                ? t("gamePlay.opponentAnswered", { name: opponentName })
                : t("gamePlay.waitingForPartner")
            }
          />
        </View>
      )}

      {/* Footer Logo */}
      <View className="absolute bottom-4 left-0 right-0 items-center opacity-30 pointer-events-none">
        <Logo size="mini" />
      </View>

      <RateAppFeedbackModal
        visible={showRateAppModal}
        onClose={() => setShowRateAppModal(false)}
      />
    </View>
  );
};

export default GamePlay;
