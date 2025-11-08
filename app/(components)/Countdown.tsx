import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Text, View } from "react-native";

interface CountdownProps {
  onComplete: () => void;
}

const Countdown: React.FC<CountdownProps> = ({ onComplete }) => {
  const [currentNumber, setCurrentNumber] = useState(3);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateNumber = () => {
      // Reset animations
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);

      // Animate: start small, grow big, then shrink slightly
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.3,
            duration: 300,
            easing: Easing.out(Easing.back(2)),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.delay(300),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    };

    animateNumber();

    // Change number every second
    const timer = setTimeout(() => {
      if (currentNumber > 1) {
        setCurrentNumber(currentNumber - 1);
      } else {
        // After 1, complete countdown
        setTimeout(() => {
          onComplete();
        }, 800);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [currentNumber, scaleAnim, opacityAnim, onComplete]);

  return (
    <View className="flex-1 bg-white items-center justify-center">
      {/* Animated Number with Neobrutalist Style */}
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        }}
      >
        <View className="relative">
          {/* Shadow */}
          <View className="absolute top-[8px] left-[8px] right-[-8px] bottom-[-8px] bg-gray-900 rounded-[32px]" />

          {/* Number Container */}
          <View className="relative bg-[#ffe4e6] border-[6px] border-gray-900 rounded-[32px] w-48 h-48 items-center justify-center">
            <Text
              className="text-gray-900 font-bold"
              style={{
                fontFamily: "MerriweatherSans_700Bold",
                fontSize: 120,
                lineHeight: 120,
              }}
            >
              {currentNumber}
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Bottom Text */}
      <Animated.View
        style={{
          opacity: opacityAnim,
        }}
        className="mt-12"
      >
        <Text
          className="text-gray-600 text-2xl text-center"
          style={{
            fontFamily: "MerriweatherSans_400Regular",
          }}
        >
          Get Ready...
        </Text>
      </Animated.View>
    </View>
  );
};

export default Countdown;
