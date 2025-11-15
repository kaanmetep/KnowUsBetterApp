import { LibreBaskerville_700Bold } from "@expo-google-fonts/libre-baskerville";
import {
  MerriweatherSans_400Regular,
  MerriweatherSans_700Bold,
} from "@expo-google-fonts/merriweather-sans";
import { useFonts } from "@expo-google-fonts/merriweather-sans/useFonts";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  AppState,
  AppStateStatus,
  Easing,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { captureRef } from "react-native-view-shot";
import { useLanguage } from "../contexts/LanguageContext";
import { getQuestionText } from "../utils/questionUtils";
import Logo from "./Logo";

interface GameFinishedProps {
  matchScore: number;
  totalQuestions: number;
  percentage: number;
  completedRounds: any[];
  displayDuration: number; // Duration in seconds to display the results
  currentPlayerName: string;
  opponentPlayerName: string;
  onComplete: () => void;
}

const GameFinished: React.FC<GameFinishedProps> = ({
  matchScore,
  totalQuestions,
  percentage,
  completedRounds,
  displayDuration,
  currentPlayerName,
  opponentPlayerName,
  onComplete,
}) => {
  const { selectedLanguage } = useLanguage();
  const [timeRemaining, setTimeRemaining] = useState(displayDuration);
  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<number | null>(null);
  const isCompletedRef = useRef<boolean>(false);
  const durationRef = useRef<number>(displayDuration);
  const onCompleteRef = useRef(onComplete);
  const shareableContentRef = useRef<View>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const countdownTranslateY = useRef(new Animated.Value(0)).current;
  const countdownScale = useRef(new Animated.Value(1)).current;

  // Card entrance animations
  const matchCardOpacity = useRef(new Animated.Value(0)).current;
  const matchCardScale = useRef(new Animated.Value(0.4)).current;
  const matchCardTranslateY = useRef(new Animated.Value(30)).current;
  const roundsCardOpacity = useRef(new Animated.Value(0)).current;
  const roundsCardScale = useRef(new Animated.Value(0.4)).current;
  const roundsCardTranslateY = useRef(new Animated.Value(30)).current;

  // Percentage text blur animation - starts completely blurry
  const blurOverlayOpacity = useRef(new Animated.Value(1)).current;
  const blurIntensity = useRef(new Animated.Value(20)).current;
  const [currentBlurIntensity, setCurrentBlurIntensity] = useState(20);

  let [fontsLoaded] = useFonts({
    MerriweatherSans_400Regular,
    MerriweatherSans_700Bold,
    LibreBaskerville_700Bold,
  });

  // Keep onComplete ref up to date
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Timer countdown - uses Date.now() to continue even when app is in background
  useEffect(() => {
    setTimeRemaining(displayDuration);
    durationRef.current = displayDuration;
    startTimeRef.current = Date.now();
    isCompletedRef.current = false;

    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Don't start timer if duration is 0 or less
    if (displayDuration <= 0) {
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

      setTimeRemaining((prev) => {
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
          updateTimer();
        }, 10);
      }
    };

    const appStateSubscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      appStateSubscription.remove();
    };
  }, [displayDuration]);

  // Countdown text subtle floating animation
  useEffect(() => {
    const floatingAnimation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(countdownTranslateY, {
            toValue: -3,
            duration: 2200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(countdownScale, {
            toValue: 1.02,
            duration: 2200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(countdownTranslateY, {
            toValue: 0,
            duration: 2200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(countdownScale, {
            toValue: 1,
            duration: 2200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    floatingAnimation.start();
    return () => floatingAnimation.stop();
  }, [countdownTranslateY, countdownScale]);

  // Card entrance animations on mount
  useEffect(() => {
    // Small delay to let screen render first
    const initialDelay = setTimeout(() => {
      // Match Score Card animation
      Animated.sequence([
        // First phase: appear from blur
        Animated.parallel([
          Animated.timing(matchCardOpacity, {
            toValue: 0.3,
            duration: 600,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(matchCardScale, {
            toValue: 0.5,
            duration: 600,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        // Second phase: emerge clearly and grow
        Animated.parallel([
          Animated.timing(matchCardOpacity, {
            toValue: 1,
            duration: 1200,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(matchCardScale, {
            toValue: 1,
            duration: 1200,
            easing: Easing.out(Easing.back(1.5)),
            useNativeDriver: true,
          }),
          Animated.timing(matchCardTranslateY, {
            toValue: 0,
            duration: 1200,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      // Completed Rounds Card animation (staggered)
      const roundsDelay = setTimeout(() => {
        Animated.sequence([
          // First phase: appear from blur
          Animated.parallel([
            Animated.timing(roundsCardOpacity, {
              toValue: 0.3,
              duration: 600,
              easing: Easing.in(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(roundsCardScale, {
              toValue: 0.5,
              duration: 600,
              easing: Easing.in(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
          // Second phase: emerge clearly and grow
          Animated.parallel([
            Animated.timing(roundsCardOpacity, {
              toValue: 1,
              duration: 1200,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(roundsCardScale, {
              toValue: 1,
              duration: 1200,
              easing: Easing.out(Easing.back(1.5)),
              useNativeDriver: true,
            }),
            Animated.timing(roundsCardTranslateY, {
              toValue: 0,
              duration: 1200,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      }, 500);

      return () => clearTimeout(roundsDelay);
    }, 100);

    return () => clearTimeout(initialDelay);
  }, []);

  // Percentage blur animation - completely blurry start, slow reveal over 3-4 seconds
  useEffect(() => {
    // Start with maximum blur (opacity 1, intensity 20)
    blurOverlayOpacity.setValue(1);
    blurIntensity.setValue(20);
    setCurrentBlurIntensity(20);

    // Update blur intensity state when animated value changes
    const blurIntensityListener = blurIntensity.addListener(({ value }) => {
      setCurrentBlurIntensity(value);
    });

    const blurDelay = setTimeout(() => {
      // Slow reveal animation - blur gradually fades away
      Animated.parallel([
        Animated.timing(blurOverlayOpacity, {
          toValue: 0,
          duration: 4000,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(blurIntensity, {
          toValue: 0,
          duration: 4000,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false, // blurIntensity doesn't support native driver
        }),
      ]).start();
    }, 1800);

    return () => {
      clearTimeout(blurDelay);
      blurIntensity.removeListener(blurIntensityListener);
    };
  }, [blurOverlayOpacity, blurIntensity]);

  // Handle share functionality
  const handleShare = async () => {
    if (!shareableContentRef.current) {
      return;
    }

    try {
      setIsSharing(true);

      // Wait a bit for images to load before capturing
      await new Promise((resolve) => setTimeout(resolve, 500));

      const uri = await captureRef(shareableContentRef, {
        format: "png",
        quality: 1,
        result: "tmpfile",
        snapshotContentContainer: false,
      });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert(
          "Sharing not available",
          "Sharing is not available on this device."
        );
      }
    } catch (error: any) {
      console.error("Error sharing:", error);
      Alert.alert("Error", "Failed to share image. Please try again.");
    } finally {
      setIsSharing(false);
    }
  };

  // Handle save functionality
  const handleSave = async () => {
    if (!shareableContentRef.current) {
      return;
    }

    try {
      setIsSaving(true);

      // Request permission
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant permission to save images to your gallery."
        );
        return;
      }

      // Wait a bit for images to load before capturing
      await new Promise((resolve) => setTimeout(resolve, 500));

      const uri = await captureRef(shareableContentRef, {
        format: "png",
        quality: 1,
        result: "tmpfile",
        snapshotContentContainer: false,
      });

      // Save to media library
      const asset = await MediaLibrary.createAssetAsync(uri);

      // Try to create album, or add to existing one
      try {
        const album = await MediaLibrary.getAlbumAsync("KnowUsBetter");
        if (album) {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        } else {
          await MediaLibrary.createAlbumAsync("KnowUsBetter", asset, false);
        }
      } catch (error) {
        // If album creation fails, just save the asset
        console.log("Album creation failed, saving to gallery:", error);
      }

      Alert.alert("Success", "Results saved to gallery!");
    } catch (error: any) {
      console.error("Error saving:", error);
      Alert.alert("Error", "Failed to save image. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  // Determine result color and romantic quote based on percentage
  // High scores: Red tones | Mid scores: Blue tones | Low scores: Grey tones
  const getResultStyle = () => {
    if (percentage >= 90) {
      // Highest score - Deepest red tones (most intense)
      return {
        bgColor: "#f87171",
        gradientColors: ["#f87171", "#fee2e2"],
        romanticQuote:
          "You two think alike. That's rare. Don't take it for granted.",
        heartColor: "#dc2626",
        borderColor: "#fca5a5",
        shadowColor: "#fee2e2",
      };
    } else if (percentage >= 80) {
      // High score - Strong red tones
      return {
        bgColor: "#fca5a5",
        gradientColors: ["#fca5a5", "#fee2e2"],
        romanticQuote:
          "You're on the same wavelength. That's the foundation of something real.",
        heartColor: "#ef4444",
        borderColor: "#fecaca",
        shadowColor: "#fef2f2",
      };
    } else if (percentage >= 70) {
      // Good score - Medium red tones
      return {
        bgColor: "#fecaca",
        gradientColors: ["#fecaca", "#fef2f2"],
        romanticQuote:
          "You get each other. That's more than most people ever find.",
        heartColor: "#f87171",
        borderColor: "#fdd5d5",
        shadowColor: "#fef2f2",
      };
    } else if (percentage >= 60) {
      // Mid score - Blue tones
      return {
        bgColor: "#93c5fd",
        gradientColors: ["#93c5fd", "#dbeafe"],
        romanticQuote:
          "You've got enough in common to build on. The rest is up to you.",
        heartColor: "#2563eb",
        borderColor: "#bfdbfe",
        shadowColor: "#eff6ff",
      };
    } else if (percentage >= 50) {
      // Mid score - Light blue tones
      return {
        bgColor: "#bfdbfe",
        gradientColors: ["#bfdbfe", "#eff6ff"],
        romanticQuote:
          "You're different, but that can work. If you want it to.",
        heartColor: "#3b82f6",
        borderColor: "#dbeafe",
        shadowColor: "#f0f9ff",
      };
    } else if (percentage >= 40) {
      // Mid-Low score - Light grey tones
      return {
        bgColor: "#e2e8f0",
        gradientColors: ["#e2e8f0", "#f1f5f9"],
        romanticQuote:
          "You don't see eye to eye on much. That's okay. Opposites exist for a reason.",
        heartColor: "#64748b",
        borderColor: "#e2e8f0",
        shadowColor: "#f8fafc",
      };
    } else if (percentage >= 30) {
      // Low score - Medium grey tones
      return {
        bgColor: "#cbd5e1",
        gradientColors: ["#cbd5e1", "#e2e8f0"],
        romanticQuote:
          "You're pretty different. That's fine. Sometimes that's exactly what works.",
        heartColor: "#475569",
        borderColor: "#cbd5e1",
        shadowColor: "#f1f5f9",
      };
    } else {
      // Lowest score - Darkest grey tones (darkest as score decreases)
      return {
        bgColor: "#94a3b8",
        gradientColors: ["#94a3b8", "#cbd5e1"],
        romanticQuote:
          "You're pretty different. That's fine. Sometimes that's exactly what works.",
        heartColor: "#334155",
        borderColor: "#94a3b8",
        shadowColor: "#e2e8f0",
      };
    }
  };

  const resultStyle = getResultStyle();

  return (
    <View className="flex-1 bg-primary pt-16">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 mt-8 mb-6">
          {/* Back to Room Button */}
          <TouchableOpacity
            onPress={onComplete}
            activeOpacity={0.8}
            className="relative"
          >
            <View className="absolute top-[1px] left-[1px] right-[-1px] bottom-[-1px] bg-gray-900 rounded-lg" />
            <View className="relative bg-white border-2 border-gray-900 rounded-lg px-3 py-1.5 flex-row items-center gap-1.5">
              <FontAwesome6 name="arrow-left" size={12} color="#1f2937" />
              <Text
                className="text-gray-900 text-xs font-bold"
                style={{ fontFamily: "MerriweatherSans_700Bold" }}
              >
                Back to Room
              </Text>
            </View>
          </TouchableOpacity>
          {/* Countdown Text */}
          <View>
            <Animated.View
              style={{
                transform: [
                  { translateY: countdownTranslateY },
                  { scale: countdownScale },
                ],
              }}
            >
              <View className="relative">
                {/* Shadow */}
                <View className="absolute top-[1px] left-[1px] right-[-1px] bottom-[-1px] bg-gray-900 rounded-lg" />
                {/* Background Container */}
                <View className="relative border-2 border-gray-900 rounded-lg overflow-hidden">
                  <LinearGradient
                    colors={["#f0f9ff", "#f8fafc"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      top: 0,
                      bottom: 0,
                    }}
                  />
                  <View className="relative px-3 py-1.5">
                    <Text
                      className="text-gray-800 text-sm font-bold"
                      style={{
                        fontFamily: "MerriweatherSans_700Bold",
                      }}
                    >
                      Returning to room in {timeRemaining}s
                    </Text>
                  </View>
                </View>
              </View>
            </Animated.View>
          </View>
        </View>

        <View className="px-6">
          {/* Shareable Content - This is what gets captured for sharing */}
          <View
            ref={shareableContentRef}
            collapsable={false}
            className="bg-primary"
            style={{ backgroundColor: "#FAFAFA", padding: 6 }}
          >
            {/*Match Score Card */}
            <Animated.View
              className="mb-4 relative"
              style={{
                opacity: matchCardOpacity,
                transform: [
                  { scale: matchCardScale },
                  { translateY: matchCardTranslateY },
                ],
              }}
            >
              <View className="relative">
                <View
                  className="relative rounded-2xl overflow-hidden"
                  style={{
                    borderWidth: 3,
                    borderColor: "#000000",
                    shadowColor: "#000000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.12,
                    shadowRadius: 20,
                    elevation: 6,
                  }}
                >
                  <LinearGradient
                    colors={["#fef3f2", "#fff5f7"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      top: 0,
                      bottom: 0,
                    }}
                  />
                  <View className="relative p-8">
                    <View className="items-center mb-6">
                      <View className="relative items-center justify-center">
                        <View className="relative overflow-hidden rounded-2xl">
                          <LinearGradient
                            colors={
                              resultStyle.gradientColors as [string, string]
                            }
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{
                              position: "absolute",
                              left: 0,
                              right: 0,
                              top: 0,
                              bottom: 0,
                            }}
                          />
                          <View className="relative px-10 py-8">
                            <View className="relative items-center justify-center">
                              <View className="flex-row items-baseline justify-center gap-2">
                                <Text
                                  className="text-gray-900 text-7xl font-bold"
                                  style={{
                                    fontFamily: "MerriweatherSans_700Bold",
                                  }}
                                >
                                  {percentage}
                                </Text>
                                <Text
                                  className="text-gray-900 text-5xl font-bold"
                                  style={{
                                    fontFamily: "MerriweatherSans_700Bold",
                                  }}
                                >
                                  %
                                </Text>
                              </View>
                              <Text
                                className="text-gray-600 text-xs font-semibold mt-3 uppercase tracking-widest"
                                style={{
                                  fontFamily: "MerriweatherSans_700Bold",
                                  letterSpacing: 3,
                                }}
                              >
                                Match Score
                              </Text>
                            </View>

                            <Animated.View
                              style={{
                                position: "absolute",
                                top: -10,
                                left: -20,
                                right: -20,
                                bottom: -10,
                                opacity: blurOverlayOpacity,
                              }}
                              pointerEvents="none"
                            >
                              <BlurView
                                intensity={currentBlurIntensity}
                                tint="light"
                                style={{
                                  width: "100%",
                                  height: "100%",
                                }}
                              />
                            </Animated.View>
                          </View>
                        </View>
                      </View>
                    </View>

                    <View className="mb-4">
                      <Text
                        className="text-center text-red-950 text-base leading-6 italic px-2"
                        style={{ fontFamily: "MerriweatherSans_400Regular" }}
                      >
                        {resultStyle.romanticQuote}
                      </Text>
                    </View>

                    <View className="flex-row items-center justify-center mb-6">
                      <View className="h-px bg-gray-300 flex-1" />
                      <View className="mx-3">
                        <FontAwesome6
                          name="heart"
                          size={20}
                          color={resultStyle.heartColor}
                        />
                      </View>
                      <View className="h-px bg-gray-300 flex-1" />
                    </View>

                    <View className="bg-white/60 rounded-xl p-4 border-2 border-gray-900/20 mb-6">
                      <View className="items-center">
                        <Text
                          className="text-gray-900 text-lg font-bold mb-1"
                          style={{ fontFamily: "MerriweatherSans_700Bold" }}
                        >
                          {matchScore} / {totalQuestions} Matches
                        </Text>
                        <View className="flex-row items-center gap-2 mt-2">
                          <View className="relative">
                            <View className="absolute top-[1px] left-[1px] right-[-1px] bottom-[-1px] bg-gray-900 rounded-full" />
                          </View>
                          <Text
                            className="text-gray-700 text-sm font-semibold"
                            style={{ fontFamily: "MerriweatherSans_700Bold" }}
                          >
                            {currentPlayerName} & {opponentPlayerName}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View className="items-center">
                      <Logo size="mini" />
                    </View>
                  </View>
                </View>
              </View>
            </Animated.View>

            {/* Completed Rounds Summary */}
            {completedRounds && completedRounds.length > 0 && (
              <Animated.View
                className="mb-3"
                style={{
                  opacity: roundsCardOpacity,
                  transform: [
                    { scale: roundsCardScale },
                    { translateY: roundsCardTranslateY },
                  ],
                }}
              >
                <View className="relative">
                  <View
                    className="relative rounded-xl p-3 overflow-hidden"
                    style={{
                      borderWidth: 3,
                      borderColor: "#000000",
                      shadowColor: "#000000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.08,
                      shadowRadius: 12,
                      elevation: 3,
                    }}
                  >
                    <LinearGradient
                      colors={["#f0f9ff", "#f5f3ff"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0,
                      }}
                    />
                    <View className="relative gap-1.5">
                      {completedRounds.map((round: any, index: number) => (
                        <View
                          key={index}
                          className="flex-row items-start justify-between gap-2"
                        >
                          <Text
                            className="text-gray-900 text-xs flex-1"
                            style={{
                              fontFamily: "MerriweatherSans_400Regular",
                            }}
                            numberOfLines={2}
                          >
                            {round.question
                              ? getQuestionText(
                                  round.question,
                                  selectedLanguage
                                )
                              : round.questionText || `Question ${index + 1}`}
                          </Text>
                          <View className="relative flex-shrink-0">
                            <View
                              className={`relative rounded-md px-2 py-1 flex-row items-center gap-1 ${
                                round.isMatched
                                  ? "bg-[#ecfdf5]"
                                  : "bg-[#fef2f2]"
                              }`}
                              style={{
                                shadowColor: "#000000",
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.06,
                                shadowRadius: 4,
                                elevation: 2,
                              }}
                            >
                              <FontAwesome6
                                name={
                                  round.isMatched
                                    ? "heart-circle-check"
                                    : "heart-circle-xmark"
                                }
                                size={12}
                                color={round.isMatched ? "#16a34a" : "#991b1b"}
                              />
                              <Text
                                className="text-gray-900 text-xs font-bold"
                                style={{
                                  fontFamily: "MerriweatherSans_700Bold",
                                }}
                              >
                                {round.isMatched ? "Match" : "No Match"}
                              </Text>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </Animated.View>
            )}
          </View>

          {/* Save and Share Buttons (Not in shareable content) */}
          <View className="mb-3 flex-row gap-3">
            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={isSaving}
              className="relative flex-1"
              activeOpacity={0.8}
            >
              <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-xl" />
              <View
                className="relative bg-[#e0f2fe] border-2 border-gray-900 rounded-xl p-4 flex-row items-center justify-center gap-2"
                style={{ minHeight: 56 }}
              >
                <FontAwesome6 name="floppy-disk" size={18} color="#0369a1" />
                <Text
                  className="text-gray-900 text-base font-bold"
                  style={{ fontFamily: "MerriweatherSans_700Bold" }}
                >
                  {isSaving ? "Saving..." : "Save Results"}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Share Button */}
            <TouchableOpacity
              onPress={handleShare}
              disabled={isSharing}
              className="relative flex-1"
              activeOpacity={0.8}
            >
              <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-xl" />
              <View
                className="relative bg-[#fef3c7] border-2 border-gray-900 rounded-xl p-4 flex-row items-center justify-center gap-2"
                style={{ minHeight: 56 }}
              >
                <FontAwesome6 name="share-nodes" size={18} color="#991b1b" />
                <Text
                  className="text-gray-900 text-base font-bold"
                  style={{ fontFamily: "MerriweatherSans_700Bold" }}
                >
                  {isSharing ? "Preparing..." : "Share Results"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default GameFinished;
