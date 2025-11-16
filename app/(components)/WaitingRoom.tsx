import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Rect } from "react-native-svg";
import { useCoins } from "../contexts/CoinContext";
import { useLanguage } from "../contexts/LanguageContext";
import {
  Category,
  getCategoryById,
  getCategoryLabel,
} from "../services/categoryService";
import { Room } from "../services/socketService";
import { getAvatarImage } from "../utils/avatarUtils";
import ButtonLoading from "./ButtonLoading";
import CoinBalanceDisplay from "./CoinBalanceDisplay";
import CoinPurchaseModal from "./CoinPurchaseModal";
import LanguageSelector from "./LanguageSelector";
import Logo from "./Logo";

const AnimatedRect = Animated.createAnimatedComponent(Rect);

interface WaitingRoomProps {
  room: Room;
  roomCode: string;
  mySocketId: string | undefined;
  isMe: (playerId: string) => boolean;
  onStartGame: () => void;
  onLeaveRoom: () => void;
  onKickPlayer?: (playerId: string) => void;
  isStartingGame?: boolean;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({
  room,
  roomCode,
  mySocketId,
  isMe,
  onStartGame,
  onLeaveRoom,
  onKickPlayer,
  isStartingGame = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [categoryInfo, setCategoryInfo] = useState<Category | null>(null);
  const { selectedLanguage } = useLanguage();
  const { coins } = useCoins();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dashOffsetAnim = useRef(new Animated.Value(0)).current;
  const startButtonGlowAnim = useRef(new Animated.Value(0)).current;
  const dashAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const coinWarningPulseAnim = useRef(new Animated.Value(1)).current;

  const participants = room.players || [];
  const isHost = participants.find((p) => p.id === mySocketId)?.isHost || false;
  const canStartGame = participants.length >= 2;

  // Waiting animation - pulse
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  // Dashed border animation - keep it running continuously
  // This effect ensures animation is always running when participants < 2
  useEffect(() => {
    if (participants.length < 2) {
      // Stop existing animation if any to avoid conflicts
      if (dashAnimationRef.current) {
        dashAnimationRef.current.stop();
        dashAnimationRef.current = null;
      }

      // Reset and start fresh animation
      dashOffsetAnim.setValue(0);
      const animation = Animated.loop(
        Animated.timing(dashOffsetAnim, {
          toValue: -15,
          duration: 800,
          easing: Easing.linear,
          useNativeDriver: false,
        })
      );

      dashAnimationRef.current = animation;
      animation.start();
    } else {
      // Stop animation when we have enough players
      if (dashAnimationRef.current) {
        dashAnimationRef.current.stop();
        dashAnimationRef.current = null;
      }
    }

    // Cleanup function
    return () => {
      // Cleanup is handled by the effect logic above
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participants.length]);

  // Start button glow animation
  useEffect(() => {
    if (canStartGame) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(startButtonGlowAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(startButtonGlowAnim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      startButtonGlowAnim.setValue(0);
    }
  }, [canStartGame, startButtonGlowAnim]);

  // Coin warning pulse animation
  useEffect(() => {
    if (
      categoryInfo?.isPremium &&
      categoryInfo.coinsRequired &&
      coins < categoryInfo.coinsRequired
    ) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(coinWarningPulseAnim, {
            toValue: 0.6,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(coinWarningPulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      return () => {
        pulseAnimation.stop();
      };
    } else {
      coinWarningPulseAnim.setValue(1);
    }
  }, [categoryInfo, coins, coinWarningPulseAnim]);

  // Load category info from Supabase
  useEffect(() => {
    const loadCategoryInfo = async () => {
      const category = room.settings?.category || "just_friends";
      const categoryData = await getCategoryById(category);
      setCategoryInfo(categoryData);
    };

    loadCategoryInfo();
  }, [room.settings?.category]);

  const category = room.settings?.category || "just_friends";
  const displayCategoryInfo = categoryInfo || {
    id: category,
    labels: {},
    color: "#f3f4f6",
    iconName: "handshake",
    iconType: "FontAwesome6" as const,
    coinsRequired: 0,
    isPremium: false,
    orderIndex: 0,
  };
  const roomLink = `https://knowusbetter.app/join/${roomCode}`;

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareLink = async () => {
    try {
      await Share.share({
        message: `🎮 Join my KnowUsBetter room!\n\nRoom Code: ${roomCode}\n\nClick to join instantly:\n`,
        url: roomLink,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleBuyCoins = () => {
    setShowPurchaseModal(true);
  };

  return (
    <View className="flex-1 bg-primary pt-16">
      {/* Coin Purchase Modal */}
      <CoinPurchaseModal
        visible={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
      />

      {/* Header Container with Language Selector and Coin Display */}
      <View
        className="absolute top-0 left-0 right-0 z-50 bg-primary backdrop-blur-sm  pb-10"
        style={{ minHeight: 100 }}
      >
        <CoinBalanceDisplay
          onBuyCoins={handleBuyCoins}
          style="absolute"
          position="top-left"
        />
        <LanguageSelector position="top-right" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header */}
        <View className="items-center mt-16 mb-4">
          <Logo size="small" />
        </View>

        <View className="px-6">
          {/* Room Code Section */}
          <View className="mb-6">
            <Text
              className="text-center text-gray-600 text-sm mb-3"
              style={{ fontFamily: "MerriweatherSans_400Regular" }}
            >
              Share this code with your partner
            </Text>

            <View className="relative">
              <View className="absolute top-[3px] left-[3px] right-[-3px] bottom-[-3px] bg-gray-900 rounded-2xl" />
              <View className="relative bg-white border-4 border-gray-900 rounded-2xl p-6 items-center">
                <Text
                  className="text-5xl font-bold text-gray-900 tracking-widest mb-2"
                  style={{
                    letterSpacing: 8,
                  }}
                >
                  {roomCode}
                </Text>
                <View className="flex-row gap-3 mt-4">
                  {/* Copy Code Button */}
                  <View className="relative">
                    <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-xl" />
                    <TouchableOpacity
                      onPress={handleCopyCode}
                      className="relative bg-[#fef3c7] border-2 border-gray-900 rounded-xl px-4 py-2 flex-row items-center gap-2"
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={copied ? "checkmark-circle" : "copy-outline"}
                        size={18}
                        color="#991b1b"
                      />
                      <Text
                        className="text-gray-900 font-semibold"
                        style={{ fontFamily: "MerriweatherSans_700Bold" }}
                      >
                        {copied ? "Copied!" : "Copy Code"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Share Link Button */}
                  <View className="relative">
                    <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-xl" />
                    <TouchableOpacity
                      onPress={handleShareLink}
                      className="relative bg-[#e0f2fe] border-2 border-gray-900 rounded-xl px-4 py-2 flex-row items-center gap-2"
                      activeOpacity={0.8}
                    >
                      <Ionicons name="share-social" size={18} color="#991b1b" />
                      <Text
                        className="text-gray-900 font-semibold"
                        style={{ fontFamily: "MerriweatherSans_700Bold" }}
                      >
                        Share Link
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Category Badge */}
          <View className="items-center mb-6">
            <View className="relative">
              <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-full" />
              <View
                className="relative border-2 border-gray-900 rounded-full px-5 py-2 flex-row items-center gap-2"
                style={{ backgroundColor: displayCategoryInfo.color }}
              >
                {displayCategoryInfo.iconType === "MaterialCommunityIcons" ? (
                  <MaterialCommunityIcons
                    name={displayCategoryInfo.iconName as any}
                    size={18}
                    color="#1f2937"
                  />
                ) : (
                  <FontAwesome6
                    name={displayCategoryInfo.iconName as any}
                    size={18}
                    color="#1f2937"
                  />
                )}
                <Text
                  className="text-gray-900 font-semibold"
                  style={{ fontFamily: "MerriweatherSans_400Regular" }}
                >
                  {getCategoryLabel(displayCategoryInfo, selectedLanguage)}
                </Text>
              </View>
            </View>

            {/* Coin Warning for Premium Categories */}
            {categoryInfo?.isPremium &&
              categoryInfo.coinsRequired &&
              coins < categoryInfo.coinsRequired &&
              !isStartingGame && (
                <Animated.View
                  style={{
                    opacity: coinWarningPulseAnim,
                    marginTop: 8,
                  }}
                >
                  <View className="relative">
                    <View className="absolute top-[1px] left-[1px] right-[-1px] bottom-[-1px] bg-gray-900 rounded-lg" />
                    <View className="relative bg-red-200 border-2 border-red-600 rounded-lg px-2.5 py-1.5 flex-row items-center gap-1.5">
                      <Text
                        className="text-red-900 text-xs font-semibold"
                        style={{ fontFamily: "MerriweatherSans_700Bold" }}
                      >
                        Need {categoryInfo.coinsRequired} coins, you have{" "}
                        {coins}
                      </Text>
                    </View>
                  </View>
                </Animated.View>
              )}
          </View>

          {/* Participants Section */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text
                className="text-gray-900 text-lg font-bold"
                style={{ fontFamily: "MerriweatherSans_700Bold" }}
              >
                Participants ({participants.length})
              </Text>
              {participants.length < 2 && (
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <View className="bg-amber-100 border border-amber-300 rounded-full px-3 py-1">
                    <Text
                      className="text-amber-700 text-xs font-semibold"
                      style={{ fontFamily: "MerriweatherSans_400Regular" }}
                    >
                      Waiting...
                    </Text>
                  </View>
                </Animated.View>
              )}
            </View>

            <View className="gap-3">
              {participants.map((participant) => {
                const isCurrentUser = isMe(participant.id);
                const canKick = isHost && !isCurrentUser && onKickPlayer;

                return (
                  <View key={participant.id} className="relative">
                    <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-xl" />
                    <View className="relative bg-white border-2 border-gray-900 rounded-xl p-4 flex-row items-center justify-between">
                      <View className="flex-row items-center gap-3">
                        <View className="w-14 h-14 rounded-full items-center justify-center border  overflow-hidden">
                          {participant.avatar &&
                          getAvatarImage(participant.avatar) ? (
                            <Image
                              source={getAvatarImage(participant.avatar)}
                              style={{ width: "100%", height: "100%" }}
                              contentFit="cover"
                            />
                          ) : (
                            <FontAwesome5
                              name="user"
                              size={16}
                              color="#991b1b"
                            />
                          )}
                        </View>
                        <View>
                          <View className=" flex-row justify-between items-center gap-1 ">
                            <Text
                              className="text-gray-900 font-semibold text-lg"
                              style={{ fontFamily: "MerriweatherSans_700Bold" }}
                            >
                              {participant.name}
                            </Text>
                            {isCurrentUser && (
                              <Text
                                className="text-gray-500 mt-[2px] text-sm font-semibold"
                                style={{
                                  fontFamily: "MerriweatherSans_400Regular",
                                }}
                              >
                                (You)
                              </Text>
                            )}
                          </View>
                          {participant.isHost && (
                            <Text
                              className="text-gray-500 text-xs"
                              style={{
                                fontFamily: "MerriweatherSans_400Regular",
                              }}
                            >
                              Room Host
                            </Text>
                          )}
                        </View>
                      </View>
                      {canKick && (
                        <TouchableOpacity
                          onPress={() => onKickPlayer(participant.id)}
                          className="p-2"
                          activeOpacity={0.7}
                        >
                          <View className="relative">
                            <View className="absolute top-[1px] left-[1px] right-[-1px] bottom-[-1px] bg-gray-900 rounded-lg" />
                            <View className="relative bg-red-100 border border-gray-900 rounded-lg p-1.5">
                              <MaterialCommunityIcons
                                name="account-remove"
                                size={18}
                                color="#991b1b"
                              />
                            </View>
                          </View>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}

              {/* Waiting for more players */}
              {participants.length < 2 && (
                <View className="relative">
                  <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px]  rounded-xl" />
                  <View className="relative bg-gray-100 rounded-xl overflow-hidden">
                    {/* Animated dashed border with SVG */}
                    <Svg
                      width="100%"
                      height="100%"
                      style={{ position: "absolute" }}
                    >
                      <AnimatedRect
                        x="0"
                        y="0"
                        width="100%"
                        height="100%"
                        stroke="#1f2937"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray="10 5"
                        strokeDashoffset={dashOffsetAnim}
                        rx="12"
                      />
                    </Svg>

                    <View className="p-4 flex-row items-center gap-3">
                      <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center border-2 border-gray-400 border-dashed">
                        <MaterialCommunityIcons
                          name="account-question"
                          size={20}
                          color="#6b7280"
                        />
                      </View>
                      <Text
                        className="text-gray-500 text-sm italic flex-1"
                        style={{ fontFamily: "MerriweatherSans_400Regular" }}
                      >
                        Waiting for another player...
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          {isHost && (
            <View className="mb-4">
              <View className="relative">
                {/* Static Shadow */}
                <View className="absolute top-[3px] left-[3px] right-[-3px] bottom-[-3px] bg-gray-900 rounded-[14px]" />
                {/* Animated Button */}
                <Animated.View
                  className="relative border-2 border-gray-900 rounded-[14px] overflow-hidden"
                  style={{
                    backgroundColor: canStartGame
                      ? startButtonGlowAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["#ffe4e6", "#ffc0cb"],
                        })
                      : "#d1d5db",
                  }}
                >
                  <TouchableOpacity
                    onPress={onStartGame}
                    disabled={!canStartGame || isStartingGame}
                    className="py-[18px] px-8 flex-row items-center justify-center gap-2"
                    activeOpacity={0.8}
                  >
                    {isStartingGame && <ButtonLoading size={16} style="dots" />}
                    <Text
                      className="text-gray-900 text-xl text-center font-bold"
                      style={{
                        fontFamily: "MerriweatherSans_700Bold",
                        letterSpacing: -0.3,
                      }}
                    >
                      {isStartingGame
                        ? "Starting..."
                        : canStartGame
                        ? "Start Game"
                        : "Waiting for Players..."}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </View>
          )}

          {/* Leave Room Button */}
          <View className="relative">
            <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-xl" />
            <TouchableOpacity
              onPress={onLeaveRoom}
              className="relative bg-white border-2 border-gray-900 rounded-xl py-3 px-6"
              activeOpacity={0.8}
            >
              <Text
                className="text-gray-900 text-center font-semibold"
                style={{ fontFamily: "MerriweatherSans_700Bold" }}
              >
                Leave Room
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default WaitingRoom;
