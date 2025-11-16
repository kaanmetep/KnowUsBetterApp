import {
  MerriweatherSans_400Regular,
  MerriweatherSans_700Bold,
} from "@expo-google-fonts/merriweather-sans";
import { useFonts } from "@expo-google-fonts/merriweather-sans/useFonts";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import * as Clipboard from "expo-clipboard";
import Constants from "expo-constants";
import * as Linking from "expo-linking";
import * as StoreReview from "expo-store-review";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLanguage } from "../contexts/LanguageContext";
import { purchaseService } from "../services/purchaseService";
import CoinBalanceDisplay from "./CoinBalanceDisplay";
import ContactUsButton from "./ContactUsButton";

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onBuyCoins?: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  onBuyCoins,
}) => {
  const { selectedLanguage, setSelectedLanguage, languages } = useLanguage();
  const [userId, setUserId] = useState<string>("");
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

  let [fontsLoaded] = useFonts({
    MerriweatherSans_400Regular,
    MerriweatherSans_700Bold,
  });

  useEffect(() => {
    if (visible) {
      loadUserId();
    }
  }, [visible]);

  const loadUserId = async () => {
    try {
      const id = await purchaseService.getAppUserId();
      setUserId(id);
    } catch (error) {
      console.error("❌ Error loading user ID:", error);
      setUserId("Unable to load ID");
    }
  };

  const handleCopyUserId = async () => {
    try {
      await Clipboard.setStringAsync(userId);
      Alert.alert("Copied!", "User ID copied to clipboard");
    } catch (error) {
      console.error("❌ Error copying user ID:", error);
      Alert.alert("Error", "Could not copy user ID");
    }
  };

  const handleBuyCoins = () => {
    if (onBuyCoins) {
      onBuyCoins();
    }
    onClose();
  };

  const handleOpenPrivacyPolicy = () => {
    const privacyPolicyUrl = "https://knowusbetter.app/privacy-policy";
    Linking.openURL(privacyPolicyUrl).catch((err) => {
      console.error("❌ Error opening privacy policy:", err);
      Alert.alert("Error", "Could not open privacy policy link");
    });
  };

  const handleOpenTermsOfService = () => {
    const termsUrl = "https://knowusbetter.app/terms-of-service";
    Linking.openURL(termsUrl).catch((err) => {
      console.error("❌ Error opening terms of service:", err);
      Alert.alert("Error", "Could not open terms of service link");
    });
  };

  const handleRateApp = async () => {
    try {
      // Try to use native review dialog if available
      if (await StoreReview.isAvailableAsync()) {
        await StoreReview.requestReview();
      } else {
        // Fallback: Open App Store/Play Store page
        // NOTE: Replace [YOUR_APP_ID] with your actual App Store ID after publishing
        const appStoreUrl =
          Platform.OS === "ios"
            ? "https://apps.apple.com/app/id[YOUR_APP_ID]"
            : "https://play.google.com/store/apps/details?id=com.knowusbetter.app";
        Linking.openURL(appStoreUrl).catch((err) => {
          console.error("❌ Error opening app store:", err);
          Alert.alert("Error", "Could not open app store");
        });
      }
    } catch (error) {
      console.error("❌ Error requesting review:", error);
      // Fallback to App Store link if review dialog fails
      const appStoreUrl =
        Platform.OS === "ios"
          ? "https://apps.apple.com/app/id[YOUR_APP_ID]"
          : "https://play.google.com/store/apps/details?id=com.knowusbetter.app";
      Linking.openURL(appStoreUrl).catch((err) => {
        console.error("❌ Error opening app store:", err);
        Alert.alert("Error", "Could not open app store");
      });
    }
  };

  const handleRequestDataDeletion = () => {
    Alert.alert(
      "Request Data Deletion",
      "Please contact us and your data will be deleted within 48 hours. If you would like to receive confirmation when your data has been deleted, please mention this in your email.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Send Email Now",
          onPress: async () => {
            try {
              // Get app user ID
              let appUserId = "Unable to load ID";
              try {
                appUserId = await purchaseService.getAppUserId();
              } catch (error) {
                console.error("Error getting app user ID:", error);
              }

              const email = "help@knowusbetter.app";
              const subject = "KnowUsBetter - Data Deletion Request";
              const body = `Hi KnowUsBetter Team,

I would like to request deletion of my account data.

${userId ? `User ID: ${userId}` : `User ID: ${appUserId}`}
---
App Info:
Platform: ${Platform.OS}
Version: ${Platform.Version}
User ID: ${userId || appUserId}`;

              const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(
                subject
              )}&body=${encodeURIComponent(body)}`;

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
                          Alert.alert(
                            "Copied!",
                            "Email address copied to clipboard"
                          );
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
          },
        },
      ]
    );
  };

  const appVersion = Constants.expoConfig?.version || "1.0.0";
  const buildNumber =
    Platform.OS === "ios"
      ? Constants.expoConfig?.ios?.buildNumber
      : Constants.expoConfig?.android?.versionCode;

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
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.7)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: "90%",
            maxWidth: 400,
            backgroundColor: "white",
            borderRadius: 20,
            maxHeight: "80%",
          }}
        >
          <View className="relative">
            <View className="absolute top-[3px] left-[3px] right-[-3px] bottom-[-3px] bg-gray-900 rounded-[20px]" />
            <View className="relative bg-white border-2 border-gray-900 rounded-[20px] overflow-hidden">
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 20 }}
              >
                <View className="flex-row justify-between items-center mb-6">
                  <Text
                    style={{
                      fontFamily: "MerriweatherSans_700Bold",
                      fontSize: 24,
                      color: "#1f2937",
                    }}
                  >
                    Settings
                  </Text>
                  <TouchableOpacity
                    onPress={onClose}
                    className="bg-gray-100 rounded-full p-1"
                  >
                    <Feather name="x" size={24} color="#1f2937" />
                  </TouchableOpacity>
                </View>

                <View className="gap-4">
                  {/* Coin Display and Contact Us - Side by Side */}
                  <View className="flex-row items-center justify-between gap-3">
                    <CoinBalanceDisplay
                      onBuyCoins={handleBuyCoins}
                      style="default"
                    />

                    <ContactUsButton position="none" />
                  </View>

                  <View className="relative">
                    <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-lg" />
                    <View className="relative bg-white border-2 border-gray-900 rounded-lg overflow-hidden">
                      <TouchableOpacity
                        onPress={() =>
                          setIsLanguageMenuOpen(!isLanguageMenuOpen)
                        }
                        activeOpacity={0.8}
                        className="p-4 flex-row items-center justify-between"
                      >
                        <Text
                          style={{
                            fontFamily: "MerriweatherSans_700Bold",
                            fontSize: 16,
                            color: "#1f2937",
                          }}
                        >
                          Select a language
                        </Text>
                        <Feather
                          name={
                            isLanguageMenuOpen ? "chevron-up" : "chevron-down"
                          }
                          size={20}
                          color="#1f2937"
                        />
                      </TouchableOpacity>

                      {isLanguageMenuOpen && (
                        <View className="border-t-2 border-gray-900">
                          {(
                            Object.keys(languages) as Array<
                              keyof typeof languages
                            >
                          ).map((lang, index) => (
                            <TouchableOpacity
                              key={lang}
                              onPress={() => {
                                setSelectedLanguage(lang);
                                setIsLanguageMenuOpen(false);
                              }}
                              activeOpacity={0.8}
                              className={`flex-row items-center gap-2 px-4 py-3 ${
                                index !== Object.keys(languages).length - 1
                                  ? "border-b-2 border-gray-900"
                                  : ""
                              } ${
                                selectedLanguage === lang ? "bg-white/50" : ""
                              }`}
                            >
                              <Text style={{ fontSize: 18 }}>
                                {languages[lang].flag}
                              </Text>
                              <Text
                                style={{
                                  fontFamily: "MerriweatherSans_400Regular",
                                  fontSize: 14,
                                  color: "#1f2937",
                                }}
                              >
                                {languages[lang].label}
                              </Text>
                              {selectedLanguage === lang && (
                                <View className="ml-auto">
                                  <Feather
                                    name="check"
                                    size={18}
                                    color="#1f2937"
                                  />
                                </View>
                              )}
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Privacy Policy */}
                  <TouchableOpacity
                    onPress={handleOpenPrivacyPolicy}
                    activeOpacity={0.8}
                  >
                    <View className="relative">
                      <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-lg" />
                      <View className="relative bg-white border-2 border-gray-900 rounded-lg p-4 flex-row items-center justify-between">
                        <View className="flex-row items-center gap-3">
                          <FontAwesome5
                            name="shield-alt"
                            size={18}
                            color="#1f2937"
                          />
                          <Text
                            style={{
                              fontFamily: "MerriweatherSans_700Bold",
                              fontSize: 14,
                              color: "#1f2937",
                            }}
                          >
                            Privacy Policy
                          </Text>
                        </View>
                        <Feather
                          name="chevron-right"
                          size={20}
                          color="#6b7280"
                        />
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* Terms of Service */}
                  <TouchableOpacity
                    onPress={handleOpenTermsOfService}
                    activeOpacity={0.8}
                  >
                    <View className="relative">
                      <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-lg" />
                      <View className="relative bg-white border-2 border-gray-900 rounded-lg p-4 flex-row items-center justify-between">
                        <View className="flex-row items-center gap-3">
                          <FontAwesome5
                            name="file-contract"
                            size={18}
                            color="#1f2937"
                          />
                          <Text
                            style={{
                              fontFamily: "MerriweatherSans_700Bold",
                              fontSize: 14,
                              color: "#1f2937",
                            }}
                          >
                            Terms of Service
                          </Text>
                        </View>
                        <Feather
                          name="chevron-right"
                          size={20}
                          color="#6b7280"
                        />
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* Rate App */}
                  <TouchableOpacity onPress={handleRateApp} activeOpacity={0.8}>
                    <View className="relative">
                      <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-lg" />
                      <View className="relative bg-white border-2 border-gray-900 rounded-lg p-4 flex-row items-center justify-between">
                        <View className="flex-row items-center gap-3">
                          <FontAwesome5 name="star" size={18} color="#fbbf24" />
                          <Text
                            style={{
                              fontFamily: "MerriweatherSans_700Bold",
                              fontSize: 14,
                              color: "#1f2937",
                            }}
                          >
                            Rate App
                          </Text>
                        </View>
                        <Feather
                          name="chevron-right"
                          size={20}
                          color="#6b7280"
                        />
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* Request Data Deletion */}
                  <TouchableOpacity
                    onPress={handleRequestDataDeletion}
                    activeOpacity={0.8}
                  >
                    <View className="relative">
                      <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-lg" />
                      <View className="relative bg-white border-2 border-gray-900 rounded-lg p-4 flex-row items-center justify-between">
                        <View className="flex-row items-center gap-3">
                          <FontAwesome5
                            name="trash-alt"
                            size={18}
                            color="#ef4444"
                          />
                          <Text
                            style={{
                              fontFamily: "MerriweatherSans_700Bold",
                              fontSize: 14,
                              color: "#1f2937",
                            }}
                          >
                            Request Data Deletion
                          </Text>
                        </View>
                        <Feather
                          name="chevron-right"
                          size={20}
                          color="#6b7280"
                        />
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* User ID */}
                  <TouchableOpacity
                    onPress={handleCopyUserId}
                    activeOpacity={0.8}
                  >
                    <View className="relative">
                      <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-lg" />
                      <View className="relative bg-gray-50 border-2 border-gray-900 rounded-lg p-4 flex-row items-center justify-center gap-2">
                        <Text
                          style={{
                            fontFamily: "MerriweatherSans_400Regular",
                            fontSize: 12,
                            color: "#6b7280",
                            textAlign: "center",
                          }}
                        >
                          User ID: {userId || "Loading..."}
                        </Text>
                        <Feather name="copy" size={16} color="#6b7280" />
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* App Version */}
                  <View className="relative">
                    <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-lg" />
                    <View className="relative bg-gray-50 border-2 border-gray-900 rounded-lg p-4">
                      <Text
                        style={{
                          fontFamily: "MerriweatherSans_400Regular",
                          fontSize: 12,
                          color: "#6b7280",
                          textAlign: "center",
                        }}
                      >
                        Version {appVersion}
                        {buildNumber ? ` (Build ${buildNumber})` : ""}
                      </Text>
                    </View>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default SettingsModal;
