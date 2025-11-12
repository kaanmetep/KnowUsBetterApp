import { Image } from "expo-image";
import { useEffect, useRef } from "react";
import { Animated, Easing, Text, View } from "react-native";

interface LoadingScreenProps {
  heartSource?: any;
  message?: string;
}

const LoadingScreen = ({
  heartSource = require("../../assets/images/heart-2.png"),
  message,
}: LoadingScreenProps) => {
  const heartScale = useRef(new Animated.Value(1)).current;
  const heartOpacity = useRef(new Animated.Value(0.8)).current;

  const dot1Opacity = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const heartbeatAnimation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.spring(heartScale, {
            toValue: 1.15,
            tension: 50,
            friction: 3,
            useNativeDriver: true,
          }),
          Animated.timing(heartOpacity, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.spring(heartScale, {
            toValue: 1,
            tension: 50,
            friction: 3,
            useNativeDriver: true,
          }),
          Animated.timing(heartOpacity, {
            toValue: 0.8,
            duration: 300,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(400),
      ])
    );

    const dotsAnimation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(dot1Opacity, {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(dot1Opacity, {
            toValue: 0.3,
            duration: 200,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(dot2Opacity, {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(dot2Opacity, {
            toValue: 0.3,
            duration: 200,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(dot3Opacity, {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(dot3Opacity, {
            toValue: 0.3,
            duration: 200,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(200),
      ])
    );

    heartbeatAnimation.start();
    dotsAnimation.start();

    return () => {
      heartbeatAnimation.stop();
      dotsAnimation.stop();
    };
  }, []);

  const displayMessage = message || "Preparing something special...";

  return (
    <View className="flex-1 bg-primary justify-center items-center px-8">
      <Animated.View
        style={{
          transform: [{ scale: heartScale }],
          opacity: heartOpacity,
        }}
      >
        <Image
          source={heartSource}
          style={{ width: 120, height: 120 }}
          contentFit="contain"
        />
      </Animated.View>

      <View className="mt-2 items-center">
        <Text
          className="text-lg text-red-950 text-center mb-4"
          style={{
            fontFamily: "MerriweatherSans_400Regular",
            letterSpacing: -0.3,
          }}
        >
          {displayMessage}
        </Text>

        <View className="flex-row items-center gap-2">
          <Animated.View
            className="w-2 h-2 rounded-full bg-red-600"
            style={{ opacity: dot1Opacity }}
          />
          <Animated.View
            className="w-2 h-2 rounded-full bg-red-600"
            style={{ opacity: dot2Opacity }}
          />
          <Animated.View
            className="w-2 h-2 rounded-full bg-red-600"
            style={{ opacity: dot3Opacity }}
          />
        </View>
      </View>
    </View>
  );
};

export default LoadingScreen;
