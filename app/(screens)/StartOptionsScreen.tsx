import { LibreBaskerville_700Bold } from "@expo-google-fonts/libre-baskerville";
import {
  MerriweatherSans_400Regular,
  MerriweatherSans_700Bold,
} from "@expo-google-fonts/merriweather-sans";
import { useFonts } from "@expo-google-fonts/merriweather-sans/useFonts";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import ContactUsButton from "../(components)/ContactUsButton";
import CreateNewRoom from "../(components)/CreateNewRoom";
import JoinExistingRoom from "../(components)/JoinExistingRoom";
import LanguageSelector from "../(components)/LanguageSelector";
import LearnHowToPlay from "../(components)/LearnHowToPlay";
import Logo from "../(components)/Logo";
import socketService from "../services/socketService";

const StartOptionsScreen = () => {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showHowToPlayModal, setShowHowToPlayModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  let [fontsLoaded] = useFonts({
    MerriweatherSans_400Regular,
    MerriweatherSans_700Bold,
    LibreBaskerville_700Bold,
  });

  useEffect(() => {
    socketService.connect();

    return () => {
      // Cleanup - DO NOT UNCONNECT SOCKET ONCE USER LEAVES THE APP.
      // socketService.disconnect();
    };
  }, []);

  const handleCreateRoom = async (
    userName: string,
    category: string,
    avatar: string = "😊"
  ) => {
    try {
      setIsLoading(true);
      console.log(
        `🏠 Creating room with ${userName} and category is: ${category} and avatar is: ${avatar}...`
      );

      // Send request to create room to backend
      const result = await socketService.createRoom(userName, avatar, category);
      // result -> { roomCode: string; player: room.players[0]; category: string }

      console.log("✅ Room is created:", result);
      setShowCreateModal(false);

      // Redirect to GameRoom (only roomCode needed, rest comes from backend)
      router.push({
        pathname: "/GameRoom",
        params: {
          roomCode: result.roomCode,
        },
      });
    } catch (error: any) {
      console.error("❌ Error creating room:", error);
      Alert.alert(
        "Hata",
        error?.message || "Room not created. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async (
    userName: string,
    roomCode: string,
    avatar: string = "😊"
  ) => {
    try {
      setIsLoading(true);
      console.log("👥 Joining room...", { userName, roomCode, avatar });

      // Send request to join room to backend
      const result = await socketService.joinRoom(
        roomCode.toUpperCase(),
        userName,
        avatar
      );

      console.log("✅ Joined room:", result);
      setShowJoinModal(false);

      // Redirect to GameRoom (only roomCode needed, rest comes from backend)
      router.push({
        pathname: "/GameRoom",
        params: {
          roomCode: result.roomCode,
        },
      });
    } catch (error: any) {
      console.error("❌ Error joining room:", error);
      Alert.alert(
        "Hata",
        error?.message || "Room not joined. Is the room code correct?"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View className="flex-1 bg-primary">
      {/* Language Selector */}
      <LanguageSelector position="top-right" />

      {/* Contact Us Button */}
      <ContactUsButton position="bottom-left" style="default" />

      <Image
        source={require("../../assets/images/options-screen-girl.png")}
        style={{
          width: 200,
          height: 200,
          transform: [{ scaleX: -1 }, { rotate: "142deg" }],
          marginTop: -50,
          marginBottom: 30,
        }}
        contentFit="contain"
      />
      <Logo marginTop={25} />
      <View className="flex-1 items-center gap-6 mt-10 px-6">
        {/* Create New Room Button */}
        <View className="w-full relative mb-1">
          <View className="absolute top-[3px] left-[3px] right-[-3px] bottom-[-3px] bg-gray-900 rounded-[14px]" />
          <TouchableOpacity
            className="bg-[#ffe4e6] border-2 border-gray-900 rounded-[14px] py-[18px] px-8 relative z-10"
            activeOpacity={0.8}
            onPress={() => setShowCreateModal(true)}
          >
            <Text
              className="text-gray-900 text-xl font-bold text-center"
              style={{ letterSpacing: -0.3 }}
            >
              Create New Room
            </Text>
          </TouchableOpacity>
        </View>

        {/* Join Existing Room Button */}
        <View className="w-full relative mb-1">
          <View className="absolute top-[3px] left-[3px] right-[-3px] bottom-[-3px] bg-gray-900 rounded-[14px]" />
          <TouchableOpacity
            className="bg-[#f0f9ff] border-2 border-gray-900 rounded-[14px] py-[18px] px-8 relative z-10"
            activeOpacity={0.8}
            onPress={() => setShowJoinModal(true)}
          >
            <Text
              className="text-gray-900 text-xl font-bold text-center"
              style={{ letterSpacing: -0.3 }}
            >
              Join Existing Room
            </Text>
          </TouchableOpacity>
        </View>

        {/* How to Play Button */}
        <View className="relative self-center mt-6">
          <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-full" />
          <TouchableOpacity
            className="bg-white border-2 border-gray-900 rounded-full py-2 px-6 relative flex-row items-center gap-2"
            activeOpacity={0.8}
            onPress={() => setShowHowToPlayModal(true)}
          >
            <Text
              className="text-gray-900 text-sm font-semibold"
              style={{ letterSpacing: -0.2 }}
            >
              Learn How to Play
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <Image
        source={require("../../assets/images/options-screen-man.png")}
        style={{
          width: 200,
          height: 200,
          transform: [{ scaleX: -1 }, { rotate: "-16deg" }],
          marginLeft: "auto",
          marginBottom: -40,
        }}
        contentFit="contain"
      />

      {/* Create New Room Modal */}
      <CreateNewRoom
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateRoom={handleCreateRoom}
      />

      {/* Join Existing Room Modal */}
      <JoinExistingRoom
        visible={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onJoinRoom={handleJoinRoom}
      />

      {/* Learn How to Play Modal */}
      <LearnHowToPlay
        visible={showHowToPlayModal}
        onClose={() => setShowHowToPlayModal(false)}
      />
    </View>
  );
};

export default StartOptionsScreen;
