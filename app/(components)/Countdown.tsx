import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  AppState,
  AppStateStatus,
  Easing,
  Text,
  View,
} from "react-native";

interface CountdownProps {
  onComplete: () => void;
  duration?: number; // Duration in seconds, default is 3
  customText?: string; // Custom text to display, default is "Get Ready..."
  showFullScreen?: boolean; // Whether to show full screen countdown or inline, default is true
}

const Countdown: React.FC<CountdownProps> = ({
  onComplete,
  duration = 3,
  customText = "Get Ready...",
  showFullScreen = true,
}) => {
  const [currentNumber, setCurrentNumber] = useState(duration);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<number | null>(null);
  const isCompletedRef = useRef<boolean>(false);
  const durationRef = useRef<number>(duration);
  const onCompleteRef = useRef(onComplete);

  // Keep onComplete ref up to date
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Initialize with duration and start timer
  useEffect(() => {
    setCurrentNumber(duration);
    durationRef.current = duration;
    startTimeRef.current = Date.now();
    isCompletedRef.current = false;

    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Don't start timer if duration is 0 or less
    if (duration <= 0) {
      onCompleteRef.current();
      return;
    }

    // Function to update timer based on real elapsed time
    const updateTimer = () => {
      if (isCompletedRef.current) {
        return;
      }

      const now = Date.now();
      const elapsedMs = now - startTimeRef.current;
      const elapsedSeconds = Math.floor(elapsedMs / 1000);
      const remaining = Math.max(0, durationRef.current - elapsedSeconds);

      setCurrentNumber((prev) => {
        // Only update if the number actually changed
        if (prev !== remaining) {
          return remaining;
        }
        return prev;
      });

      if (remaining <= 0 && !isCompletedRef.current) {
        isCompletedRef.current = true;
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setTimeout(() => {
          onCompleteRef.current();
        }, 100);
      }
    };

    // Update timer immediately to ensure correct initial value
    updateTimer();

    // Start countdown timer - uses real elapsed time instead of intervals
    // This ensures timer continues even if app goes to background
    timerRef.current = setInterval(() => {
      updateTimer();
    }, 100); // Check every 100ms

    // Handle AppState changes - update timer immediately when app comes to foreground
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active" && !isCompletedRef.current) {
        // App came to foreground - immediately update timer with real elapsed time
        updateTimer();
        // Also update after a small delay to ensure accuracy
        setTimeout(() => {
          if (!isCompletedRef.current) {
            updateTimer();
          }
        }, 50);
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      subscription.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  // Animate number when it changes
  useEffect(() => {
    // Don't animate if number is 0 or less
    if (currentNumber <= 0) {
      return;
    }

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
  }, [currentNumber, scaleAnim, opacityAnim]);

  const containerStyle = showFullScreen
    ? "flex-1 bg-white items-center justify-center"
    : "items-center justify-center";

  // Full screen style (game start countdown)
  if (showFullScreen) {
    const numberSize = 120;
    const containerSize = 192;
    const borderWidth = 6;
    const borderRadius = 32;

    return (
      <View className={containerStyle}>
        {/* Animated Number with Neobrutalist Style - Square */}
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          }}
        >
          <View className="relative">
            {/* Shadow */}
            <View
              className="absolute bg-gray-900"
              style={{
                top: 8,
                left: 8,
                right: -8,
                bottom: -8,
                borderRadius: borderRadius + 2,
              }}
            />

            {/* Number Container - Square */}
            <View
              className="relative bg-[#ffe4e6] border-gray-900 items-center justify-center"
              style={{
                width: containerSize,
                height: containerSize,
                borderWidth: borderWidth,
                borderRadius: borderRadius,
              }}
            >
              <Text
                className="text-gray-900 font-bold"
                style={{
                  fontFamily: "MerriweatherSans_700Bold",
                  fontSize: numberSize,
                  lineHeight: numberSize,
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
            {customText}
          </Text>
        </Animated.View>
      </View>
    );
  }

  // Inline style (question timer) - Simple and clean, matching socials design
  return (
    <View className={containerStyle}>
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        }}
      >
        <View className="relative">
          {/* Shadow - subtle like socials */}
          <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-lg" />

          {/* Number Container - Simple white with border, matching socials style */}
          <View className="relative bg-white border-2 border-gray-900 rounded-lg w-14 h-14 items-center justify-center">
            <Text
              className="text-gray-900 font-bold"
              style={{
                fontFamily: "MerriweatherSans_700Bold",
                fontSize: 28,
                lineHeight: 28,
              }}
            >
              {currentNumber}
            </Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

export default Countdown;
