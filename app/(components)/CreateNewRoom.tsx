import { Ionicons } from "@expo/vector-icons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useCoins } from "../contexts/CoinContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useTranslation } from "../hooks/useTranslation";
import {
  Category,
  getCategories,
  getCategoryLabel,
} from "../services/categoryService";
import { UserPreferencesService } from "../services/userPreferencesService";
import AvatarSelection from "./AvatarSelection";
import ContactUsButton from "./ContactUsButton";
import ModalButton from "./ModalButton";
import NameInput from "./NameInput";

interface CreateNewRoomProps {
  visible: boolean;
  onClose: () => void;
  onCreateRoom: (
    userName: string,
    category: string,
    avatar?: string
  ) => Promise<void>;
  onBuyCoins?: () => void;
}

const CreateNewRoom: React.FC<CreateNewRoomProps> = ({
  visible,
  onClose,
  onCreateRoom,
  onBuyCoins,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [userNameFocused, setUserNameFocused] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);
  const { coins } = useCoins();
  const { selectedLanguage } = useLanguage();
  const { t } = useTranslation();
  const loadingOpacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loadCategories = async () => {
      setCategoriesLoading(true);
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error("❌ Error loading categories:", error);
      } finally {
        setCategoriesLoading(false);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    loadingOpacity.setValue(0.1);
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(loadingOpacity, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(loadingOpacity, {
          toValue: 0.4,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => {
      pulse.stop();
      pulse.reset();
    };
  }, []);

  useEffect(() => {
    if (visible) loadSavedPreferences();
  }, [visible]);

  const loadSavedPreferences = async () => {
    try {
      const savedUsername = await UserPreferencesService.getUsername();
      const savedAvatar = await UserPreferencesService.getAvatar();
      if (savedUsername) setUserName(savedUsername);
      if (savedAvatar) setSelectedAvatar(savedAvatar);
    } catch (error) {
      console.warn("⚠️ Failed to load saved preferences:", error);
    }
  };

  useEffect(() => {
    if (selectedAvatar) UserPreferencesService.saveAvatar(selectedAvatar);
  }, [selectedAvatar]);

  useEffect(() => {
    if (userName.trim().length > 0) {
      const timeoutId = setTimeout(() => {
        UserPreferencesService.saveUsername(userName.trim());
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [userName]);

  const handleClose = () => {
    setStep(1);
    setSelectedAvatar(null);
    setSelectedCategory(null);
    setUserName("");
    setUserNameFocused(false);
    onClose();
  };

  const handleContinueFromStep1 = () => {
    if (selectedAvatar) setStep(2);
  };

  const handleContinueFromStep2 = () => {
    if (userName.trim().length > 0) setStep(3);
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
  };

  const handleCreate = async () => {
    if (selectedCategory && userName.trim() && selectedAvatar && !isCreating) {
      const category = categories.find((c) => c.id === selectedCategory);
      if (category?.coinsRequired && coins < category.coinsRequired) {
        onBuyCoins?.();
        return;
      }

      setIsCreating(true);
      try {
        await onCreateRoom(userName.trim(), selectedCategory, selectedAvatar);
        setStep(1);
        setSelectedAvatar(null);
        setSelectedCategory(null);
        setUserName("");
      } catch (error) {
        console.error("Error creating room:", error);
      } finally {
        setIsCreating(false);
      }
    }
  };

  const isStep1Valid = selectedAvatar !== null;
  const isStep2Valid = userName.trim().length > 0;
  const isStep3Valid = selectedCategory !== null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <Pressable
          className="flex-1 bg-black/40 justify-center items-center px-4"
          onPress={handleClose}
        >
          <Pressable
            className="w-full bg-white rounded-3xl p-6"
            onPress={(e) => e.stopPropagation()}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 5,
            }}
          >
            {/* Header: Close & Back Buttons */}
            <View className="flex-row justify-between items-center absolute top-4 left-4 right-4 z-20">
              <View>
                {step > 1 && (
                  <TouchableOpacity
                    onPress={handleBack}
                    className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center"
                  >
                    <Ionicons name="arrow-back" size={20} color="#374151" />
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                onPress={handleClose}
                className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center"
              >
                <Ionicons name="close" size={20} color="#374151" />
              </TouchableOpacity>
            </View>

            <View className="h-8" />

            {/* STEP INDICATOR */}
            <View className="flex-row justify-center gap-2 mb-6">
              {[1, 2, 3].map((s) => {
                let bgClass = "bg-gray-100";
                if (s === step) bgClass = "bg-rose-400";
                else if (s < step) bgClass = "bg-rose-200";

                return (
                  <TouchableOpacity
                    key={s}
                    onPress={() => {
                      if (s === 1) setStep(1);
                      if (s === 2 && isStep1Valid) setStep(2);
                      if (s === 3 && isStep1Valid && isStep2Valid) setStep(3);
                    }}
                    disabled={
                      (s === 2 && !isStep1Valid) ||
                      (s === 3 && (!isStep1Valid || !isStep2Valid))
                    }
                    activeOpacity={0.8}
                  >
                    <View className={`w-8 h-1.5 rounded-full ${bgClass}`} />
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* --- STEP 1: AVATAR --- */}
            {step === 1 && (
              <View>
                <AvatarSelection
                  selectedAvatar={selectedAvatar}
                  onAvatarSelect={setSelectedAvatar}
                  theme="red"
                />
                <View className="mt-8">
                  <ModalButton
                    onPress={handleContinueFromStep1}
                    disabled={!isStep1Valid}
                    text={t("createRoom.continue")}
                    disabledText={t("createRoom.selectAvatar")}
                    variant="pink"
                  />
                </View>
              </View>
            )}

            {/* --- STEP 2: NAME --- */}
            {step === 2 && (
              <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View className="py-4">
                  <NameInput
                    userName={userName}
                    onUserNameChange={setUserName}
                    userNameFocused={userNameFocused}
                    onUserNameFocus={() => setUserNameFocused(true)}
                    onUserNameBlur={() => setUserNameFocused(false)}
                  />
                </View>
                <View className="mt-6">
                  <ModalButton
                    onPress={handleContinueFromStep2}
                    disabled={!isStep2Valid}
                    text={t("createRoom.continue")}
                    disabledText={t("createRoom.enterYourName")}
                    variant="pink"
                  />
                </View>
              </ScrollView>
            )}

            {/* --- STEP 3: CATEGORY --- */}
            {step === 3 && (
              <View>
                <Text
                  className="text-2xl font-bold text-slate-800 text-center mb-1"
                  style={{ fontFamily: "MerriweatherSans_700Bold" }}
                >
                  {t("createRoom.chooseYourVibe")}
                </Text>

                <Text
                  className="text-sm text-slate-500 text-center mb-6"
                  style={{ fontFamily: "MerriweatherSans_400Regular" }}
                >
                  {t("createRoom.pickCategory")}
                </Text>

                <ScrollView
                  className="max-h-[300px] mb-4 -mx-2 px-2"
                  showsVerticalScrollIndicator={false}
                >
                  {categoriesLoading ? (
                    <View className="py-8 items-center">
                      <Animated.Text
                        className="text-slate-400"
                        style={{
                          fontFamily: "MerriweatherSans_400Regular",
                          opacity: loadingOpacity,
                        }}
                      >
                        {t("createRoom.loadingCategories")}
                      </Animated.Text>
                    </View>
                  ) : categories.length === 0 ? (
                    <View className="py-4 items-center">
                      <Text
                        className="text-slate-500"
                        style={{ fontFamily: "MerriweatherSans_400Regular" }}
                      >
                        {t("createRoom.noCategoriesAvailable")}
                      </Text>
                      <View className="mt-4">
                        <ContactUsButton
                          position="none"
                          text={t("createRoom.reportIssue")}
                        />
                      </View>
                    </View>
                  ) : (
                    categories.map((category) => {
                      const isSelected = selectedCategory === category.id;

                      const borderColor = isSelected
                        ? "rgba(0,0,0,0.1)"
                        : "transparent";
                      const borderWidth = isSelected ? 2 : 0;

                      return (
                        <TouchableOpacity
                          key={category.id}
                          onPress={() => setSelectedCategory(category.id)}
                          className="mb-3 rounded-2xl p-4 flex-row items-center justify-between"
                          activeOpacity={0.8}
                          style={{
                            backgroundColor: category.color,
                            borderWidth: borderWidth,
                            borderColor: borderColor,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.05,
                            shadowRadius: 4,
                            elevation: 2,
                          }}
                        >
                          <View className="flex-row items-center flex-1">
                            <View className="w-10 h-10 rounded-full bg-white/40 items-center justify-center mr-3">
                              {category.iconType ===
                              "MaterialCommunityIcons" ? (
                                <MaterialCommunityIcons
                                  name={category.iconName as any}
                                  size={20}
                                  color="#1f2937"
                                />
                              ) : (
                                <FontAwesome6
                                  name={category.iconName as any}
                                  size={18}
                                  color="#1f2937"
                                />
                              )}
                            </View>

                            <Text
                              className="text-lg font-semibold text-slate-900 flex-1 mr-2"
                              style={{
                                fontFamily: "MerriweatherSans_600SemiBold",
                              }}
                              numberOfLines={1}
                            >
                              {getCategoryLabel(category, selectedLanguage)}
                            </Text>

                            {category.isPremium && (
                              <View className="bg-yellow-400 rounded-lg px-2.5 py-1.5 flex-row items-center shadow-sm">
                                <FontAwesome6
                                  name="coins"
                                  size={10}
                                  color="#713f12"
                                />
                                <Text className="text-yellow-900 text-xs font-bold ml-1.5">
                                  {category.coinsRequired}
                                </Text>
                              </View>
                            )}
                          </View>

                          {/* Checkmark */}
                          {isSelected && (
                            <View className="ml-3 w-6 h-6 rounded-full bg-white/40 items-center justify-center">
                              <Ionicons
                                name="checkmark"
                                size={16}
                                color="#1f2937"
                              />
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })
                  )}
                </ScrollView>

                <View className="items-center justify-center mb-2 gap-2">
                  <View className="bg-amber-50 rounded-full px-4 py-1.5 border border-amber-100">
                    <Text
                      className="text-amber-700 text-xs font-medium"
                      style={{ fontFamily: "MerriweatherSans_400Regular" }}
                    >
                      <FontAwesome6 name="coins" size={12} color="#b45309" />
                      {"  "}
                      <Text>{t("coins.youHave", { coins })}</Text>
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => onBuyCoins?.()}
                    className="bg-amber-100 rounded-full px-4 py-1.5 border border-amber-200 active:bg-amber-200 mt-2"
                    activeOpacity={0.7}
                  >
                    <Text
                      className="text-amber-700 text-xs font-semibold"
                      style={{ fontFamily: "MerriweatherSans_600SemiBold" }}
                    >
                      {t("coins.buyCoins")}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View className="mt-4">
                  <ModalButton
                    onPress={handleCreate}
                    disabled={!isStep3Valid}
                    isLoading={isCreating}
                    text={t("createRoom.createRoom")}
                    disabledText={t("createRoom.selectCategory")}
                    loadingText={t("createRoom.creating")}
                    variant="pink"
                    showLoadingIndicator={true}
                  />
                </View>
              </View>
            )}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CreateNewRoom;
