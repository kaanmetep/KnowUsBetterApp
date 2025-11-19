import { LibreBaskerville_700Bold } from "@expo-google-fonts/libre-baskerville";
import {
  MerriweatherSans_400Regular,
  MerriweatherSans_700Bold,
} from "@expo-google-fonts/merriweather-sans";
import { useFonts } from "@expo-google-fonts/merriweather-sans/useFonts";
import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
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
import CoinBalanceDisplay from "../(components)/CoinBalanceDisplay";
import CoinPurchaseModal from "../(components)/CoinPurchaseModal";
import CreateNewRoom from "../(components)/CreateNewRoom";
import JoinExistingRoom from "../(components)/JoinExistingRoom";
import LearnHowToPlay from "../(components)/LearnHowToPlay";
import Logo from "../(components)/Logo";
import SettingsModal from "../(components)/SettingsModal";
import SocialMediaIcons from "../(components)/SocialMediaIcons";
import { useLanguage } from "../contexts/LanguageContext";
import { useTranslation } from "../hooks/useTranslation";
import socketService from "../services/socketService";

const StartOptionsScreen = () => {
  const router = useRouter();
  const { selectedLanguage, setSelectedLanguage, languages } = useLanguage();
  const { t } = useTranslation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showHowToPlayModal, setShowHowToPlayModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

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
      // Cleanup - DO NOT DISCONNECT SOCKET WHEN THIS COMPONENT UNMOUNTS.
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
  ): Promise<void> => {
    try {
      setIsLoading(true);
      // Send request to create room to backend
      const result = await socketService.createRoom(userName, avatar, category);
      // result -> { roomCode: string; player: room.players[0]; category: string }
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
        t("alerts.oops"),
        error?.message || t("errors.roomCreateError"),
        [{ text: t("common.ok"), style: "default" }]
      );
      // Don't re-throw - error is already handled, re-throwing causes "Uncaught (in promise)"
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async (
    userName: string,
    roomCode: string,
    avatar: string = "😊"
  ): Promise<void> => {
    try {
      setIsLoading(true);

      // Send request to join room to backend
      const result = await socketService.joinRoom(
        roomCode.toUpperCase(),
        userName,
        avatar
      );

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

      // Extract error message
      let errorMessage = t("errors.roomNotFoundMessage");
      if (typeof error === "string") {
        // If error is just "Room not found" or similar, use our friendly message
        if (
          error.toLowerCase().includes("room") &&
          error.toLowerCase().includes("not found")
        ) {
          errorMessage = t("errors.roomNotFoundMessage");
        } else {
          errorMessage = error;
        }
      } else if (error?.message) {
        // If error message is generic, use our friendly message
        if (
          error.message.toLowerCase().includes("room") &&
          error.message.toLowerCase().includes("not found")
        ) {
          errorMessage = t("errors.roomNotFoundMessage");
        } else {
          errorMessage = error.message;
        }
      } else if (error?.error) {
        errorMessage = error.error;
      }

      // Show alert - modal will remain open and user can try again
      Alert.alert(
        t("errors.roomNotFound"),
        errorMessage,
        [{ text: t("common.ok"), style: "default" }],
        { cancelable: true }
      );
      // Re-throw error so JoinExistingRoom component knows the join failed
      // and doesn't reset the form/step
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View className="flex-1 bg-primary">
      {/* Language Selector & Settings Button Container */}
      <View className="absolute top-20 right-6 z-50 flex-row items-center gap-3">
        {/* Inline Language Selector */}
        <View className="relative">
          <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-lg" />
          <TouchableOpacity
            onPress={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
            activeOpacity={0.8}
            className="relative bg-white border-2 border-gray-900 rounded-lg px-3 py-2 flex-row items-center gap-1"
          >
            <Text style={{ fontSize: 18 }}>
              {languages[selectedLanguage].flag}
            </Text>
            <Text
              style={{ fontFamily: "MerriweatherSans_700Bold", fontSize: 12 }}
              className="text-gray-900"
            >
              {selectedLanguage.toUpperCase()}
            </Text>
          </TouchableOpacity>

          {/* Dropdown Menu */}
          {isLanguageMenuOpen && (
            <View className="absolute top-[52px] right-0 w-[140px]">
              <View className="relative">
                <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-lg" />
                <View className="relative bg-white border-2 border-gray-900 rounded-lg overflow-hidden">
                  {(Object.keys(languages) as (keyof typeof languages)[]).map(
                    (lang, index) => (
                      <TouchableOpacity
                        key={lang}
                        onPress={() => {
                          setSelectedLanguage(lang);
                          setIsLanguageMenuOpen(false);
                        }}
                        activeOpacity={0.8}
                        className={`flex-row items-center gap-1 px-3 py-3 ${
                          index !== Object.keys(languages).length - 1
                            ? "border-b-2 border-gray-900"
                            : ""
                        } ${selectedLanguage === lang ? "bg-[#ffe4e6]" : ""}`}
                      >
                        <Text style={{ fontSize: 16 }}>
                          {languages[lang].flag}
                        </Text>
                        <Text
                          style={{
                            fontFamily: "MerriweatherSans_400Regular",
                            fontSize: 13,
                          }}
                          className="text-gray-900"
                        >
                          {languages[lang].label}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Settings Button */}
        <View className="relative">
          <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-lg" />
          <TouchableOpacity
            onPress={() => setShowSettingsModal(true)}
            activeOpacity={0.8}
            className="relative bg-white border-2 border-gray-900 rounded-lg p-2.5"
          >
            <Feather name="settings" size={17} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Coin Display and Buy Button - Bottom Left */}
      <CoinBalanceDisplay
        onBuyCoins={() => {
          setShowSettingsModal(false);
          setShowPurchaseModal(true);
        }}
        style="absolute"
        position="bottom-left"
        showBuyButton={false}
      />

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
            activeOpacity={0.85}
            onPress={() => setShowCreateModal(true)}
            className="relative z-10 w-full"
            style={{ borderRadius: 14, overflow: "hidden" }}
          >
            <LinearGradient
              colors={["#fee2e2", "#fecaca", "#fca5a5"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderWidth: 2,
                borderColor: "#1f2937",
                borderRadius: 14,
                paddingVertical: 18,
                paddingHorizontal: 32,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View style={{ marginRight: 12 }}>
                <Entypo name="plus" size={24} color="#1f2937" />
              </View>
              <Text
                className="text-gray-900 text-xl font-bold text-center"
                style={{ letterSpacing: -0.3 }}
              >
                {t("startScreen.createNewRoom")}
              </Text>
            </LinearGradient>
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
            activeOpacity={0.85}
            onPress={() => setShowJoinModal(true)}
            className="relative z-10 w-full"
            style={{ borderRadius: 14, overflow: "hidden" }}
          >
            <LinearGradient
              colors={["#dbeafe", "#bfdbfe", "#93c5fd"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderWidth: 2,
                borderColor: "#1f2937",
                borderRadius: 14,
                paddingVertical: 18,
                paddingHorizontal: 32,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View style={{ marginRight: 12 }}>
                <FontAwesome6 name="user-group" size={16} color="#1f2937" />
              </View>
              <Text
                className="text-gray-900 text-xl font-bold text-center"
                style={{ letterSpacing: -0.3 }}
              >
                {t("startScreen.joinExistingRoom")}
              </Text>
            </LinearGradient>
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
            activeOpacity={0.85}
            onPress={() => setShowHowToPlayModal(true)}
            className="relative"
            style={{ borderRadius: 9999, overflow: "hidden" }}
          >
            <LinearGradient
              colors={["#f9fafb", "#f3f4f6", "#e5e7eb"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderWidth: 2,
                borderColor: "#1f2937",
                borderRadius: 9999,
                paddingVertical: 8,
                paddingHorizontal: 24,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Text
                className="text-gray-900 text-sm font-semibold"
                style={{ letterSpacing: -0.2 }}
              >
                {t("startScreen.learnHowToPlay")}
              </Text>
            </LinearGradient>
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
          marginBottom: -50,
        }}
        contentFit="contain"
      />

      {/* Create New Room Modal */}
      <CreateNewRoom
        visible={showCreateModal && !showPurchaseModal}
        onClose={() => setShowCreateModal(false)}
        onCreateRoom={handleCreateRoom}
        onBuyCoins={() => {
          setShowCreateModal(false);
          setShowPurchaseModal(true);
        }}
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

      {/* Coin Purchase Modal - EN SONDA OLMALI (EN ÜSTTE RENDER EDİLİR) */}
      <CoinPurchaseModal
        visible={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onBuyCoins={() => {
          setShowSettingsModal(false);
          setShowPurchaseModal(true);
        }}
      />

      {/* Development Test Button - Only visible in __DEV__ mode */}
      {__DEV__ && (
        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: "/GameFinishedPreview",
            });
          }}
          style={{
            position: "absolute",
            bottom: 20,
            right: 20,
            backgroundColor: "#fef3c7",
            padding: 12,
            borderRadius: 8,
            borderWidth: 2,
            borderColor: "#991b1b",
          }}
        >
          <Text
            style={{
              fontFamily: "MerriweatherSans_700Bold",
              fontSize: 12,
              color: "#991b1b",
            }}
          >
            Test GameFinished
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default StartOptionsScreen;
