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
import SettingsButton from "./SettingsButton";
import SettingsModal from "./SettingsModal";

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

const AnswerNotification: React.FC<{ text: string }> = React.memo(
  ({ text }) => {
    const animValue = useRef(new Animated.Value(0)).current;
    const slideValue = useRef(new Animated.Value(20)).current; // Slide up from bottom
    const hasAnimated = useRef(false);

    useEffect(() => {
      if (!hasAnimated.current) {
        hasAnimated.current = true;
        Animated.parallel([
          Animated.timing(animValue, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.spring(slideValue, {
            toValue: 0,
            friction: 6,
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
        className="items-center justify-center mt-4"
      >
        <View className="bg-slate-800 rounded-2xl px-6 py-3 shadow-lg shadow-slate-300">
          <Text
            className="text-white text-center text-sm font-medium"
            style={{ fontFamily: "MerriweatherSans_400Regular" }}
          >
            {text}
          </Text>
        </View>
      </Animated.View>
    );
  },
  () => true
);

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
}) => {
  const { selectedLanguage, setSelectedLanguage, languages } = useLanguage();
  const { t } = useTranslation();
  const [timerKey, setTimerKey] = useState(0);
  const [categoryInfo, setCategoryInfo] = useState<Category | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

  useEffect(() => {
    setTimerKey((prev) => prev + 1);
  }, [currentQuestionIndex, questionDuration]);

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

  const getButtonStyles = (
    type: "yes" | "no" | "custom",
    isSelected: boolean,
    isDisabled: boolean
  ) => {
    if (isDisabled && !isSelected) return "bg-slate-100 border-slate-200";

    if (type === "yes") {
      return isSelected
        ? "bg-[#A5D8FF] border-[#74C0FC]" // Active Blue
        : "bg-[#E7F5FF] border-[#D0EBFF]"; // Passive Blue
    }
    if (type === "no") {
      return isSelected
        ? "bg-[#FFA8A8] border-[#FF8787]" // Active Red
        : "bg-[#FFF5F5] border-[#FFC9C9]"; // Passive Red
    }
    // Custom answers default to blue theme
    return isSelected
      ? "bg-[#A5D8FF] border-[#74C0FC]"
      : "bg-white border-slate-100";
  };

  const getButtonTextStyles = (isSelected: boolean, isDisabled: boolean) => {
    if (isDisabled && !isSelected) return "text-slate-300";
    if (isSelected) return "text-slate-900";
    return "text-slate-600";
  };

  return (
    <View className="flex-1 bg-[#F8FAFC]" style={{ flexDirection: "column" }}>
      {/* Settings Modal */}
      <SettingsModal
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />

      {/* --- Header Section --- */}
      <View className="pt-16 pb-4 px-6 flex-row justify-between items-center z-50">
        {/* Back Button */}
        {onLeaveRoom && (
          <TouchableOpacity
            onPress={onLeaveRoom}
            className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm shadow-slate-200 border border-slate-100"
            activeOpacity={0.7}
          >
            <FontAwesome5 name="arrow-left" size={14} color="#64748B" />
          </TouchableOpacity>
        )}

        {/* Right Actions Group */}
        <View className="flex-row gap-3">
          {/* Language Selector */}
          <View className="relative z-50">
            <TouchableOpacity
              onPress={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
              activeOpacity={0.7}
              className="bg-white border border-slate-100 rounded-full px-4 py-2 flex-row items-center gap-2 shadow-sm shadow-slate-200"
            >
              <Text style={{ fontSize: 16 }}>
                {languages[selectedLanguage].flag}
              </Text>
              <Text className="text-slate-600 font-bold text-xs">
                {selectedLanguage.toUpperCase()}
              </Text>
              <Feather
                name={isLanguageMenuOpen ? "chevron-up" : "chevron-down"}
                size={14}
                color="#94A3B8"
              />
            </TouchableOpacity>

            {/* Language Dropdown */}
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
                      <Text style={{ fontSize: 16 }}>
                        {languages[lang].flag}
                      </Text>
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

          {/* Settings Icon */}
          <SettingsButton
            onPress={() => setShowSettingsModal(true)}
            variant="modern"
          />
        </View>
      </View>

      {/* --- Main Game Area --- */}
      <View className="flex-1 px-6 pt-4">
        {/* Category Badge */}
        <View className="items-center mb-6">
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

        {roundResult && (
          <RoundResult
            roundResult={roundResult}
            currentQuestion={currentQuestion}
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={totalQuestions}
            selectedLanguage={selectedLanguage}
          />
        )}

        {!roundResult && (
          <Pressable className="flex-1" onPress={(e) => e.stopPropagation()}>
            {/* THE CARD */}
            <View
              className="bg-white rounded-[32px] p-6 w-full shadow-2xl shadow-blue-100/50"
              style={{ elevation: 10 }} // Android Shadow
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

                {/* Elegant Question Counter */}
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
                  {getQuestionText(currentQuestion, selectedLanguage)}
                </Text>
              </View>

              {/* Answers Section */}
              <View className="gap-4">
                {!currentQuestion.haveAnswers ? (
                  // YES / NO Layout
                  <>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        if (!hasSubmitted) onSelectAnswer("yes");
                      }}
                      disabled={hasSubmitted}
                      activeOpacity={0.9}
                    >
                      <View
                        className={`w-full py-4 rounded-2xl border-b-4 ${getButtonStyles(
                          "yes",
                          selectedAnswer === "yes",
                          hasSubmitted
                        )}`}
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
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        if (!hasSubmitted) onSelectAnswer("no");
                      }}
                      disabled={hasSubmitted}
                      activeOpacity={0.9}
                    >
                      <View
                        className={`w-full py-4 rounded-2xl border-b-4 ${getButtonStyles(
                          "no",
                          selectedAnswer === "no",
                          hasSubmitted
                        )}`}
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
                      </View>
                    </TouchableOpacity>
                  </>
                ) : (
                  // Custom Answers Layout
                  getQuestionAnswers(currentQuestion, selectedLanguage).map(
                    (answer: string, index: number) => (
                      <TouchableOpacity
                        key={index}
                        onPress={(e) => {
                          e.stopPropagation();
                          if (!hasSubmitted) onSelectAnswer(answer);
                        }}
                        disabled={hasSubmitted}
                        activeOpacity={0.9}
                      >
                        <View
                          className={`w-full py-4 px-6 rounded-2xl border-b-4 ${getButtonStyles(
                            "custom",
                            selectedAnswer === answer,
                            hasSubmitted
                          )}`}
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
                        </View>
                      </TouchableOpacity>
                    )
                  )
                )}
              </View>
            </View>
          </Pressable>
        )}
      </View>

      {/* Notifications Area - Floating at bottom */}
      {!roundResult && (
        <View className="px-6 pb-10">
          {hasSubmitted && !opponentAnswered && (
            <AnswerNotification text={t("gamePlay.waitingForPartner")} />
          )}
          {opponentAnswered && opponentName && (
            <AnswerNotification
              text={t("gamePlay.opponentAnswered", { name: opponentName })}
            />
          )}
        </View>
      )}

      {/* Footer Logo */}
      <View className="absolute bottom-4 left-0 right-0 items-center opacity-30 pointer-events-none">
        <Logo size="mini" />
      </View>
    </View>
  );
};

export default GamePlay;
