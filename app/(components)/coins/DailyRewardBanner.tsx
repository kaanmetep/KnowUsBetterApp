import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ButtonLoading from "../ui/ButtonLoading";
import { useCoins } from "../../contexts/CoinContext";
import { DAILY_REWARD_INTERVAL_MS } from "../../services/dailyRewardService";
import { useTranslation } from "../../hooks/useTranslation";
import DailyRewardSuccessOverlay from "./DailyRewardSuccessOverlay";

const formatCountdown = (ms: number): string => {
  if (ms <= 0) return "00:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
};

const DailyRewardBanner = () => {
  const { t } = useTranslation();
  const {
    dailyRewardEligible,
    nextDailyRewardAt,
    claimDailyReward,
    checkDailyReward,
  } = useCoins();

  const [isClaiming, setIsClaiming] = useState(false);
  const [claimResult, setClaimResult] = useState<"success" | "error" | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [countdown, setCountdown] = useState<string>("00:00:00");
  const [barContainerWidth, setBarContainerWidth] = useState(0);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const coinBounceY = useRef(new Animated.Value(0)).current;
  const coinScale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.4)).current;
  const shimmerX = useRef(new Animated.Value(-60)).current;
  const waitPulse = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animationsRef = useRef<Animated.CompositeAnimation[]>([]);

  const stopAnimations = () => {
    animationsRef.current.forEach((a) => a.stop());
    animationsRef.current = [];
  };

  const animateToProgress = (toValue: number) => {
    Animated.timing(progressAnim, {
      toValue,
      duration: 700,
      useNativeDriver: false,
    }).start();
  };

  // Coin animations — eligible vs. waiting
  useEffect(() => {
    stopAnimations();

    if (dailyRewardEligible) {
      coinBounceY.setValue(0);
      coinScale.setValue(1);
      waitPulse.setValue(1);

      const bounce = Animated.loop(
        Animated.sequence([
          Animated.timing(coinBounceY, {
            toValue: -3,
            duration: 700,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(coinBounceY, {
            toValue: 0,
            duration: 700,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );

      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(coinScale, {
            toValue: 1.06,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(coinScale, {
            toValue: 1,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );

      const glow = Animated.loop(
        Animated.sequence([
          Animated.timing(glowOpacity, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.35,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      );

      bounce.start();
      pulse.start();
      glow.start();
      animationsRef.current = [bounce, pulse, glow];
    } else {
      coinBounceY.setValue(0);
      glowOpacity.setValue(0.4);

      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(waitPulse, {
            toValue: 0.88,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(waitPulse, {
            toValue: 1,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      animationsRef.current = [pulse];
    }

    return stopAnimations;
  }, [dailyRewardEligible]);

  // Bar shimmer when eligible and bar container is measured
  useEffect(() => {
    if (!dailyRewardEligible || barContainerWidth === 0) return;

    shimmerX.setValue(-60);
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerX, {
          toValue: barContainerWidth + 60,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(600),
        Animated.timing(shimmerX, {
          toValue: -60,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();
    return () => shimmer.stop();
  }, [dailyRewardEligible, barContainerWidth]);

  // Countdown ticker
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (dailyRewardEligible) {
      animateToProgress(1);
      return;
    }

    if (nextDailyRewardAt) {
      const tick = () => {
        const remaining = nextDailyRewardAt.getTime() - Date.now();
        if (remaining <= 0) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          animateToProgress(1);
          checkDailyReward();
        } else {
          const elapsed = DAILY_REWARD_INTERVAL_MS - remaining;
          animateToProgress(
            Math.max(0, Math.min(1, elapsed / DAILY_REWARD_INTERVAL_MS))
          );
          setCountdown(formatCountdown(remaining));
        }
      };
      tick();
      intervalRef.current = setInterval(tick, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [dailyRewardEligible, nextDailyRewardAt]);

  const handleClaim = async () => {
    if (isClaiming) return;
    setIsClaiming(true);
    setClaimResult(null);
    setClaimError(null);
    const result = await claimDailyReward();
    setIsClaiming(false);
    if (result.success) {
      setShowSuccessOverlay(true);
    } else {
      setClaimError(result.error ?? "unknown");
      setClaimResult("error");
      setTimeout(() => {
        setClaimResult(null);
        setClaimError(null);
      }, 5000);
    }
  };

  if (!dailyRewardEligible && !nextDailyRewardAt) return null;

  const barWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <>
    <TouchableOpacity
      activeOpacity={dailyRewardEligible ? 0.82 : 1}
      onPress={dailyRewardEligible ? handleClaim : undefined}
      disabled={isClaiming}
      style={{
        width: 285,
        borderRadius: 16,
        backgroundColor: "white",
        shadowColor: "#F59E0B",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 10,
        elevation: 6,
        borderWidth: 1.5,
        borderColor: "#FDE68A",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 7,
          paddingBottom: 5,
        }}
      >
        {/* Animated coin circle */}
        <Animated.View
          style={{
            transform: [
              { translateY: coinBounceY },
              { scale: dailyRewardEligible ? coinScale : waitPulse },
            ],
            marginRight: 10,
          }}
        >
          <Animated.View
            style={{
              width: 33,
              height: 33,
              borderRadius: 17,
              backgroundColor: "#FEF3C7",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1.5,
              borderColor: "#FDE68A",
              shadowColor: "#F59E0B",
              shadowOffset: { width: 0, height: 0 },
              shadowRadius: 8,
              shadowOpacity: glowOpacity as any,
            }}
          >
            <FontAwesome5 name="coins" size={18} color="#D97706" />
          </Animated.View>

          {/* +1 badge */}
          <View
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              backgroundColor: "#F59E0B",
              borderRadius: 8,
              minWidth: 18,
              height: 18,
              paddingHorizontal: 4,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1.5,
              borderColor: "white",
              shadowColor: "#D97706",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.35,
              shadowRadius: 3,
              elevation: 3,
            }}
          >
            <Text
              style={{
                fontFamily: "MerriweatherSans_700Bold",
                fontSize: 9,
                color: "white",
                lineHeight: 12,
              }}
            >
              +1
            </Text>
          </View>
        </Animated.View>

        {/* Right side */}
        <View style={{ flex: 1 }}>
          {/* Label + badge row */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                fontFamily: "MerriweatherSans_700Bold",
                fontSize: 11,
                color: "#92400E",
                flex: 1,
              }}
            >
              {t("dailyReward.labelFull")}
            </Text>
            {dailyRewardEligible && (
              <View
                style={{
                  backgroundColor: "#FEF3C7",
                  borderRadius: 4,
                  paddingHorizontal: 5,
                  paddingVertical: 1.5,
                }}
              >
                <Text
                  style={{
                    fontFamily: "MerriweatherSans_700Bold",
                    fontSize: 8,
                    color: "#D97706",
                  }}
                >
                  {t("dailyReward.ready")}
                </Text>
              </View>
            )}
          </View>

          {/* Progress bar */}
          <View
            style={{
              height: 5,
              backgroundColor: "#F1F5F9",
              borderRadius: 3,
              overflow: "hidden",
            }}
            onLayout={(e) =>
              setBarContainerWidth(e.nativeEvent.layout.width)
            }
          >
            <Animated.View
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: barWidth,
                backgroundColor: "#F59E0B",
                borderRadius: 3,
              }}
            />
            {/* Shimmer overlay when full */}
            {dailyRewardEligible && (
              <Animated.View
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  width: 60,
                  transform: [{ translateX: shimmerX }],
                }}
              >
                <LinearGradient
                  colors={[
                    "transparent",
                    "rgba(255,255,255,0.55)",
                    "transparent",
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ flex: 1 }}
                />
              </Animated.View>
            )}
          </View>

          {/* Countdown below bar */}
          {!dailyRewardEligible && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 3,
              }}
            >
              <Text
                style={{
                  fontFamily: "MerriweatherSans_400Regular",
                  fontSize: 10,
                  color: "#CBD5E1",
                  marginRight: 4,
                }}
              >
                {t("dailyReward.remaining")}
              </Text>
              <Text
                style={{
                  fontFamily: "MerriweatherSans_700Bold",
                  fontSize: 11,
                  color: "#D97706",
                }}
              >
                {countdown}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Claim button — only when eligible */}
      {dailyRewardEligible && (
        <View style={{ marginHorizontal: 7, marginBottom: 6, marginTop: 1 }}>
          <LinearGradient
            colors={
              claimResult === "error"
                ? ["#FEF2F2", "#FECACA"]
                : ["#FEF3C7", "#FDE68A"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              borderRadius: 8,
              height: 26,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isClaiming ? (
              <ButtonLoading size={14} style="spinner" color="#D97706" />
            ) : claimResult === "error" ? (
              <>
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={13}
                  color="#DC2626"
                  style={{ marginRight: 5 }}
                />
                <Text
                  style={{
                    fontFamily: "MerriweatherSans_700Bold",
                    fontSize: 10,
                    color: "#DC2626",
                  }}
                  numberOfLines={1}
                >
                  {claimError ?? "error"}
                </Text>
              </>
            ) : (
              <>
                <FontAwesome5
                  name="coins"
                  size={11}
                  color="#D97706"
                  style={{ marginRight: 5 }}
                />
                <Text
                  style={{
                    fontFamily: "MerriweatherSans_700Bold",
                    fontSize: 11,
                    color: "#92400E",
                  }}
                >
                  {t("dailyReward.claimButton")}
                </Text>
              </>
            )}
          </LinearGradient>
        </View>
      )}
    </TouchableOpacity>

    <DailyRewardSuccessOverlay
      visible={showSuccessOverlay}
      onDismiss={() => setShowSuccessOverlay(false)}
    />
    </>
  );
};

export default DailyRewardBanner;
