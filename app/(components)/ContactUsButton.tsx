import Fontisto from "@expo/vector-icons/Fontisto";
import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";
import React from "react";
import { Alert, Platform, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "../hooks/useTranslation";
import { purchaseService } from "../services/purchaseService";

interface ContactUsButtonProps {
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "none";
  style?: "default" | "compact";
  text?: string;
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
      <TouchableOpacity
        className="bg-white border border-slate-100 rounded-full flex-row items-center justify-center"
        style={{
          paddingVertical: style === "compact" ? 10 : 8,
          paddingHorizontal: style === "compact" ? 10 : 16,
          shadowColor: "#94a3b8",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
        activeOpacity={0.8}
        onPress={handleContactUs}
      >
        {style === "compact" ? (
          <Fontisto name="email" size={16} color="#475569" />
        ) : (
          <View className="flex-row items-center gap-2">
            <Fontisto name="email" size={14} color="#475569" />
            <Text
              className="text-slate-700 text-xs font-semibold"
              style={{ letterSpacing: 0.2 }}
            >
              {text || defaultText}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default ContactUsButton;
