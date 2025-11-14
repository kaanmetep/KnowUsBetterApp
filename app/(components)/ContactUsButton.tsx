import Fontisto from "@expo/vector-icons/Fontisto";
import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";
import React from "react";
import { Alert, Platform, Text, TouchableOpacity, View } from "react-native";
import { purchaseService } from "../services/purchaseService";

interface ContactUsButtonProps {
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "none";
  style?: "default" | "compact"; // default: with text, compact: icon only
  text?: string; // Custom button text
}

const ContactUsButton: React.FC<ContactUsButtonProps> = ({
  position = "bottom-left",
  style = "default",
  text = "Contact Us",
}) => {
  const handleContactUs = async () => {
    try {
      // Get app user ID
      let appUserId = "Unable to load ID";
      try {
        appUserId = await purchaseService.getAppUserId();
      } catch (error) {
        console.error("Error getting app user ID:", error);
      }

      const email = "help@knowusbetter.app";
      const subject = "KnowUsBetter - Support Request";
      const body = `Hi KnowUsBetter Team,

[Please describe your issue or feedback here]

---
App Info:
Platform: ${Platform.OS}
Version: ${Platform.Version}
User ID: ${appUserId}`;

      const userInfo = `Platform: ${Platform.OS}\nVersion: ${Platform.Version}\nUser ID: ${appUserId}`;

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
            `Please send your message to:\n\n${email}\n\n${userInfo}\n\nEmail has been copied to clipboard!`
          );
          await Clipboard.setStringAsync(email);
        } else {
          Alert.alert(
            "Contact Us",
            `Please send your message to:\n\n${email}\n\n${userInfo}`,
            [
              {
                text: "Copy Email",
                onPress: async () => {
                  await Clipboard.setStringAsync(email);
                  Alert.alert("Copied!", "Email address copied to clipboard");
                },
              },
              { text: "OK", style: "cancel" },
            ]
          );
        }
      }
    } catch (error) {
      console.error("❌ Error opening email:", error);
      Alert.alert(
        "Error",
        "Could not open email client. Please email us at: help@knowusbetter.app"
      );
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
                {text}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ContactUsButton;
