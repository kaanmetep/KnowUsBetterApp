import { FontAwesome5 } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLanguage } from "../contexts/LanguageContext";
import socketService from "../services/socketService";
import {
  getQuestionAnswers,
  getQuestionText,
  getYesNoText,
} from "../utils/questionUtils";
import ChatMessages from "./ChatMessages";
import Countdown from "./Countdown";
import Logo from "./Logo";
import RoundResult from "./RoundResult";

interface ChatMessage {
  playerId: string;
  playerName: string;
  avatar: string;
  message: string;
  timestamp: number;
}

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
  roomCode: string;
  currentPlayerId?: string;
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
  roomCode,
  currentPlayerId,
}) => {
  const { selectedLanguage } = useLanguage();
  const yesNoText = getYesNoText(selectedLanguage);
  const [timerKey, setTimerKey] = useState(0); // Key to force timer reset
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const chatInputRef = useRef<TextInput>(null);

  // Reset timer when question changes
  useEffect(() => {
    // Force timer to reset by changing key
    setTimerKey((prev) => prev + 1);
  }, [currentQuestionIndex, questionDuration]);

  // Chat message handler
  useEffect(() => {
    const handleChatMessage = (data: ChatMessage) => {
      console.log("💬 Chat message received:", data);
      setChatMessages((prev) => [...prev, data]);
    };

    socketService.onChatMessage(handleChatMessage);

    return () => {
      socketService.offChatMessage(handleChatMessage);
    };
  }, []);

  // Handle keyboard show/hide to scroll to input and track keyboard state
  useEffect(() => {
    const keyboardWillShow =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const keyboardWillHide =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const keyboardDidShowListener = Keyboard.addListener(
      keyboardWillShow,
      (event) => {
        setIsKeyboardVisible(true);
        setKeyboardHeight(event.endCoordinates.height);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      keyboardWillHide,
      () => {
        setIsKeyboardVisible(false);
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Send chat message
  const handleSendMessage = () => {
    if (!chatInput.trim() || chatInput.length > 500) {
      return;
    }
    socketService.sendMessage(roomCode, chatInput.trim());
    setChatInput("");
    // Dismiss keyboard after sending message
    Keyboard.dismiss();
  };

  return (
    <View className="flex-1 bg-primary" style={{ flexDirection: "column" }}>
      <Pressable
        className="bg-primary pt-16"
        style={{ flexDirection: "column" }}
        onPress={() => {
          // Close keyboard
          Keyboard.dismiss();
          setIsKeyboardVisible(false);
        }}
      >
        <View className="items-center mt-2 mb-4">
          <Logo size="tiny" />
        </View>
        <View className="px-6" style={{ flexShrink: 1 }}>
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
            <View className="relative mb-2">
              <View className="absolute top-[4px] left-[4px] right-[-4px] bottom-[-4px] bg-gray-900 rounded-2xl" />
              <Pressable
                onPress={(e) => {
                  // Card'a tıklandığında klavyeyi kapat
                  e.stopPropagation();
                  Keyboard.dismiss();
                  setIsKeyboardVisible(false);
                }}
              >
                <View className="relative bg-white border-4 border-gray-900 rounded-2xl p-8 min-h-[320px]">
                  {/* Progress Bar and Timer in top bar */}
                  <View className="flex-row items-center justify-between mb-6">
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
                  <View className="mb-6">
                    <Text
                      className="text-2xl font-bold text-gray-900 text-center leading-9"
                      style={{ fontFamily: "MerriweatherSans_700Bold" }}
                    >
                      {getQuestionText(currentQuestion, selectedLanguage)}
                    </Text>
                  </View>

                  {/* Answer Options */}
                  <View className="gap-3">
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
                                {yesNoText.yes}
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
                                {yesNoText.no}
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

      {/* Chat Section - Custom scrollable component */}
      <View
        className="px-6 flex-1 mt-2"
        style={{
          minHeight: 0,
          paddingBottom: Platform.OS === "ios" ? 72 : 90, // Space for chat input
        }}
      >
        <ChatMessages
          messages={chatMessages}
          currentPlayerId={currentPlayerId}
          hasSubmitted={hasSubmitted}
          roundResult={roundResult}
          opponentAnswered={opponentAnswered}
          opponentName={opponentName}
        />
      </View>

      {/* Chat Input - Moves up when keyboard opens */}
      <View
        className="bg-white border-t-2 border-gray-900 px-8 py-4"
        style={{
          position: "absolute",
          bottom: keyboardHeight,
          left: 0,
          right: 0,
          paddingBottom: Platform.OS === "ios" ? 30 : 20,
        }}
      >
        <View className="flex-row items-center gap-2">
          <View className="flex-1 relative">
            <View className="absolute top-[1px] left-[1px] right-[-1px] bottom-[-1px] bg-gray-900 rounded-lg" />
            <TextInput
              ref={chatInputRef}
              value={chatInput}
              onChangeText={setChatInput}
              placeholder="Send a message..."
              placeholderTextColor="#9ca3af"
              maxLength={500}
              returnKeyType="send"
              className="relative bg-white border-2 border-gray-900 rounded-lg px-2 py-2.5 text-gray-900"
              style={{
                fontFamily: "MerriweatherSans_400Regular",
                fontSize: 14,
              }}
              onSubmitEditing={handleSendMessage}
            />
          </View>
          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={!chatInput.trim()}
            className="relative"
            activeOpacity={0.8}
          >
            <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-lg" />
            <View
              className={`relative border-2 border-gray-900 rounded-lg px-4 py-2.5 ${
                chatInput.trim() ? "bg-[#ffe4e6]" : "bg-gray-200"
              }`}
            >
              <FontAwesome5
                name="paper-plane"
                size={16}
                color={chatInput.trim() ? "#1f2937" : "#9ca3af"}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (isKeyboardVisible) {
                Keyboard.dismiss();
              } else {
                // Klavye kapalıyken TextInput'a focus vererek klavyeyi aç
                chatInputRef.current?.focus();
              }
            }}
            className="relative"
            activeOpacity={0.8}
          >
            <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-lg" />
            <View
              className={`relative border-2 border-gray-900 rounded-lg px-3 py-2.5 ${
                isKeyboardVisible ? "bg-[#fef3c7]" : "bg-gray-300"
              }`}
            >
              <FontAwesome5
                name="chevron-down"
                size={14}
                color={isKeyboardVisible ? "#991b1b" : "#6b7280"}
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default GamePlay;
