import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  AppState,
  AppStateStatus,
  Easing,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "../../hooks/useTranslation";

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

  // --- FULL SCREEN RENDER (Game Start) ---
  if (showFullScreen) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#FFF8F5",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <StatusBar barStyle="dark-content" />

        {/* Category badge — top */}
        {categoryName && (
          <View style={{ position: "absolute", top: 80, alignItems: "center" }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                backgroundColor: "white",
                borderRadius: 20,
                paddingVertical: 10,
                paddingHorizontal: 18,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 3,
                borderWidth: 1,
                borderColor: "#F1EEF0",
              }}
            >
              <FontAwesome6 name="tag" size={12} color="#C94B6A" />
              <Text
                style={{
                  fontFamily: "MerriweatherSans_700Bold",
                  fontSize: 13,
                  color: "#1E293B",
                  letterSpacing: 0.4,
                }}
              >
                {categoryName}
              </Text>
            </View>
          </View>
        )}

        {/* Center: animated number */}
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
            alignItems: "center",
          }}
        >
          {/* Outer soft ring */}
          <View
            style={{
              width: 210,
              height: 210,
              borderRadius: 105,
              backgroundColor: "#FFF0F3",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Inner white circle */}
            <View
              style={{
                width: 162,
                height: 162,
                borderRadius: 81,
                backgroundColor: "white",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#C94B6A",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.14,
                shadowRadius: 24,
                elevation: 12,
              }}
            >
              <Text
                style={{
                  fontFamily: "MerriweatherSans_700Bold",
                  fontSize: 96,
                  lineHeight: 96,
                  color: "#1E293B",
                  includeFontPadding: false,
                  textAlign: "center",
                }}
              >
                {currentNumber}
              </Text>
            </View>
          </View>

          {/* "Get Ready" label */}
          <Text
            style={{
              fontFamily: "MerriweatherSans_400Regular",
              fontSize: 18,
              color: "#94A3B8",
              marginTop: 32,
              letterSpacing: 0.4,
            }}
          >
            {displayText}
          </Text>
        </Animated.View>

        {/* Cancel button — bottom */}
        {onCancel && (
          <View style={{ position: "absolute", bottom: 60, alignItems: "center" }}>
            <TouchableOpacity
              onPress={onCancel}
              activeOpacity={0.7}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 36,
                borderRadius: 20,
                backgroundColor: "white",
                borderWidth: 1,
                borderColor: "#F1F5F9",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <Text
                style={{
                  fontFamily: "MerriweatherSans_700Bold",
                  fontSize: 14,
                  color: "#94A3B8",
                }}
              >
                {t("common.cancel")}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  const containerStyle = "items-center justify-center";

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
