import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Image, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "../hooks/useTranslation";

interface LogoProps {
  marginTop?: number;
  size?: "default" | "small" | "xs" | "tiny" | "mini";
}

const Logo = ({ marginTop = 0, size = "default" }: LogoProps) => {
  const { t, selectedLanguage } = useTranslation();
  const [msgIndex, setMsgIndex] = useState(0);

  // Get messages from translations based on selected language
  const messages = useMemo(() => {
    return [t("logo.message1"), t("logo.message2"), t("logo.message3")];
  }, [t, selectedLanguage]);

  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const isSmall = size === "small";
  const isXs = size === "xs";
  const isTiny = size === "tiny";
  const isMini = size === "mini";

  const logoSize = isMini
    ? { width: 25, height: 25 }
    : isTiny
    ? { width: 35, height: 35 }
    : isXs
    ? { width: 42, height: 42 }
    : isSmall
    ? { width: 50, height: 50 }
    : { width: 80, height: 70 };

  const titleSize = isMini
    ? "text-sm"
    : isTiny
    ? "text-xl"
    : isXs
    ? "text-2xl"
    : isSmall
    ? "text-3xl"
    : "text-5xl";

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -8,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        const next = (msgIndex + 1) % messages.length;
        setMsgIndex(next);
        translateY.setValue(8);
        opacity.setValue(0);
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 0,
            duration: 400,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [messages.length, msgIndex, opacity, translateY]);

  return (
    <View className="flex items-center" style={{ marginTop }}>
      {/* Logo Image */}
      <View
        className="shadow-xl shadow-rose-200/50"
        style={{ borderRadius: 20 }}
      >
        <Image
          source={require("../../assets/images/logo.png")}
          style={logoSize}
          resizeMode="contain"
        />
      </View>

      {/* Main Title */}
      <Text
        className={`${titleSize} text-slate-800 -mt-2`}
        style={{
          fontFamily: "LibreBaskerville_700Bold",
          textShadowColor: "rgba(226, 232, 240, 0.5)",
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 2,
        }}
      >
        KnowUsBetter
      </Text>

      {/* Animated Subtitle */}
      {!isSmall && !isTiny && !isMini && (
        <Animated.Text
          className={`mt-1 text-slate-500 font-medium tracking-wide ${
            isXs ? "text-xs" : "text-sm"
          }`}
          style={{
            fontFamily: "MerriweatherSans_400Regular",
            opacity,
            transform: [{ translateY }],
          }}
        >
          {messages[msgIndex]}
        </Animated.Text>
      )}
    </View>
  );
};

export default Logo;

const styles = StyleSheet.create({});
