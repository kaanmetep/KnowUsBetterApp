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
import { useTranslation } from "../../hooks/useTranslation";

interface OnboardingStep3Props {
  onNext: () => void;
  onPrevious: () => void;
}

const { width, height } = Dimensions.get("window");

const OnboardingStep3 = ({ onNext, onPrevious }: OnboardingStep3Props) => {
  const { t } = useTranslation();
  const [fontsLoaded] = useFonts({
    MerriweatherSans_400Regular,
    MerriweatherSans_700Bold,
    LibreBaskerville_700Bold,
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(24)).current;
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const imageSlideAnim = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(imageOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(imageSlideAnim, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
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

      {/* Start Playing button */}
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
      </Animated.View>

      {/* Content: image top, text below */}
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 32,
          paddingBottom: 100,
        }}
      >
        {/* Image */}
        <Animated.View
          style={{
            opacity: imageOpacity,
            transform: [{ translateY: imageSlideAnim }],
            marginBottom: 24,
          }}
        >
          <Image
            source={require("../../../assets/images/step3-together.webp")}
            style={{ width: width * 0.55, height: height * 0.32 }}
            contentFit="contain"
          />
        </Animated.View>

        {/* Text block */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }],
            width: "100%",
            alignItems: "center",
          }}
        >
          {/* Badge */}
          <View
            style={{
              marginBottom: 12,
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
              {t("onboarding.step3Label")}
            </Text>
          </View>

          {/* Title */}
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={{
              fontFamily: "LibreBaskerville_700Bold",
              fontSize: 30,
              color: "#1E293B",
              marginBottom: 24,
              textAlign: "center",
            }}
          >
            {t("onboarding.step3Title")}
          </Text>

          {/* Description */}
          <Text
            style={{
              fontFamily: "MerriweatherSans_400Regular",
              fontSize: 13,
              color: "#64748B",
              lineHeight: 20,
              textAlign: "center",
            }}
          >
            {t("onboarding.step3Description")}
          </Text>
        </Animated.View>
      </View>
    </View>
  );
};

export default OnboardingStep3;
