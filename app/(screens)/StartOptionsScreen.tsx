import { LibreBaskerville_700Bold } from "@expo-google-fonts/libre-baskerville";
import {
  MerriweatherSans_400Regular,
  MerriweatherSans_700Bold,
} from "@expo-google-fonts/merriweather-sans";
import { useFonts } from "@expo-google-fonts/merriweather-sans/useFonts";
import Fontisto from "@expo/vector-icons/Fontisto";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import CreateNewRoom from "../(components)/CreateNewRoom";
import JoinExistingRoom from "../(components)/JoinExistingRoom";
import Logo from "../(components)/Logo";

const StartOptionsScreen = () => {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  let [fontsLoaded] = useFonts({
    MerriweatherSans_400Regular,
    MerriweatherSans_700Bold,
    LibreBaskerville_700Bold,
  });

  const handleCreateRoom = (category: string) => {
    console.log("Creating room with category:", category);
    setShowCreateModal(false);

    // Generate random room code (6 characters)
    const generatedRoomCode = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();

    // Navigate to GameRoom
    router.push({
      pathname: "/GameRoom",
      params: {
        roomCode: generatedRoomCode,
        category: category,
        hostName: "You",
        isHost: "true",
      },
    });
  };

  const handleJoinRoom = (userName: string, roomCode: string) => {
    console.log("Joining room with userName:", userName, "roomCode:", roomCode);
    setShowJoinModal(false);

    // Navigate to GameRoom as participant
    router.push({
      pathname: "/GameRoom",
      params: {
        roomCode: roomCode,
        category: "unknown", // Category will be fetched from the room
        hostName: userName,
        isHost: "false",
      },
    });
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View className="flex-1 bg-primary">
      {/* Contact Us Button*/}
      <View className="absolute top-20 right-4 z-10">
        <View className="relative">
          <View className="absolute top-[1px] left-[1px] right-[-1px] bottom-[-1px] bg-gray-900 rounded-full" />
          <TouchableOpacity
            className="bg-white border-2 border-gray-900 rounded-full py-1.5 px-4 relative"
            activeOpacity={0.8}
            onPress={() => {}}
          >
            <View className="flex-row items-center gap-2">
              <Fontisto name="email" size={14} color="black" />
              <Text
                className="text-gray-900 text-xs font-semibold"
                style={{ letterSpacing: -0.2 }}
              >
                Contact Us
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

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
        <View className="relative self-center mt-8">
          <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-full" />
          <TouchableOpacity
            className="bg-white border-2 border-gray-900 rounded-full py-2 px-6 relative flex-row items-center gap-2"
            activeOpacity={0.8}
            onPress={() => {}}
          >
            <Text
              className="text-gray-900 text-sm font-semibold"
              style={{ letterSpacing: -0.2 }}
            >
              Learn How to play
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
    </View>
  );
};

export default StartOptionsScreen;
