import { LibreBaskerville_700Bold } from "@expo-google-fonts/libre-baskerville";
import {
  MerriweatherSans_400Regular,
  MerriweatherSans_600SemiBold,
  MerriweatherSans_700Bold,
} from "@expo-google-fonts/merriweather-sans";
import { useFonts } from "@expo-google-fonts/merriweather-sans/useFonts";
import { Entypo, Feather, FontAwesome6 } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Alert,
  Animated,
  StatusBar,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import AnnouncementBanner from "../(components)/announcements/AnnouncementBanner";
import AnnouncementsModal from "../(components)/announcements/AnnouncementsModal";
import CoinPurchaseModal from "../(components)/coins/CoinPurchaseModal";
import DailyRewardBanner from "../(components)/coins/DailyRewardBanner";
import CreateNewRoom from "../(components)/game/CreateNewRoom";
import JoinExistingRoom from "../(components)/game/JoinExistingRoom";
import LearnHowToPlay from "../(components)/game/LearnHowToPlay";
import RateAppFeedbackModal from "../(components)/profile/RateAppFeedbackModal";
import SettingsButton from "../(components)/settings/SettingsButton";
import SettingsModal from "../(components)/settings/SettingsModal";
import Logo from "../(components)/ui/Logo";
import { useTranslation } from "../hooks/useTranslation";
import socketService from "../services/socketService";

const StartOptionsScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isSmallPhone = width <= 375 && height <= 700;
  const isVerySmallPhone = width <= 350 || height <= 620;
  const scale = isVerySmallPhone ? 0.86 : isSmallPhone ? 0.93 : 1;
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showHowToPlayModal, setShowHowToPlayModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAnnouncementsModal, setShowAnnouncementsModal] = useState(false);
  const [showRateAppModal, setShowRateAppModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoY = useRef(new Animated.Value(-12)).current;
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroScale = useRef(new Animated.Value(2)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardY = useRef(new Animated.Value(32)).current;
  const createOpacity = useRef(new Animated.Value(0)).current;
  const createY = useRef(new Animated.Value(20)).current;
  const joinOpacity = useRef(new Animated.Value(0)).current;
  const joinY = useRef(new Animated.Value(20)).current;
  const helpOpacity = useRef(new Animated.Value(0)).current;

  let [fontsLoaded] = useFonts({
    MerriweatherSans_400Regular,
    MerriweatherSans_600SemiBold,
    MerriweatherSans_700Bold,
    LibreBaskerville_700Bold,
  });

  useEffect(() => {
    socketService.connect();
    return () => {};
  }, []);

  const headerTop = Math.max(
    insets.top + (isSmallPhone ? 8 : 12),
    isSmallPhone ? 12 : 16,
  );

  useEffect(() => {
    Animated.stagger(70, [
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(logoY, {
          toValue: 0,
          friction: 9,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(heroOpacity, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.spring(heroScale, {
          toValue: 1,
          friction: 9,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(cardY, {
          toValue: 0,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(createOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.spring(createY, {
          toValue: 0,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(joinOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.spring(joinY, {
          toValue: 0,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(helpOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleCreateRoom = async (
    userName: string,
    category: string,
    avatar: string = "😊",
  ): Promise<void> => {
    try {
      setIsLoading(true);
      const result = await socketService.createRoom(userName, avatar, category);
      setShowCreateModal(false);
      router.push({
        pathname: "/GameRoom",
        params: { roomCode: result.roomCode },
      });
    } catch (error: any) {
      Alert.alert(
        t("alerts.oops"),
        error?.message || t("errors.roomCreateError"),
        [{ text: t("common.ok") }],
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async (
    userName: string,
    roomCode: string,
    avatar: string = "😊",
  ): Promise<void> => {
    try {
      setIsLoading(true);
      const result = await socketService.joinRoom(
        roomCode.toUpperCase(),
        userName,
        avatar,
      );
      setShowJoinModal(false);
      router.push({
        pathname: "/GameRoom",
        params: { roomCode: result.roomCode },
      });
    } catch (error: any) {
      let errorMessage = t("errors.roomNotFoundMessage");
      if (
        error?.message?.toLowerCase().includes("room") &&
        error.message.toLowerCase().includes("not found")
      ) {
        errorMessage = t("errors.roomNotFoundMessage");
      } else {
        errorMessage = error.message || error;
      }
      Alert.alert(t("errors.roomNotFound"), errorMessage, [
        { text: t("common.ok") },
      ]);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  if (!fontsLoaded) return null;

  return (
    <View style={{ flex: 1, backgroundColor: "#FFF8F5" }}>
      <StatusBar barStyle="dark-content" />

      {/* Header row — DailyReward left, Settings right */}
      <View
        style={{
          position: "absolute",
          top: headerTop,
          left: isSmallPhone ? 12 : 16,
          right: isSmallPhone ? 14 : 20,
          zIndex: 50,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Animated.View style={{ opacity: logoOpacity }}>
          <DailyRewardBanner />
        </Animated.View>
        <Animated.View style={{ opacity: logoOpacity }}>
          <SettingsButton onPress={() => setShowSettingsModal(true)} />
        </Animated.View>
      </View>

      {/* Hero — logo + couple illustration */}
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: 0,
          paddingTop: headerTop + (isSmallPhone ? 96 : 128),
        }}
      >
        <Animated.View
          style={{
            opacity: logoOpacity,
            transform: [
              { translateY: logoY },
              { scale: isVerySmallPhone ? 0.82 : isSmallPhone ? 0.9 : 1 },
            ],
            alignItems: "center",
            marginBottom: isVerySmallPhone ? -32 : isSmallPhone ? -30 : -46,
          }}
        >
          <Logo size="sm" />
        </Animated.View>

        <Animated.View
          style={{
            opacity: heroOpacity,
            transform: [{ scale: heroScale }],
            marginBottom: isSmallPhone ? -56 : -82,
          }}
        >
          <Image
            source={require("../../assets/images/deneme2.png")}
            style={{
              width: width,
              height: height * (isSmallPhone ? 0.34 : 0.4),
            }}
            contentFit="contain"
          />

          <LinearGradient
            colors={["transparent", "white"]}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "45%",
            }}
            pointerEvents="none"
          />
        </Animated.View>
      </View>

      {/* Action card */}
      <Animated.View
        style={{
          opacity: cardOpacity,
          transform: [{ translateY: cardY }],
          backgroundColor: "white",
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          paddingHorizontal: isSmallPhone ? 18 : 24,
          paddingTop: isSmallPhone ? 12 : 16,
          paddingBottom: (isSmallPhone ? 12 : 14) + Math.max(insets.bottom - 18, 0),
          shadowColor: "#2D0A14",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 20,
          elevation: 14,
        }}
      >
        {/* Drag handle */}
        <View
          style={{
            width: 36,
            height: 4,
            backgroundColor: "#E9EEF4",
            borderRadius: 2,
            alignSelf: "center",
            marginBottom: isSmallPhone ? 16 : 24,
          }}
        />

        {/* Create New Room */}
        <Animated.View
          style={{
            opacity: createOpacity,
            transform: [{ translateY: createY }],
            marginBottom: isSmallPhone ? 10 : 12,
          }}
        >
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setShowCreateModal(true)}
            style={{
              backgroundColor: "#C94B6A",
              borderRadius: 20 * scale,
              paddingVertical: 18 * scale,
              paddingHorizontal: 22 * scale,
              flexDirection: "row",
              alignItems: "center",
              shadowColor: "#C94B6A",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.32,
              shadowRadius: 14,
              elevation: 8,
            }}
          >
            <View
              style={{
                width: 42 * scale,
                height: 42 * scale,
                borderRadius: 13 * scale,
                backgroundColor: "rgba(255,255,255,0.18)",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 16 * scale,
              }}
            >
              <Entypo name="plus" size={22 * scale} color="white" />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: "MerriweatherSans_700Bold",
                  fontSize: 16 * scale,
                  color: "white",
                  letterSpacing: 0.1,
                }}
              >
                {t("startScreen.createNewRoom")}
              </Text>
              <Text
                style={{
                  fontFamily: "MerriweatherSans_400Regular",
                  fontSize: 12 * scale,
                  color: "rgba(255,255,255,0.7)",
                  marginTop: 2,
                }}
              >
                {t("startScreen.hostAGame")}
              </Text>
            </View>
            <Feather
              name="chevron-right"
              size={19 * scale}
              color="rgba(255,255,255,0.65)"
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Join Existing Room */}
        <Animated.View
          style={{
            opacity: joinOpacity,
            transform: [{ translateY: joinY }],
            marginBottom: isSmallPhone ? 14 : 20,
          }}
        >
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setShowJoinModal(true)}
            style={{
              backgroundColor: "white",
              borderRadius: 20 * scale,
              paddingVertical: 18 * scale,
              paddingHorizontal: 22 * scale,
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1.5,
              borderColor: "#EDCDD7",
              shadowColor: "#C94B6A",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.07,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View
              style={{
                width: 42 * scale,
                height: 42 * scale,
                borderRadius: 13 * scale,
                backgroundColor: "#FFF0F3",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 16 * scale,
              }}
            >
              <FontAwesome6 name="user-group" size={17 * scale} color="#C94B6A" />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: "MerriweatherSans_700Bold",
                  fontSize: 16 * scale,
                  color: "#1E293B",
                  letterSpacing: 0.1,
                }}
              >
                {t("startScreen.joinExistingRoom")}
              </Text>
              <Text
                style={{
                  fontFamily: "MerriweatherSans_400Regular",
                  fontSize: 12 * scale,
                  color: "#94A3B8",
                  marginTop: 2,
                }}
              >
                {t("startScreen.enterCode")}
              </Text>
            </View>
            <Feather name="chevron-right" size={19 * scale} color="#C94B6A" />
          </TouchableOpacity>
        </Animated.View>

        {/* How to Play */}
        <Animated.View
          style={{
            opacity: helpOpacity,
            alignItems: "center",
            marginBottom: isSmallPhone ? 12 : 18,
          }}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowHowToPlayModal(true)}
            style={{ flexDirection: "row", alignItems: "center", gap: 6 * scale }}
          >
            <Feather name="help-circle" size={14 * scale} color="#B0BCCA" />
            <Text
              style={{
                fontFamily: "MerriweatherSans_600SemiBold",
                fontSize: 13 * scale,
                color: "#B0BCCA",
              }}
            >
              {t("startScreen.learnHowToPlay")}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Announcement Banner */}
        <Animated.View style={{ opacity: helpOpacity, alignItems: "center" }}>
          <AnnouncementBanner
            onViewAll={() => setShowAnnouncementsModal(true)}
          />
        </Animated.View>
      </Animated.View>

      {/* Modals */}
      <CreateNewRoom
        visible={showCreateModal && !showPurchaseModal}
        onClose={() => setShowCreateModal(false)}
        onCreateRoom={handleCreateRoom}
        onBuyCoins={() => {
          setShowCreateModal(false);
          setShowPurchaseModal(true);
        }}
      />
      <JoinExistingRoom
        visible={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onJoinRoom={handleJoinRoom}
      />
      <LearnHowToPlay
        visible={showHowToPlayModal}
        onClose={() => setShowHowToPlayModal(false)}
      />
      <CoinPurchaseModal
        visible={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
      />
      <SettingsModal
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onBuyCoins={() => {
          setShowSettingsModal(false);
          setShowPurchaseModal(true);
        }}
        onRequestRateApp={() => setShowRateAppModal(true)}
      />
      <AnnouncementsModal
        visible={showAnnouncementsModal}
        onClose={() => setShowAnnouncementsModal(false)}
      />
      <RateAppFeedbackModal
        visible={showRateAppModal}
        onClose={() => setShowRateAppModal(false)}
      />
    </View>
  );
};

export default StartOptionsScreen;
