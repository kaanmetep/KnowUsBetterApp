import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Logo from "./Logo";

// Notification Item Component
const NotificationItem: React.FC<{ text: string; delay: number }> = ({
  text,
  delay,
}) => {
  const animValue = useRef(new Animated.Value(0)).current;
  const slideValue = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    // Delay each notification slightly for stagger effect
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(animValue, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(slideValue, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);
  }, []);

  return (
    <Animated.View
      style={{
        opacity: animValue,
        transform: [{ translateY: slideValue }],
      }}
    >
      <View className="border border-gray-300 rounded-xl bg-white/50 px-4 py-3">
        <Text
          className="text-gray-700 text-center text-sm"
          style={{ fontFamily: "MerriweatherSans_400Regular" }}
        >
          {text}
        </Text>
      </View>
    </Animated.View>
  );
};

interface GamePlayProps {
  currentQuestion: any;
  currentQuestionIndex: number;
  totalQuestions: number;
  selectedAnswer: string | null;
  hasSubmitted: boolean;
  opponentAnswered: boolean;
  notifications: string[];
  roundResult: any;
  onSelectAnswer: (answer: string) => void;
}

const GamePlay: React.FC<GamePlayProps> = ({
  currentQuestion,
  currentQuestionIndex,
  totalQuestions,
  selectedAnswer,
  hasSubmitted,
  opponentAnswered,
  notifications,
  roundResult,
  onSelectAnswer,
}) => {
  const progressAnim = useRef(new Animated.Value(100)).current;
  const waitingPulseAnim = useRef(new Animated.Value(1)).current;

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
  }, [roundResult]);

  // Waiting pulse animation
  useEffect(() => {
    if (hasSubmitted && !roundResult) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(waitingPulseAnim, {
            toValue: 0.7,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(waitingPulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      waitingPulseAnim.setValue(1);
    }
  }, [hasSubmitted, roundResult, waitingPulseAnim]);

  return (
    <View className="flex-1 bg-primary pt-16">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header */}
        <View className="items-center mt-8 mb-6">
          <Logo size="small" />
        </View>

        <View className="px-6">
          {/* Progress Bar - Çubuklu */}
          <View className="mb-8">
            <View className="flex-row gap-2 justify-center">
              {Array.from({ length: totalQuestions }).map((_, index) => (
                <View
                  key={index}
                  className="relative"
                  style={{ flex: 1, maxWidth: 60 }}
                >
                  <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-lg" />
                  <View
                    className={`relative h-3 border-2 border-gray-900 rounded-lg ${
                      index < currentQuestionIndex + 1
                        ? "bg-[#ffe4e6]"
                        : "bg-white"
                    }`}
                  />
                </View>
              ))}
            </View>
          </View>

          {/* Main Card - Soru ve Cevaplar İçin */}
          <View className="relative mb-6">
            <View className="absolute top-[4px] left-[4px] right-[-4px] bottom-[-4px] bg-gray-900 rounded-2xl" />
            <View className="relative bg-white border-4 border-gray-900 rounded-2xl p-6">
              {roundResult ? (
                /* Round Result View */
                <>
                  {/* Question */}
                  <View className="mb-6">
                    <Text
                      className="text-2xl font-bold text-gray-900 text-center leading-9"
                      style={{ fontFamily: "MerriweatherSans_700Bold" }}
                    >
                      {roundResult.question?.text || currentQuestion.text}
                    </Text>
                  </View>

                  {/* Players' Answers */}
                  <View className="gap-3 mb-6">
                    {roundResult.playerAnswers?.map(
                      (playerAnswer: any, index: number) => (
                        <View key={index} className="relative">
                          <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-xl" />
                          <View className="relative bg-primary border-2 border-gray-900 rounded-xl p-4">
                            <View className="flex-row items-center justify-between mb-2">
                              <Text
                                className="text-gray-900 font-bold"
                                style={{
                                  fontFamily: "MerriweatherSans_700Bold",
                                }}
                              >
                                {playerAnswer.playerName}
                              </Text>
                            </View>
                            <View className="relative">
                              <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-lg" />
                              <View className="relative bg-[#ffe4e6] border-2 border-gray-900 rounded-lg py-3 px-4">
                                <Text
                                  className="text-gray-900 text-lg font-bold"
                                  style={{
                                    fontFamily: "MerriweatherSans_700Bold",
                                  }}
                                >
                                  {playerAnswer.answer}
                                </Text>
                              </View>
                            </View>
                          </View>
                        </View>
                      )
                    )}
                  </View>

                  {/* Match Result */}
                  <View className="relative mb-6">
                    <View className="absolute top-[3px] left-[3px] right-[-3px] bottom-[-3px] bg-gray-900 rounded-xl" />
                    <View
                      className={`relative border-4 border-gray-900 rounded-xl py-4 px-6 ${
                        roundResult.isMatched ? "bg-[#d4f4dd]" : "bg-[#ffe4e6]"
                      }`}
                    >
                      <Text
                        className="text-gray-900 text-2xl font-bold text-center"
                        style={{ fontFamily: "MerriweatherSans_700Bold" }}
                      >
                        {roundResult.isMatched ? "✅ Match!" : "❌ No Match"}
                      </Text>
                      <Text
                        className="text-gray-700 text-center mt-2"
                        style={{ fontFamily: "MerriweatherSans_400Regular" }}
                      >
                        {roundResult.matchScore} / {roundResult.totalQuestions}{" "}
                        matches
                      </Text>
                    </View>
                  </View>

                  {/* Countdown Progress Bar */}
                  <View className="relative">
                    <View className="absolute top-[3px] left-[3px] right-[-3px] bottom-[-3px] bg-gray-900 rounded-full" />
                    <View className="relative h-4 bg-gray-100 border-4 border-gray-900 rounded-full overflow-hidden">
                      <Animated.View
                        style={{
                          width: progressAnim.interpolate({
                            inputRange: [0, 100],
                            outputRange: ["0%", "100%"],
                          }),
                          height: "100%",
                          backgroundColor: "#fb7185",
                        }}
                      />
                    </View>
                  </View>
                </>
              ) : (
                /* Normal Question View */
                <>
                  {/* Question */}
                  <View className="mb-6">
                    <Text
                      className="text-2xl font-bold text-gray-900 text-center leading-9"
                      style={{ fontFamily: "MerriweatherSans_700Bold" }}
                    >
                      {currentQuestion.text}
                    </Text>
                  </View>

                  {/* Answer Options */}
                  <View className="gap-3">
                    {!currentQuestion.haveAnswers ? (
                      <>
                        {/* Yes Button */}
                        <TouchableOpacity
                          onPress={() => !hasSubmitted && onSelectAnswer("yes")}
                          disabled={hasSubmitted}
                          activeOpacity={0.8}
                        >
                          <View className="relative">
                            <View className="absolute top-[3px] left-[3px] right-[-3px] bottom-[-3px] bg-gray-900 rounded-xl" />
                            <View
                              className={`relative border-4 border-gray-900 rounded-xl py-4 px-6 ${
                                selectedAnswer === "yes"
                                  ? "bg-[#ffe4e6]"
                                  : hasSubmitted
                                  ? "bg-gray-200"
                                  : "bg-primary"
                              }`}
                            >
                              <Text
                                className="text-gray-900 text-xl font-bold text-center"
                                style={{
                                  fontFamily: "MerriweatherSans_700Bold",
                                }}
                              >
                                Yes
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>

                        {/* No Button */}
                        <TouchableOpacity
                          onPress={() => !hasSubmitted && onSelectAnswer("no")}
                          disabled={hasSubmitted}
                          activeOpacity={0.8}
                        >
                          <View className="relative">
                            <View className="absolute top-[3px] left-[3px] right-[-3px] bottom-[-3px] bg-gray-900 rounded-xl" />
                            <View
                              className={`relative border-4 border-gray-900 rounded-xl py-4 px-6 ${
                                selectedAnswer === "no"
                                  ? "bg-[#ffe4e6]"
                                  : hasSubmitted
                                  ? "bg-gray-200"
                                  : "bg-primary"
                              }`}
                            >
                              <Text
                                className="text-gray-900 text-xl font-bold text-center"
                                style={{
                                  fontFamily: "MerriweatherSans_700Bold",
                                }}
                              >
                                No
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <>
                        {/* Custom Answers from question.answers array */}
                        {currentQuestion.answers?.map(
                          (answer: string, index: number) => (
                            <TouchableOpacity
                              key={index}
                              onPress={() =>
                                !hasSubmitted && onSelectAnswer(answer)
                              }
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
                          )
                        )}
                      </>
                    )}
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Notifications - Elegant slide-in */}
          {notifications.length > 0 && (
            <View className="gap-2 mb-6">
              {notifications.map((notification, index) => (
                <NotificationItem
                  key={index}
                  text={notification}
                  delay={index * 100}
                />
              ))}
            </View>
          )}

          {/* Waiting Status */}
          {hasSubmitted && !roundResult && (
            <Animated.View
              className="relative mb-6"
              style={{ opacity: waitingPulseAnim }}
            >
              <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-xl" />
              <View className="relative bg-[#ffe4e6] border-2 border-gray-900 rounded-xl px-4 py-3 flex-row items-center justify-center gap-2">
                <Text
                  className="text-gray-900 text-sm font-semibold"
                  style={{
                    fontFamily: "MerriweatherSans_700Bold",
                  }}
                >
                  {opponentAnswered
                    ? "Both answered! Processing..."
                    : "Waiting for partner..."}
                </Text>
              </View>
            </Animated.View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default GamePlay;
