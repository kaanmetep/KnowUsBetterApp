import {
  MerriweatherSans_400Regular,
  MerriweatherSans_700Bold,
} from "@expo-google-fonts/merriweather-sans";
import { useFonts } from "@expo-google-fonts/merriweather-sans/useFonts";
import Feather from "@expo/vector-icons/Feather";
import * as Clipboard from "expo-clipboard";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
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
                  {/* Coin Display and Buy Button */}
                  <CoinBalanceDisplay
                    onBuyCoins={handleBuyCoins}
                    style="default"
                  />

                  <View className="relative">
                    <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-lg" />
                    <View className="relative bg-white border-2 border-gray-900 rounded-lg p-4">
                      <Text
                        style={{
                          fontFamily: "MerriweatherSans_700Bold",
                          fontSize: 14,
                          color: "#1f2937",
                          marginBottom: 8,
                        }}
                      >
                        Your User ID
                      </Text>
                      <View className="flex-row items-center justify-between gap-2">
                        <Text
                          style={{
                            fontFamily: "MerriweatherSans_400Regular",
                            fontSize: 12,
                            color: "#6b7280",
                            flex: 1,
                          }}
                          numberOfLines={1}
                        >
                          {userId || "Loading..."}
                        </Text>
                        <TouchableOpacity
                          onPress={handleCopyUserId}
                          className="bg-white border-2 border-gray-900 rounded-md px-3 py-1.5"
                        >
                          <Text
                            style={{
                              fontFamily: "MerriweatherSans_700Bold",
                              fontSize: 12,
                              color: "#1f2937",
                            }}
                          >
                            Copy
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  <View className="relative">
                    <View className="absolute top-[3px] left-[3px] right-[-3px] bottom-[-3px] bg-gray-900 rounded-lg" />
                    <View className="relative bg-white border-2 border-gray-900 rounded-lg p-4">
                      <ContactUsButton position="none" />
                    </View>
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
                        <View className="flex-row items-center gap-2">
                          <Text style={{ fontSize: 20 }}>
                            {languages[selectedLanguage].flag}
                          </Text>
                          <Text
                            style={{
                              fontFamily: "MerriweatherSans_700Bold",
                              fontSize: 16,
                              color: "#1f2937",
                            }}
                          >
                            {languages[selectedLanguage].label}
                          </Text>
                        </View>
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
