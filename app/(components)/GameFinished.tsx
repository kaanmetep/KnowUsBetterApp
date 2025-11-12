import {
  MerriweatherSans_400Regular,
  MerriweatherSans_700Bold,
} from "@expo-google-fonts/merriweather-sans";
import { useFonts } from "@expo-google-fonts/merriweather-sans/useFonts";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Image } from "expo-image";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  AppState,
  AppStateStatus,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { captureRef } from "react-native-view-shot";
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
  const [timeRemaining, setTimeRemaining] = useState(displayDuration);
  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<number | null>(null);
  const isCompletedRef = useRef<boolean>(false);
  const durationRef = useRef<number>(displayDuration);
  const onCompleteRef = useRef(onComplete);
  const shareableContentRef = useRef<View>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  let [fontsLoaded] = useFonts({
    MerriweatherSans_400Regular,
    MerriweatherSans_700Bold,
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
  const getResultStyle = () => {
    if (percentage >= 90) {
      return {
        bgColor: "#fce7f3",
        gradientColors: ["#fce7f3", "#f3e8ff"],
        romanticQuote:
          "You two think alike. That's rare. Don't take it for granted.",
        heartColor: "#ec4899",
      };
    } else if (percentage >= 80) {
      return {
        bgColor: "#d4f4dd",
        gradientColors: ["#d4f4dd", "#f0fdf4"],
        romanticQuote:
          "You're on the same wavelength. That's the foundation of something real.",
        heartColor: "#16a34a",
      };
    } else if (percentage >= 70) {
      return {
        bgColor: "#fef3c7",
        gradientColors: ["#fef3c7", "#fef9c3"],
        romanticQuote:
          "You get each other. That's more than most people ever find.",
        heartColor: "#f59e0b",
      };
    } else if (percentage >= 60) {
      return {
        bgColor: "#ffe4e6",
        gradientColors: ["#ffe4e6", "#fff1f2"],
        romanticQuote:
          "You've got enough in common to build on. The rest is up to you.",
        heartColor: "#f43f5e",
      };
    } else if (percentage >= 50) {
      return {
        bgColor: "#e0f2fe",
        gradientColors: ["#e0f2fe", "#f0f9ff"],
        romanticQuote:
          "You're different, but that can work. If you want it to.",
        heartColor: "#0ea5e9",
      };
    } else if (percentage >= 40) {
      return {
        bgColor: "#f3e8ff",
        gradientColors: ["#f3e8ff", "#faf5ff"],
        romanticQuote:
          "You don't see eye to eye on much. That's okay. Opposites exist for a reason.",
        heartColor: "#a855f7",
      };
    } else {
      return {
        bgColor: "#f1f5f9",
        gradientColors: ["#f1f5f9", "#f8fafc"],
        romanticQuote:
          "You're pretty different. That's fine. Sometimes that's exactly what works.",
        heartColor: "#64748b",
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
        <View className="flex-row items-center justify-between px-6 mt-3 mb-2">
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

          {/* Logo - Smaller and right aligned */}
          <View className="items-end">
            <Logo size="tiny" />
          </View>
        </View>

        <View className="px-6">
          {/* Countdown Text - Above Card (Not in shareable content) */}
          <View className="mb-4">
            <Text
              className="text-gray-900 text-sm font-bold"
              style={{ fontFamily: "MerriweatherSans_700Bold" }}
            >
              Returning to room in {timeRemaining}s
            </Text>
          </View>

          {/* Shareable Content - This is what gets captured for sharing */}
          <View
            ref={shareableContentRef}
            collapsable={false}
            className="bg-primary"
            style={{ backgroundColor: "#FAFAFA" }}
          >
            {/*Match Score Card */}
            <View className="mb-4 relative">
              {/* Girl Image - Top Left */}
              <Image
                source={require("../../assets/images/options-screen-girl.png")}
                style={{
                  width: 200,
                  height: 200,
                  transform: [{ scaleX: -1 }, { rotate: "142deg" }],
                  position: "absolute",
                  top: -50,
                  left: -30,
                  zIndex: 1,
                }}
                contentFit="contain"
              />
              {/* Man Image - Top Right */}
              <Image
                source={require("../../assets/images/options-screen-man.png")}
                style={{
                  width: 200,
                  height: 200,
                  transform: [{ scaleX: -1 }, { rotate: "-16deg" }],
                  position: "absolute",
                  top: -50,
                  right: -30,
                  zIndex: 1,
                }}
                contentFit="contain"
              />
              <View className="relative" style={{ zIndex: 2 }}>
                <View className="absolute top-[3px] left-[3px] right-[-3px] bottom-[-3px] bg-red-50 rounded-2xl" />
                <View className="relative border-4 border-gray-900 rounded-2xl overflow-hidden">
                  <View className="relative p-8">
                    {/* Percentage */}
                    <View className="items-center ">
                      <View className="flex-row items-baseline justify-center gap-2 mb-2">
                        <Text
                          className="text-gray-900 text-6xl font-bold"
                          style={{ fontFamily: "MerriweatherSans_700Bold" }}
                        >
                          {percentage}
                        </Text>
                        <Text
                          className="text-gray-900 text-4xl font-bold"
                          style={{ fontFamily: "MerriweatherSans_700Bold" }}
                        >
                          %
                        </Text>
                      </View>
                    </View>

                    {/* Decorative Line */}
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

                    {/* Romantic Quote */}
                    <View className="mb-6">
                      <Text
                        className="text-center text-red-950 text-base leading-6 italic px-2"
                        style={{ fontFamily: "MerriweatherSans_400Regular" }}
                      >
                        "{resultStyle.romanticQuote}"
                      </Text>
                    </View>

                    {/* Match Details */}
                    <View className="bg-white/60 rounded-xl p-4 border-2 border-gray-900/20">
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
                  </View>
                </View>
              </View>
            </View>

            {/* Completed Rounds Summary - Compact (Original Design) */}
            {completedRounds && completedRounds.length > 0 && (
              <View className="mb-3">
                <View className="relative">
                  <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-xl" />
                  <View className="relative bg-white border-2 border-gray-900 rounded-xl p-3">
                    <View className="gap-1.5">
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
                            {round.question?.text ||
                              round.questionText ||
                              `Question ${index + 1}`}
                          </Text>
                          <View className="relative flex-shrink-0">
                            <View className="absolute top-[1px] left-[1px] right-[-1px] bottom-[-1px] bg-gray-900 rounded-md" />
                            <View
                              className={`relative border border-gray-900 rounded-md px-2 py-1 flex-row items-center gap-1 ${
                                round.isMatched
                                  ? "bg-[#d4f4dd]"
                                  : "bg-[#ffe4e6]"
                              }`}
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
              </View>
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
