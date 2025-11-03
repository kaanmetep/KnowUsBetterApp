import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Image, StyleSheet, Text, View } from "react-native";
const Logo = ({ marginTop = 0 }: { marginTop?: number }) => {
  const [msgIndex, setMsgIndex] = useState(0);
  const messages = [
    "Test Your Connection Together",
    "Get to Know the Real You Two",
    "Answer, Laugh, and Connect",
  ];
  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
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
        style={{ width: 80, height: 70 }}
      />
      <Text
        className="text-5xl text-red-950"
        style={{ fontFamily: "LibreBaskerville_700Bold" }}
      >
        KnowUsBetter
      </Text>
      <Animated.Text
        className="mt-2 text-red-900"
        style={{
          fontFamily: "MerriweatherSans_400Regular",
          opacity,
          transform: [{ translateY }],
        }}
      >
        {messages[msgIndex]}
      </Animated.Text>
    </View>
  );
};

export default Logo;

const styles = StyleSheet.create({});
