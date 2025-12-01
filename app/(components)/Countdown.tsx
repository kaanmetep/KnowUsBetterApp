import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  AppState,
  AppStateStatus,
  Easing,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "../hooks/useTranslation";

interface CountdownProps {
  onComplete: () => void;
  duration?: number;
  customText?: string;
  showFullScreen?: boolean;
  onCancel?: () => void;
  categoryName?: string;
}

const Countdown: React.FC<CountdownProps> = ({
  onComplete,
  duration = 3,
  customText,
  showFullScreen = true,
  onCancel,
  categoryName,
}) => {
  const { t } = useTranslation();
  const displayText = customText || t("countdown.getReady");
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

  // Initialize and Logic
  useEffect(() => {
    setCurrentNumber(duration);
    durationRef.current = duration;
    startTimeRef.current = Date.now();
    isCompletedRef.current = false;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (duration <= 0) {
      onCompleteRef.current();
      return;
    }

    const updateTimer = () => {
      if (isCompletedRef.current) return;

      const now = Date.now();
      const elapsedMs = now - startTimeRef.current;
      const elapsedSeconds = Math.floor(elapsedMs / 1000);
      const remaining = Math.max(0, durationRef.current - elapsedSeconds);

      setCurrentNumber((prev) => {
        if (prev !== remaining) return remaining;
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

    updateTimer();

    timerRef.current = setInterval(() => {
      updateTimer();
    }, 100);

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active" && !isCompletedRef.current) {
        updateTimer();
        setTimeout(() => {
          if (!isCompletedRef.current) updateTimer();
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
  }, [duration]);

  // Animation Logic
  useEffect(() => {
    if (currentNumber <= 0) return;

    const animateNumber = () => {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);

      Animated.parallel([
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 300,
            easing: Easing.out(Easing.back(1.5)),
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
          Animated.delay(400),
          Animated.timing(opacityAnim, {
            toValue: 0.8,
            duration: 200,
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

  // --- FULL SCREEN RENDER (Game Start) ---
  if (showFullScreen) {
    const numberSize = 100;
    const containerSize = 180;

    return (
      <View className={containerStyle}>
        {/* Soft UI Background Pulse */}
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          }}
        >
          {/* Main Floating Circle */}
          <View
            className="bg-white items-center justify-center shadow-2xl shadow-blue-200/50"
            style={{
              width: containerSize,
              height: containerSize,
              borderRadius: containerSize / 2,
              borderWidth: 8,
              borderColor: "#eff6ff", // Very subtle blue ring
            }}
          >
            <Text
              className="text-slate-800 font-bold"
              style={{
                fontFamily: "MerriweatherSans_700Bold",
                fontSize: numberSize,
                lineHeight: numberSize,
                textAlign: "center",
                includeFontPadding: false,
              }}
            >
              {currentNumber}
            </Text>
          </View>
        </Animated.View>

        {/* Bottom Text */}
        <Animated.View
          style={{ opacity: opacityAnim }}
          className="mt-10 px-8 items-center"
        >
          <Text
            className="text-slate-400 text-2xl text-center font-medium"
            style={{ fontFamily: "MerriweatherSans_400Regular" }}
          >
            {displayText}
          </Text>
        </Animated.View>

        {/* Category Pill */}
        {categoryName && (
          <View className="mt-8">
            <View className="bg-slate-50 rounded-full px-6 py-3 border border-slate-100 shadow-sm flex-row items-center gap-2">
              <FontAwesome6 name="tag" size={14} color="#64748B" />
              <Text
                className="text-slate-600 text-sm font-bold uppercase tracking-wide"
                style={{ fontFamily: "MerriweatherSans_700Bold" }}
              >
                {t("countdown.categoryLabel", { category: categoryName })}
              </Text>
            </View>
          </View>
        )}

        {/* Cancel Button */}
        {onCancel && (
          <View className="mt-8">
            <TouchableOpacity
              onPress={onCancel}
              activeOpacity={0.7}
              className="px-8 py-3 rounded-2xl bg-red-50 border border-red-100"
            >
              <Text
                className="text-red-500 text-center font-bold"
                style={{ fontFamily: "MerriweatherSans_700Bold" }}
              >
                {t("common.cancel")}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  // --- INLINE RENDER (Top Left Timer) ---
  return (
    <View className={containerStyle}>
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
        }}
      >
        {/* Circle */}
        <View className="w-12 h-12 bg-white rounded-full items-center justify-center shadow-md shadow-slate-200/50 border border-slate-100">
          <Text
            className={`font-bold text-lg ${
              currentNumber <= 3 ? "text-red-500" : "text-blue-500"
            }`}
            style={{
              fontFamily: "MerriweatherSans_700Bold",
            }}
          >
            {currentNumber}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

export default Countdown;
