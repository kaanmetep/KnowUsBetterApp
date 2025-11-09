import { LibreBaskerville_700Bold } from "@expo-google-fonts/libre-baskerville";
import {
  MerriweatherSans_400Regular,
  MerriweatherSans_700Bold,
} from "@expo-google-fonts/merriweather-sans";
import { useFonts } from "@expo-google-fonts/merriweather-sans/useFonts";
import { FontAwesome5 } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import LanguageSelector from "../(components)/LanguageSelector";
import Logo from "../(components)/Logo";
import SocialMediaIcons from "../(components)/SocialMediaIcons";
const OnboardingPage = () => {
  const router = useRouter();
  const { width, height } = Dimensions.get("window");
  let [fontsLoaded] = useFonts({
    MerriweatherSans_400Regular,
    MerriweatherSans_700Bold,
    LibreBaskerville_700Bold,
  });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedHeart, setSelectedHeart] = useState<any>(null);
  // Bottom ticker
  const scrollViewRef = useRef<ScrollView>(null);
  // Button pulse animation
  const buttonPulseAnim = useRef(new Animated.Value(1)).current;
  // Heart transition animation
  const heartScale = useRef(new Animated.Value(1)).current;
  const heartOpacity = useRef(new Animated.Value(1)).current;
  const heartTranslateX = useRef(new Animated.Value(0)).current;
  const heartTranslateY = useRef(new Animated.Value(0)).current;
  // Card carousel animation - infinite horizontal scroll
  const cardScrollX = useRef(new Animated.Value(0)).current;
  // Feature cards animation
  const card1Scale = useRef(new Animated.Value(1)).current;
  const card2Scale = useRef(new Animated.Value(1)).current;
  const card3Scale = useRef(new Animated.Value(1)).current;
  const card1Opacity = useRef(new Animated.Value(1)).current;
  const card2Opacity = useRef(new Animated.Value(1)).current;
  const card3Opacity = useRef(new Animated.Value(1)).current;
  const card1TranslateY = useRef(new Animated.Value(0)).current;
  const card2TranslateY = useRef(new Animated.Value(0)).current;
  const card3TranslateY = useRef(new Animated.Value(0)).current;

  const tickerSentences = [
    "Would you ask your partner for their Instagram password?",
    "Would you accept it if your partner were a popular person?",
    "Do long-distance relationships work?",
    "Would you pay your partner's debt?",
  ];
  const tickerText = tickerSentences.join("     ");
  const hearts = useMemo(() => {
    let seed = 15;
    const heartsCount = 2;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    const sources = [
      require("../../assets/images/heart-1.png"),
      require("../../assets/images/heart-2.png"),
      require("../../assets/images/heart-3.png"),
    ];
    const items = Array.from({ length: heartsCount }).map((_, i) => {
      const source = sources[i % sources.length];
      const size = Math.floor(40 + random() * 80); // 40-120px
      // Sadece ekranın alt yarısında üret (height / 2'den başla)
      const top = Math.floor(height / 2 + random() * (height / 2 - size));
      const left = Math.floor(random() * (width - size));
      const rotateDeg = Math.floor(-30 + random() * 60); // -30 to 30
      const opacity = 0.15 + random() * 0.25; // 0.15 - 0.4
      return { id: i, source, size, top, left, rotateDeg, opacity };
    });
    return items;
  }, [width, height]);

  useEffect(() => {
    const scrollSpeed = 40; // px per second
    let animationFrame: number;
    let lastTime = Date.now();
    let currentScroll = 0;

    const animate = () => {
      const now = Date.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      currentScroll += scrollSpeed * delta;

      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ x: currentScroll, animated: false });
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, []);

  // Button pulse animation
  useEffect(() => {
    // Start pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(buttonPulseAnim, {
          toValue: 1.08,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(buttonPulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
    };
  }, []);

  // Infinite continuous horizontal carousel animation
  useEffect(() => {
    const cardWidth = 280;
    const cardGap = 24;
    const cardTotalWidth = cardWidth + cardGap;
    const totalCards = tickerSentences.length;
    const oneSetWidth = totalCards * cardTotalWidth;

    // Track current scroll position
    let currentScrollPosition = -oneSetWidth;
    cardScrollX.setValue(currentScrollPosition);

    // Start continuous animation
    const animate = () => {
      // Move one set forward
      const targetPosition = currentScrollPosition - oneSetWidth;

      Animated.timing(cardScrollX, {
        toValue: targetPosition,
        duration: totalCards * 4000, // 4 seconds per card (slower)
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => {
        // Update current position
        currentScrollPosition = targetPosition;

        // If we've scrolled 2 sets, reset to middle set (seamless loop)
        if (currentScrollPosition <= -oneSetWidth * 2) {
          currentScrollPosition = -oneSetWidth;
          cardScrollX.setValue(currentScrollPosition);
        }

        // Continue animation
        animate();
      });
    };

    // Start the animation
    animate();
  }, [cardScrollX, tickerSentences.length]);

  // Feature cards entrance animation
  useEffect(() => {
    // Initial values
    card1Scale.setValue(0.95);
    card2Scale.setValue(0.95);
    card3Scale.setValue(0.95);
    card1Opacity.setValue(0);
    card2Opacity.setValue(0);
    card3Opacity.setValue(0);
    card1TranslateY.setValue(20);
    card2TranslateY.setValue(20);
    card3TranslateY.setValue(20);

    // Staggered animations
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(card1Scale, {
          toValue: 1,
          tension: 50,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.timing(card1Opacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(card1TranslateY, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }, 100);

    setTimeout(() => {
      Animated.parallel([
        Animated.spring(card2Scale, {
          toValue: 1,
          tension: 50,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.timing(card2Opacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(card2TranslateY, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }, 200);

    setTimeout(() => {
      Animated.parallel([
        Animated.spring(card3Scale, {
          toValue: 1,
          tension: 50,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.timing(card3Opacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(card3TranslateY, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }, 300);
  }, []);

  // Reset animation values when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Reset heart animation values
      heartScale.setValue(1);
      heartOpacity.setValue(1);
      heartTranslateX.setValue(0);
      heartTranslateY.setValue(0);

      // Reset card animation values
      const cardWidth = 280;
      const cardGap = 24;
      const cardTotalWidth = cardWidth + cardGap;
      const totalCards = tickerSentences.length;
      const oneSetWidth = totalCards * cardTotalWidth;
      cardScrollX.setValue(-oneSetWidth);

      // Reset transition states
      setIsTransitioning(false);
      setSelectedHeart(null);

      // Reset feature cards animation
      card1Scale.setValue(0.95);
      card2Scale.setValue(0.95);
      card3Scale.setValue(0.95);
      card1Opacity.setValue(0);
      card2Opacity.setValue(0);
      card3Opacity.setValue(0);
      card1TranslateY.setValue(20);
      card2TranslateY.setValue(20);
      card3TranslateY.setValue(20);

      // Start feature cards entrance animation
      setTimeout(() => {
        Animated.parallel([
          Animated.spring(card1Scale, {
            toValue: 1,
            tension: 50,
            friction: 3,
            useNativeDriver: true,
          }),
          Animated.timing(card1Opacity, {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(card1TranslateY, {
            toValue: 0,
            duration: 400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start();
      }, 100);

      setTimeout(() => {
        Animated.parallel([
          Animated.spring(card2Scale, {
            toValue: 1,
            tension: 50,
            friction: 3,
            useNativeDriver: true,
          }),
          Animated.timing(card2Opacity, {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(card2TranslateY, {
            toValue: 0,
            duration: 400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start();
      }, 200);

      setTimeout(() => {
        Animated.parallel([
          Animated.spring(card3Scale, {
            toValue: 1,
            tension: 50,
            friction: 3,
            useNativeDriver: true,
          }),
          Animated.timing(card3Opacity, {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(card3TranslateY, {
            toValue: 0,
            duration: 400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start();
      }, 300);
    }, [
      heartScale,
      heartOpacity,
      heartTranslateX,
      heartTranslateY,
      cardScrollX,
      card1Scale,
      card2Scale,
      card3Scale,
      card1Opacity,
      card2Opacity,
      card3Opacity,
      card1TranslateY,
      card2TranslateY,
      card3TranslateY,
    ])
  );

  const handleStartPress = () => {
    // Take the first heart to animate. (Changing screen animation)
    const heartToAnimate = hearts[0];
    if (!heartToAnimate) return;

    setSelectedHeart(heartToAnimate);
    setIsTransitioning(true);

    // The heart's current position to the center of the screen
    const targetX = width / 2 - heartToAnimate.left - heartToAnimate.size / 2;
    const targetY = height / 2 - heartToAnimate.top - heartToAnimate.size / 2;
    const targetScale = (Math.max(width, height) * 5) / heartToAnimate.size;

    // Delay the transition to the next screen.
    setTimeout(() => {
      router.push("/StartOptionsScreen");
    }, 400);

    Animated.parallel([
      Animated.timing(heartScale, {
        toValue: targetScale,
        duration: 1000,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(heartTranslateX, {
        toValue: targetX,
        duration: 1000,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(heartTranslateY, {
        toValue: targetY,
        duration: 1000,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(heartOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  };

  if (!fontsLoaded) {
    return null;
  }
  return (
    <View className="flex-1 bg-primary ">
      {/* Language Selector */}
      <LanguageSelector position="top-right" />

      <View
        pointerEvents="none"
        className="absolute inset-0"
        style={{ zIndex: 1 }}
      >
        {hearts.map((h) => {
          const isSelectedHeart =
            isTransitioning && selectedHeart && h.id === selectedHeart.id;

          if (isSelectedHeart) {
            return (
              <Animated.View
                key={h.id}
                style={{
                  position: "absolute",
                  top: h.top,
                  left: h.left,
                  width: h.size,
                  height: h.size,
                  opacity: heartOpacity,
                  transform: [
                    { translateX: heartTranslateX },
                    { translateY: heartTranslateY },
                    { scale: heartScale },
                    { rotate: `${h.rotateDeg}deg` },
                  ],
                  zIndex: 1,
                }}
              >
                <Image
                  source={h.source}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="contain"
                />
              </Animated.View>
            );
          }

          return (
            <Image
              key={h.id}
              source={h.source}
              style={{
                position: "absolute",
                top: h.top,
                left: h.left,
                width: h.size,
                height: h.size,
                opacity: h.opacity,
                transform: [{ rotate: `${h.rotateDeg}deg` }],
              }}
              contentFit="contain"
            />
          );
        })}
      </View>
      <Image
        source={require("../../assets/images/options-screen-girl.png")}
        style={{
          width: 200,
          height: 200,
          transform: [{ scaleX: -1 }, { rotate: "142deg" }],
          marginTop: -50,
          marginBottom: 30,
          zIndex: 0,
        }}
        contentFit="contain"
      />
      {/* Social Media Icons - Above Logo */}
      <SocialMediaIcons position="above-logo" />
      <Logo />
      <View className="flex-1 items-center gap-4 mt-6 px-6">
        {/* Feature Cards - Vertical Stack */}
        <View className="w-full items-center gap-2.5">
          {/* Card 1: NO LOGIN REQUIRED */}
          <Animated.View
            className="relative w-full max-w-xs"
            style={{
              opacity: card1Opacity,
              transform: [
                {
                  translateY: card1TranslateY,
                },
                {
                  scale: card1Scale,
                },
              ],
            }}
          >
            {/* Shadow layer */}
            <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-lg" />
            <View className="relative bg-blue-50 border-2 border-gray-900 rounded-lg px-4 py-3">
              <View className="flex-row items-center justify-center gap-2.5">
                <View className="bg-white border-2 border-gray-900 rounded-md p-1.5">
                  <FontAwesome5 name="user-check" size={16} color="#000000" />
                </View>
                <Text
                  className="text-gray-900 font-bold flex-1 text-center"
                  style={{
                    fontFamily: "MerriweatherSans_700Bold",
                    fontSize: 14,
                    letterSpacing: -0.3,
                  }}
                >
                  NO LOGIN REQUIRED
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Card 2: PLAY WITH YOUR PARTNER */}
          <Animated.View
            className="relative w-full max-w-xs"
            style={{
              opacity: card2Opacity,
              transform: [
                {
                  translateY: card2TranslateY,
                },
                {
                  scale: card2Scale,
                },
              ],
            }}
          >
            {/* Shadow layer */}
            <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-lg" />
            <View className="relative bg-pink-50 border-2 border-gray-900 rounded-lg px-4 py-3">
              <View className="flex-row items-center justify-center gap-2.5">
                <View className="bg-white border-2 border-gray-900 rounded-md p-1.5">
                  <FontAwesome5 name="heart" size={16} color="#000000" />
                </View>
                <Text
                  className="text-gray-900 font-bold flex-1 text-center"
                  style={{
                    fontFamily: "MerriweatherSans_700Bold",
                    fontSize: 14,
                    letterSpacing: -0.3,
                  }}
                >
                  PLAY WITH YOUR PARTNER
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Card 3: KNOW EACH OTHER BETTER */}
          <Animated.View
            className="relative w-full max-w-xs"
            style={{
              opacity: card3Opacity,
              transform: [
                {
                  translateY: card3TranslateY,
                },
                {
                  scale: card3Scale,
                },
              ],
            }}
          >
            {/* Shadow layer */}
            <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-lg" />
            <View className="relative bg-yellow-50 border-2 border-gray-900 rounded-lg px-4 py-3">
              <View className="flex-row items-center justify-center gap-2.5">
                <View className="bg-white border-2 border-gray-900 rounded-md p-1.5">
                  <FontAwesome5 name="lightbulb" size={16} color="#000000" />
                </View>
                <Text
                  className="text-gray-900 font-bold flex-1 text-center"
                  style={{
                    fontFamily: "MerriweatherSans_700Bold",
                    fontSize: 14,
                    letterSpacing: -0.3,
                  }}
                >
                  KNOW EACH OTHER BETTER
                </Text>
              </View>
            </View>
          </Animated.View>
        </View>
        {/* Start Button */}
        <View className="mt-4 items-center w-full px-3 ">
          <Animated.View
            className="relative w-full"
            style={{
              transform: [{ scale: buttonPulseAnim }],
            }}
          >
            {/* Shadow Layer */}
            <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-xl" />
            <View className="relative bg-white border-2 border-gray-900 rounded-xl py-4 px-12 w-full">
              <TouchableOpacity
                onPress={handleStartPress}
                activeOpacity={0.85}
                className="w-full"
              >
                <Text
                  className="text-gray-900 text-lg text-center font-bold"
                  style={{ fontFamily: "MerriweatherSans_700Bold" }}
                >
                  Start playing now!
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </View>
      <Image
        source={require("../../assets/images/options-screen-man.png")}
        style={{
          width: 200,
          height: 200,
          transform: [{ scaleX: -1 }, { rotate: "-16deg" }],
          marginLeft: "auto",
          marginBottom: -40,
          zIndex: 0,
        }}
        contentFit="contain"
      />
    </View>
  );
};

export default OnboardingPage;
