import { LibreBaskerville_700Bold } from "@expo-google-fonts/libre-baskerville";
import {
  MerriweatherSans_400Regular,
  MerriweatherSans_600SemiBold,
  MerriweatherSans_700Bold,
} from "@expo-google-fonts/merriweather-sans";
import { useFonts } from "@expo-google-fonts/merriweather-sans/useFonts";
import {
  Entypo,
  Feather,
  FontAwesome5,
  FontAwesome6,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CoinBalanceDisplay from "../(components)/CoinBalanceDisplay";
import CoinPurchaseModal from "../(components)/CoinPurchaseModal";
import CreateNewRoom from "../(components)/CreateNewRoom";
import JoinExistingRoom from "../(components)/JoinExistingRoom";
import LanguageSelector from "../(components)/LanguageSelector";
import LearnHowToPlay from "../(components)/LearnHowToPlay";
import Logo from "../(components)/Logo";
import SettingsButton from "../(components)/SettingsButton";
import SettingsModal from "../(components)/SettingsModal";
import { useTranslation } from "../hooks/useTranslation";
import socketService from "../services/socketService";

const { width, height } = Dimensions.get("window");

// ARTIRILMIŞ VE KENARLARA SERPİŞTİRİLMİŞ İKONLAR
const FLOATING_ICONS = [
  // --- SOL ÜST BÖLGE ---
  {
    name: "heart",
    lib: "FA5",
    size: 24,
    color: "#FFDECF",
    top: "15%",
    left: "4%",
    rotate: "-25deg",
  },
  {
    name: "leaf",
    lib: "Entypo",
    size: 18,
    color: "#E0F2F1",
    top: "20%",
    left: "22%",
    rotate: "45deg",
  },
  {
    name: "ghost",
    lib: "FA5",
    size: 16,
    color: "#F3E5F5",
    top: "22%",
    left: "48%",
    rotate: "10deg",
  },

  // --- SAĞ ÜST BÖLGE ---
  {
    name: "heart",
    lib: "FA5",
    size: 16,
    color: "#FFDECF",
    top: "18%",
    right: "8%",
    rotate: "-30deg",
  },
  {
    name: "ladybug",
    lib: "MCI",
    size: 22,
    color: "#FFEBEE",
    top: "24%",
    right: "4%",
    rotate: "20deg",
  },

  // --- SAĞ ALT BÖLGE ---
  {
    name: "ladybug",
    lib: "MCI",
    size: 26,
    color: "#FFEBEE",
    bottom: "20%",
    right: "26%",
    rotate: "45deg",
  },
  {
    name: "heart",
    lib: "FA5",
    size: 18,
    color: "#FFDECF",
    bottom: "5%",
    right: "18%",
    rotate: "-15deg",
  },
  {
    name: "leaf",
    lib: "Entypo",
    size: 16,
    color: "#E0F2F1",
    bottom: "18%",
    right: "3%",
    rotate: "60deg",
  },
  {
    name: "ghost",
    lib: "FA5",
    size: 14,
    color: "#F3E5F5",
    bottom: "12%",
    right: "38%",
    rotate: "-5deg",
  },
];

const StartOptionsScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showHowToPlayModal, setShowHowToPlayModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Animations
  const createButtonScale = useRef(new Animated.Value(0.9)).current;
  const createButtonOpacity = useRef(new Animated.Value(0)).current;
  const joinButtonScale = useRef(new Animated.Value(0.9)).current;
  const joinButtonOpacity = useRef(new Animated.Value(0)).current;
  const learnButtonOpacity = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  // İllüstrasyonların giriş animasyonu için
  const imageSlideIn = useRef(new Animated.Value(50)).current;
  const imageOpacity = useRef(new Animated.Value(0)).current;

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

  // Entrance Animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(imageOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(imageSlideIn, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.stagger(150, [
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.spring(createButtonScale, {
            toValue: 1,
            friction: 6,
            useNativeDriver: true,
          }),
          Animated.timing(createButtonOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.spring(joinButtonScale, {
            toValue: 1,
            friction: 6,
            useNativeDriver: true,
          }),
          Animated.timing(joinButtonOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(learnButtonOpacity, {
          toValue: 1,
          duration: 400,
          delay: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const renderIcon = (icon: any, index: number) => {
    let IconLib: any;
    switch (icon.lib) {
      case "FA5":
        IconLib = FontAwesome5;
        break;
      case "MCI":
        IconLib = MaterialCommunityIcons;
        break;
      case "Feather":
        IconLib = Feather;
        break;
      case "Entypo":
        IconLib = Entypo;
        break;
      default:
        IconLib = FontAwesome5;
    }

    return (
      <View
        key={index}
        style={{
          position: "absolute",
          top: icon.top,
          left: icon.left,
          right: icon.right,
          bottom: icon.bottom,
          transform: [{ rotate: icon.rotate }],
          zIndex: 0,
          opacity: 0.6,
        }}
      >
        <IconLib name={icon.name} size={icon.size} color={icon.color} />
      </View>
    );
  };

  const handleCreateRoom = async (
    userName: string,
    category: string,
    avatar: string = "😊"
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
        [{ text: t("common.ok") }]
      );
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
      const result = await socketService.joinRoom(
        roomCode.toUpperCase(),
        userName,
        avatar
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
    <View className="flex-1 bg-white relative">
      <StatusBar barStyle="dark-content" />

      {/* UÇUŞAN İKONLAR */}
      {FLOATING_ICONS.map(renderIcon)}

      {/* Üst Kısım Kontrolleri */}
      <View className="absolute top-20 right-6 z-50 flex-row items-center gap-3">
        <View className="relative">
          <LanguageSelector position="onboarding" />
        </View>
        <CoinBalanceDisplay
          onBuyCoins={() => {
            setShowSettingsModal(false);
            setShowPurchaseModal(true);
          }}
        />
        <SettingsButton onPress={() => setShowSettingsModal(true)} />
      </View>

      {/* --- KIZ GÖRSELİ (Arka Planda) --- */}
      <Animated.View
        style={{
          position: "absolute",
          top: height * 0.1,
          right: -40,
          opacity: imageOpacity,
          transform: [{ translateX: imageSlideIn }],
          // 3. Z-Index: -1 (En arkaya atıldı)

          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Glow Effect */}
        <View
          style={{
            position: "absolute",
            width: width * 0.7,
            height: width * 0.7,
            borderRadius: width * 0.35,
            backgroundColor: "#FFEEE8",
            opacity: 0.15, // Glow çok silik
            transform: [{ scale: 1.2 }],
            shadowColor: "#FFAB91",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.2,
            shadowRadius: 60,
            zIndex: -1,
          }}
        />
        {/* Resim */}
        <Image
          source={require("../../assets/images/step1-girl.webp")}
          style={{
            width: width * 0.45,
            height: height * 0.5,
            // 2. Opacity: İyice kısıldı (0.3)
            opacity: 0.3,
          }}
          // 1. Blur: Hafif fluluk eklendi (Depth of field)
          blurRadius={1.5}
          contentFit="contain"
        />
      </Animated.View>

      {/* --- ERKEK GÖRSELİ (Arka Planda) --- */}
      <Animated.View
        style={{
          position: "absolute",
          bottom: -height * 0.08,
          left: -30,
          opacity: imageOpacity,
          transform: [
            {
              translateX: Animated.multiply(
                imageSlideIn,
                new Animated.Value(-1)
              ),
            },
          ],

          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Glow Effect */}
        <View
          style={{
            position: "absolute",
            width: width * 0.8,
            height: width * 0.8,
            borderRadius: width * 0.4,
            backgroundColor: "#EBF8FF",
            opacity: 0.15, // Glow çok silik
            transform: [{ scale: 1.1 }],
            shadowColor: "#74C0FC",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.2,
            shadowRadius: 60,
            zIndex: -1,
          }}
        />
        {/* Resim */}
        <Image
          source={require("../../assets/images/step2-boy.webp")}
          style={{
            width: width * 0.5,
            height: height * 0.55,
            // 2. Opacity: İyice kısıldı (0.3)
            opacity: 0.2,
          }}
          // 1. Blur: Hafif fluluk eklendi (Depth of field)
          blurRadius={1.5}
          contentFit="contain"
        />
      </Animated.View>

      {/* --- ANA İÇERİK --- */}
      <View className="flex-1 justify-center px-6 z-10 mt-10">
        {/* LOGO ALANI - XS BOYUT */}
        <Animated.View
          style={{
            opacity: logoOpacity,
            marginBottom: 20,
            alignItems: "center",
            width: "100%",
          }}
        >
          <Logo size="xs" />
        </Animated.View>

        {/* BUTONLAR */}
        <View className="w-full gap-5">
          {/* Create New Room Button */}
          <Animated.View
            style={{
              opacity: createButtonOpacity,
              transform: [{ scale: createButtonScale }],
            }}
          >
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setShowCreateModal(true)}
              style={{
                borderRadius: 24,
                shadowColor: "#FF8080",
                shadowOffset: {
                  width: 0,
                  height: 8,
                },
                shadowOpacity: 0.25,
                shadowRadius: 16,
                elevation: 10,
              }}
            >
              <LinearGradient
                colors={["#FFF0F0", "#FFE0E0", "#FFD5D5"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  borderRadius: 24,
                  paddingVertical: 22,
                  paddingHorizontal: 24,
                  flexDirection: "row",
                  alignItems: "center",
                  borderWidth: 1.5,
                  borderColor: "#FFBDBD",
                }}
              >
                <View className="flex-row items-center gap-4 flex-1">
                  <View className="w-12 h-12 bg-white rounded-full items-center justify-center shadow-sm shadow-red-100">
                    <Entypo name="plus" size={24} color="#FF8080" />
                  </View>
                  <View>
                    <Text
                      className="text-slate-800 text-lg"
                      style={{ fontFamily: "MerriweatherSans_700Bold" }}
                    >
                      {t("startScreen.createNewRoom")}
                    </Text>
                    <Text
                      className="text-slate-500 text-xs mt-0.5"
                      style={{ fontFamily: "MerriweatherSans_400Regular" }}
                    >
                      {t("startScreen.hostAGame")}
                    </Text>
                  </View>
                </View>
                <Feather name="chevron-right" size={20} color="#FF8080" />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Join Existing Room Button */}
          <Animated.View
            style={{
              opacity: joinButtonOpacity,
              transform: [{ scale: joinButtonScale }],
            }}
          >
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setShowJoinModal(true)}
              style={{
                borderRadius: 24,
                shadowColor: "#74C0FC",
                shadowOffset: {
                  width: 0,
                  height: 8,
                },
                shadowOpacity: 0.25,
                shadowRadius: 16,
                elevation: 10,
              }}
            >
              <LinearGradient
                colors={["#EDF5FF", "#D8ECFF", "#C3E3FF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  borderRadius: 24,
                  paddingVertical: 22,
                  paddingHorizontal: 24,
                  flexDirection: "row",
                  alignItems: "center",
                  borderWidth: 1.5,
                  borderColor: "#A8D8FF",
                }}
              >
                <View className="flex-row items-center gap-4 flex-1">
                  <View className="w-12 h-12 bg-white rounded-full items-center justify-center shadow-sm shadow-blue-100">
                    <FontAwesome6 name="user-group" size={18} color="#5DB3FF" />
                  </View>
                  <View>
                    <Text
                      className="text-slate-800 text-lg"
                      style={{ fontFamily: "MerriweatherSans_700Bold" }}
                    >
                      {t("startScreen.joinExistingRoom")}
                    </Text>
                    <Text
                      className="text-slate-500 text-xs mt-0.5"
                      style={{ fontFamily: "MerriweatherSans_400Regular" }}
                    >
                      {t("startScreen.enterCode")}
                    </Text>
                  </View>
                </View>
                <Feather name="chevron-right" size={20} color="#5DB3FF" />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* How to Play Button */}
          <Animated.View
            style={{
              opacity: learnButtonOpacity,
              alignSelf: "center",
              marginTop: 15,
            }}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowHowToPlayModal(true)}
              className="bg-white/90 border border-slate-200 rounded-full px-6 py-3 shadow-md shadow-slate-200 flex-row items-center gap-2 backdrop-blur-md"
            >
              <Feather name="help-circle" size={16} color="#64748B" />
              <Text
                className="text-slate-600 text-sm font-semibold"
                style={{ fontFamily: "MerriweatherSans_600SemiBold" }}
              >
                {t("startScreen.learnHowToPlay")}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>

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
      />
    </View>
  );
};

export default StartOptionsScreen;
