import { MerriweatherSans_400Regular, MerriweatherSans_600SemiBold } from "@expo-google-fonts/merriweather-sans";
import { useFonts } from "@expo-google-fonts/merriweather-sans/useFonts";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { useLanguage } from "../../contexts/LanguageContext";
import { useTranslation } from "../../hooks/useTranslation";
import {
  Announcement,
  getAnnouncementText,
  getLatestAnnouncement,
} from "../../services/announcementService";

interface AnnouncementBannerProps {
  onViewAll?: () => void;
}

const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({
  onViewAll,
}) => {
  const { selectedLanguage } = useLanguage();
  const { t } = useTranslation();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const bellRotateAnim = useRef(new Animated.Value(0)).current;

  let [fontsLoaded] = useFonts({
    MerriweatherSans_400Regular,
    MerriweatherSans_600SemiBold,
  });

  useEffect(() => {
    loadAnnouncement();
  }, []);

  const loadAnnouncement = async () => {
    try {
      const latest = await getLatestAnnouncement(selectedLanguage);
      if (latest) {
        setAnnouncement(latest);
        setIsVisible(true);
        animateIn();
      }
    } catch (error) {
      console.warn("Failed to load announcement:", error);
    }
  };

  const animateIn = () => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    if (!isVisible || !announcement) return;

    // Bildirim gelmiş gibi sallanma animasyonu
    const createShakeAnimation = () => {
      return Animated.sequence([
        Animated.timing(bellRotateAnim, {
          toValue: -15,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(bellRotateAnim, {
          toValue: 15,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(bellRotateAnim, {
          toValue: -10,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(bellRotateAnim, {
          toValue: 10,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(bellRotateAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]);
    };

    // İlk animasyonu başlat (badge göründükten 500ms sonra)
    const initialTimeout = setTimeout(() => {
      createShakeAnimation().start();
    }, 500);

    // Her 3 saniyede bir tekrarla (hafif sallanma)
    const interval = setInterval(() => {
      createShakeAnimation().start();
    }, 3000);

    // Cleanup
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [isVisible, announcement]);

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    }
  };

  if (!fontsLoaded || !isVisible || !announcement) {
    return null;
  }

  const title = getAnnouncementText(announcement, "title", selectedLanguage);

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return "";
    }
  };

  const dateText = formatDate(announcement.createdAt);

  return (
    <Animated.View
      style={{
        transform: [{ translateY: slideAnim }],
        opacity: opacityAnim,
        marginBottom: 12,
        alignSelf: "center",
      }}
    >
      <TouchableOpacity
        onPress={handleViewAll}
        activeOpacity={0.8}
        style={{
          borderRadius: 12,
          maxWidth: "80%",
        }}
      >
        <View
          style={{
            borderRadius: 12,
            padding: 10,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderWidth: 1,
            borderColor: "#E2E8F0",
            shadowColor: "#64748B",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          {/* Icon */}
          <View className="w-8 h-8 bg-slate-50 rounded-full items-center justify-center mr-2">
            <Animated.View
              style={{
                transform: [
                  {
                    rotate: bellRotateAnim.interpolate({
                      inputRange: [-15, 15],
                      outputRange: ["-15deg", "15deg"],
                    }),
                  },
                ],
              }}
            >
              <Feather name="bell" size={14} color="#64748B" />
            </Animated.View>
          </View>

          {/* Content */}
          <View className="mr-2" style={{ flexShrink: 1 }}>
            <Text
              className="text-slate-600 text-xs"
              style={{ fontFamily: "MerriweatherSans_600SemiBold" }}
              numberOfLines={1}
            >
              {title}
            </Text>
          </View>

          {/* Date */}
          {dateText && (
            <View className="flex-row items-center gap-1">
              <Feather name="calendar" size={10} color="#94A3B8" />
              <Text
                className="text-slate-400 text-xs"
                style={{ 
                  fontFamily: "MerriweatherSans_400Regular",
                  opacity: 0.7,
                }}
              >
                {dateText}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default AnnouncementBanner;
