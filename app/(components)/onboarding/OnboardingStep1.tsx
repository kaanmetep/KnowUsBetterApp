import { LibreBaskerville_700Bold } from "@expo-google-fonts/libre-baskerville";
import {
  MerriweatherSans_400Regular,
  MerriweatherSans_600SemiBold,
  MerriweatherSans_700Bold,
} from "@expo-google-fonts/merriweather-sans";
import { useFonts } from "@expo-google-fonts/merriweather-sans/useFonts";
import { Feather } from "@expo/vector-icons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Image } from "expo-image";
import { useEffect, useRef, useState } from "react";
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
import {
  Category,
  getCategories,
  getCategoryLabel,
} from "../../services/categoryService";

interface OnboardingStep1Props {
  onNext: () => void;
}

const { width, height } = Dimensions.get("window");

const SHORT_LABELS: Record<string, string> = {
  "just friends": "Just Friends",
  "just met": "Just Met",
  "deep talk": "Deep Talk",
  "long term": "Long Term",
  "long-term": "Long Term",
  "intimacy": "Intimacy",
  "arkadaş": "Arkadaşlar",
  "yeni tanı": "Yeni Tanıştık",
  "derin sohbet": "Derin Sohbet",
  "uzun s": "Uzun Süreli",
  "yakın": "Yakınlık",
  "solo amig": "Solo Amigos",
  "recién": "Recién Conocidos",
  "charla": "Charla Profunda",
  "largo plazo": "Largo Plazo",
  "intimidad": "Intimidad",
};

const getShortCategoryLabel = (label: string): string => {
  const lower = label.toLowerCase().trim();
  for (const key of Object.keys(SHORT_LABELS)) {
    if (lower.includes(key)) return SHORT_LABELS[key];
  }
  const words = label.trim().split(/\s+/);
  return words.length > 2 ? words.slice(0, 2).join(" ") : label;
};

const OnboardingStep1 = ({ onNext }: OnboardingStep1Props) => {
  const { t } = useTranslation();
  const { selectedLanguage } = useLanguage();
  const [fontsLoaded] = useFonts({
    MerriweatherSans_400Regular,
    MerriweatherSans_600SemiBold,
    MerriweatherSans_700Bold,
    LibreBaskerville_700Bold,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideInAnim = useRef(new Animated.Value(-24)).current;
  const imageSlideAnim = useRef(new Animated.Value(40)).current;
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const catFade = useRef(new Animated.Value(1)).current;
  const catSlideY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideInAnim, {
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
      Animated.spring(imageSlideAnim, {
        toValue: 0,
        friction: 8,
        tension: 32,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    getCategories()
      .then((cats) => setCategories(cats))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (categories.length === 0) return;

    const interval = setInterval(() => {
      Animated.parallel([
        Animated.timing(catFade, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(catSlideY, {
          toValue: -8,
          duration: 300,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentIndex((prev) => (prev + 1) % categories.length);
        catSlideY.setValue(8);
        Animated.parallel([
          Animated.timing(catFade, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(catSlideY, {
            toValue: 0,
            duration: 300,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, 2200);

    return () => clearInterval(interval);
  }, [categories]);

  if (!fontsLoaded) return null;

  const cat = categories[currentIndex] ?? null;

  const renderIcon = (c: Category, size: number, color: string) =>
    c.iconType === "MaterialCommunityIcons" ? (
      <MaterialCommunityIcons
        name={c.iconName as any}
        size={size}
        color={color}
      />
    ) : (
      <FontAwesome6 name={c.iconName as any} size={size} color={color} />
    );

  return (
    <View style={{ flex: 1, backgroundColor: "#FFF8F5" }}>
      <StatusBar barStyle="dark-content" />

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
        {/* Left */}
        <Animated.View
          style={{
            width: "57%",
            height: "100%",
            justifyContent: "center",
            paddingLeft: 28,
            paddingRight: 10,
            paddingBottom: 100,
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
              {t("onboarding.step1Label")}
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
            {t("onboarding.step1Title")}
          </Text>

          {/* Description */}
          <Text
            style={{
              fontFamily: "MerriweatherSans_400Regular",
              fontSize: 13,
              color: "#64748B",
              lineHeight: 20,
              marginBottom: 6,
            }}
          >
            {t("onboarding.step1Description")}
          </Text>

          {/* Category showcase */}
          {cat ? (
            <Animated.View
              style={{
                marginTop: 12,
                opacity: catFade,
                transform: [{ translateY: catSlideY }],
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                backgroundColor: "white",
                borderRadius: 16,
                paddingVertical: 12,
                paddingHorizontal: 14,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.07,
                shadowRadius: 8,
                elevation: 3,
                borderWidth: 1,
                borderColor: "#F1EEF0",
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: cat.color + "20",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {renderIcon(cat, 18, cat.color)}
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: "MerriweatherSans_700Bold",
                    fontSize: 14,
                    color: "#1E293B",
                  }}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.75}
                >
                  {getShortCategoryLabel(
                    getCategoryLabel(cat, selectedLanguage),
                  )}
                </Text>
                <Text
                  style={{
                    fontFamily: "MerriweatherSans_400Regular",
                    fontSize: 11,
                    color: "#94A3B8",
                    marginTop: 2,
                  }}
                >
                  {currentIndex + 1} / {categories.length}
                </Text>
              </View>
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: cat.color,
                }}
              />
            </Animated.View>
          ) : (
            <View
              style={{
                height: 64,
                borderRadius: 16,
                backgroundColor: "#EDE8E8",
                opacity: 0.4,
              }}
            />
          )}
        </Animated.View>

        {/* Right: illustration */}
        <Animated.View
          style={{
            position: "absolute",
            right: 0,
            height: "100%",
            width: "47%",
            justifyContent: "center",
            alignItems: "flex-end",
            opacity: imageOpacity,
            transform: [{ translateX: imageSlideAnim }],
          }}
        >
          <Image
            source={require("../../../assets/images/step1-girl-2.png")}
            style={{
              width: width * 0.52,
              height: height * 0.6,
              marginRight: -width * 0.14,
              marginBottom: -height * -0.05,
            }}
            contentFit="contain"
          />
        </Animated.View>
      </View>
    </View>
  );
};

export default OnboardingStep1;
