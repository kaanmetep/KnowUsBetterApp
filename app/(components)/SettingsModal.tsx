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
import { useTranslation } from "../hooks/useTranslation";
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
  const { t } = useTranslation();
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
      setUserId(t("settings.unableToLoadId"));
    }
  };

  const handleCopyUserId = async () => {
    try {
      await Clipboard.setStringAsync(userId);
      Alert.alert(t("common.copied"), t("settings.userIdCopied"));
    } catch (error) {
      console.error("❌ Error copying user ID:", error);
      Alert.alert(t("common.error"), t("settings.couldNotCopyUserId"));
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
      Alert.alert(t("common.error"), t("settings.couldNotOpenPrivacyPolicy"));
    });
  };

  const handleOpenTermsOfService = () => {
    const termsUrl = "https://knowusbetter.app/terms-of-service";
    Linking.openURL(termsUrl).catch((err) => {
      console.error("❌ Error opening terms of service:", err);
      Alert.alert(t("common.error"), t("settings.couldNotOpenTerms"));
    });
  };

  const handleRateApp = async () => {
    try {
      if (await StoreReview.isAvailableAsync()) {
        await StoreReview.requestReview();
      } else {
        const appStoreUrl =
          Platform.OS === "ios"
            ? "https://apps.apple.com/app/id[YOUR_APP_ID]"
            : "https://play.google.com/store/apps/details?id=com.knowusbetter.app";
        Linking.openURL(appStoreUrl).catch((err) => {
          console.error("❌ Error opening app store:", err);
          Alert.alert(t("common.error"), t("settings.couldNotOpenAppStore"));
        });
      }
    } catch (error) {
      console.error("❌ Error requesting review:", error);
      const appStoreUrl =
        Platform.OS === "ios"
          ? "https://apps.apple.com/app/id[YOUR_APP_ID]"
          : "https://play.google.com/store/apps/details?id=com.knowusbetter.app";
      Linking.openURL(appStoreUrl).catch((err) => {
        console.error("❌ Error opening app store:", err);
        Alert.alert(t("common.error"), t("settings.couldNotOpenAppStore"));
      });
    }
  };

  const handleRequestDataDeletion = () => {
    Alert.alert(
      t("settings.requestDataDeletion"),
      t("settings.dataDeletionMessage"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("settings.sendEmailNow"),
          onPress: async () => {
            try {
              let appUserId = t("settings.unableToLoadId");
              try {
                appUserId = await purchaseService.getAppUserId();
              } catch (error) {
                console.error("Error getting app user ID:", error);
              }

              const email = "help@knowusbetter.app";
              const subject = t("settings.dataDeletionRequestSubject");
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
                if (Platform.OS === "web") {
                  window.alert(
                    `Please send your message to:\n\n${email}\n\nEmail has been copied to clipboard!`
                  );
                  await Clipboard.setStringAsync(email);
                } else {
                  Alert.alert(
                    t("contact.contactUs"),
                    t("settings.pleaseSendMessageTo", { email }),
                    [
                      {
                        text: t("contact.copyEmail"),
                        onPress: async () => {
                          await Clipboard.setStringAsync(email);
                          Alert.alert(
                            t("common.copied"),
                            t("contact.emailCopied")
                          );
                        },
                      },
                      { text: t("common.ok"), style: "cancel" },
                    ]
                  );
                }
              }
            } catch (error) {
              console.error("❌ Error opening email:", error);
              Alert.alert(
                t("common.error"),
                t("settings.couldNotOpenEmailClient")
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
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: "90%",
            maxWidth: 400,
            backgroundColor: "white",
            borderRadius: 32,
            maxHeight: "85%",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.15,
            shadowRadius: 24,
            elevation: 10,
          }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 24 }}
          >
            <View className="flex-row justify-between items-center mb-8">
              <Text
                style={{
                  fontFamily: "MerriweatherSans_700Bold",
                  fontSize: 24,
                  color: "#1e293b",
                }}
              >
                {t("settings.title")}
              </Text>
              <TouchableOpacity
                onPress={onClose}
                className="bg-slate-100 rounded-full p-2"
                activeOpacity={0.7}
              >
                <Feather name="x" size={20} color="#475569" />
              </TouchableOpacity>
            </View>

            <View className="gap-4">
              <View className="flex-row items-center justify-between mb-2">
                <CoinBalanceDisplay onBuyCoins={handleBuyCoins} />
                <ContactUsButton position="none" />
              </View>

              {/* Buy Coins Button */}
              <TouchableOpacity
                onPress={handleBuyCoins}
                activeOpacity={0.7}
                className="bg-amber-50  border-amber-300 rounded-full px-4 py-3 flex-row items-center justify-center gap-2 shadow-sm shadow-amber-100/50"
              >
                <View className="bg-amber-100 w-5 h-5 rounded-full items-center justify-center">
                  <FontAwesome5 name="plus" size={10} color="#B45309" />
                </View>
                <Text
                  className="text-amber-800 font-bold text-sm"
                  style={{ fontFamily: "MerriweatherSans_700Bold" }}
                >
                  {t("coins.buyCoins")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                activeOpacity={0.9}
                className="bg-white rounded-2xl p-4 border border-slate-100"
                style={{
                  shadowColor: "#94a3b8",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3">
                    <View className="w-8 h-8 rounded-full bg-indigo-50 items-center justify-center">
                      <Feather name="globe" size={16} color="#6366f1" />
                    </View>
                    <Text
                      style={{
                        fontFamily: "MerriweatherSans_700Bold",
                        fontSize: 16,
                        color: "#334155",
                      }}
                    >
                      {t("settings.selectLanguage")}
                    </Text>
                  </View>
                  <Feather
                    name={isLanguageMenuOpen ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#94a3b8"
                  />
                </View>

                {isLanguageMenuOpen && (
                  <View className="mt-4 pt-2 border-t border-slate-100">
                    {(Object.keys(languages) as (keyof typeof languages)[]).map(
                      (lang, index) => (
                        <TouchableOpacity
                          key={lang}
                          onPress={() => {
                            setSelectedLanguage(lang);
                            setIsLanguageMenuOpen(false);
                          }}
                          activeOpacity={0.7}
                          className={`flex-row items-center gap-3 py-3 ${
                            selectedLanguage === lang
                              ? "bg-indigo-50/50 rounded-xl px-2 -mx-2"
                              : ""
                          }`}
                        >
                          <Text style={{ fontSize: 20 }}>
                            {languages[lang].flag}
                          </Text>
                          <Text
                            style={{
                              fontFamily: "MerriweatherSans_400Regular",
                              fontSize: 15,
                              color:
                                selectedLanguage === lang
                                  ? "#4f46e5"
                                  : "#475569",
                            }}
                          >
                            {languages[lang].label}
                          </Text>
                          {selectedLanguage === lang && (
                            <View className="ml-auto">
                              <Feather name="check" size={18} color="#4f46e5" />
                            </View>
                          )}
                        </TouchableOpacity>
                      )
                    )}
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleOpenPrivacyPolicy}
                activeOpacity={0.7}
                className="bg-white rounded-2xl p-4 flex-row items-center justify-between border border-slate-100"
                style={{
                  shadowColor: "#94a3b8",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <View className="flex-row items-center gap-3">
                  <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center">
                    <FontAwesome5 name="shield-alt" size={14} color="#3b82f6" />
                  </View>
                  <Text
                    style={{
                      fontFamily: "MerriweatherSans_700Bold",
                      fontSize: 14,
                      color: "#334155",
                    }}
                  >
                    {t("settings.privacyPolicy")}
                  </Text>
                </View>
                <Feather name="chevron-right" size={18} color="#94a3b8" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleOpenTermsOfService}
                activeOpacity={0.7}
                className="bg-white rounded-2xl p-4 flex-row items-center justify-between border border-slate-100"
                style={{
                  shadowColor: "#94a3b8",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <View className="flex-row items-center gap-3">
                  <View className="w-8 h-8 rounded-full bg-emerald-50 items-center justify-center">
                    <FontAwesome5
                      name="file-contract"
                      size={14}
                      color="#10b981"
                    />
                  </View>
                  <Text
                    style={{
                      fontFamily: "MerriweatherSans_700Bold",
                      fontSize: 14,
                      color: "#334155",
                    }}
                  >
                    {t("settings.termsOfService")}
                  </Text>
                </View>
                <Feather name="chevron-right" size={18} color="#94a3b8" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleRequestDataDeletion}
                activeOpacity={0.7}
                className="bg-white rounded-2xl p-4 flex-row items-center justify-between border border-slate-100"
                style={{
                  shadowColor: "#94a3b8",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <View className="flex-row items-center gap-3">
                  <View className="w-8 h-8 rounded-full bg-red-50 items-center justify-center">
                    <FontAwesome5 name="trash-alt" size={14} color="#ef4444" />
                  </View>
                  <Text
                    style={{
                      fontFamily: "MerriweatherSans_700Bold",
                      fontSize: 14,
                      color: "#334155",
                    }}
                  >
                    {t("settings.requestDataDeletion")}
                  </Text>
                </View>
                <Feather name="chevron-right" size={18} color="#94a3b8" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCopyUserId}
                activeOpacity={0.7}
                className="bg-slate-50 rounded-2xl p-4 mt-2"
              >
                <View className="flex-col items-center justify-center gap-2">
                  <Text
                    style={{
                      fontFamily: "MerriweatherSans_700Bold",
                      fontSize: 12,
                      color: "#64748b",
                      textAlign: "center",
                    }}
                  >
                    {t("settings.userId")}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <Text
                      style={{
                        fontFamily: "MerriweatherSans_400Regular",
                        fontSize: 12,
                        color: "#94a3b8",
                        textAlign: "center",
                      }}
                    >
                      {userId || t("settings.loading")}
                    </Text>
                    <Feather name="copy" size={12} color="#94a3b8" />
                  </View>
                </View>
              </TouchableOpacity>

              <View className="items-center py-2">
                <Text
                  style={{
                    fontFamily: "MerriweatherSans_400Regular",
                    fontSize: 12,
                    color: "#cbd5e1",
                    textAlign: "center",
                  }}
                >
                  {t("settings.version", { version: appVersion })}
                  {buildNumber
                    ? ` (${t("settings.build", { build: buildNumber })})`
                    : ""}
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default SettingsModal;
