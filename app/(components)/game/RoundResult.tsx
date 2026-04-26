import { FontAwesome5 } from "@expo/vector-icons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Image } from "expo-image";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, Text, View } from "react-native";
import { Language } from "../../contexts/LanguageContext";
import { useTranslation } from "../../hooks/useTranslation";
import { getAvatarImage } from "../../utils/avatarUtils";
import { getResolvedQuestionText, resolvePlayerName } from "../../utils/questionUtils";
import { toTurkishPossessive } from "../../utils/turkishGrammar";

const getKnowMeWellGuessLabel = (name: string, selectedLanguage: Language, t: any) => {
  if (selectedLanguage === "tr") {
    return `${toTurkishPossessive(name)} tahmini`;
  }
  return t("knowMeWell.guessLabelWithName", { name });
};

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
  playerName?: string;
  categoryId?: string;
  player1Name?: string;
  player2Name?: string;
}

const RoundResult: React.FC<RoundResultProps> = ({
  roundResult,
  currentQuestion,
  currentQuestionIndex,
  totalQuestions,
  selectedLanguage,
  playerName,
  categoryId,
  player1Name,
  player2Name,
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
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();
    }
  }, [roundResult, progressAnim]);

  // Player Card Styling Logic - Based on match status, not index
  const getPlayerCardStyle = () => {
    if (isMatched) {
      // Both players get green when matched
      return {
        bgClass: "bg-green-50",
        borderClass: "border-green-200",
        textColor: "text-green-700",
        customStyle: {
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          borderColor: "#10B981",
          borderWidth: 1,
        },
      };
    } else {
      // Both players get red when not matched
      return {
        bgClass: "bg-red-50",
        borderClass: "border-red-200",
        textColor: "text-red-700",
        customStyle: {
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          borderColor: "#EF4444",
          borderWidth: 1,
        },
      };
    }
  };

  if (categoryId === "know_me_well" && player1Name && player2Name) {
    const subjectName = resolvePlayerName(currentQuestionIndex, player1Name, player2Name);
    const guesserName = subjectName === player1Name ? player2Name : player1Name;

    const resolveAnswer = (pa: any): string => {
      if (!pa?.answer) return "---";
      if (typeof pa.answer === "object" && !Array.isArray(pa.answer)) {
        return pa.answer[selectedLanguage as keyof typeof pa.answer] || pa.answer.en || "";
      }
      const raw = String(pa.answer);
      const lower = raw.toLowerCase().trim();
      if (lower === "yes") return t("gamePlay.yes");
      if (lower === "no") return t("gamePlay.no");
      return raw.charAt(0).toUpperCase() + raw.slice(1);
    };

    const subjectPA = roundResult.playerAnswers?.find((p: any) => p.playerName === subjectName);
    const guesserPA = roundResult.playerAnswers?.find((p: any) => p.playerName === guesserName);
    const subjectAnswer = resolveAnswer(subjectPA);
    const guesserAnswer = resolveAnswer(guesserPA);

    return (
      <View className="w-full mt-2">
        <View
          className="bg-white rounded-[32px] p-6 w-full shadow-2xl shadow-blue-100/50 border border-white"
          style={{ elevation: 10 }}
        >
            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
              <StatusPill type="neutral">
                <FontAwesome6 name="puzzle-piece" size={12} color="#64748B" />
                <Text
                  className="text-slate-500 text-[10px] font-bold uppercase tracking-wider"
                  style={{ fontFamily: "MerriweatherSans_700Bold" }}
                >
                  {t("knowMeWell.aboutLabel", { name: subjectName })}
                </Text>
              </StatusPill>
              <View
                className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ backgroundColor: isMatched ? "#f0fdf4" : "#fff1f2", borderWidth: 1, borderColor: isMatched ? "#bbf7d0" : "#fecdd3" }}
              >
                <FontAwesome5 name={isMatched ? "check-circle" : "times-circle"} size={11} color={isMatched ? "#16a34a" : "#e11d48"} />
                <Text style={{ fontFamily: "MerriweatherSans_700Bold", fontSize: 10, color: isMatched ? "#16a34a" : "#e11d48" }}>
                  {isMatched ? t("knowMeWell.correctTag") : t("knowMeWell.wrongTag")}
                </Text>
              </View>
            </View>

            {/* Question */}
            <Text
              className="text-slate-700 text-center mb-6 leading-7"
              style={{ fontFamily: "MerriweatherSans_700Bold", fontSize: 17 }}
            >
              {getResolvedQuestionText(roundResult.question || currentQuestion, selectedLanguage, playerName)}
            </Text>

            {/* Subject reveal — centered, spotlight feel */}
            <View
              style={{
                backgroundColor: "#FFF7ED",
                borderRadius: 20,
                paddingVertical: 20,
                paddingHorizontal: 16,
                alignItems: "center",
                marginBottom: 14,
                borderWidth: 1,
                borderColor: "rgba(253,186,116,0.4)",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <View style={{ width: 28, height: 28, borderRadius: 14, overflow: "hidden", backgroundColor: "#f1f5f9" }}>
                  {subjectPA?.avatar && getAvatarImage(subjectPA.avatar) ? (
                    <Image source={getAvatarImage(subjectPA.avatar)} style={{ width: "100%", height: "100%" }} contentFit="cover" />
                  ) : (
                    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                      <FontAwesome5 name="user" size={12} color="#cbd5e1" />
                    </View>
                  )}
                </View>
                <Text style={{ fontFamily: "MerriweatherSans_700Bold", fontSize: 11, color: "#f97316", textTransform: "uppercase", letterSpacing: 1 }}>
                  {subjectPA?.playerName || subjectName}
                </Text>
              </View>
              <Text style={{ fontFamily: "MerriweatherSans_700Bold", fontSize: 26, color: "#1e293b", textAlign: "center" }}>
                {subjectAnswer}
              </Text>
            </View>

            {/* Guesser result — compact strip */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: isMatched ? "#f0fdf4" : "#fff1f2",
                borderRadius: 16,
                paddingVertical: 12,
                paddingHorizontal: 14,
                borderWidth: 1,
                borderColor: isMatched ? "#bbf7d0" : "#fecdd3",
                marginBottom: 20,
                gap: 10,
              }}
            >
              <View style={{ width: 28, height: 28, borderRadius: 14, overflow: "hidden", backgroundColor: "#f1f5f9" }}>
                {guesserPA?.avatar && getAvatarImage(guesserPA.avatar) ? (
                  <Image source={getAvatarImage(guesserPA.avatar)} style={{ width: "100%", height: "100%" }} contentFit="cover" />
                ) : (
                  <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                    <FontAwesome5 name="user" size={12} color="#cbd5e1" />
                  </View>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: "MerriweatherSans_400Regular", fontSize: 11, color: isMatched ? "#16a34a" : "#e11d48", marginBottom: 1 }}>
                  {getKnowMeWellGuessLabel(
                    guesserPA?.playerName || guesserName,
                    selectedLanguage,
                    t
                  )}
                </Text>
                <Text style={{ fontFamily: "MerriweatherSans_700Bold", fontSize: 14, color: isMatched ? "#15803d" : "#be123c" }}>
                  {guesserAnswer}
                </Text>
              </View>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: isMatched ? "#dcfce7" : "#ffe4e6",
                }}
              >
                <FontAwesome5 name={isMatched ? "check" : "times"} size={14} color={isMatched ? "#16a34a" : "#e11d48"} />
              </View>
            </View>

            {/* Footer */}
            <View className="h-1.5 bg-slate-100 rounded-full overflow-hidden w-full mb-2">
              <Animated.View
                style={{
                  width: progressAnim.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] }),
                  height: "100%",
                  backgroundColor: "#fdba74",
                  borderRadius: 999,
                }}
              />
            </View>
            <Text className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest" style={{ fontFamily: "MerriweatherSans_700Bold" }}>
              {isLastQuestion ? t("roundResult.loadingResults") : t("roundResult.nextQuestionSoon")}
            </Text>
        </View>
      </View>
    );
  }

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
            {getResolvedQuestionText(
              roundResult.question || currentQuestion,
              selectedLanguage,
              playerName
            )}
          </Text>
        </View>

        {/* Players' Answers List */}
        <View className="gap-3 mb-6">
          {roundResult.playerAnswers?.map(
            (playerAnswer: any, index: number) => {
              const styles = getPlayerCardStyle();

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
