import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLanguage } from "../contexts/LanguageContext";
import { useTranslation } from "../hooks/useTranslation";
import {
  Category,
  getCategoryById,
  getCategoryLabel,
} from "../services/categoryService";
import { getQuestionAnswers, getQuestionText } from "../utils/questionUtils";
import Countdown from "./Countdown";
import Logo from "./Logo";
import RoundResult from "./RoundResult";
import SettingsModal from "./SettingsModal";

// AnswerNotification Component - Moved outside to prevent re-creation on every render
const AnswerNotification: React.FC<{ text: string }> = React.memo(
  ({ text }) => {
    const animValue = useRef(new Animated.Value(0)).current;
    const slideValue = useRef(new Animated.Value(-20)).current;
    const hasAnimated = useRef(false);

    useEffect(() => {
      if (!hasAnimated.current) {
        hasAnimated.current = true;
        Animated.parallel([
          Animated.timing(animValue, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(slideValue, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, []);

    return (
      <Animated.View
        style={{
          opacity: animValue,
          transform: [{ translateY: slideValue }],
        }}
      >
        <View className="rounded-lg bg-gray-200/80 px-4 py-2.5 border border-gray-300/50 mb-2">
          <Text
            className="text-gray-600 text-center text-xs"
            style={{ fontFamily: "MerriweatherSans_400Regular" }}
          >
            {text}
          </Text>
        </View>
      </Animated.View>
    );
  },
  // Prevent re-renders when text changes - component should stay mounted
  () => true
);

interface GamePlayProps {
  currentQuestion: any;
  currentQuestionIndex: number;
  totalQuestions: number;
  questionDuration: number; // Duration in seconds
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
  notifications,
  roundResult,
  onSelectAnswer,
  onLeaveRoom,
  roomCode,
  currentPlayerId,
  categoryId,
}) => {
  const { selectedLanguage, setSelectedLanguage, languages } = useLanguage();
  const { t } = useTranslation();
  const [timerKey, setTimerKey] = useState(0); // Key to force timer reset
  const [categoryInfo, setCategoryInfo] = useState<Category | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

  // Reset timer when question changes
  useEffect(() => {
    // Force timer to reset by changing key
    setTimerKey((prev) => prev + 1);
  }, [currentQuestionIndex, questionDuration]);

  useEffect(() => {
    let isMounted = true;
    const loadCategoryInfo = async () => {
      if (!categoryId) {
        if (isMounted) {
          setCategoryInfo(null);
        }
        return;
      }
      try {
        const info = await getCategoryById(categoryId);
        if (isMounted) {
          setCategoryInfo(info);
        }
      } catch (error) {
        console.error("❌ Failed to load category info:", error);
        if (isMounted) {
          setCategoryInfo(null);
        }
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
    color: "#f3f4f6",
    iconName: "heart",
    iconType: "FontAwesome6" as const,
    coinsRequired: 0,
    isPremium: false,
    orderIndex: 0,
  };

  return (
    <View className="flex-1 bg-primary" style={{ flexDirection: "column" }}>
      {/* Settings Modal */}
      <SettingsModal
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />

      {/* Language Selector & Settings Button Container */}
      <View className="absolute top-20 right-6 z-50 flex-row items-center gap-3">
        {/* Inline Language Selector */}
        <View className="relative">
          <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-lg" />
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
            <View className="absolute top-[52px] right-0 w-[140px]">
              <View className="relative">
                <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-lg" />
                <View className="relative bg-white border-2 border-gray-900 rounded-lg overflow-hidden">
                  {(
                    Object.keys(languages) as Array<keyof typeof languages>
                  ).map((lang, index) => (
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
                  ))}
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Settings Button */}
        <View className="relative">
          <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-lg" />
          <TouchableOpacity
            onPress={() => setShowSettingsModal(true)}
            activeOpacity={0.8}
            className="relative bg-white border-2 border-gray-900 rounded-lg p-2.5"
          >
            <Feather name="settings" size={17} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Logo - Bottom center */}
      <View className="absolute bottom-8 left-0 right-0 z-40 items-center">
        <Logo size="mini" />
      </View>

      <Pressable
        className="bg-primary pt-12 mt-24"
        style={{ flexDirection: "column" }}
      >
        <View className="px-6" style={{ flexShrink: 1 }}>
          {/* Category Badge - Above the card, centered */}
          <View className="flex-row items-center justify-center gap-2 my-2">
            <Text
              className="text-gray-600 text-xs"
              style={{
                fontFamily: "MerriweatherSans_400Regular",
              }}
            >
              {t("gamePlay.categoryLabel")}:
            </Text>
            <View className="relative opacity-95">
              <View className="absolute top-[1px] left-[1px] right-[-1px] bottom-[-1px] bg-gray-900 rounded-full" />
              <View
                className="relative border-2 border-gray-900 rounded-full px-3 py-1.5 flex-row items-center justify-center gap-1.5"
                style={{ backgroundColor: displayCategoryInfo.color }}
              >
                {displayCategoryInfo.iconType === "MaterialCommunityIcons" ? (
                  <MaterialCommunityIcons
                    name={displayCategoryInfo.iconName as any}
                    size={12}
                    color="#1f2937"
                  />
                ) : (
                  <FontAwesome6
                    name={displayCategoryInfo.iconName as any}
                    size={12}
                    color="#1f2937"
                  />
                )}
                <Text
                  className="text-gray-800 text-[10px] font-semibold"
                  style={{
                    fontFamily: "MerriweatherSans_400Regular",
                  }}
                  numberOfLines={1}
                >
                  {getCategoryLabel(displayCategoryInfo, selectedLanguage)}
                </Text>
              </View>
            </View>
          </View>
          {/* Round Result Card (Displayed between questions) */}
          {roundResult && (
            <RoundResult
              roundResult={roundResult}
              currentQuestion={currentQuestion}
              currentQuestionIndex={currentQuestionIndex}
              totalQuestions={totalQuestions}
              selectedLanguage={selectedLanguage}
            />
          )}
          {/* Main Card */}
          {!roundResult && (
            <View className="relative mb-2 mt-6">
              <View className="absolute top-[4px] left-[4px] right-[-4px] bottom-[-4px] bg-gray-900 rounded-2xl" />
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                }}
              >
                <View className="relative bg-white border-4 border-gray-900 rounded-2xl p-8 min-h-[420px]">
                  {/* Progress Bar and Timer in top bar */}
                  <View className="flex-row items-center justify-between mb-6 gap-3">
                    {/* Timer - Left Side */}
                    <View style={{ width: 52, height: 52 }}>
                      <View key={timerKey}>
                        <Countdown
                          duration={questionDuration}
                          showFullScreen={false}
                          onComplete={() => {
                            // Timer completed - auto-submit if not already submitted
                            if (!hasSubmitted && currentQuestion) {
                              if (!currentQuestion.haveAnswers) {
                                // Auto-select "yes" for yes/no questions
                                onSelectAnswer("yes");
                              } else {
                                // Auto-select first answer for multiple choice
                                const answers = getQuestionAnswers(
                                  currentQuestion,
                                  selectedLanguage
                                );
                                if (answers.length > 0) {
                                  onSelectAnswer(answers[0]);
                                }
                              }
                            }
                          }}
                        />
                      </View>
                    </View>

                    {/* Simple Circular Question Counter - Right Side */}
                    <View className="relative">
                      <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-full" />
                      <View className="relative bg-white border-2 border-gray-900 rounded-full w-16 h-16 items-center justify-center">
                        <Text
                          className="text-gray-900 text-sm font-bold"
                          style={{ fontFamily: "MerriweatherSans_700Bold" }}
                        >
                          {currentQuestionIndex + 1}/{totalQuestions}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Question */}
                  <View className="mt-2">
                    <Text
                      className="text-3xl font-bold text-gray-900 text-center leading-9"
                      style={{ fontFamily: "MerriweatherSans_700Bold" }}
                    >
                      {getQuestionText(currentQuestion, selectedLanguage)}
                    </Text>
                  </View>

                  {/* Answer Options */}
                  <View className="gap-4 mt-6">
                    {!currentQuestion.haveAnswers ? (
                      <>
                        {/* Yes Button */}
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation();
                            if (!hasSubmitted) {
                              onSelectAnswer("yes");
                            }
                          }}
                          disabled={hasSubmitted}
                          activeOpacity={0.8}
                        >
                          <View className="relative">
                            <View className="absolute top-[3px] left-[3px] right-[-3px] bottom-[-3px] bg-gray-900 rounded-xl" />
                            <View
                              className={`relative border-4 border-gray-900 rounded-xl py-4 px-6 ${
                                selectedAnswer === "yes"
                                  ? "bg-green-300"
                                  : hasSubmitted
                                  ? "bg-gray-200"
                                  : "bg-green-50"
                              }`}
                            >
                              <Text
                                className="text-gray-900 text-xl font-bold text-center"
                                style={{
                                  fontFamily: "MerriweatherSans_700Bold",
                                }}
                              >
                                {t("gamePlay.yes")}
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>

                        {/* No Button */}
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation();
                            if (!hasSubmitted) {
                              onSelectAnswer("no");
                            }
                          }}
                          disabled={hasSubmitted}
                          activeOpacity={0.8}
                        >
                          <View className="relative">
                            <View className="absolute top-[3px] left-[3px] right-[-3px] bottom-[-3px] bg-gray-900 rounded-xl" />
                            <View
                              className={`relative border-4 border-gray-900 rounded-xl py-4 px-6 ${
                                selectedAnswer === "no"
                                  ? "bg-red-300"
                                  : hasSubmitted
                                  ? "bg-gray-200"
                                  : "bg-red-50"
                              }`}
                            >
                              <Text
                                className="text-gray-900 text-xl font-bold text-center"
                                style={{
                                  fontFamily: "MerriweatherSans_700Bold",
                                }}
                              >
                                {t("gamePlay.no")}
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <>
                        {/* Custom Answers from question.answers array */}
                        {getQuestionAnswers(
                          currentQuestion,
                          selectedLanguage
                        ).map((answer: string, index: number) => (
                          <TouchableOpacity
                            key={index}
                            onPress={(e) => {
                              e.stopPropagation();
                              if (!hasSubmitted) {
                                onSelectAnswer(answer);
                              }
                            }}
                            disabled={hasSubmitted}
                            activeOpacity={0.8}
                          >
                            <View className="relative">
                              <View className="absolute top-[3px] left-[3px] right-[-3px] bottom-[-3px] bg-gray-900 rounded-xl" />
                              <View
                                className={`relative border-4 border-gray-900 rounded-xl py-4 px-6 ${
                                  selectedAnswer === answer
                                    ? "bg-[#ffe4e6]"
                                    : hasSubmitted
                                    ? "bg-gray-200"
                                    : "bg-primary"
                                }`}
                              >
                                <Text
                                  className="text-gray-900 text-lg font-bold"
                                  style={{
                                    fontFamily: "MerriweatherSans_700Bold",
                                  }}
                                >
                                  {answer}
                                </Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </>
                    )}
                  </View>
                </View>
              </Pressable>
            </View>
          )}
        </View>
      </Pressable>

      {/* Notifications Section */}
      {!roundResult && (
        <View className="px-6 pb-6 mt-4">
          {/* Waiting Notification - Only show if user submitted and opponent hasn't answered */}
          {hasSubmitted && !opponentAnswered && (
            <AnswerNotification text={t("gamePlay.waitingForPartner")} />
          )}

          {/* Opponent Answer Notification - Only show if opponent answered */}
          {opponentAnswered && opponentName && (
            <AnswerNotification
              text={t("gamePlay.opponentAnswered", { name: opponentName })}
            />
          )}
        </View>
      )}

      {/* Leave Button - Top left, small and always visible */}
      {onLeaveRoom && (
        <View className="absolute top-20 left-6 z-50">
          <View className="relative">
            <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-xl" />
            <TouchableOpacity
              onPress={onLeaveRoom}
              className="relative bg-white border-2 border-gray-900 text-red-950 rounded-xl py-2.5 px-4 flex-row items-center gap-2"
              activeOpacity={0.8}
            >
              <FontAwesome5 name="arrow-left" size={12} color="#1f2937" />
              <Text
                className="text-gray-900 text-xs font-semibold"
                style={{ fontFamily: "MerriweatherSans_700Bold" }}
              >
                {t("gamePlay.leaveRoomButton")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default GamePlay;
