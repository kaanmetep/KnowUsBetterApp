import { LibreBaskerville_700Bold } from "@expo-google-fonts/libre-baskerville";
import {
  MerriweatherSans_400Regular,
  MerriweatherSans_700Bold,
} from "@expo-google-fonts/merriweather-sans";
import { useFonts } from "@expo-google-fonts/merriweather-sans/useFonts";
import { FontAwesome5 } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  BackHandler,
  Dimensions,
  Easing,
  Linking,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CoinPurchaseModal from "../(components)/CoinPurchaseModal";
import LoadingScreen from "../(components)/LoadingScreen";
import Logo from "../(components)/Logo";
import SettingsModal from "../(components)/SettingsModal";
import SocialMediaIcons from "../(components)/SocialMediaIcons";
import { useLanguage } from "../contexts/LanguageContext";
import { useTranslation } from "../hooks/useTranslation";
import { UserPreferencesService } from "../services/userPreferencesService";
const OnboardingPage = () => {
  const router = useRouter();
  const { width, height } = Dimensions.get("window");
  const { selectedLanguage, setSelectedLanguage, languages } = useLanguage();
  const { t } = useTranslation();
  const [fontsLoaded] = useFonts({
    MerriweatherSans_400Regular,
    MerriweatherSans_700Bold,
    LibreBaskerville_700Bold,
  });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedHeart, setSelectedHeart] = useState<any>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [hasDeclinedTerms, setHasDeclinedTerms] = useState(false);
  // Button pulse animation
  const buttonPulseAnim = useRef(new Animated.Value(1)).current;
  // Heart transition animation
  const heartScale = useRef(new Animated.Value(1)).current;
  const heartOpacity = useRef(new Animated.Value(1)).current;
  const heartTranslateX = useRef(new Animated.Value(0)).current;
  const heartTranslateY = useRef(new Animated.Value(0)).current;
  // Feature cards animation
  const card1Scale = useRef(new Animated.Value(1)).current;
  const card2Scale = useRef(new Animated.Value(1)).current;
  const card3Scale = useRef(new Animated.Value(1)).current;
  const card1Opacity = useRef(new Animated.Value(1)).current;
  const card2Opacity = useRef(new Animated.Value(1)).current;
  const card3Opacity = useRef(new Animated.Value(1)).current;
  const card1TranslateY = useRef(new Animated.Value(0)).current;
  const card2TranslateY = useRef(new Animated.Value(0)).current;
  const card3TranslateY = useRef(new Animated.Value(0)).current;

  const hearts = useMemo(() => {
    let seed = 15;
    const heartsCount = 2;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    const sources = [
      require("../../assets/images/heart-1.png"),
      require("../../assets/images/heart-2.png"),
    ];
    const items = Array.from({ length: heartsCount }).map((_, i) => {
      const source = sources[i % sources.length];
      const size = Math.floor(40 + random() * 80);
      const top = Math.floor(height / 2 + random() * (height / 2 - size));
      const left = Math.floor(random() * (width - size));
      const rotateDeg = Math.floor(-30 + random() * 60);
      const opacity = 0.15 + random() * 0.25;
      return { id: i, source, size, top, left, rotateDeg, opacity };
    });
    return items;
  }, [width, height]);

  // Button pulse animation
  useEffect(() => {
    const checkTermsAcceptance = async () => {
      const accepted = await UserPreferencesService.hasAcceptedTerms();
      if (!accepted) {
        setShowTermsModal(true);
      }
    };

    checkTermsAcceptance();
  }, []);

  useEffect(() => {
    // Start pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(buttonPulseAnim, {
          toValue: 1.08,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(buttonPulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
    };
  }, []);

  // Feature cards entrance animation
  useEffect(() => {
    // Initial values
    card1Scale.setValue(0.95);
    card2Scale.setValue(0.95);
    card3Scale.setValue(0.95);
    card1Opacity.setValue(0);
    card2Opacity.setValue(0);
    card3Opacity.setValue(0);
    card1TranslateY.setValue(20);
    card2TranslateY.setValue(20);
    card3TranslateY.setValue(20);

    // Staggered animations
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(card1Scale, {
          toValue: 1,
          tension: 50,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.timing(card1Opacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(card1TranslateY, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }, 100);

    setTimeout(() => {
      Animated.parallel([
        Animated.spring(card2Scale, {
          toValue: 1,
          tension: 50,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.timing(card2Opacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(card2TranslateY, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }, 200);

    setTimeout(() => {
      Animated.parallel([
        Animated.spring(card3Scale, {
          toValue: 1,
          tension: 50,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.timing(card3Opacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(card3TranslateY, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }, 300);
  }, []);

  // Reset animation values when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Reset heart animation values
      heartScale.setValue(1);
      heartOpacity.setValue(1);
      heartTranslateX.setValue(0);
      heartTranslateY.setValue(0);

      // Reset transition states
      setIsTransitioning(false);
      setSelectedHeart(null);

      // Reset feature cards animation
      card1Scale.setValue(0.95);
      card2Scale.setValue(0.95);
      card3Scale.setValue(0.95);
      card1Opacity.setValue(0);
      card2Opacity.setValue(0);
      card3Opacity.setValue(0);
      card1TranslateY.setValue(20);
      card2TranslateY.setValue(20);
      card3TranslateY.setValue(20);

      // Start feature cards entrance animation
      setTimeout(() => {
        Animated.parallel([
          Animated.spring(card1Scale, {
            toValue: 1,
            tension: 50,
            friction: 3,
            useNativeDriver: true,
          }),
          Animated.timing(card1Opacity, {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(card1TranslateY, {
            toValue: 0,
            duration: 400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start();
      }, 100);

      setTimeout(() => {
        Animated.parallel([
          Animated.spring(card2Scale, {
            toValue: 1,
            tension: 50,
            friction: 3,
            useNativeDriver: true,
          }),
          Animated.timing(card2Opacity, {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(card2TranslateY, {
            toValue: 0,
            duration: 400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start();
      }, 200);

      setTimeout(() => {
        Animated.parallel([
          Animated.spring(card3Scale, {
            toValue: 1,
            tension: 50,
            friction: 3,
            useNativeDriver: true,
          }),
          Animated.timing(card3Opacity, {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(card3TranslateY, {
            toValue: 0,
            duration: 400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start();
      }, 300);
    }, [
      heartScale,
      heartOpacity,
      heartTranslateX,
      heartTranslateY,
      card1Scale,
      card2Scale,
      card3Scale,
      card1Opacity,
      card2Opacity,
      card3Opacity,
      card1TranslateY,
      card2TranslateY,
      card3TranslateY,
    ])
  );

  const handleStartPress = () => {
    // Take the first heart to animate. (Changing screen animation)
    const heartToAnimate = hearts[0];
    if (!heartToAnimate) return;

    setSelectedHeart(heartToAnimate);
    setIsTransitioning(true);

    // The heart's current position to the center of the screen
    const targetX = width / 2 - heartToAnimate.left - heartToAnimate.size / 2;
    const targetY = height / 2 - heartToAnimate.top - heartToAnimate.size / 2;
    const targetScale = (Math.max(width, height) * 5) / heartToAnimate.size;

    // Delay the transition to the next screen.
    setTimeout(() => {
      router.push("/StartOptionsScreen");
    }, 400);

    Animated.parallel([
      Animated.timing(heartScale, {
        toValue: targetScale,
        duration: 1000,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(heartTranslateX, {
        toValue: targetX,
        duration: 1000,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(heartTranslateY, {
        toValue: targetY,
        duration: 1000,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(heartOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleAcceptTerms = async () => {
    await UserPreferencesService.setTermsAccepted(true);
    setShowTermsModal(false);
    setHasDeclinedTerms(false);
  };

  const handleDeclineTerms = async () => {
    await UserPreferencesService.setTermsAccepted(false);
    setHasDeclinedTerms(true);
    Alert.alert(
      t("onboarding.termsDeclinedTitle"),
      t("onboarding.termsDeclinedMessage")
    );

    if (Platform.OS === "android") {
      BackHandler.exitApp();
    }
  };

  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert(
        t("onboarding.termsLinkErrorTitle"),
        t("onboarding.termsLinkErrorMessage")
      );
    });
  };

  if (!fontsLoaded) {
    return <LoadingScreen />;
  }
  return (
    <View className="flex-1 bg-primary ">
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
                  {(
                    Object.keys(languages) as Array<keyof typeof languages>
                  ).map((lang, index) => (
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
                  ))}
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

      <View
        pointerEvents="none"
        className="absolute inset-0"
        style={{ zIndex: 1 }}
      >
        {hearts.map((h) => {
          const isSelectedHeart =
            isTransitioning && selectedHeart && h.id === selectedHeart.id;

          if (isSelectedHeart) {
            return (
              <Animated.View
                key={h.id}
                style={{
                  position: "absolute",
                  top: h.top,
                  left: h.left,
                  width: h.size,
                  height: h.size,
                  opacity: heartOpacity,
                  transform: [
                    { translateX: heartTranslateX },
                    { translateY: heartTranslateY },
                    { scale: heartScale },
                    { rotate: `${h.rotateDeg}deg` },
                  ],
                  zIndex: 1,
                }}
              >
                <Image
                  source={h.source}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="contain"
                />
              </Animated.View>
            );
          }

          return (
            <Image
              key={h.id}
              source={h.source}
              style={{
                position: "absolute",
                top: h.top,
                left: h.left,
                width: h.size,
                height: h.size,
                opacity: h.opacity,
                transform: [{ rotate: `${h.rotateDeg}deg` }],
              }}
              contentFit="contain"
            />
          );
        })}
      </View>
      <Image
        source={require("../../assets/images/options-screen-girl.png")}
        style={{
          width: 200,
          height: 200,
          transform: [{ scaleX: -1 }, { rotate: "142deg" }],
          marginTop: -50,
          marginBottom: 30,
          zIndex: 0,
        }}
        contentFit="contain"
      />
      {/* Social Media Icons */}
      <SocialMediaIcons position="above-logo" />
      <Logo />
      <View className="flex-1 items-center gap-4 mt-6 px-6">
        {/* Feature Cards */}
        <View className="w-full items-center gap-2.5">
          {/* Card 1 */}
          <Animated.View
            className="relative w-full max-w-xs"
            style={{
              opacity: card1Opacity,
              transform: [
                {
                  translateY: card1TranslateY,
                },
                {
                  scale: card1Scale,
                },
              ],
            }}
          >
            {/* Shadow layer */}
            <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-lg" />
            <View className="relative bg-blue-50 border-2 border-gray-900 rounded-lg px-4 py-3">
              <View className="flex-row items-center justify-center gap-2.5">
                <View className="bg-white border-2 border-gray-900 rounded-md p-1.5">
                  <FontAwesome5 name="user-check" size={16} color="#000000" />
                </View>
                <Text
                  className="text-gray-900 font-bold flex-1 text-center"
                  style={{
                    fontFamily: "MerriweatherSans_700Bold",
                    fontSize: 14,
                    letterSpacing: -0.3,
                  }}
                >
                  {t("onboarding.noLoginRequired")}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Card 2 */}
          <Animated.View
            className="relative w-full max-w-xs"
            style={{
              opacity: card2Opacity,
              transform: [
                {
                  translateY: card2TranslateY,
                },
                {
                  scale: card2Scale,
                },
              ],
            }}
          >
            {/* Shadow layer */}
            <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-lg" />
            <View className="relative bg-pink-50 border-2 border-gray-900 rounded-lg px-4 py-3">
              <View className="flex-row items-center justify-center gap-2.5">
                <View className="bg-white border-2 border-gray-900 rounded-md p-1.5">
                  <FontAwesome5 name="heart" size={16} color="#000000" />
                </View>
                <Text
                  className="text-gray-900 font-bold flex-1 text-center"
                  style={{
                    fontFamily: "MerriweatherSans_700Bold",
                    fontSize: 14,
                    letterSpacing: -0.3,
                  }}
                >
                  {t("onboarding.playWithPartner")}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Card 3 */}
          <Animated.View
            className="relative w-full max-w-xs"
            style={{
              opacity: card3Opacity,
              transform: [
                {
                  translateY: card3TranslateY,
                },
                {
                  scale: card3Scale,
                },
              ],
            }}
          >
            {/* Shadow layer */}
            <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-lg" />
            <View className="relative bg-yellow-50 border-2 border-gray-900 rounded-lg px-4 py-3">
              <View className="flex-row items-center justify-center gap-2.5">
                <View className="bg-white border-2 border-gray-900 rounded-md p-1.5">
                  <FontAwesome5 name="lightbulb" size={16} color="#000000" />
                </View>
                <Text
                  className="text-gray-900 font-bold flex-1 text-center"
                  style={{
                    fontFamily: "MerriweatherSans_700Bold",
                    fontSize: 14,
                    letterSpacing: -0.3,
                  }}
                >
                  {t("onboarding.discoverEachOther")}
                </Text>
              </View>
            </View>
          </Animated.View>
        </View>
        {/* Start Button */}
        <View className="mt-3 items-center w-full px-3 ">
          <Animated.View
            className="relative w-full"
            style={{
              transform: [{ scale: buttonPulseAnim }],
              position: "relative",
            }}
          >
            {/* Shadow Layer */}
            <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-xl" />
            <View className="relative bg-white border-2 border-gray-900 rounded-xl py-4 px-12 w-full">
              <TouchableOpacity
                onPress={handleStartPress}
                activeOpacity={0.85}
                className="w-full"
              >
                <Text
                  className="text-gray-900 text-lg text-center font-bold"
                  style={{ fontFamily: "MerriweatherSans_700Bold" }}
                >
                  {t("onboarding.startPlayingNow")}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </View>
      <Image
        source={require("../../assets/images/options-screen-man.png")}
        style={{
          width: 200,
          height: 200,
          transform: [{ scaleX: -1 }, { rotate: "-16deg" }],
          marginLeft: "auto",
          marginBottom: -50,
          zIndex: 0,
        }}
        contentFit="contain"
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

      <Modal
        visible={showTermsModal}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View className="flex-1 bg-black/70 items-center justify-center px-6">
          <View className="w-full bg-white border-2 border-gray-900 rounded-2xl p-6 max-w-md">
            <Text
              className="text-gray-900 text-lg mb-4"
              style={{ fontFamily: "MerriweatherSans_700Bold" }}
            >
              {t("onboarding.termsModalTitle")}
            </Text>
            <Text
              className="text-gray-900 mb-4"
              style={{ fontFamily: "MerriweatherSans_400Regular" }}
            >
              {t("onboarding.termsModalIntroPrefix")}
              <Text
                className="text-pink-600 underline"
                onPress={() =>
                  handleOpenLink("https://knowusbetter.app/terms-of-service")
                }
              >
                {t("onboarding.termsOfUseLink")}
              </Text>
              {t("onboarding.termsModalIntroSeparator")}
              <Text
                className="text-pink-600 underline"
                onPress={() =>
                  handleOpenLink("https://knowusbetter.app/privacy-policy")
                }
              >
                {t("onboarding.privacyPolicyLink")}
              </Text>
              {t("onboarding.termsModalIntroSuffix")}
            </Text>
            <Text
              className="text-gray-900 mb-6"
              style={{ fontFamily: "MerriweatherSans_400Regular" }}
            >
              {t("onboarding.termsModalConductWarning")}
            </Text>
            {hasDeclinedTerms && (
              <Text
                className="text-red-600 mb-4"
                style={{ fontFamily: "MerriweatherSans_700Bold" }}
              >
                {t("onboarding.termsModalDeclineNotice")}
              </Text>
            )}
            <View className="flex-row gap-3">
              <View className="flex-1">
                <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-xl" />
                <TouchableOpacity
                  onPress={handleDeclineTerms}
                  activeOpacity={0.85}
                  className="relative bg-white border-2 border-gray-900 rounded-xl py-3"
                >
                  <Text
                    className="text-center text-gray-900 font-bold"
                    style={{ fontFamily: "MerriweatherSans_700Bold" }}
                  >
                    {t("onboarding.declineButton")}
                  </Text>
                </TouchableOpacity>
              </View>
              <View className="flex-1">
                <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-xl" />
                <TouchableOpacity
                  onPress={handleAcceptTerms}
                  activeOpacity={0.85}
                  className="relative border-2 border-gray-900 rounded-xl py-3"
                  style={{ backgroundColor: "#ff9f50" }}
                >
                  <Text
                    className="text-center text-white font-bold"
                    style={{ fontFamily: "MerriweatherSans_700Bold" }}
                  >
                    {t("onboarding.acceptButton")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default OnboardingPage;
