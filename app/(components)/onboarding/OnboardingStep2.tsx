import { LibreBaskerville_700Bold } from "@expo-google-fonts/libre-baskerville";
import {
  MerriweatherSans_400Regular,
  MerriweatherSans_700Bold,
} from "@expo-google-fonts/merriweather-sans";
import { useFonts } from "@expo-google-fonts/merriweather-sans/useFonts";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLanguage } from "../../contexts/LanguageContext";
import { useTranslation } from "../../hooks/useTranslation";

const CODE_IMAGES = {
  en: require("../../../assets/images/code-en.jpeg"),
  tr: require("../../../assets/images/code-tr.jpeg"),
  es: require("../../../assets/images/code-es.jpeg"),
};

interface OnboardingStep2Props {
  onNext: () => void;
  onPrevious: () => void;
}

const { width, height } = Dimensions.get("window");

const OnboardingStep2 = ({ onNext, onPrevious }: OnboardingStep2Props) => {
  const { t } = useTranslation();
  const { selectedLanguage } = useLanguage();
  const [fontsLoaded] = useFonts({
    MerriweatherSans_400Regular,
    MerriweatherSans_700Bold,
    LibreBaskerville_700Bold,
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideInAnim = useRef(new Animated.Value(24)).current;
  const imageSlideAnim = useRef(new Animated.Value(-40)).current;
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const codeSlideAnim = useRef(new Animated.Value(60)).current;
  const codeOpacity = useRef(new Animated.Value(0)).current;
  const breatheAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideInAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(imageOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(imageSlideAnim, { toValue: 0, friction: 8, tension: 32, useNativeDriver: true }),
      Animated.timing(codeOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(codeSlideAnim, {
        toValue: 0,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(breatheAnim, {
            toValue: 1,
            duration: 1600,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(breatheAnim, {
            toValue: 0,
            duration: 1600,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  if (!fontsLoaded) return null;

  return (
    <View style={{ flex: 1, backgroundColor: "#FFF8F5" }}>
      <StatusBar barStyle="dark-content" />

      {/* Back button */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          position: "absolute",
          bottom: 44,
          left: 32,
          zIndex: 20,
        }}
      >
        <TouchableOpacity
          onPress={onPrevious}
          activeOpacity={0.85}
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: "white",
            borderWidth: 1,
            borderColor: "#E2E8F0",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <Feather name="arrow-left" size={22} color="#1E293B" />
        </TouchableOpacity>
      </Animated.View>

      {/* Next button */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          position: "absolute",
          bottom: 44,
          right: 32,
          zIndex: 20,
        }}
      >
        <TouchableOpacity
          onPress={onNext}
          activeOpacity={0.85}
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: "#C94B6A",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#C94B6A",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <Feather name="arrow-right" size={22} color="white" />
        </TouchableOpacity>
      </Animated.View>

      {/* Step dots */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          position: "absolute",
          bottom: 56,
          left: 0,
          right: 0,
          flexDirection: "row",
          justifyContent: "center",
          gap: 8,
          zIndex: 10,
        }}
      >
        <View
          style={{
            width: 7,
            height: 7,
            borderRadius: 4,
            backgroundColor: "#E8C4CE",
          }}
        />
        <View
          style={{
            width: 22,
            height: 7,
            borderRadius: 4,
            backgroundColor: "#C94B6A",
          }}
        />
        <View
          style={{
            width: 7,
            height: 7,
            borderRadius: 4,
            backgroundColor: "#E8C4CE",
          }}
        />
      </Animated.View>

      <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
        {/* Left: illustration */}
        <Animated.View
          style={{
            position: "absolute",
            left: 0,
            height: "100%",
            width: "47%",
            justifyContent: "center",
            alignItems: "flex-start",
            opacity: imageOpacity,
            transform: [{ translateX: imageSlideAnim }],
          }}
        >
          <Image
            source={require("../../../assets/images/step2-boy.webp")}
            style={{
              width: width * 0.52,
              height: height * 0.62,
              marginLeft: -width * 0.14,
            }}
            contentFit="contain"
          />
        </Animated.View>

        {/* Right: text content */}
        <Animated.View
          style={{
            width: "57%",
            height: "100%",
            justifyContent: "center",
            paddingRight: 28,
            paddingLeft: 10,
            paddingBottom: 100,
            marginLeft: "43%",
            opacity: fadeAnim,
            transform: [{ translateX: slideInAnim }],
          }}
        >
          {/* Badge */}
          <View
            style={{
              alignSelf: "flex-start",
              marginBottom: 14,
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 8,
              backgroundColor: "#FFF0F3",
              borderWidth: 1,
              borderColor: "#F5C2CE",
            }}
          >
            <Text
              style={{
                fontFamily: "MerriweatherSans_700Bold",
                fontSize: 10,
                color: "#C94B6A",
                letterSpacing: 1.2,
                textTransform: "uppercase",
              }}
            >
              {t("onboarding.step2Label")}
            </Text>
          </View>

          {/* Title */}
          <Text
            numberOfLines={2}
            adjustsFontSizeToFit
            style={{
              fontFamily: "LibreBaskerville_700Bold",
              fontSize: 32,
              color: "#1E293B",
              lineHeight: 40,
              marginBottom: 10,
            }}
          >
            {t("onboarding.step2Title")}
          </Text>

          {/* Description */}
          <Text
            style={{
              fontFamily: "MerriweatherSans_400Regular",
              fontSize: 13,
              color: "#64748B",
              lineHeight: 20,
              marginBottom: 16,
            }}
          >
            {t("onboarding.step2Description")}
          </Text>

          {/* Code preview image */}
          <Animated.View
            style={{
              opacity: codeOpacity,
              transform: [
                { translateY: codeSlideAnim },
                {
                  translateY: breatheAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -4],
                  }),
                },
                {
                  scale: breatheAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.015],
                  }),
                },
              ],
              shadowColor: "#C94B6A",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.15,
              shadowRadius: 16,
              elevation: 6,
              borderRadius: 14,
              overflow: "hidden",
            }}
          >
            <Image
              source={CODE_IMAGES[selectedLanguage] ?? CODE_IMAGES.en}
              style={{
                width: "100%",
                height: 90,
              }}
              contentFit="cover"
            />
          </Animated.View>
        </Animated.View>
      </View>
    </View>
  );
};

export default OnboardingStep2;
