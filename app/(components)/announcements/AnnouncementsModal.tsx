import {
  MerriweatherSans_400Regular,
  MerriweatherSans_600SemiBold,
  MerriweatherSans_700Bold,
} from "@expo-google-fonts/merriweather-sans";
import { useFonts } from "@expo-google-fonts/merriweather-sans/useFonts";
import { Feather } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLanguage } from "../../contexts/LanguageContext";
import { useTranslation } from "../../hooks/useTranslation";
import {
  Announcement,
  getAllAnnouncements,
  getAnnouncementText,
} from "../../services/announcementService";

interface AnnouncementsModalProps {
  visible: boolean;
  onClose: () => void;
}

const AnnouncementsModal: React.FC<AnnouncementsModalProps> = ({
  visible,
  onClose,
}) => {
  const { selectedLanguage } = useLanguage();
  const { t } = useTranslation();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  let [fontsLoaded] = useFonts({
    MerriweatherSans_400Regular,
    MerriweatherSans_600SemiBold,
    MerriweatherSans_700Bold,
  });

  useEffect(() => {
    if (visible) {
      loadAnnouncements();
    }
  }, [visible]);

  const loadAnnouncements = async () => {
    setIsLoading(true);
    try {
      const all = await getAllAnnouncements();
      
      // Sort by date (newest first) and take only last 3
      const sorted = all.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
      const lastThree = sorted.slice(0, 3);
      
      setAnnouncements(lastThree);
    } catch (error) {
      console.warn("Failed to load announcements:", error);
      setAnnouncements([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      return date.toLocaleDateString(selectedLanguage === "tr" ? "tr-TR" : selectedLanguage === "es" ? "es-ES" : "en-US", options);
    } catch {
      return "";
    }
  };

  const handleActionPress = async (url: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.warn("Failed to open URL:", error);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
      statusBarTranslucent={true}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={{
            width: "90%",
            maxWidth: 400,
            backgroundColor: "white",
            borderRadius: 32,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.15,
            shadowRadius: 24,
            elevation: 10,
          }}
        >
          {/* Header */}
          <View className="flex-row justify-between items-center p-6 border-b border-slate-100">
            <Text
              style={{
                fontFamily: "MerriweatherSans_700Bold",
                fontSize: 22,
                color: "#1e293b",
              }}
            >
              {t("announcements.title") || "Latest Announcements"}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="bg-slate-100 rounded-full p-2"
              activeOpacity={0.7}
            >
              <Feather name="x" size={20} color="#475569" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={{ padding: 24 }}>
            {isLoading ? (
              <View className="py-8 items-center">
                <ActivityIndicator size="large" color="#F59E0B" />
              </View>
            ) : announcements.length === 0 ? (
              <View className="py-8 items-center">
                <Feather name="bell-off" size={48} color="#CBD5E1" />
                <Text
                  className="text-slate-400 text-center mt-4"
                  style={{ fontFamily: "MerriweatherSans_400Regular" }}
                >
                  {t("announcements.noAnnouncements") || "No announcements"}
                </Text>
              </View>
            ) : (
              <View className="gap-4">
                {announcements.map((announcement, index) => {
                  const title = getAnnouncementText(
                    announcement,
                    "title",
                    selectedLanguage
                  );
                  const message = getAnnouncementText(
                    announcement,
                    "message",
                    selectedLanguage
                  );
                  const date = formatDate(announcement.createdAt);

                  return (
                    <View
                      key={announcement.id}
                      className="bg-amber-50 rounded-2xl p-4 border border-amber-200"
                      style={{
                        shadowColor: "#F59E0B",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 2,
                      }}
                    >
                      {/* Date */}
                      <View className="flex-row items-center mb-2">
                        <Feather name="calendar" size={14} color="#92400E" />
                        <Text
                          className="text-amber-900 text-xs ml-2"
                          style={{ fontFamily: "MerriweatherSans_400Regular" }}
                        >
                          {date}
                        </Text>
                      </View>

                      {/* Title */}
                      <Text
                        className="text-amber-900 text-base mb-2"
                        style={{ fontFamily: "MerriweatherSans_700Bold" }}
                      >
                        {title}
                      </Text>

                      {/* Message */}
                      <Text
                        className="text-amber-800 text-sm mb-3"
                        style={{ fontFamily: "MerriweatherSans_400Regular" }}
                      >
                        {message}
                      </Text>

                      {/* Action Button */}
                      {announcement.actionUrl && (
                        <TouchableOpacity
                          onPress={() => handleActionPress(announcement.actionUrl!)}
                          activeOpacity={0.8}
                          className="bg-amber-200 rounded-full px-4 py-2 self-start"
                        >
                          <View className="flex-row items-center gap-2">
                            <Text
                              className="text-amber-900 text-sm"
                              style={{ fontFamily: "MerriweatherSans_600SemiBold" }}
                            >
                              {t("announcements.learnMore") || "Learn More"}
                            </Text>
                            <Feather name="arrow-right" size={14} color="#92400E" />
                          </View>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default AnnouncementsModal;
