import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Image, StyleSheet, Text, View } from "react-native";

interface LogoProps {
  marginTop?: number;
  size?: "default" | "small" | "tiny" | "mini";
}

const Logo = ({ marginTop = 0, size = "default" }: LogoProps) => {
  const [msgIndex, setMsgIndex] = useState(0);
  const messages = [
    "Test Your Connection Together",
    "Get to Know the Real You Two",
    "Answer, Laugh, and Connect",
  ];
  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const isSmall = size === "small";
  const isTiny = size === "tiny";
  const isMini = size === "mini";
  const logoSize = isMini
    ? { width: 25, height: 25 }
    : isTiny
    ? { width: 35, height: 35 }
    : isSmall
    ? { width: 50, height: 50 }
    : { width: 80, height: 70 };
  const titleSize = isMini
    ? "text-sm"
    : isTiny
    ? "text-xl"
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
          toValue: -12,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        const next = (msgIndex + 1) % messages.length;
        setMsgIndex(next);
        translateY.setValue(12);
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
      <Image
        source={require("../../assets/images/logo.png")}
        style={logoSize}
      />
      <Text
        className={`${titleSize} text-red-950 -mt-2`}
        style={{ fontFamily: "LibreBaskerville_700Bold" }}
      >
        KnowUsBetter
      </Text>
      {!isSmall && !isTiny && !isMini && (
        <Animated.Text
          className="mt-1 text-red-900"
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
