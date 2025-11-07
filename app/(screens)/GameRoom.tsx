import {
  MerriweatherSans_400Regular,
  MerriweatherSans_700Bold,
} from "@expo-google-fonts/merriweather-sans";
import { useFonts } from "@expo-google-fonts/merriweather-sans/useFonts";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Platform,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Rect } from "react-native-svg";
import ContactUsButton from "../(components)/ContactUsButton";
import LanguageSelector from "../(components)/LanguageSelector";
import Logo from "../(components)/Logo";
import socketService, { Room } from "../services/socketService";

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const GameRoom = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Only get roomCode from params
  const roomCode = (params.roomCode as string) || "DEMO123";

  const [room, setRoom] = useState<Room | null>(null);
  const [copied, setCopied] = useState(false);
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const dashOffsetAnim = React.useRef(new Animated.Value(0)).current;

  let [fontsLoaded] = useFonts({
    MerriweatherSans_400Regular,
    MerriweatherSans_700Bold,
  });

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

  // Dashed border animation (marching ants effect)
  useEffect(() => {
    Animated.loop(
      Animated.timing(dashOffsetAnim, {
        toValue: -15, // Pattern length (10 + 5)
        duration: 800,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();
  }, [dashOffsetAnim]);

  // Socket.io event listeners
  useEffect(() => {
    console.log("🎮 GameRoom mounted - roomCode:", roomCode);

    // Load current room data on mount
    const loadRoomData = async () => {
      try {
        const roomData = await socketService.getRoom(roomCode);
        console.log("📋 Current room data loaded:", roomData);
        setRoom(roomData);
      } catch (error) {
        console.error("❌ Failed to load room data:", error);
      }
    };

    loadRoomData();

    // New player joined
    const handlePlayerJoined = (data: any) => {
      console.log("👥 New player joined:", data);

      if (data.room) {
        setRoom(data.room);

        // Show notification
        if (Platform.OS === "web") {
          alert(`🎉 New Player! ${data.player.name} joined the room!`);
        } else {
          Alert.alert("🎉 New Player!", `${data.player.name} joined the room!`);
        }
      }
    };

    // Player left
    const handlePlayerLeft = (data: any) => {
      console.log("🚪 Player left:", data);

      if (data.room) {
        setRoom(data.room);
      }
    };

    // Register event listeners
    socketService.onPlayerJoined(handlePlayerJoined);
    socketService.onPlayerLeft(handlePlayerLeft);

    // Cleanup - remove event listeners when component unmounts
    return () => {
      console.log("🧹 GameRoom cleanup");
      socketService.offPlayerJoined(handlePlayerJoined);
      socketService.offPlayerLeft(handlePlayerLeft);
    };
  }, [roomCode]);

  const getCategoryInfo = (categoryId: string) => {
    const categories: Record<
      string,
      { label: string; color: string; emoji: string }
    > = {
      just_friends: { label: "Just Friends", color: "#fef3c7", emoji: "🤝" },
      we_just_met: { label: "We Just Met", color: "#ffe4e6", emoji: "💞" },
      long_term: { label: "Long-Term Lovers", color: "#e0f2fe", emoji: "💍" },
      spicy: { label: "Spicy & Flirty", color: "#f87171", emoji: "🔥" },
    };
    return (
      categories[categoryId] || {
        label: "Unknown",
        color: "#f3f4f6",
        emoji: "❓",
      }
    );
  };

  // Get data from room state
  const category = room?.settings?.category || "just_friends";
  const participants = room?.players || [];
  const mySocketId = socketService.getSocket()?.id;
  const isHost = participants.find((p) => p.id === mySocketId)?.isHost || false;

  const categoryInfo = getCategoryInfo(category);
  const roomLink = `https://knowusbetter.app/join/${roomCode}`;
  const canStartGame = participants.length >= 2;

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

  const handleLeaveRoom = async () => {
    const confirmLeave = async () => {
      try {
        await socketService.leaveRoom(roomCode);
        console.log("✅ Successfully left the room");
        router.back();
      } catch (error) {
        console.error("❌ Error leaving room:", error);
        // Even if error occurs, go back
        router.back();
      }
    };

    // Web platform uses window.confirm
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Are you sure you want to leave this room?"
      );
      if (confirmed) {
        await confirmLeave();
      }
    } else {
      // Mobile platforms use Alert
      Alert.alert(
        "Leave Room",
        "Are you sure you want to leave this room?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Leave",
            style: "destructive",
            onPress: confirmLeave,
          },
        ],
        { cancelable: true }
      );
    }
  };

  const handleStartGame = () => {
    if (canStartGame) {
      // TODO: Navigate to game screen
      console.log("Starting game with participants:", participants);
      Alert.alert("Starting Game", "Game is starting...");
    }
  };

  if (!fontsLoaded || !room) {
    return null;
  }

  return (
    <View className="flex-1 bg-primary pt-16">
      {/* Language Selector */}
      <LanguageSelector position="top-right" />

      {/* Contact Us Button */}
      <ContactUsButton position="top-left" style="default" />

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
                className="relative border-2 border-gray-900 rounded-full px-5 py-2"
                style={{ backgroundColor: categoryInfo.color }}
              >
                <Text
                  className="text-gray-900 font-semibold"
                  style={{ fontFamily: "MerriweatherSans_400Regular" }}
                >
                  {categoryInfo.emoji} {categoryInfo.label}
                </Text>
              </View>
            </View>
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
              {participants.map((participant, index) => (
                <View key={participant.id} className="relative">
                  <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-xl" />
                  <View className="relative bg-white border-2 border-gray-900 rounded-xl p-4 flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                      <View className="w-10 h-10 rounded-full bg-[#ffe4e6] items-center justify-center border-2 border-gray-900">
                        <FontAwesome5 name="user" size={16} color="#991b1b" />
                      </View>
                      <View>
                        <Text
                          className="text-gray-900 font-semibold text-base"
                          style={{ fontFamily: "MerriweatherSans_700Bold" }}
                        >
                          {participant.name}
                        </Text>
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
                  </View>
                </View>
              ))}

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
                <View className="absolute top-[3px] left-[3px] right-[-3px] bottom-[-3px] bg-gray-900 rounded-[14px]" />
                <TouchableOpacity
                  onPress={handleStartGame}
                  disabled={!canStartGame}
                  className={`relative border-2 border-gray-900 rounded-[14px] py-[18px] px-8 ${
                    canStartGame ? "bg-[#ffe4e6]" : "bg-gray-300"
                  }`}
                  activeOpacity={0.8}
                >
                  <Text
                    className="text-gray-900 text-xl text-center font-bold"
                    style={{
                      fontFamily: "MerriweatherSans_700Bold",
                      letterSpacing: -0.3,
                    }}
                  >
                    {canStartGame ? "Start Game 🎮" : "Waiting for Players..."}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Leave Room Button */}
          <View className="relative">
            <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-xl" />
            <TouchableOpacity
              onPress={handleLeaveRoom}
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

export default GameRoom;
