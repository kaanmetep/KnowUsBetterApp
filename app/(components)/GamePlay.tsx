import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import LanguageSelector from "./LanguageSelector";
import Logo from "./Logo";

interface GamePlayProps {
  currentQuestion: any;
  currentQuestionIndex: number;
  totalQuestions: number;
  selectedAnswer: string | null;
  hasSubmitted: boolean;
  opponentAnswered: boolean;
  onSelectAnswer: (answer: string) => void;
  onSubmitAnswer: () => void;
}

const GamePlay: React.FC<GamePlayProps> = ({
  currentQuestion,
  currentQuestionIndex,
  totalQuestions,
  selectedAnswer,
  hasSubmitted,
  opponentAnswered,
  onSelectAnswer,
  onSubmitAnswer,
}) => {
  return (
    <View className="flex-1 bg-primary pt-16">
      {/* Language Selector */}
      <LanguageSelector position="top-right" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header */}
        <View className="items-center mt-10 mb-6">
          <Logo size="small" />
        </View>

        <View className="px-6">
          {/* Question Counter */}
          <View className="flex-row justify-center mb-6">
            <View className="bg-white border-2 border-gray-900 rounded-full px-4 py-2">
              <Text
                className="text-gray-900 font-semibold"
                style={{ fontFamily: "MerriweatherSans_700Bold" }}
              >
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </Text>
            </View>
          </View>

          {/* Question Card */}
          <View className="mb-8">
            <View className="relative">
              <View className="absolute top-[4px] left-[4px] right-[-4px] bottom-[-4px] bg-gray-900 rounded-2xl" />
              <View className="relative bg-white border-4 border-gray-900 rounded-2xl p-6">
                <Text
                  className="text-2xl font-bold text-gray-900 text-center leading-9"
                  style={{ fontFamily: "MerriweatherSans_700Bold" }}
                >
                  {currentQuestion.text}
                </Text>
              </View>
            </View>
          </View>

          {/* Answer Options */}
          <View className="gap-4 mb-6">
            {/* Yes Button */}
            <TouchableOpacity
              onPress={() => !hasSubmitted && onSelectAnswer("yes")}
              disabled={hasSubmitted}
              activeOpacity={0.8}
            >
              <View className="relative">
                <View className="absolute top-[3px] left-[3px] right-[-3px] bottom-[-3px] bg-gray-900 rounded-xl" />
                <View
                  className={`relative border-4 border-gray-900 rounded-xl py-5 px-6 ${
                    selectedAnswer === "yes"
                      ? "bg-[#d4f4dd]"
                      : hasSubmitted
                      ? "bg-gray-200"
                      : "bg-white"
                  }`}
                >
                  <Text
                    className="text-gray-900 text-xl font-bold text-center"
                    style={{ fontFamily: "MerriweatherSans_700Bold" }}
                  >
                    👍 Yes
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
                  className={`relative border-4 border-gray-900 rounded-xl py-5 px-6 ${
                    selectedAnswer === "no"
                      ? "bg-[#ffe4e6]"
                      : hasSubmitted
                      ? "bg-gray-200"
                      : "bg-white"
                  }`}
                >
                  <Text
                    className="text-gray-900 text-xl font-bold text-center"
                    style={{ fontFamily: "MerriweatherSans_700Bold" }}
                  >
                    👎 No
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          {!hasSubmitted && (
            <View className="relative mb-6">
              <View className="absolute top-[3px] left-[3px] right-[-3px] bottom-[-3px] bg-gray-900 rounded-[14px]" />
              <TouchableOpacity
                onPress={onSubmitAnswer}
                disabled={!selectedAnswer}
                className={`relative border-2 border-gray-900 rounded-[14px] py-4 px-8 ${
                  selectedAnswer ? "bg-[#ffe4e6]" : "bg-gray-300"
                }`}
                activeOpacity={0.8}
              >
                <Text
                  className="text-gray-900 text-lg text-center font-bold"
                  style={{
                    fontFamily: "MerriweatherSans_700Bold",
                    letterSpacing: -0.3,
                  }}
                >
                  {selectedAnswer ? "Submit Answer" : "Select an Answer"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Waiting Status */}
          {hasSubmitted && (
            <View className="relative mb-6">
              <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-xl" />
              <View className="relative bg-amber-50 border-2 border-gray-900 rounded-xl p-4">
                <Text
                  className="text-amber-700 text-center font-semibold"
                  style={{ fontFamily: "MerriweatherSans_700Bold" }}
                >
                  {opponentAnswered
                    ? "⏳ Both answered! Processing..."
                    : "⏳ Waiting for your partner..."}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default GamePlay;
