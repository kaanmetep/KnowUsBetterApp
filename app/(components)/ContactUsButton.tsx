import Fontisto from "@expo/vector-icons/Fontisto";
import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";
import React from "react";
import { Alert, Platform, Text, TouchableOpacity, View } from "react-native";

interface ContactUsButtonProps {
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  style?: "default" | "compact"; // default: with text, compact: icon only
}

const ContactUsButton: React.FC<ContactUsButtonProps> = ({
  position = "bottom-left",
  style = "default",
}) => {
  const handleContactUs = async () => {
    const email = "help@knowusbetter.app";
    const subject = "KnowUsBetter - Support Request";
    const body = `Hi KnowUsBetter Team,\n\n[Please describe your issue or feedback here]\n\n---\nApp Info:\nPlatform: ${Platform.OS}\nVersion: ${Platform.Version}`;

    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    try {
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
      } else {
        // Fallback: Show email address
        if (Platform.OS === "web") {
          window.alert(
            `Please send your message to:\n\n${email}\n\nEmail has been copied to clipboard!`
          );
          await Clipboard.setStringAsync(email);
        } else {
          Alert.alert(
            "Contact Us",
            `Please send your message to:\n\n${email}`,
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
                Contact Us
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ContactUsButton;
