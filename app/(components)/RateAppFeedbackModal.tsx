import {
  MerriweatherSans_400Regular,
  MerriweatherSans_700Bold,
} from "@expo-google-fonts/merriweather-sans";
import { useFonts } from "@expo-google-fonts/merriweather-sans/useFonts";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "../hooks/useTranslation";
import { purchaseService } from "../services/purchaseService";

interface RateAppFeedbackModalProps {
  visible: boolean;
  onClose: () => void;
}

const RateAppFeedbackModal: React.FC<RateAppFeedbackModalProps> = ({
  visible,
  onClose,
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  let [fontsLoaded] = useFonts({
    MerriweatherSans_400Regular,
    MerriweatherSans_700Bold,
  });

  const handleYes = async () => {
    const appStoreId = "6754946265";
    const androidPackageName = "com.knowusbetter.app";
    const webReviewUrl =
      Platform.OS === "ios"
        ? `https://apps.apple.com/app/id${appStoreId}?action=write-review`
        : `https://play.google.com/store/apps/details?id=${androidPackageName}&showAllReviews=true`;
    const reviewDeepLink =
      Platform.OS === "ios"
        ? `itms-apps://itunes.apple.com/app/id${appStoreId}?action=write-review`
        : `market://details?id=${androidPackageName}`;

    try {
      setIsLoading(true);

      onClose();

      try {
        await Linking.openURL(webReviewUrl);
      } catch (error) {
        console.error("❌ Error opening App Store:", error);
        try {
          await Linking.openURL(reviewDeepLink);
        } catch (deepLinkError) {
          console.error("❌ Error opening App Store deep link:", deepLinkError);
          Alert.alert(
            t("common.error"),
            Platform.OS === "ios"
              ? t("settings.couldNotOpenAppStoreSearchHint")
              : t("settings.couldNotOpenPlayStoreSearchHint")
          );
        }
      }
    } catch (error) {
      console.error("❌ Error opening review flow:", error);
      Alert.alert(t("common.error"), t("settings.couldNotOpenAppStore"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleNo = async () => {
    try {
      setIsLoading(true);
      // Open feedback form (same as ContactUsButton)
      let appUserId = t("settings.unableToLoadId");
      try {
        appUserId = await purchaseService.getAppUserId();
      } catch (error) {
        console.error("Error getting app user ID:", error);
      }

      const email = "help@knowusbetter.app";
      const subject = t("settings.feedbackSubject") || "KnowUsBetter - Feedback";
      const body = `${t("contact.emailBodyGreeting")}

${t("settings.feedbackBody") || "I would like to share my feedback about the app."}

---
${t("contact.emailBodyAppInfo")}
${t("contact.emailBodyPlatform", { platform: Platform.OS })}
${t("contact.emailBodyVersion", { version: Platform.Version })}
${t("contact.emailBodyUserId", { userId: appUserId })}`;

      const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;

      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
      } else {
        if (Platform.OS === "web") {
          window.alert(
            `${t("contact.pleaseSendMessageToWithInfo", {
              email,
              userInfo: `${t("contact.emailBodyPlatform", {
                platform: Platform.OS,
              })}\n${t("contact.emailBodyVersion", {
                version: Platform.Version,
              })}\n${t("contact.emailBodyUserId", { userId: appUserId })}`,
            })}\n\n${t("contact.emailCopiedToClipboard")}`
          );
          await Clipboard.setStringAsync(email);
        } else {
          Alert.alert(
            t("contact.contactUs"),
            t("contact.pleaseSendMessageToWithInfo", {
              email,
              userInfo: `${t("contact.emailBodyPlatform", {
                platform: Platform.OS,
              })}\n${t("contact.emailBodyVersion", {
                version: Platform.Version,
              })}\n${t("contact.emailBodyUserId", { userId: appUserId })}`,
            }),
            [
              {
                text: t("contact.copyEmail"),
                onPress: async () => {
                  await Clipboard.setStringAsync(email);
                  Alert.alert(t("common.copied"), t("contact.emailCopied"));
                },
              },
              { text: t("common.ok"), style: "cancel" },
            ]
          );
        }
      }
      onClose();
    } catch (error) {
      console.error("❌ Error opening feedback form:", error);
      Alert.alert(
        t("common.error"),
        t("settings.couldNotOpenEmailClient")
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!fontsLoaded) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
      statusBarTranslucent={true}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: "85%",
            maxWidth: 380,
            backgroundColor: "white",
            borderRadius: 24,
            padding: 24,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.15,
            shadowRadius: 24,
            elevation: 10,
          }}
        >
          {/* Close button */}
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.7}
            className="absolute top-4 right-4 z-10"
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: "#f1f5f9",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Feather name="x" size={18} color="#64748b" />
          </TouchableOpacity>

          {/* Content */}
          <View className="items-center" style={{ paddingTop: 8 }}>
            {/* Title */}
            <Text
              style={{
                fontFamily: "MerriweatherSans_700Bold",
                fontSize: 20,
                color: "#1e293b",
                textAlign: "center",
                marginBottom: 8,
                paddingHorizontal: 32,
              }}
            >
              {t("settings.rateAppQuestion")}
            </Text>

            {/* Subtitle */}
            <Text
              style={{
                fontFamily: "MerriweatherSans_400Regular",
                fontSize: 14,
                color: "#64748b",
                textAlign: "center",
                marginBottom: 24,
                lineHeight: 20,
                paddingHorizontal: 8,
              }}
            >
              {t("settings.rateAppSubtitle")}
            </Text>

            {/* Buttons */}
            <View className="w-full gap-2.5">
              {/* Yes Button */}
              <TouchableOpacity
                onPress={handleYes}
                disabled={isLoading}
                activeOpacity={0.85}
                style={{
                  backgroundColor: "#fef3c7",
                  borderRadius: 16,
                  paddingVertical: 14,
                  paddingHorizontal: 20,
                  borderWidth: 1.5,
                  borderColor: "#fde68a",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <FontAwesome5 name="star" size={14} color="#d97706" />
                <Text
                  style={{
                    fontFamily: "MerriweatherSans_700Bold",
                    fontSize: 15,
                    color: "#92400e",
                  }}
                >
                  {t("common.yes")}
                </Text>
              </TouchableOpacity>

              {/* No Button */}
              <TouchableOpacity
                onPress={handleNo}
                disabled={isLoading}
                activeOpacity={0.85}
                style={{
                  backgroundColor: "#f8fafc",
                  borderRadius: 16,
                  paddingVertical: 14,
                  paddingHorizontal: 20,
                  borderWidth: 1,
                  borderColor: "#e2e8f0",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <Feather name="message-circle" size={14} color="#64748b" />
                <Text
                  style={{
                    fontFamily: "MerriweatherSans_700Bold",
                    fontSize: 15,
                    color: "#475569",
                  }}
                >
                  {t("settings.shareFeedback")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default RateAppFeedbackModal;
