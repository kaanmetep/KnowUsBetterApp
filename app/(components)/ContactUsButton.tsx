import Fontisto from "@expo/vector-icons/Fontisto";
import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";
import React from "react";
import { Alert, Platform, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "../hooks/useTranslation";
import { purchaseService } from "../services/purchaseService";

interface ContactUsButtonProps {
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "none";
  style?: "default" | "compact"; // default: with text, compact: icon only
  text?: string; // Custom button text
}

const ContactUsButton: React.FC<ContactUsButtonProps> = ({
  position = "bottom-left",
  style = "default",
  text,
}) => {
  const { t } = useTranslation();
  const defaultText = t("contact.contactUs");

  const handleContactUs = async () => {
    try {
      // Get app user ID
      let appUserId = t("settings.unableToLoadId");
      try {
        appUserId = await purchaseService.getAppUserId();
      } catch (error) {
        console.error("Error getting app user ID:", error);
      }

      const email = "help@knowusbetter.app";
      const subject = t("contact.supportRequestSubject");
      const body = `${t("contact.emailBodyGreeting")}

${t("contact.emailBodyPlaceholder")}

---
${t("contact.emailBodyAppInfo")}
${t("contact.emailBodyPlatform", { platform: Platform.OS })}
${t("contact.emailBodyVersion", { version: Platform.Version })}
${t("contact.emailBodyUserId", { userId: appUserId })}`;

      const userInfo = `${t("contact.emailBodyPlatform", {
        platform: Platform.OS,
      })}\n${t("contact.emailBodyVersion", { version: Platform.Version })}\n${t(
        "contact.emailBodyUserId",
        { userId: appUserId }
      )}`;

      const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;

      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
      } else {
        // Fallback: Show email address with user info
        if (Platform.OS === "web") {
          window.alert(
            `${t("contact.pleaseSendMessageToWithInfo", {
              email,
              userInfo,
            })}\n\n${t("contact.emailCopiedToClipboard")}`
          );
          await Clipboard.setStringAsync(email);
        } else {
          Alert.alert(
            t("contact.contactUs"),
            t("contact.pleaseSendMessageToWithInfo", { email, userInfo }),
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
    } catch (error) {
      console.error("❌ Error opening email:", error);
      Alert.alert(t("common.error"), t("settings.couldNotOpenEmailClient"));
    }
  };

  const positionClasses = {
    "top-right": "absolute top-20 right-6 z-10",
    "top-left": "absolute top-20 left-6 z-10",
    "bottom-right": "absolute bottom-20 right-6 z-10",
    "bottom-left": "absolute bottom-20 left-6 z-10",
    none: "",
  };

  return (
    <View className={positionClasses[position]}>
      <View className="relative">
        <View className="absolute top-[1px] left-[1px] right-[-1px] bottom-[-1px] bg-gray-900 rounded-full" />
        <TouchableOpacity
          className="bg-white border-2 border-gray-900 rounded-full py-1.5 px-4 relative"
          activeOpacity={0.8}
          onPress={handleContactUs}
        >
          {style === "compact" ? (
            <Fontisto name="email" size={16} color="black" />
          ) : (
            <View className="flex-row items-center gap-2">
              <Fontisto name="email" size={14} color="black" />
              <Text
                className="text-gray-900 text-xs font-semibold"
                style={{ letterSpacing: -0.2 }}
              >
                {text || defaultText}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ContactUsButton;
