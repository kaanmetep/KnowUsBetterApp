import { FontAwesome5 } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { Language } from "../contexts/LanguageContext";
import { useTranslation } from "../hooks/useTranslation";
import { getAvatarImage } from "../utils/avatarUtils";
import { getQuestionText } from "../utils/questionUtils";

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

  // Animate progress bar when round result appears
  useEffect(() => {
    if (roundResult) {
      // Reset to 100% and animate down to 0% over 5 seconds
      progressAnim.setValue(100);
      Animated.timing(progressAnim, {
        toValue: 0,
        duration: 5000,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();
    }
  }, [roundResult, progressAnim]);
  return (
    <View className="relative mb-2 mt-6">
      <View className="absolute top-[4px] left-[4px] right-[-4px] bottom-[-4px] bg-gray-900 rounded-2xl" />
      <View className="relative bg-white border-4 border-gray-900 rounded-2xl p-6 overflow-hidden">
        {/* Subtle Background Pattern */}
        <LinearGradient
          colors={["#ffffff", "#f9fafb"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
          }}
        />
        {/* Question */}
        <View className="relative mb-5 z-10">
          <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-xl" />
          <View className="relative bg-white border-2 border-gray-900 rounded-xl p-4 overflow-hidden">
            <View className="relative z-10">
              <View className="flex-row items-start gap-2 mb-3">
                <FontAwesome5 name="question-circle" size={16} color="black" />
                <Text
                  className="text-xs font-bold text-black uppercase tracking-wider mt-[1px] -ml-1"
                  style={{ fontFamily: "MerriweatherSans_700Bold" }}
                >
                  {t("roundResult.questionLabel")}
                </Text>
              </View>
              <Text
                className="text-lg font-bold text-gray-900 leading-6"
                style={{ fontFamily: "MerriweatherSans_700Bold" }}
              >
                {getQuestionText(
                  roundResult.question || currentQuestion,
                  selectedLanguage
                )}
              </Text>
            </View>
          </View>
        </View>

        {/* Players' Answers */}
        <View className="gap-3 mb-5 relative z-10">
          {roundResult.playerAnswers?.map(
            (playerAnswer: any, index: number) => (
              <View key={index} className="relative">
                <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-xl" />
                <View className="relative bg-white border-2 border-gray-900 rounded-xl p-4">
                  {/* Player Name Header */}
                  <View className="flex-row items-center gap-2 mb-3">
                    <View className="relative flex-shrink-0">
                      <View className="relative bg-white border-2 border-gray-900 rounded-full w-10 h-10 items-center justify-center overflow-hidden">
                        {playerAnswer.avatar &&
                        getAvatarImage(playerAnswer.avatar) ? (
                          <Image
                            source={getAvatarImage(playerAnswer.avatar)}
                            style={{ width: "100%", height: "100%" }}
                            contentFit="cover"
                          />
                        ) : (
                          <FontAwesome5 name="user" size={14} color="#1f2937" />
                        )}
                      </View>
                    </View>
                    <Text
                      className="font-bold text-gray-900 flex-1"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={{
                        fontFamily: "MerriweatherSans_700Bold",
                      }}
                    >
                      {playerAnswer.playerName}
                    </Text>
                  </View>
                  {/* Answer - Below player name */}
                  <View className="relative">
                    <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-lg" />
                    <View
                      className={`relative border-2 border-gray-900 rounded-lg py-2.5 px-3 overflow-hidden ${
                        typeof playerAnswer.answer === "string" &&
                        playerAnswer.answer.toLowerCase().trim() === "yes"
                          ? "bg-green-100"
                          : typeof playerAnswer.answer === "string" &&
                            playerAnswer.answer.toLowerCase().trim() === "no"
                          ? "bg-red-200"
                          : ""
                      }`}
                    >
                      {(() => {
                        // Show gradient only for non-yes/no answers (custom answers or MultiLanguageAnswer objects)
                        if (!playerAnswer.answer) return null;
                        if (typeof playerAnswer.answer === "object") {
                          // It's a MultiLanguageAnswer object, show gradient
                          return (
                            <LinearGradient
                              colors={["#fff1f2", "#ffe4e6"]}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 0 }}
                              style={{
                                position: "absolute",
                                left: 0,
                                right: 0,
                                top: 0,
                                bottom: 0,
                              }}
                            />
                          );
                        }
                        // It's a string, check if it's yes/no
                        const answerString = String(playerAnswer.answer);
                        const answerLower = answerString.toLowerCase().trim();
                        if (answerLower !== "yes" && answerLower !== "no") {
                          return (
                            <LinearGradient
                              colors={["#fff1f2", "#ffe4e6"]}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 0 }}
                              style={{
                                position: "absolute",
                                left: 0,
                                right: 0,
                                top: 0,
                                bottom: 0,
                              }}
                            />
                          );
                        }
                        return null;
                      })()}
                      <View className="flex-row items-center justify-center relative z-10">
                        <Text
                          className="text-sm font-bold text-gray-900"
                          numberOfLines={1}
                          style={{
                            fontFamily: "MerriweatherSans_700Bold",
                            fontSize: 14,
                          }}
                        >
                          {(() => {
                            if (!playerAnswer.answer) {
                              return "";
                            }

                            // Check if answer is a MultiLanguageAnswer object
                            if (
                              typeof playerAnswer.answer === "object" &&
                              playerAnswer.answer !== null &&
                              !Array.isArray(playerAnswer.answer)
                            ) {
                              // It's a MultiLanguageAnswer object, get the answer for selected language
                              const langKey =
                                selectedLanguage as keyof typeof playerAnswer.answer;
                              const translatedAnswer =
                                playerAnswer.answer[langKey] ||
                                playerAnswer.answer.en ||
                                "";
                              // Capitalize first letter
                              return (
                                translatedAnswer[0]?.toUpperCase() +
                                translatedAnswer.slice(1).toLowerCase()
                              );
                            }

                            // It's a string answer
                            const answerString = String(playerAnswer.answer);
                            if (answerString.trim() === "") {
                              return "";
                            }
                            const answerLower = answerString
                              .toLowerCase()
                              .trim();
                            // Only translate yes/no answers, keep custom answers as-is
                            if (answerLower === "yes") {
                              return t("gamePlay.yes");
                            }
                            if (answerLower === "no") {
                              return t("gamePlay.no");
                            }
                            // Custom answers - show as received (already translated)
                            return (
                              answerString[0].toUpperCase() +
                              answerString.slice(1).toLowerCase()
                            );
                          })()}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            )
          )}
        </View>

        {/* Countdown Progress Bar */}
        <View className="relative z-10">
          <View className="relative mb-3">
            <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-full" />
            <View className="relative h-3 bg-gray-100 border-2 border-gray-900 rounded-full overflow-hidden">
              <Animated.View
                style={{
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ["0%", "100%"],
                  }),
                  height: "100%",
                  backgroundColor: roundResult.isMatched
                    ? "#10b981"
                    : "#ef4444",
                }}
              />
            </View>
          </View>
          <Text
            className="text-center text-xs text-gray-500"
            style={{ fontFamily: "MerriweatherSans_400Regular" }}
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

const styles = StyleSheet.create({});
