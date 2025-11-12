import { FontAwesome5 } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import socketService from "../services/socketService";
import Countdown from "./Countdown";
import Logo from "./Logo";
import RoundResult from "./RoundResult";

// Notification Item Component - Soluk gri renkli
const AnswerNotification: React.FC<{ text: string }> = ({ text }) => {
  const animValue = useRef(new Animated.Value(0)).current;
  const slideValue = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    // Yukarıdan gelme animasyonu
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
  }, []);

  return (
    <Animated.View
      style={{
        opacity: animValue,
        transform: [{ translateY: slideValue }],
      }}
    >
      <View className="rounded-lg bg-gray-200/80 px-4 py-2.5 border border-gray-300/50">
        <Text
          className="text-gray-600 text-center text-xs"
          style={{ fontFamily: "MerriweatherSans_400Regular" }}
        >
          {text}
        </Text>
      </View>
    </Animated.View>
  );
};

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
  const [timerKey, setTimerKey] = useState(0); // Key to force timer reset
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const chatScrollViewRef = useRef<ScrollView>(null);
  const chatInputRef = useRef<TextInput>(null);
  const [highlightedMessages, setHighlightedMessages] = useState<Set<number>>(
    new Set()
  );
  const messageAnimations = useRef<Map<number, Animated.Value>>(new Map());

  // Reset timer when question changes
  useEffect(() => {
    // Force timer to reset by changing key
    setTimerKey((prev) => prev + 1);
  }, [currentQuestionIndex, questionDuration]);

  // Chat message handler
  useEffect(() => {
    const handleChatMessage = (data: ChatMessage) => {
      console.log("💬 Chat message received:", data);
      setChatMessages((prev) => {
        const newMessages = [...prev, data];
        // Highlight the new message (last message in array)
        const newMessageIndex = newMessages.length - 1;

        // Create animation value for this message
        const animValue = new Animated.Value(1);
        messageAnimations.current.set(newMessageIndex, animValue);

        setHighlightedMessages((prevHighlighted) => {
          const newSet = new Set(prevHighlighted);
          newSet.add(newMessageIndex);
          return newSet;
        });

        // Fade out highlight after 2 seconds
        setTimeout(() => {
          Animated.timing(animValue, {
            toValue: 0,
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false, // backgroundColor requires this to be false
          }).start(() => {
            setHighlightedMessages((prevHighlighted) => {
              const newSet = new Set(prevHighlighted);
              newSet.delete(newMessageIndex);
              return newSet;
            });
            // Clean up animation value
            messageAnimations.current.delete(newMessageIndex);
          });
        }, 2000);

        return newMessages;
      });
      // Scroll to bottom when new message arrives
      setTimeout(() => {
        chatScrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
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
      () => {
        setIsKeyboardVisible(true);
        // Small delay to ensure keyboard is fully shown
        setTimeout(() => {
          chatScrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      keyboardWillHide,
      () => {
        setIsKeyboardVisible(false);
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

  // Format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-primary"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <View
        className="flex-1 bg-primary pt-16"
        style={{ flexDirection: "column" }}
      >
        <View className="items-center mt-3 mb-4">
          <Logo size="small" />
        </View>
        <View className="px-6 flex-1" style={{ flexShrink: 1, minHeight: 0 }}>
          {/* Round Result Card (Displayed between questions) */}
          {roundResult && (
            <RoundResult
              roundResult={roundResult}
              currentQuestion={currentQuestion}
              currentQuestionIndex={currentQuestionIndex}
              totalQuestions={totalQuestions}
            />
          )}
          {/* Main Card */}
          {!roundResult && (
            <View className="relative mb-2">
              <View className="absolute top-[4px] left-[4px] right-[-4px] bottom-[-4px] bg-gray-900 rounded-2xl" />
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
                            } else if (
                              currentQuestion.answers &&
                              currentQuestion.answers.length > 0
                            ) {
                              // Auto-select first answer for multiple choice
                              onSelectAnswer(currentQuestion.answers[0]);
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
              </View>
            </View>
          )}

          {/* Chat Section - After question card */}
          <View className="mt-4 mb-4">
            {/* Chat Messages Container Header */}
            <View>
              <Text
                className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2"
                style={{ fontFamily: "MerriweatherSans_700Bold" }}
              >
                Recent Messages
              </Text>
            </View>

            {/* Chat Messages ScrollView - Fixed height with scroll */}
            <View style={{ height: 192, overflow: "hidden" }}>
              <ScrollView
                ref={chatScrollViewRef}
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 10, paddingRight: 4 }}
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
                scrollEnabled={true}
                onContentSizeChange={() => {
                  chatScrollViewRef.current?.scrollToEnd({ animated: true });
                }}
              >
                {/* Chat Messages */}
                {chatMessages.map((msg, index) => {
                  const isHighlighted = highlightedMessages.has(index);
                  const animValue = messageAnimations.current.get(index);

                  // Interpolate background color from blue to transparent
                  const backgroundColor = animValue
                    ? animValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [
                          "rgba(219, 234, 254, 0)",
                          "rgba(219, 234, 254, 0.6)",
                        ],
                      })
                    : undefined;

                  return (
                    <Animated.View
                      key={index}
                      className="flex-row items-start gap-3 mb-3 px-2 py-1 rounded-lg"
                      style={{
                        backgroundColor:
                          backgroundColor !== undefined
                            ? backgroundColor
                            : isHighlighted
                            ? "rgba(219, 234, 254, 0.6)"
                            : "transparent",
                      }}
                    >
                      {/* Avatar */}
                      <View className="relative">
                        <View className="absolute top-[1px] left-[1px] right-[-1px] bottom-[-1px] bg-gray-900 rounded-full" />
                        <View className="relative bg-white border-2 border-gray-900 rounded-full w-10 h-10 items-center justify-center overflow-hidden">
                          {msg.avatar ? (
                            <Text
                              className="text-gray-900 text-xs font-bold"
                              style={{
                                fontFamily: "MerriweatherSans_700Bold",
                              }}
                            >
                              {msg.avatar}
                            </Text>
                          ) : (
                            <FontAwesome5
                              name="user"
                              size={16}
                              color="#1f2937"
                            />
                          )}
                        </View>
                      </View>

                      {/* Message Content */}
                      <View className="flex-1">
                        <View className="flex-row items-center gap-1 mb-1">
                          <Text
                            className="text-sm font-bold text-gray-900"
                            style={{ fontFamily: "MerriweatherSans_700Bold" }}
                          >
                            {msg.playerName}
                          </Text>
                          {currentPlayerId &&
                            msg.playerId === currentPlayerId && (
                              <Text
                                className="text-xs text-gray-500"
                                style={{
                                  fontFamily: "MerriweatherSans_400Regular",
                                }}
                              >
                                (You)
                              </Text>
                            )}
                        </View>
                        <Text
                          className="text-sm text-gray-900"
                          style={{
                            fontFamily: "MerriweatherSans_400Regular",
                          }}
                        >
                          {msg.message}
                        </Text>
                      </View>

                      {/* Timestamp */}
                      <Text
                        className="text-xs text-gray-500"
                        style={{ fontFamily: "MerriweatherSans_400Regular" }}
                      >
                        {formatTime(msg.timestamp)}
                      </Text>
                    </Animated.View>
                  );
                })}

                {/* Waiting Notification - Kullanıcı cevapladı ama rakip henüz cevaplamadı */}
                {hasSubmitted && !roundResult && !opponentAnswered && (
                  <View
                    className={
                      chatMessages.length > 0 ? "mt-2 mb-2" : "mt-0 mb-2"
                    }
                  >
                    <AnswerNotification text="Waiting for your partner to answer..." />
                  </View>
                )}

                {/* Opponent Answer Notification - Mesajların altında */}
                {opponentAnswered && !roundResult && opponentName && (
                  <View
                    className={
                      chatMessages.length > 0 ? "mt-2 mb-2" : "mt-0 mb-2"
                    }
                  >
                    <AnswerNotification
                      text={`${opponentName} has answered the question.`}
                    />
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </View>
      </View>

      {/* Chat Input - Fixed at bottom */}
      <View
        className="bg-white border-t-2 border-gray-900 px-8 py-4"
        style={{
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
    </KeyboardAvoidingView>
  );
};

export default GamePlay;
