import { LibreBaskerville_700Bold } from "@expo-google-fonts/libre-baskerville";
import {
  MerriweatherSans_400Regular,
  MerriweatherSans_700Bold,
} from "@expo-google-fonts/merriweather-sans";
import { useFonts } from "@expo-google-fonts/merriweather-sans/useFonts";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Foundation from "@expo/vector-icons/Foundation";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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
  // Heart transition animation
  const heartScale = useRef(new Animated.Value(1)).current;
  const heartOpacity = useRef(new Animated.Value(1)).current;
  const heartTranslateX = useRef(new Animated.Value(0)).current;
  const heartTranslateY = useRef(new Animated.Value(0)).current;
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
      <View pointerEvents="none" className="absolute inset-0">
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
                  zIndex: 1000,
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
                opacity: isTransitioning ? 0 : h.opacity,
                transform: [{ rotate: `${h.rotateDeg}deg` }],
              }}
              contentFit="contain"
            />
          );
        })}
      </View>
      <View className="flex-1 mt-[150px] items-center">
        <Logo />
        <View className="mt-12 w-11/12 max-w-[360px] gap-5">
          {/* Feature 1 */}
          <View className="relative">
            <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-xl" />
            <View className="relative flex-row items-center gap-3 bg-white border-2 border-gray-900 rounded-xl px-4 py-3">
              <View className="w-8 h-8 rounded-full bg-[#ffe4e6] items-center justify-center border-2 border-gray-900">
                <FontAwesome6
                  name="heart-circle-bolt"
                  size={16}
                  color="#991b1b"
                />
              </View>
              <Text
                style={{ fontFamily: "MerriweatherSans_400Regular" }}
                className="text-gray-900 flex-1"
              >
                Real-time test with your partner
              </Text>
            </View>
          </View>

          {/* Feature 2 */}
          <View className="relative">
            <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-xl" />
            <View className="relative flex-row items-center gap-3 bg-white border-2 border-gray-900 rounded-xl px-4 py-3">
              <View className="w-8 h-8 rounded-full bg-[#ffe4e6] items-center justify-center border-2 border-gray-900">
                <Foundation name="page-multiple" size={16} color="#991b1b" />
              </View>
              <Text
                style={{ fontFamily: "MerriweatherSans_400Regular" }}
                className="text-gray-900 flex-1"
              >
                Multiple fun categories to explore
              </Text>
            </View>
          </View>

          {/* Feature 3 */}
          <View className="relative">
            <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-xl" />
            <View className="relative flex-row items-center gap-3 bg-white border-2 border-gray-900 rounded-xl px-4 py-3">
              <View className="w-8 h-8 rounded-full bg-[#ffe4e6] items-center justify-center border-2 border-gray-900">
                <Entypo name="cross" size={16} color="#991b1b" />
              </View>
              <Text
                style={{ fontFamily: "MerriweatherSans_400Regular" }}
                className="text-gray-900 flex-1"
              >
                No login or signup required
              </Text>
            </View>
          </View>

          {/* Start Button */}
          <View className="mt-4 items-center">
            <View className="relative w-full">
              <View className="absolute top-[3px] left-[3px] right-[-3px] bottom-[-3px] bg-gray-900 rounded-[14px]" />
              <TouchableOpacity
                onPress={handleStartPress}
                activeOpacity={0.8}
                className="relative bg-[#ffe4e6] border-2 border-gray-900 rounded-[14px] py-[18px] px-12"
              >
                <Text
                  className="text-gray-900 text-xl text-center font-bold"
                  style={{ fontFamily: "MerriweatherSans_700Bold" }}
                >
                  Start playing now!
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
      {/* Bottom ticker */}
      <View className="absolute -left-0 right-0 bottom-10 px-2">
        <View className="relative">
          {/* Shadow */}
          <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-xl" />
          {/* Ticker Container */}
          <View
            className="relative bg-white border-2 border-gray-900 rounded-xl overflow-hidden"
            style={{ height: 42 }}
          >
            <ScrollView
              ref={scrollViewRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              scrollEnabled={false}
              contentContainerStyle={{ alignItems: "center", height: 42 }}
              onContentSizeChange={(w) => {
                // Loop back to start when reaching end
                if (scrollViewRef.current) {
                  scrollViewRef.current.scrollTo({ x: 0, animated: false });
                }
              }}
            >
              {Array(10)
                .fill(tickerText)
                .map((text, i) => (
                  <Text
                    key={i}
                    style={{
                      fontFamily: "MerriweatherSans_400Regular",
                      fontSize: 14,
                      lineHeight: 42,
                      color: "#1a1a1a",
                      paddingHorizontal: 16,
                      fontWeight: "500",
                    }}
                  >
                    {text}
                  </Text>
                ))}
            </ScrollView>
          </View>
        </View>
      </View>
    </View>
  );
};

export default OnboardingPage;
