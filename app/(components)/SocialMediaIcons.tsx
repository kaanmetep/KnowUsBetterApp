import { FontAwesome5 } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useRef } from "react";
import {
  Animated,
  Easing,
  Linking,
  TouchableOpacity,
  View,
} from "react-native";

interface SocialMediaIconsProps {
  twitterUrl?: string;
  tiktokUrl?: string;
  instagramUrl?: string;
  position?: "above-logo" | "bottom-left" | "bottom-right";
}

const SocialMediaIcons: React.FC<SocialMediaIconsProps> = ({
  twitterUrl = "https://x.com/yourusername",
  tiktokUrl = "https://www.tiktok.com/@yourusername",
  instagramUrl = "https://www.instagram.com/yourusername",
  position = "above-logo",
}) => {
  // Social icons animation
  const socialIcon1Scale = useRef(new Animated.Value(1)).current;
  const socialIcon2Scale = useRef(new Animated.Value(1)).current;
  const socialIcon3Scale = useRef(new Animated.Value(1)).current;
  const socialIcon1Rotate = useRef(new Animated.Value(0)).current;
  const socialIcon2Rotate = useRef(new Animated.Value(0)).current;
  const socialIcon3Rotate = useRef(new Animated.Value(0)).current;
  // Continuous idle animations (subtle movement)
  const socialIcon1IdleY = useRef(new Animated.Value(0)).current;
  const socialIcon2IdleY = useRef(new Animated.Value(0)).current;
  const socialIcon3IdleY = useRef(new Animated.Value(0)).current;
  const socialIcon1IdleRotate = useRef(new Animated.Value(0)).current;
  const socialIcon2IdleRotate = useRef(new Animated.Value(0)).current;
  const socialIcon3IdleRotate = useRef(new Animated.Value(0)).current;

  // Continuous subtle idle animations
  const startIdleAnimations = useCallback(() => {
    // Icon 1 - Slight up/down and rotate
    const animateIcon1 = () => {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(socialIcon1IdleY, {
              toValue: -2,
              duration: 2500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(socialIcon1IdleY, {
              toValue: 2,
              duration: 2500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(socialIcon1IdleY, {
              toValue: 0,
              duration: 2500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(socialIcon1IdleRotate, {
              toValue: 3,
              duration: 3000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(socialIcon1IdleRotate, {
              toValue: -3,
              duration: 3000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(socialIcon1IdleRotate, {
              toValue: 0,
              duration: 3000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    };

    // Icon 2 - Slight up/down and rotate (different timing)
    const animateIcon2 = () => {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(socialIcon2IdleY, {
              toValue: 2,
              duration: 2700,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(socialIcon2IdleY, {
              toValue: -2,
              duration: 2700,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(socialIcon2IdleY, {
              toValue: 0,
              duration: 2700,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(socialIcon2IdleRotate, {
              toValue: -2.5,
              duration: 3200,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(socialIcon2IdleRotate, {
              toValue: 2.5,
              duration: 3200,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(socialIcon2IdleRotate, {
              toValue: 0,
              duration: 3200,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    };

    // Icon 3 - Slight up/down and rotate (different timing)
    const animateIcon3 = () => {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(socialIcon3IdleY, {
              toValue: -1.5,
              duration: 2900,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(socialIcon3IdleY, {
              toValue: 1.5,
              duration: 2900,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(socialIcon3IdleY, {
              toValue: 0,
              duration: 2900,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(socialIcon3IdleRotate, {
              toValue: 2,
              duration: 3100,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(socialIcon3IdleRotate, {
              toValue: -2,
              duration: 3100,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(socialIcon3IdleRotate, {
              toValue: 0,
              duration: 3100,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    };

    // Start animations with slight delays to make them feel more organic
    const idleTimeout1 = setTimeout(() => animateIcon1(), 800);
    const idleTimeout2 = setTimeout(() => animateIcon2(), 1000);
    const idleTimeout3 = setTimeout(() => animateIcon3(), 1200);

    // Return cleanup function
    return () => {
      clearTimeout(idleTimeout1);
      clearTimeout(idleTimeout2);
      clearTimeout(idleTimeout3);
    };
  }, []);

  // Function to start social icons entrance animation
  const startSocialIconsAnimation = useCallback(() => {
    // Initial values
    socialIcon1Scale.setValue(0);
    socialIcon2Scale.setValue(0);
    socialIcon3Scale.setValue(0);
    socialIcon1Rotate.setValue(0);
    socialIcon2Rotate.setValue(0);
    socialIcon3Rotate.setValue(0);

    // Staggered animations
    const timeout1 = setTimeout(() => {
      Animated.parallel([
        Animated.spring(socialIcon1Scale, {
          toValue: 1,
          tension: 50,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.timing(socialIcon1Rotate, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]).start();
    }, 100);

    const timeout2 = setTimeout(() => {
      Animated.parallel([
        Animated.spring(socialIcon2Scale, {
          toValue: 1,
          tension: 50,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.timing(socialIcon2Rotate, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]).start();
    }, 200);

    const timeout3 = setTimeout(() => {
      Animated.parallel([
        Animated.spring(socialIcon3Scale, {
          toValue: 1,
          tension: 50,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.timing(socialIcon3Rotate, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Start continuous idle animations after entrance
        startIdleAnimations();
      });
    }, 300);

    // Return cleanup function
    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
    };
  }, [
    socialIcon1Scale,
    socialIcon2Scale,
    socialIcon3Scale,
    socialIcon1Rotate,
    socialIcon2Rotate,
    socialIcon3Rotate,
    startIdleAnimations,
  ]);

  // Reset animation values when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Reset social icons idle animations
      socialIcon1IdleY.setValue(0);
      socialIcon2IdleY.setValue(0);
      socialIcon3IdleY.setValue(0);
      socialIcon1IdleRotate.setValue(0);
      socialIcon2IdleRotate.setValue(0);
      socialIcon3IdleRotate.setValue(0);

      // Start social icons entrance animation
      const cleanup = startSocialIconsAnimation();

      // Cleanup function
      return () => {
        if (cleanup) cleanup();
      };
    }, [
      socialIcon1IdleY,
      socialIcon2IdleY,
      socialIcon3IdleY,
      socialIcon1IdleRotate,
      socialIcon2IdleRotate,
      socialIcon3IdleRotate,
      startSocialIconsAnimation,
    ])
  );

  const handleSocialPress = async (url: string, iconScale: Animated.Value) => {
    // Press animation
    Animated.sequence([
      Animated.timing(iconScale, {
        toValue: 0.85,
        duration: 100,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(iconScale, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start();

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error("Error opening URL:", error);
    }
  };

  // Position-based styling
  const getContainerStyle = () => {
    switch (position) {
      case "bottom-left":
        return "absolute bottom-6 left-6 flex-row items-center gap-3";
      case "bottom-right":
        return "absolute bottom-6 right-6 flex-row items-center gap-3";
      case "above-logo":
      default:
        return "flex-row items-center justify-center gap-3 mb-3";
    }
  };

  return (
    <View className={getContainerStyle()}>
      {/* X (Twitter) */}
      <TouchableOpacity
        onPress={() => handleSocialPress(twitterUrl, socialIcon1Scale)}
        activeOpacity={1}
      >
        <Animated.View
          className="relative"
          style={{
            transform: [
              {
                translateY: socialIcon1IdleY,
              },
              {
                scale: socialIcon1Scale.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
              },
              {
                rotate: Animated.add(
                  socialIcon1Rotate.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-15, 0],
                  }),
                  socialIcon1IdleRotate
                ).interpolate({
                  inputRange: [-18, 6],
                  outputRange: ["-18deg", "6deg"],
                }),
              },
            ],
          }}
        >
          {/* Shadow layer */}
          <View className="absolute top-[1.5px] left-[1.5px] right-[-1.5px] bottom-[-1.5px] bg-gray-900 rounded-md" />
          <View className="relative bg-white border-[1.5px] border-gray-900 rounded-md w-10 h-10 items-center justify-center">
            <FontAwesome5 name="twitter" size={14} color="#000000" />
          </View>
        </Animated.View>
      </TouchableOpacity>

      {/* TikTok */}
      <TouchableOpacity
        onPress={() => handleSocialPress(tiktokUrl, socialIcon2Scale)}
        activeOpacity={1}
      >
        <Animated.View
          className="relative"
          style={{
            transform: [
              {
                translateY: socialIcon2IdleY,
              },
              {
                scale: socialIcon2Scale.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
              },
              {
                rotate: Animated.add(
                  socialIcon2Rotate.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-15, 0],
                  }),
                  socialIcon2IdleRotate
                ).interpolate({
                  inputRange: [-18, 5],
                  outputRange: ["-18deg", "5deg"],
                }),
              },
            ],
          }}
        >
          {/* Shadow layer */}
          <View className="absolute top-[1.5px] left-[1.5px] right-[-1.5px] bottom-[-1.5px] bg-gray-900 rounded-md" />
          <View className="relative bg-white border-[1.5px] border-gray-900 rounded-md w-10 h-10 items-center justify-center">
            <FontAwesome5 name="tiktok" size={14} color="#000000" />
          </View>
        </Animated.View>
      </TouchableOpacity>

      {/* Instagram */}
      <TouchableOpacity
        onPress={() => handleSocialPress(instagramUrl, socialIcon3Scale)}
        activeOpacity={1}
      >
        <Animated.View
          className="relative"
          style={{
            transform: [
              {
                translateY: socialIcon3IdleY,
              },
              {
                scale: socialIcon3Scale.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
              },
              {
                rotate: Animated.add(
                  socialIcon3Rotate.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-15, 0],
                  }),
                  socialIcon3IdleRotate
                ).interpolate({
                  inputRange: [-18, 5],
                  outputRange: ["-18deg", "5deg"],
                }),
              },
            ],
          }}
        >
          {/* Shadow layer */}
          <View className="absolute top-[1.5px] left-[1.5px] right-[-1.5px] bottom-[-1.5px] bg-gray-900 rounded-md" />
          <View className="relative bg-white border-[1.5px] border-gray-900 rounded-md w-10 h-10 items-center justify-center">
            <FontAwesome5 name="instagram" size={14} color="#000000" />
          </View>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

export default SocialMediaIcons;
