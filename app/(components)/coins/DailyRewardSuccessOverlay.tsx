import { FontAwesome5 } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Modal,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useCoins } from "../../contexts/CoinContext";
import { useTranslation } from "../../hooks/useTranslation";

const PARTICLE_COLORS = [
  "#F59E0B",
  "#FCD34D",
  "#FBBF24",
  "#FDE68A",
  "#D97706",
  "#F59E0B",
  "#FCD34D",
];
const PARTICLE_COUNT = 12;
const ANGLES = Array.from(
  { length: PARTICLE_COUNT },
  (_, i) => (360 / PARTICLE_COUNT) * i,
);
const DISTANCES = [75, 95, 82, 108, 78, 98, 88, 112, 74, 90, 100, 80];
const SIZES = [6, 8, 5, 7, 6, 9, 4, 7, 5, 8, 5, 6];

interface Props {
  visible: boolean;
  onDismiss: () => void;
}

const DailyRewardSuccessOverlay = ({ visible, onDismiss }: Props) => {
  const { t } = useTranslation();
  const { coins } = useCoins();

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const coinScale = useRef(new Animated.Value(0)).current;
  const coinGlow = useRef(new Animated.Value(0.3)).current;
  const glowScale = useRef(new Animated.Value(0.6)).current;
  const plusOneY = useRef(new Animated.Value(0)).current;
  const plusOneOpacity = useRef(new Animated.Value(0)).current;
  const plusOneScale = useRef(new Animated.Value(0.4)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentY = useRef(new Animated.Value(18)).current;
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const particles = useRef(
    ANGLES.map(() => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
    })),
  ).current;

  const dismiss = () => {
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(coinScale, {
        toValue: 0.5,
        duration: 280,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss());
  };

  useEffect(() => {
    if (!visible) return;

    backdropOpacity.setValue(0);
    coinScale.setValue(0);
    coinGlow.setValue(0.3);
    glowScale.setValue(0.6);
    plusOneY.setValue(0);
    plusOneOpacity.setValue(0);
    plusOneScale.setValue(0.4);
    contentOpacity.setValue(0);
    contentY.setValue(18);
    particles.forEach((p) => {
      p.x.setValue(0);
      p.y.setValue(0);
      p.opacity.setValue(0);
      p.scale.setValue(0);
    });

    Animated.timing(backdropOpacity, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();

    Animated.sequence([
      Animated.delay(60),
      Animated.spring(coinScale, {
        toValue: 1,
        friction: 4,
        tension: 55,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.sequence([
      Animated.delay(180),
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(coinGlow, {
              toValue: 1,
              duration: 750,
              useNativeDriver: true,
            }),
            Animated.timing(glowScale, {
              toValue: 1.25,
              duration: 750,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(coinGlow, {
              toValue: 0.25,
              duration: 750,
              useNativeDriver: true,
            }),
            Animated.timing(glowScale, {
              toValue: 0.85,
              duration: 750,
              useNativeDriver: true,
            }),
          ]),
        ]),
        { iterations: 5 },
      ),
    ]).start();

    particles.forEach((p, i) => {
      const angle = (ANGLES[i] * Math.PI) / 180;
      const dx = Math.cos(angle) * DISTANCES[i];
      const dy = Math.sin(angle) * DISTANCES[i];
      const delay = 100 + (i % 5) * 25;

      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.spring(p.scale, {
            toValue: 1,
            friction: 5,
            tension: 70,
            useNativeDriver: true,
          }),
          Animated.timing(p.opacity, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(p.x, {
            toValue: dx,
            duration: 700,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(p.y, {
            toValue: dy,
            duration: 700,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.delay(280),
            Animated.timing(p.opacity, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start();
    });

    Animated.sequence([
      Animated.delay(120),
      Animated.parallel([
        Animated.spring(plusOneScale, {
          toValue: 1,
          friction: 4,
          tension: 65,
          useNativeDriver: true,
        }),
        Animated.timing(plusOneOpacity, {
          toValue: 1,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(plusOneY, {
          toValue: -90,
          duration: 950,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    Animated.sequence([
      Animated.delay(580),
      Animated.timing(plusOneOpacity, {
        toValue: 0,
        duration: 320,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.sequence([
      Animated.delay(360),
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 380,
          useNativeDriver: true,
        }),
        Animated.spring(contentY, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    dismissTimerRef.current = setTimeout(dismiss, 2400);

    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent visible animationType="none" statusBarTranslucent>
      <TouchableWithoutFeedback onPress={dismiss}>
        <Animated.View
          style={{
            flex: 1,
            backgroundColor: "rgba(8, 3, 0, 0.82)",
            alignItems: "center",
            justifyContent: "center",
            opacity: backdropOpacity,
          }}
        >
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            {particles.map((p, i) => (
              <Animated.View
                key={i}
                style={{
                  position: "absolute",
                  width: SIZES[i],
                  height: SIZES[i],
                  borderRadius: SIZES[i] / 2,
                  backgroundColor: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
                  transform: [
                    { translateX: p.x },
                    { translateY: p.y },
                    { scale: p.scale },
                  ],
                  opacity: p.opacity,
                }}
              />
            ))}

            <Animated.View
              style={{
                position: "absolute",
                width: 160,
                height: 160,
                borderRadius: 80,
                backgroundColor: "rgba(245, 158, 11, 0.16)",
                transform: [{ scale: glowScale }],
                opacity: coinGlow,
              }}
            />

            <Animated.Text
              style={{
                position: "absolute",
                fontFamily: "MerriweatherSans_700Bold",
                fontSize: 48,
                color: "#FBBF24",
                textShadowColor: "rgba(245,158,11,0.65)",
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 14,
                transform: [{ translateY: plusOneY }, { scale: plusOneScale }],
                opacity: plusOneOpacity,
                zIndex: 10,
              }}
            >
              +1
            </Animated.Text>

            <Animated.View
              style={{
                width: 112,
                height: 112,
                borderRadius: 56,
                backgroundColor: "#FEF3C7",
                borderWidth: 3,
                borderColor: "#F59E0B",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#F59E0B",
                shadowOffset: { width: 0, height: 0 },
                shadowRadius: 28,
                shadowOpacity: coinGlow as any,
                elevation: 18,
                transform: [{ scale: coinScale }],
              }}
            >
              <FontAwesome5 name="coins" size={52} color="#D97706" />
            </Animated.View>
          </View>

          <Animated.View
            style={{
              alignItems: "center",
              marginTop: 36,
              opacity: contentOpacity,
              transform: [{ translateY: contentY }],
            }}
          >
            <Text
              style={{
                fontFamily: "MerriweatherSans_700Bold",
                fontSize: 24,
                color: "white",
                marginBottom: 10,
                textShadowColor: "rgba(245,158,11,0.25)",
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 8,
              }}
            >
              {t("dailyReward.claimTitle")}
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 7,
                backgroundColor: "rgba(255,255,255,0.07)",
                paddingHorizontal: 16,
                paddingVertical: 7,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: "rgba(245,158,11,0.25)",
              }}
            >
              <FontAwesome5 name="coins" size={14} color="#F59E0B" />
              <Text
                style={{
                  fontFamily: "MerriweatherSans_700Bold",
                  fontSize: 15,
                  color: "rgba(255,255,255,0.75)",
                }}
              >
                {coins}
              </Text>
              <Text
                style={{
                  fontFamily: "MerriweatherSans_400Regular",
                  fontSize: 13,
                  color: "rgba(255,255,255,0.45)",
                }}
              >
                coins
              </Text>
            </View>
          </Animated.View>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default DailyRewardSuccessOverlay;
