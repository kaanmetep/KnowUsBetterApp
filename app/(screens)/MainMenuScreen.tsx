import { LibreBaskerville_700Bold } from "@expo-google-fonts/libre-baskerville";
import {
  MerriweatherSans_400Regular,
  MerriweatherSans_600SemiBold,
  MerriweatherSans_700Bold,
} from "@expo-google-fonts/merriweather-sans";
import { useFonts } from "@expo-google-fonts/merriweather-sans/useFonts";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  StatusBar,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AnnouncementBanner from "../(components)/announcements/AnnouncementBanner";
import AnnouncementsModal from "../(components)/announcements/AnnouncementsModal";
import CoinPurchaseModal from "../(components)/coins/CoinPurchaseModal";
import DailyRewardBanner from "../(components)/coins/DailyRewardBanner";
import LearnHowToPlay from "../(components)/game/LearnHowToPlay";
import MainMenuActionButton from "../(components)/game/MainMenuActionButton";
import CreateNewRoomModal from "../(components)/game/room-modal/CreateNewRoomModal";
import JoinExistingRoomModal from "../(components)/game/room-modal/JoinExistingRoomModal";
import RateAppFeedbackModal from "../(components)/profile/RateAppFeedbackModal";
import SettingsButton from "../(components)/settings/SettingsButton";
import SettingsModal from "../(components)/settings/SettingsModal";
import Logo from "../(components)/ui/Logo";
import { useTranslation } from "../hooks/useTranslation";
import { NotificationService } from "../services/notificationService";
import { purchaseService } from "../services/purchaseService";
import socketService from "../services/socketService";

const MainMenuScreen = () => {
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

  useEffect(() => {
    const registerNotificationToken = async () => {
      try {
        const userId = await purchaseService.getAppUserId();
        if (!userId) return;
        await NotificationService.registerPushToken(userId);
      } catch (error) {
        console.warn("⚠️ Failed to register push token:", error);
      }
    };

    registerNotificationToken();
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
            source={require("../../assets/images/MainMenuScreenPhoto.png")}
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

      <Animated.View
        style={{
          opacity: cardOpacity,
          transform: [{ translateY: cardY }],
          backgroundColor: "white",
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          paddingHorizontal: isSmallPhone ? 18 : 24,
          paddingTop: isSmallPhone ? 12 : 16,
          paddingBottom:
            (isSmallPhone ? 12 : 14) + Math.max(insets.bottom - 18, 0),
          shadowColor: "#2D0A14",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 20,
          elevation: 14,
        }}
      >
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

        <Animated.View
          style={{
            opacity: createOpacity,
            transform: [{ translateY: createY }],
            marginBottom: isSmallPhone ? 10 : 12,
          }}
        >
          <MainMenuActionButton
            type="create"
            scale={scale}
            title={t("startScreen.createNewRoom")}
            subtitle={t("startScreen.hostAGame")}
            onPress={() => setShowCreateModal(true)}
          />
        </Animated.View>

        <Animated.View
          style={{
            opacity: joinOpacity,
            transform: [{ translateY: joinY }],
            marginBottom: isSmallPhone ? 14 : 20,
          }}
        >
          <MainMenuActionButton
            type="join"
            scale={scale}
            title={t("startScreen.joinExistingRoom")}
            subtitle={t("startScreen.enterCode")}
            onPress={() => setShowJoinModal(true)}
          />
        </Animated.View>

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
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6 * scale,
            }}
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

        <Animated.View style={{ opacity: helpOpacity, alignItems: "center" }}>
          <AnnouncementBanner
            onViewAll={() => setShowAnnouncementsModal(true)}
          />
        </Animated.View>
      </Animated.View>

      <CreateNewRoomModal
        visible={showCreateModal && !showPurchaseModal}
        onClose={() => setShowCreateModal(false)}
        onCreateRoom={handleCreateRoom}
        onBuyCoins={() => {
          setShowCreateModal(false);
          setShowPurchaseModal(true);
        }}
      />
      <JoinExistingRoomModal
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

export default MainMenuScreen;
