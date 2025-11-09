import { LibreBaskerville_700Bold } from "@expo-google-fonts/libre-baskerville";
import {
  MerriweatherSans_400Regular,
  MerriweatherSans_700Bold,
} from "@expo-google-fonts/merriweather-sans";
import { useFonts } from "@expo-google-fonts/merriweather-sans/useFonts";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ContactUsButton from "../(components)/ContactUsButton";
import CreateNewRoom from "../(components)/CreateNewRoom";
import JoinExistingRoom from "../(components)/JoinExistingRoom";
import LanguageSelector from "../(components)/LanguageSelector";
import LearnHowToPlay from "../(components)/LearnHowToPlay";
import Logo from "../(components)/Logo";
import SocialMediaIcons from "../(components)/SocialMediaIcons";
import socketService from "../services/socketService";

const StartOptionsScreen = () => {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showHowToPlayModal, setShowHowToPlayModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Button animations
  const createButtonScale = useRef(new Animated.Value(0.95)).current;
  const createButtonOpacity = useRef(new Animated.Value(0)).current;
  const createButtonPulse = useRef(new Animated.Value(1)).current;
  const joinButtonScale = useRef(new Animated.Value(0.95)).current;
  const joinButtonOpacity = useRef(new Animated.Value(0)).current;
  const joinButtonPulse = useRef(new Animated.Value(1)).current;
  const learnButtonScale = useRef(new Animated.Value(0.95)).current;
  const learnButtonOpacity = useRef(new Animated.Value(0)).current;
  const learnButtonPulse = useRef(new Animated.Value(1)).current;

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

  // Button entrance animations
  useEffect(() => {
    // Create button animation
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(createButtonScale, {
          toValue: 1,
          tension: 50,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(createButtonOpacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Start subtle pulse animation after entrance
        Animated.loop(
          Animated.sequence([
            Animated.timing(createButtonPulse, {
              toValue: 1.015,
              duration: 2500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(createButtonPulse, {
              toValue: 1,
              duration: 2500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        ).start();
      });
    }, 150);

    // Join button animation
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(joinButtonScale, {
          toValue: 1,
          tension: 50,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(joinButtonOpacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Start subtle pulse animation after entrance
        Animated.loop(
          Animated.sequence([
            Animated.timing(joinButtonPulse, {
              toValue: 1.015,
              duration: 2800,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(joinButtonPulse, {
              toValue: 1,
              duration: 2800,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        ).start();
      });
    }, 250);

    // Learn button animation
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(learnButtonScale, {
          toValue: 1,
          tension: 50,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(learnButtonOpacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Start subtle pulse animation after entrance
        Animated.loop(
          Animated.sequence([
            Animated.timing(learnButtonPulse, {
              toValue: 1.015,
              duration: 3000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(learnButtonPulse, {
              toValue: 1,
              duration: 3000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        ).start();
      });
    }, 350);
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
      {/* Social Media Icons - Above Logo */}
      <SocialMediaIcons position="above-logo" />
      <Logo marginTop={5} />
      <View className="flex-1 items-center gap-6 mt-10 px-6">
        {/* Create New Room Button */}
        <Animated.View
          className="w-full relative mb-1"
          style={{
            opacity: createButtonOpacity,
            transform: [
              {
                scale: Animated.multiply(createButtonScale, createButtonPulse),
              },
            ],
          }}
        >
          <View className="absolute top-[3px] left-[3px] right-[-3px] bottom-[-3px] bg-gray-900 rounded-[14px]" />
          <TouchableOpacity
            className="bg-[#ffd7da] border-2 border-gray-900 rounded-[14px] py-[18px] px-8 relative z-10 flex-row items-center justify-center gap-3"
            activeOpacity={0.85}
            onPress={() => setShowCreateModal(true)}
          >
            <Entypo name="plus" size={24} color="#1f2937" />
            <Text
              className="text-gray-900 text-xl font-bold text-center"
              style={{ letterSpacing: -0.3 }}
            >
              Create New Room
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Join Existing Room Button */}
        <Animated.View
          className="w-full relative mb-1"
          style={{
            opacity: joinButtonOpacity,
            transform: [
              { scale: Animated.multiply(joinButtonScale, joinButtonPulse) },
            ],
          }}
        >
          <View className="absolute top-[3px] left-[3px] right-[-3px] bottom-[-3px] bg-gray-900 rounded-[14px]" />
          <TouchableOpacity
            className="bg-[#dbeafe] border-2 border-gray-900 rounded-[14px] py-[18px] px-8 relative z-10 flex-row items-center justify-center gap-3"
            activeOpacity={0.85}
            onPress={() => setShowJoinModal(true)}
          >
            <FontAwesome6 name="user-group" size={16} color="#1f2937" />
            <Text
              className="text-gray-900 text-xl font-bold text-center"
              style={{ letterSpacing: -0.3 }}
            >
              Join Existing Room
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* How to Play Button */}
        <Animated.View
          className="relative self-center mt-6"
          style={{
            opacity: learnButtonOpacity,
            transform: [
              { scale: Animated.multiply(learnButtonScale, learnButtonPulse) },
            ],
          }}
        >
          <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-full" />
          <TouchableOpacity
            className="bg-white border-2 border-gray-900 rounded-full py-2 px-6 relative flex-row items-center gap-2"
            activeOpacity={0.85}
            onPress={() => setShowHowToPlayModal(true)}
          >
            <Text
              className="text-gray-900 text-sm font-semibold"
              style={{ letterSpacing: -0.2 }}
            >
              Learn How to Play
            </Text>
          </TouchableOpacity>
        </Animated.View>
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
