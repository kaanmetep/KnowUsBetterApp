import { LibreBaskerville_700Bold } from "@expo-google-fonts/libre-baskerville";
import {
  MerriweatherSans_400Regular,
  MerriweatherSans_700Bold,
} from "@expo-google-fonts/merriweather-sans";
import { useFonts } from "@expo-google-fonts/merriweather-sans/useFonts";
import {
  Entypo,
  Feather,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
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
import { useTranslation } from "../hooks/useTranslation";

interface OnboardingStep3Props {
  onNext: () => void;
  onPrevious: () => void;
}

const { width, height } = Dimensions.get("window");

const FLOATING_ICONS = [
  {
    name: "heart",
    lib: "FA5",
    size: 32,
    color: "#FFDECF",
    top: "18%",
    left: "6%",
    rotate: "-25deg",
  },
  {
    name: "kiss-wink-heart",
    lib: "FA5",
    size: 38,
    color: "#FFE4E1",
    top: "18%",
    left: "48%",
    rotate: "15deg",
  },
  {
    name: "leaf",
    lib: "Entypo",
    size: 28,
    color: "#E0F2F1",
    bottom: "18%",
    left: "8%",
    rotate: "-20deg",
  },
  {
    name: "ladybug",
    lib: "MCI",
    size: 34,
    color: "#FFEBEE",
    bottom: "20%",
    left: "45%",
    rotate: "10deg",
  },
  {
    name: "ghost",
    lib: "FA5",
    size: 24,
    color: "#F3E5F5",
    bottom: "12%",
    left: "28%",
    rotate: "-15deg",
  },
];

const OnboardingStep3 = ({ onNext, onPrevious }: OnboardingStep3Props) => {
  const { t } = useTranslation();
  const [fontsLoaded] = useFonts({
    MerriweatherSans_400Regular,
    MerriweatherSans_700Bold,
    LibreBaskerville_700Bold,
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;
  const imageFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(imageFadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  if (!fontsLoaded) return null;

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
        }}
      >
        <IconLib name={icon.name} size={icon.size} color={icon.color} />
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white relative">
      <StatusBar barStyle="dark-content" />

      {FLOATING_ICONS.map(renderIcon)}

      <View className="flex-1 items-center justify-center px-8">
        <Animated.View
          className="items-center justify-center mb-8"
          style={{
            opacity: imageFadeAnim,
            transform: [{ translateY: slideUpAnim }],
          }}
        >
          <Image
            source={require("../../assets/images/step3-together.webp")}
            style={{
              width: width * 0.45,
              height: height * 0.25,
            }}
            contentFit="contain"
          />
        </Animated.View>

        <Animated.View
          className="items-center w-full"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }],
          }}
        >
          <View className="self-center mb-5 bg-orange-50 px-4 py-2 rounded-xl border border-orange-100 shadow-sm shadow-orange-100">
            <Text
              className="text-orange-600 font-bold text-xs tracking-widest uppercase"
              style={{ fontFamily: "MerriweatherSans_700Bold" }}
            >
              {t("onboarding.step3Label")}
            </Text>
          </View>

          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            className="text-slate-900 text-4xl text-center mb-5 leading-tight shadow-sm"
            style={{ fontFamily: "LibreBaskerville_700Bold" }}
          >
            {t("onboarding.step3Title")}
          </Text>

          <Text
            className="text-slate-500 text-base text-center leading-7 px-4"
            style={{ fontFamily: "MerriweatherSans_400Regular" }}
          >
            {t("onboarding.step3Description")}
          </Text>
        </Animated.View>
      </View>

      <Animated.View
        className="absolute bottom-12 left-8 z-30"
        style={{ opacity: fadeAnim }}
      >
        <TouchableOpacity
          onPress={onPrevious}
          activeOpacity={0.8}
          className="w-16 h-16 bg-white border border-slate-200 rounded-full items-center justify-center shadow-xl shadow-slate-300"
        >
          <FontAwesome5 name="arrow-left" size={22} color="#1E293B" />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View
        className="absolute bottom-12 right-8 z-30"
        style={{ opacity: fadeAnim }}
      >
        <TouchableOpacity
          onPress={onNext}
          activeOpacity={0.8}
          className="px-6 py-4 bg-slate-900 rounded-full items-center justify-center shadow-xl shadow-slate-300"
        >
          <Text
            className="text-white font-bold text-base"
            style={{ fontFamily: "MerriweatherSans_700Bold" }}
          >
            {t("onboarding.startPlaying")}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default OnboardingStep3;
