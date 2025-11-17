import { FontAwesome5 } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useEffect, useRef } from "react";
import { Animated, ScrollView, Text, View } from "react-native";
import { useTranslation } from "../hooks/useTranslation";
import { getAvatarImage } from "../utils/avatarUtils";

interface ChatMessage {
  playerId: string;
  playerName: string;
  avatar: string;
  message: string;
  timestamp: number;
}

interface ChatMessagesProps {
  messages: ChatMessage[];
  currentPlayerId?: string;
  hasSubmitted: boolean;
  roundResult: any;
  opponentAnswered: boolean;
  opponentName: string | null;
}

const AnswerNotification: React.FC<{ text: string }> = ({ text }) => {
  const animValue = useRef(new Animated.Value(0)).current;
  const slideValue = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
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

const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  currentPlayerId,
  hasSubmitted,
  roundResult,
  opponentAnswered,
  opponentName,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const { t } = useTranslation();

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  return (
    <View className="flex-1" style={{ minHeight: 0 }}>
      <View>
        <Text
          className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2"
          style={{ fontFamily: "MerriweatherSans_700Bold" }}
        >
          {t("chatMessages.recentMessages")}
        </Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 10, paddingRight: 4 }}
        showsVerticalScrollIndicator={true}
        scrollEnabled={true}
        onContentSizeChange={() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }}
      >
        {messages.map((msg, index) => (
          <View
            key={index}
            className="flex-row items-start gap-3 mb-3 px-2 py-1 rounded-lg"
          >
            {/* Avatar */}
            <View className="relative">
              <View className="absolute top-[1px] left-[1px] right-[-1px] bottom-[-1px] bg-gray-900 rounded-full" />
              <View className="relative bg-white border-2 border-gray-900 rounded-full w-10 h-10 items-center justify-center overflow-hidden">
                {msg.avatar && getAvatarImage(msg.avatar) ? (
                  <Image
                    source={getAvatarImage(msg.avatar)}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                ) : (
                  <FontAwesome5 name="user" size={16} color="#1f2937" />
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
                {currentPlayerId && msg.playerId === currentPlayerId && (
                  <Text
                    className="text-xs text-gray-500"
                    style={{
                      fontFamily: "MerriweatherSans_400Regular",
                    }}
                  >
                    {t("chatMessages.youTag")}
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
          </View>
        ))}

        {/* Waiting Notification */}
        {hasSubmitted && !roundResult && !opponentAnswered && (
          <View className={messages.length > 0 ? "mt-2 mb-2" : "mt-0 mb-2"}>
            <AnswerNotification text={t("chatMessages.waitingForPartner")} />
          </View>
        )}

        {/* Opponent Answer Notification */}
        {opponentAnswered && !roundResult && opponentName && (
          <View className={messages.length > 0 ? "mt-2 mb-2" : "mt-0 mb-2"}>
            <AnswerNotification
              text={t("chatMessages.opponentAnswered", { name: opponentName })}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default ChatMessages;
