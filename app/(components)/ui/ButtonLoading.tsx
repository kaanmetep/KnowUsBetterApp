import React, { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";

interface ButtonLoadingProps {
  size?: number;
  color?: string;
  style?: "dots" | "spinner" | "hearts";
}

const ButtonLoading: React.FC<ButtonLoadingProps> = ({
  size = 16,
  color = "#991b1b",
  style = "dots",
}) => {
  if (style === "dots") {
    return <ColorfulDotsLoading size={size} />;
  }
  if (style === "hearts") {
    return <HeartsLoading size={size} />;
  }
  return <SpinnerLoading size={size} color={color} />;
};

// Simple pulsing dots animation (gray)
const ColorfulDotsLoading: React.FC<{ size: number }> = ({ size }) => {
  const dot1 = useRef(new Animated.Value(0.4)).current;
  const dot2 = useRef(new Animated.Value(0.4)).current;
  const dot3 = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const createAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0.4,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
    };

    const anim1 = createAnimation(dot1, 0);
    const anim2 = createAnimation(dot2, 200);
    const anim3 = createAnimation(dot3, 400);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, [dot1, dot2, dot3]);

  const dotSize = size;
  const dotSpacing = size * 0.5;
  const dotColor = "#6b7280"; // gray-500

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: dotSpacing,
      }}
    >
      <Animated.View
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: dotSize / 2,
          backgroundColor: dotColor,
          opacity: dot1,
          transform: [
            {
              scale: dot1.interpolate({
                inputRange: [0.4, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
        }}
      />
      <Animated.View
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: dotSize / 2,
          backgroundColor: dotColor,
          opacity: dot2,
          transform: [
            {
              scale: dot2.interpolate({
                inputRange: [0.4, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
        }}
      />
      <Animated.View
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: dotSize / 2,
          backgroundColor: dotColor,
          opacity: dot3,
          transform: [
            {
              scale: dot3.interpolate({
                inputRange: [0.4, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
        }}
      />
    </View>
  );
};

// Hearts pulsing animation
const HeartsLoading: React.FC<{ size: number }> = ({ size }) => {
  const heart1 = useRef(new Animated.Value(0.5)).current;
  const heart2 = useRef(new Animated.Value(0.5)).current;
  const heart3 = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const createPulseAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0.5,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
    };

    const anim1 = createPulseAnimation(heart1, 0);
    const anim2 = createPulseAnimation(heart2, 200);
    const anim3 = createPulseAnimation(heart3, 400);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, [heart1, heart2, heart3]);

  const heartSize = size;
  const spacing = size * 0.5;

  const createHeart = (animValue: Animated.Value, color: string) => {
    const scale = animValue.interpolate({
      inputRange: [0.5, 1],
      outputRange: [0.8, 1.2],
    });

    const opacity = animValue.interpolate({
      inputRange: [0.5, 1],
      outputRange: [0.6, 1],
    });

    return (
      <Animated.Text
        style={{
          fontSize: heartSize,
          transform: [{ scale }],
          opacity,
        }}
      >
        💖
      </Animated.Text>
    );
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing,
      }}
    >
      {createHeart(heart1, "#ffe4e6")}
      {createHeart(heart2, "#dbeafe")}
      {createHeart(heart3, "#ffe4e6")}
    </View>
  );
};

// Spinning circle animation
const SpinnerLoading: React.FC<{ size: number; color: string }> = ({
  size,
  color,
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    spin.start();

    return () => {
      spin.stop();
    };
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 2,
        borderColor: color,
        borderTopColor: "transparent",
        transform: [{ rotate: spin }],
      }}
    />
  );
};

export default ButtonLoading;
