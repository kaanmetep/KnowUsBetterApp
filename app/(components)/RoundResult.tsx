import { FontAwesome5 } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, Text, View } from "react-native";
import { Language } from "../contexts/LanguageContext";
import { useTranslation } from "../hooks/useTranslation";
import { getAvatarImage } from "../utils/avatarUtils";
import { getQuestionText } from "../utils/questionUtils";

const StatusPill: React.FC<{
  children: React.ReactNode;
  type?: "success" | "danger" | "neutral";
}> = ({ children, type = "neutral" }) => {
  let bgStyle = "bg-slate-100 border-slate-200";
  if (type === "success") bgStyle = "bg-green-50 border-green-200";
  if (type === "danger") bgStyle = "bg-red-50 border-red-200";

  return (
    <View
      className={`px-3 py-1.5 rounded-full border ${bgStyle} flex-row items-center gap-2`}
    >
      {children}
    </View>
  );
};

interface RoundResultProps {
  roundResult: any;
  currentQuestion: any;
  currentQuestionIndex: number;
  totalQuestions: number;
  selectedLanguage: Language;
}

const RoundResult: React.FC<RoundResultProps> = ({
  roundResult,
  currentQuestion,
  currentQuestionIndex,
  totalQuestions,
  selectedLanguage,
}) => {
  const isLastQuestion = currentQuestionIndex + 1 === totalQuestions;
  const progressAnim = useRef(new Animated.Value(100)).current;
  const { t } = useTranslation();

  const isMatched = roundResult?.isMatched ?? false;

  useEffect(() => {
    if (roundResult) {
      progressAnim.setValue(100);
      Animated.timing(progressAnim, {
        toValue: 0,
        duration: 5000,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();
    }
  }, [roundResult, progressAnim]);

  // Player Card Styling Logic
  const getPlayerCardStyle = (index: number) => {
    if (index === 0) {
      return {
        bgClass: "bg-[#E7F5FF]",
        borderClass: "border-[#D0EBFF]",
        textColor: "text-[#1971c2]",
      };
    }
    return {
      bgClass: "",
      borderClass: "",
      customStyle: {
        backgroundColor: "rgba(254, 158, 162, 0.15)",
        borderColor: "#fe9ea2",
        borderWidth: 1,
      },
      textColor: "text-[#c92a2a]",
    };
  };

  return (
    <View className="w-full mt-2">
      {/* Card */}
      <View
        className="bg-white rounded-[32px] p-6 w-full shadow-2xl shadow-blue-100/50 border border-white"
        style={{ elevation: 10 }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <StatusPill type="neutral">
            <FontAwesome5 name="question-circle" size={12} color="#64748B" />
            <Text
              className="text-slate-500 text-[10px] font-bold uppercase tracking-wider"
              style={{ fontFamily: "MerriweatherSans_700Bold" }}
            >
              {t("roundResult.questionLabel") || "SORU"}
            </Text>
          </StatusPill>

          {/* Icon */}
          <StatusPill type={isMatched ? "success" : "danger"}>
            {isMatched ? (
              <FontAwesome5 name="check-circle" size={14} color="#059669" />
            ) : (
              <FontAwesome5 name="times-circle" size={14} color="#DC2626" />
            )}
            <Text
              className={`text-xs font-bold ${
                isMatched ? "text-green-700" : "text-red-700"
              }`}
              style={{ fontFamily: "MerriweatherSans_700Bold" }}
            >
              {isMatched ? t("roundResult.matched") : t("roundResult.mismatch")}
            </Text>
          </StatusPill>
        </View>

        {/* Question Text */}
        <View className="mb-8 justify-center items-center">
          <Text
            className="text-slate-800 text-center text-xl leading-8"
            style={{ fontFamily: "MerriweatherSans_700Bold" }}
          >
            {getQuestionText(
              roundResult.question || currentQuestion,
              selectedLanguage
            )}
          </Text>
        </View>

        {/* Players' Answers List */}
        <View className="gap-3 mb-6">
          {roundResult.playerAnswers?.map(
            (playerAnswer: any, index: number) => {
              const styles = getPlayerCardStyle(index);

              return (
                <View
                  key={index}
                  className={`flex-row items-center p-3 rounded-2xl border ${styles.bgClass} ${styles.borderClass}`}
                  style={styles.customStyle}
                >
                  {/* Avatar Section */}
                  <View className="relative w-10 h-10 rounded-full border-2 border-white shadow-sm mr-3 bg-white overflow-hidden">
                    {playerAnswer.avatar &&
                    getAvatarImage(playerAnswer.avatar) ? (
                      <Image
                        source={getAvatarImage(playerAnswer.avatar)}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="cover"
                      />
                    ) : (
                      <View className="w-full h-full items-center justify-center bg-slate-50">
                        <FontAwesome5 name="user" size={16} color="#cbd5e1" />
                      </View>
                    )}
                  </View>

                  {/* Name & Answer Section */}
                  <View className="flex-1 justify-center">
                    <Text
                      className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5"
                      numberOfLines={1}
                      style={{ fontFamily: "MerriweatherSans_700Bold" }}
                    >
                      {playerAnswer.playerName}
                    </Text>

                    <Text
                      className={`text-base font-semibold ${styles.textColor}`}
                      style={{ fontFamily: "MerriweatherSans_400Regular" }}
                      numberOfLines={1}
                    >
                      {(() => {
                        if (!playerAnswer.answer) return "---";

                        // Multi-language handling
                        let finalAnswer = "";
                        if (
                          typeof playerAnswer.answer === "object" &&
                          !Array.isArray(playerAnswer.answer)
                        ) {
                          const langKey =
                            selectedLanguage as keyof typeof playerAnswer.answer;
                          finalAnswer =
                            playerAnswer.answer[langKey] ||
                            playerAnswer.answer.en ||
                            "";
                        } else {
                          finalAnswer = String(playerAnswer.answer);
                        }

                        // Translations
                        const lower = finalAnswer.toLowerCase().trim();
                        if (lower === "yes") return t("gamePlay.yes");
                        if (lower === "no") return t("gamePlay.no");

                        // Capitalize
                        return (
                          finalAnswer.charAt(0).toUpperCase() +
                          finalAnswer.slice(1)
                        );
                      })()}
                    </Text>
                  </View>
                </View>
              );
            }
          )}
        </View>

        {/* Footer */}
        <View className="mt-2">
          <View className="h-1.5 bg-slate-100 rounded-full overflow-hidden w-full mb-2">
            <Animated.View
              style={{
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ["0%", "100%"],
                }),
                height: "100%",
                backgroundColor: isMatched ? "#10B981" : "#EF4444",
                borderRadius: 999,
              }}
            />
          </View>
          <Text
            className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest"
            style={{ fontFamily: "MerriweatherSans_700Bold" }}
          >
            {isLastQuestion
              ? t("roundResult.loadingResults")
              : t("roundResult.nextQuestionSoon")}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default RoundResult;
