import { LibreBaskerville_700Bold } from "@expo-google-fonts/libre-baskerville";
import {
  MerriweatherSans_400Regular,
  MerriweatherSans_700Bold,
} from "@expo-google-fonts/merriweather-sans";
import { useFonts } from "@expo-google-fonts/merriweather-sans/useFonts";
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
  // Button gradient animation
  const gradientAnim = useRef(new Animated.Value(0)).current;
  // Button pulse animation
  const buttonPulseAnim = useRef(new Animated.Value(1)).current;
  // Heart transition animation
  const heartScale = useRef(new Animated.Value(1)).current;
  const heartOpacity = useRef(new Animated.Value(1)).current;
  const heartTranslateX = useRef(new Animated.Value(0)).current;
  const heartTranslateY = useRef(new Animated.Value(0)).current;
  // Card carousel animation - infinite horizontal scroll
  const cardScrollX = useRef(new Animated.Value(0)).current;

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
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(gradientAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(gradientAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [gradientAnim]);

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
    }, [
      heartScale,
      heartOpacity,
      heartTranslateX,
      heartTranslateY,
      buttonPulseAnim,
      cardScrollX,
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
        style={{ zIndex: 9999 }}
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
                  zIndex: 10000,
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
          zIndex: 1,
        }}
        contentFit="contain"
      />
      <Logo />
      <View className="flex-1 items-center gap-6 mt-16 px-6">
        {/* Question Cards Carousel - Infinite Scroll */}
        <View className="w-full" style={{ height: 180 }}>
          <View
            className="relative"
            style={{
              width: "100%",
              height: 180,
              overflow: "hidden",
            }}
          >
            <Animated.View
              style={{
                flexDirection: "row",
                transform: [{ translateX: cardScrollX }],
              }}
            >
              {/* Repeat cards 3 times for infinite loop */}
              {[0, 1, 2].map((setIndex) =>
                tickerSentences.map((sentence, index) => {
                  const cardWidth = 280;
                  const cardGap = 24;
                  const globalIndex = setIndex * tickerSentences.length + index;
                  return (
                    <View
                      key={`${setIndex}-${index}`}
                      style={{
                        width: cardWidth,
                        height: 180,
                        marginRight: cardGap,
                      }}
                    >
                      {/* Shadow layer - lighter */}
                      <View
                        className="absolute"
                        style={{
                          top: 3,
                          left: 3,
                          right: -3,
                          bottom: -3,
                          backgroundColor: "#000",
                          borderRadius: 12,
                          zIndex: 0,
                        }}
                      />
                      {/* Card */}
                      <View
                        className={`relative border-[3px] border-gray-900 rounded-xl p-5 flex-1 justify-center z-10 ${
                          index % 2 === 0 ? "bg-red-50" : "bg-blue-50"
                        }`}
                      >
                        <Text
                          className="text-gray-900 text-center font-bold leading-6"
                          style={{
                            fontFamily: "MerriweatherSans_700Bold",
                            fontSize: 18,
                            letterSpacing: -0.3,
                          }}
                        >
                          {sentence}
                        </Text>
                      </View>
                    </View>
                  );
                })
              )}
            </Animated.View>
          </View>
        </View>

        {/* Start Button */}
        <View className="mt-6 items-center ">
          <Animated.View
            className="relative"
            style={{
              transform: [{ scale: buttonPulseAnim }],
            }}
          >
            {/* Light Shadow Layer */}
            <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-xl" />
            <Animated.View
              style={{
                backgroundColor: gradientAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["#dbeafe", "#fce7f3"], // Pastel blue to pastel pink
                }),
              }}
              className="relative border-2 border-gray-900 rounded-xl py-4 px-10"
            >
              <TouchableOpacity
                onPress={handleStartPress}
                activeOpacity={0.9}
                className="w-full"
              >
                <Text
                  className="text-gray-900 text-lg text-center font-bold"
                  style={{ fontFamily: "MerriweatherSans_700Bold" }}
                >
                  Start playing now!
                </Text>
              </TouchableOpacity>
            </Animated.View>
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
          zIndex: 1,
        }}
        contentFit="contain"
      />
    </View>
  );
};

export default OnboardingPage;
