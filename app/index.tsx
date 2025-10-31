import { LibreBaskerville_700Bold } from '@expo-google-fonts/libre-baskerville';
import { MerriweatherSans_400Regular, MerriweatherSans_700Bold } from '@expo-google-fonts/merriweather-sans';
import { useFonts } from '@expo-google-fonts/merriweather-sans/useFonts';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Foundation from '@expo/vector-icons/Foundation';
import { Image } from "expo-image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Dimensions, Easing, ScrollView, Text, View } from "react-native";


export default function Index() {
  const { width, height } = Dimensions.get("window");
  const messages = [
    "Test Your Connection Together",
    "Get to Know the Real You Two",
    "Answer, Laugh, and Connect",
  ];
  let [fontsLoaded] = useFonts({
    MerriweatherSans_400Regular,
    MerriweatherSans_700Bold,
    LibreBaskerville_700Bold,
  });
  const [msgIndex, setMsgIndex] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  // Bottom ticker
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  // Button gradient animation
  const gradientAnim = useRef(new Animated.Value(0)).current;
  const tickerSentences = [
    "Would you ask your partner for their Instagram password?",
    "Would you accept it if your partner were a popular person?",
    "Do long-distance relationships work?",
    "Would you pay your partner's debt?",
  ];
  const tickerText = tickerSentences.join("     ");
  const hearts = useMemo(() => {
    let seed = 15;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    const sources = [
      require("../public/images/heart-1.png"),
      require("../public/images/heart-2.png"),
      require("../public/images/heart-3.png"),
      
    ];
    const count = 6;
    const items = Array.from({ length: count }).map((_, i) => {
      const source = sources[i % sources.length];
      const size = Math.floor(40 + random() * 80); // 40-120px
      const left = Math.floor(random() * width);
      const rotateDeg = Math.floor(-30 + random() * 60); // -30 to 30
      const opacity = 0.15 + random() * 0.25; // 0.15 - 0.4
      const animY = new Animated.Value(height + size);
      const duration = 8000 + random() * 4000; // 8-12 seconds
      return { id: i, source, size, left, rotateDeg, opacity, animY, duration };
    });
    return items;
  }, [width, height]);
  useEffect(() => {
    hearts.forEach((heart) => {
      const animate = () => {
        heart.animY.setValue(height + heart.size);
        Animated.timing(heart.animY, {
          toValue: -heart.size,
          duration: heart.duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }).start(() => animate());
      };
      animate();
    });
  }, [hearts, height]);
  useEffect(() => {
    const interval = setInterval(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -12,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        const next = (msgIndex + 1) % messages.length;
        setMsgIndex(next);
        translateY.setValue(12);
        opacity.setValue(0);
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 0,
            duration: 400,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [messages.length, msgIndex, opacity, translateY]);
  useEffect(() => {
    const scrollSpeed = 40; // px per second
    let animationFrame;
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
  if (!fontsLoaded) {
    return null;
  }
  return (
    <View className="flex-1 bg-primary ">
      <View pointerEvents="none" className="absolute inset-0">
        {hearts.map((h) => (
          <Animated.View
            key={h.id}
            style={{
              position: "absolute",
              left: h.left,
              width: h.size,
              height: h.size,
              opacity: h.opacity,
              transform: [
                { translateY: h.animY },
                { rotate: `${h.rotateDeg}deg` }
              ],
            }}
          >
            <Image
              source={h.source}
              style={{
                width: h.size,
                height: h.size,
              }}
              contentFit="contain"
            />
          </Animated.View>
        ))}
      </View>
      <View className="flex-1 mt-[100px] items-center">
        <Image source={require("../public/images/logo.png")} style={{ width: 80, height: 70 }} />
        <Text className="text-5xl text-red-950" style={{fontFamily: 'LibreBaskerville_700Bold' }}>KnowUsBetter</Text>
        <Animated.Text
          className="mt-2 text-red-900"
          style={{
            fontFamily: 'MerriweatherSans_400Regular',
            opacity,
            transform: [{ translateY }],
          }}
        >
          {messages[msgIndex]}
        </Animated.Text>
        <View className="mt-8 w-11/12 max-w-[360px] gap-2">
          <View className="flex-row items-center gap-3 bg-gray-50 rounded-lg px-3 py-2 border border-red-200/30 shadow-sm">
            <View className="w-7 h-7 rounded-full bg-white/50 items-center justify-center">
              <FontAwesome6 name="heart-circle-bolt" size={16} color="#991b1b" />
            </View>
            <Text style={{fontFamily: 'MerriweatherSans_400Regular'}} className="text-red-900">Real-time quiz with your partner</Text>
          </View>
          <View className="flex-row items-center gap-3 bg-gray-50 rounded-lg px-3 py-2 border border-red-200/30 mt-4 shadow-sm">
            <View className="w-7 h-7 rounded-full bg-white/50 items-center justify-center">
              <Foundation name="page-multiple" size={16} color="#991b1b" />
            </View>
            <Text style={{fontFamily: 'MerriweatherSans_400Regular'}} className="text-red-900">Multiple fun categories to explore</Text>
          </View>
          <View className="flex-row items-center gap-3 bg-gray-50 rounded-lg px-3 py-2 border border-red-200/30 mt-4 shadow-sm">
            <View className="w-7 h-7 rounded-full bg-white/50 items-center justify-center">
              <Entypo name="cross" size={16} color="#991b1b" />
            </View>
            <Text style={{fontFamily: 'MerriweatherSans_400Regular'}} className="text-red-900">No login or signup required</Text>
          </View>
          <View className="mt-8 items-center">
            <View className="w-fit">
              <Animated.View
                style={{
                  borderRadius: 12,
                  paddingVertical: 16,
                  paddingHorizontal: 48,
                  borderWidth: 1,
                  borderColor: 'rgba(252, 165, 165, 0.25)',
                  backgroundColor: gradientAnim.interpolate({
                    inputRange: [0, 0.33, 0.66, 1],
                    outputRange: ['#fff1f2', '#fdf2f8', '#faf5ff', '#eff6ff'],
                  }),
                }}
              >
                <Text className="text-red-700 text-xl shadow-sm" style={{fontFamily: 'MerriweatherSans_700Bold'}}>Start playing now!</Text>
              </Animated.View>
            </View>
          </View>
        </View>
      </View>
      {/* Bottom ticker */}
      <View className="absolute left-0 right-0 bottom-8 bg-white/70" style={{ height: 36, overflow: 'hidden' }}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          contentContainerStyle={{ alignItems: 'center', height: 36 }}
          onContentSizeChange={(w) => {
            // Loop back to start when reaching end
            if (scrollViewRef.current) {
              scrollViewRef.current.scrollTo({ x: 0, animated: false });
            }
          }}
        >
          {Array(10).fill(tickerText).map((text, i) => (
            <Text
              key={i}
              style={{
                fontFamily: 'MerriweatherSans_400Regular',
                fontSize: 14,
                lineHeight: 36,
                color: '#991b1b',
                paddingHorizontal: 16,
              }}
            >
              {text}
            </Text>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
