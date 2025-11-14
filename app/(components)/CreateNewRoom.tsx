import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useEffect, useState } from "react";
import {
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
import { UserPreferencesService } from "../services/userPreferencesService";
import AvatarSelection from "./AvatarSelection";
import ButtonLoading from "./ButtonLoading";
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

type Category = {
  id: string;
  label: string;
  iconName: "handshake" | "heart" | "ring" | "fire-flame-curved";
  color: string;
  isPremium?: boolean;
  coinsRequired?: number;
};

const categories: Category[] = [
  {
    id: "just_friends",
    label: "We're Just Friends",
    iconName: "handshake",
    color: "#fef3c7",
  },
  {
    id: "we_just_met",
    label: "We Just Met",
    iconName: "heart",
    color: "#fee4e6",
  },
  {
    id: "long_term",
    label: "Long-Term Lovers",
    iconName: "ring",
    color: "#e0f2fe",
    isPremium: true,
    coinsRequired: 1,
  },
  {
    id: "spicy",
    label: "Spicy & Flirty",
    iconName: "fire-flame-curved",
    color: "#f87171",
    isPremium: true,
    coinsRequired: 2,
  },
];

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
  const { coins } = useCoins();

  // Load saved preferences when modal opens
  useEffect(() => {
    if (visible) {
      loadSavedPreferences();
    }
  }, [visible]);

  const loadSavedPreferences = async () => {
    try {
      const savedUsername = await UserPreferencesService.getUsername();
      const savedAvatar = await UserPreferencesService.getAvatar();

      if (savedUsername) {
        setUserName(savedUsername);
      }
      if (savedAvatar) {
        setSelectedAvatar(savedAvatar);
      }
    } catch (error) {
      console.warn("⚠️ Failed to load saved preferences:", error);
    }
  };

  // Save avatar when it changes
  useEffect(() => {
    if (selectedAvatar) {
      UserPreferencesService.saveAvatar(selectedAvatar);
    }
  }, [selectedAvatar]);

  // Save username when it changes (debounced)
  useEffect(() => {
    if (userName.trim().length > 0) {
      const timeoutId = setTimeout(() => {
        UserPreferencesService.saveUsername(userName.trim());
      }, 500); // Save after 500ms of no typing

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
    if (selectedAvatar) {
      setStep(2);
    }
  };

  const handleContinueFromStep2 = () => {
    if (userName.trim().length > 0) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    }
  };

  const handleCreate = async () => {
    if (selectedCategory && userName.trim() && selectedAvatar && !isCreating) {
      // Check if category requires coins (only check, don't deduct yet)
      const category = categories.find((c) => c.id === selectedCategory);
      if (category?.coinsRequired) {
        // Only check if user has enough coins, don't deduct yet
        if (coins < category.coinsRequired) {
          // Not enough coins - show purchase modal
          onBuyCoins?.();
          return;
        }
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
          className="flex-1 bg-black/50 justify-center items-center px-6"
          onPress={handleClose}
        >
          <Pressable
            className="w-full max-w-[400px]"
            onPress={(e) => e.stopPropagation()}
          >
            {/* STEP 1: Avatar Selection */}
            {step === 1 && (
              <View className="relative">
                {/* Shadow */}
                <View className="absolute top-[4px] left-[4px] right-[-4px] bottom-[-4px] bg-gray-900 rounded-2xl" />

                {/* Modal Content */}
                <View className="relative bg-white border-4 border-gray-900 rounded-2xl p-6">
                  {/* Close Button */}
                  <TouchableOpacity
                    onPress={handleClose}
                    className="absolute top-4 right-4 z-10"
                  >
                    <View className="relative">
                      <View className="absolute top-[1px] left-[1px] right-[-1px] bottom-[-1px] bg-gray-900 rounded-full" />
                      <View className="relative bg-white border-2 border-gray-900 rounded-full w-8 h-8 items-center justify-center">
                        <Text className="text-gray-900 text-lg font-bold">
                          ×
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* Step Indicator */}
                  <View className="flex-row justify-center gap-2 mb-4">
                    <TouchableOpacity
                      onPress={() => setStep(1)}
                      activeOpacity={0.8}
                    >
                      <View className="w-8 h-2 rounded-full bg-[#ffe4e6] border-2 border-gray-900" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        if (isStep1Valid) {
                          setStep(2);
                        }
                      }}
                      activeOpacity={0.8}
                      disabled={!isStep1Valid}
                    >
                      <View
                        className={`w-8 h-2 rounded-full ${
                          isStep1Valid ? "bg-gray-300" : "bg-gray-200"
                        } border-gray-900`}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        if (isStep1Valid && isStep2Valid) {
                          setStep(3);
                        }
                      }}
                      activeOpacity={0.8}
                      disabled={!isStep1Valid || !isStep2Valid}
                    >
                      <View
                        className={`w-8 h-2 rounded-full ${
                          isStep1Valid && isStep2Valid
                            ? "bg-gray-300"
                            : "bg-gray-200"
                        } border-gray-900`}
                      />
                    </TouchableOpacity>
                  </View>

                  <AvatarSelection
                    selectedAvatar={selectedAvatar}
                    onAvatarSelect={setSelectedAvatar}
                    theme="red"
                  />

                  {/* Continue Button */}
                  <View className="relative mt-6">
                    <View className="absolute top-[3px] left-[3px] right-[-3px] bottom-[-3px] bg-gray-900 rounded-[14px]" />
                    <TouchableOpacity
                      onPress={handleContinueFromStep1}
                      disabled={!isStep1Valid}
                      className="relative border-2 border-gray-900 rounded-[14px] py-4 px-8"
                      style={{
                        backgroundColor: isStep1Valid ? "#ffe4e6" : "#d1d5db",
                      }}
                      activeOpacity={0.8}
                    >
                      <Text
                        className="text-gray-900 text-lg text-center font-bold"
                        style={{ letterSpacing: -0.3 }}
                      >
                        {isStep1Valid ? "Continue →" : "Select an Avatar"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* STEP 2: Name Input */}
            {step === 2 && (
              <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View className="relative">
                  {/* Shadow */}
                  <View className="absolute top-[4px] left-[4px] right-[-4px] bottom-[-4px] bg-gray-900 rounded-2xl" />

                  {/* Modal Content */}
                  <View className="relative bg-white border-4 border-gray-900 rounded-2xl p-6">
                    {/* Close Button */}
                    <TouchableOpacity
                      onPress={handleClose}
                      className="absolute top-4 right-4 z-10"
                    >
                      <View className="relative">
                        <View className="absolute top-[1px] left-[1px] right-[-1px] bottom-[-1px] bg-gray-900 rounded-full" />
                        <View className="relative bg-white border-2 border-gray-900 rounded-full w-8 h-8 items-center justify-center">
                          <Text className="text-gray-900 text-lg font-bold">
                            ×
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>

                    {/* Back Button */}
                    <TouchableOpacity
                      onPress={handleBack}
                      className="absolute top-4 left-4 z-10"
                    >
                      <View className="relative">
                        <View className="absolute top-[1px] left-[1px] right-[-1px] bottom-[-1px] bg-gray-900 rounded-full" />
                        <View className="relative bg-white border-2 border-gray-900 rounded-full w-8 h-8 items-center justify-center">
                          <Text className="text-gray-900 text-lg font-bold">
                            ←
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>

                    {/* Step Indicator */}
                    <View className="flex-row justify-center gap-2 mb-4">
                      <TouchableOpacity
                        onPress={() => setStep(1)}
                        activeOpacity={0.8}
                      >
                        <View className="w-8 h-2 rounded-full bg-gray-300 border-gray-900" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setStep(2)}
                        activeOpacity={0.8}
                      >
                        <View className="w-8 h-2 rounded-full bg-[#ffe4e6] border-2 border-gray-900" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          if (isStep2Valid) {
                            setStep(3);
                          }
                        }}
                        activeOpacity={0.8}
                        disabled={!isStep2Valid}
                      >
                        <View
                          className={`w-8 h-2 rounded-full ${
                            isStep2Valid ? "bg-gray-300" : "bg-gray-200"
                          } border-gray-900`}
                        />
                      </TouchableOpacity>
                    </View>

                    <NameInput
                      userName={userName}
                      onUserNameChange={setUserName}
                      userNameFocused={userNameFocused}
                      onUserNameFocus={() => setUserNameFocused(true)}
                      onUserNameBlur={() => setUserNameFocused(false)}
                    />

                    {/* Continue Button */}
                    <View className="relative mt-6">
                      <View className="absolute top-[3px] left-[3px] right-[-3px] bottom-[-3px] bg-gray-900 rounded-[14px]" />
                      <TouchableOpacity
                        onPress={handleContinueFromStep2}
                        disabled={!isStep2Valid}
                        className="relative border-2 border-gray-900 rounded-[14px] py-4 px-8"
                        style={{
                          backgroundColor: isStep2Valid ? "#ffe4e6" : "#d1d5db",
                        }}
                        activeOpacity={0.8}
                      >
                        <Text
                          className="text-gray-900 text-lg text-center font-bold"
                          style={{ letterSpacing: -0.3 }}
                        >
                          {isStep2Valid ? "Continue →" : "Enter Your Name"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </ScrollView>
            )}

            {/* STEP 3: Category Selection */}
            {step === 3 && (
              <View className="relative">
                {/* Shadow */}
                <View className="absolute top-[4px] left-[4px] right-[-4px] bottom-[-4px] bg-gray-900 rounded-2xl" />

                {/* Modal Content */}
                <View className="relative bg-white border-4 border-gray-900 rounded-2xl p-6">
                  {/* Close Button */}
                  <TouchableOpacity
                    onPress={handleClose}
                    className="absolute top-4 right-4 z-10"
                  >
                    <View className="relative">
                      <View className="absolute top-[1px] left-[1px] right-[-1px] bottom-[-1px] bg-gray-900 rounded-full" />
                      <View className="relative bg-white border-2 border-gray-900 rounded-full w-8 h-8 items-center justify-center">
                        <Text className="text-gray-900 text-lg font-bold">
                          ×
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* Back Button */}
                  <TouchableOpacity
                    onPress={handleBack}
                    className="absolute top-4 left-4 z-10"
                  >
                    <View className="relative">
                      <View className="absolute top-[1px] left-[1px] right-[-1px] bottom-[-1px] bg-gray-900 rounded-full" />
                      <View className="relative bg-white border-2 border-gray-900 rounded-full w-8 h-8 items-center justify-center">
                        <Text className="text-gray-900 text-lg font-bold">
                          ←
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* Step Indicator */}
                  <View className="flex-row justify-center gap-2 mb-4">
                    <TouchableOpacity
                      onPress={() => setStep(1)}
                      activeOpacity={0.8}
                    >
                      <View className="w-8 h-2 rounded-full bg-gray-300 border-gray-900" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setStep(2)}
                      activeOpacity={0.8}
                    >
                      <View className="w-8 h-2 rounded-full bg-gray-300 border-gray-900" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setStep(3)}
                      activeOpacity={0.8}
                    >
                      <View className="w-8 h-2 rounded-full bg-[#ffe4e6] border-2 border-gray-900" />
                    </TouchableOpacity>
                  </View>

                  {/* Title */}
                  <Text
                    className="text-2xl font-bold text-gray-900 text-center mb-2"
                    style={{ fontFamily: "MerriweatherSans_700Bold" }}
                  >
                    Choose Your Vibe
                  </Text>

                  <Text
                    className="text-sm text-gray-600 text-center mb-6"
                    style={{ fontFamily: "MerriweatherSans_400Regular" }}
                  >
                    Pick the category that fits your relationship
                  </Text>

                  {/* Categories */}
                  <ScrollView className="max-h-[300px] mb-4">
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        onPress={() => setSelectedCategory(category.id)}
                        className="mb-3"
                      >
                        <View className="relative">
                          {/* Shadow */}
                          <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-xl" />

                          {/* Category Card */}
                          <View
                            className={`relative border-2 border-gray-900 rounded-xl p-4 ${
                              selectedCategory === category.id ? "border-4" : ""
                            }`}
                            style={{
                              backgroundColor: category.color,
                            }}
                          >
                            <View className="flex-row items-center justify-between">
                              <View className="flex-row items-center gap-3 flex-1">
                                {category.iconName === "ring" ? (
                                  <MaterialCommunityIcons
                                    name={category.iconName}
                                    size={20}
                                    color="black"
                                  />
                                ) : (
                                  <FontAwesome6
                                    name={category.iconName}
                                    size={20}
                                    color="#1f2937"
                                  />
                                )}
                                <Text
                                  className="text-lg font-semibold text-gray-900"
                                  style={{
                                    fontFamily: "MerriweatherSans_400Regular",
                                  }}
                                >
                                  {category.label}
                                </Text>
                                {category.isPremium && (
                                  <View className="relative">
                                    <View className="absolute top-[1px] left-[1px] right-[-1px] bottom-[-1px] bg-gray-900 rounded-md" />
                                    <View className="relative bg-amber-300 border-2 border-gray-900 rounded-md px-2 py-0.5">
                                      <Text
                                        className="text-gray-900 text-xs font-bold"
                                        style={{ letterSpacing: -0.2 }}
                                      >
                                        <FontAwesome6
                                          name="coins"
                                          size={8}
                                          color="#991b1b"
                                        />{" "}
                                        <Text>
                                          {category.coinsRequired} Coin
                                        </Text>
                                      </Text>
                                    </View>
                                  </View>
                                )}
                              </View>
                              {selectedCategory === category.id && (
                                <View className="w-6 h-6 rounded-full bg-gray-900 items-center justify-center">
                                  <Text className="text-white text-sm font-bold">
                                    ✓
                                  </Text>
                                </View>
                              )}
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {/* Coin Balance */}
                  <View className="flex-row items-center justify-center mb-2">
                    <View className="bg-amber-50 border border-amber-200 rounded-full px-3 py-2">
                      <Text
                        className="text-amber-700 text-xs font-medium"
                        style={{ fontFamily: "MerriweatherSans_400Regular" }}
                      >
                        <FontAwesome6 name="coins" size={16} color="#991b1b" />
                        {"   "}
                        <Text>You have: {coins} coins</Text>
                      </Text>
                    </View>
                  </View>

                  {/* Buy Coins Button */}
                  <View className="mb-4">
                    <TouchableOpacity
                      onPress={() => onBuyCoins?.()}
                      activeOpacity={0.8}
                    >
                      <View className="flex-row items-center justify-center gap-2 py-2">
                        <Text
                          className="text-amber-600 text-sm font-semibold underline"
                          style={{
                            fontFamily: "MerriweatherSans_400Regular",
                          }}
                        >
                          Buy Coins
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>

                  {/* Create Button */}
                  <View className="relative">
                    <View className="absolute top-[3px] left-[3px] right-[-3px] bottom-[-3px] bg-gray-900 rounded-[14px]" />
                    <TouchableOpacity
                      onPress={handleCreate}
                      disabled={!isStep3Valid || isCreating}
                      className="relative border-2 border-gray-900 rounded-[14px] py-4 px-8 flex-row items-center justify-center gap-2"
                      style={{
                        backgroundColor:
                          isStep3Valid && !isCreating ? "#ffe4e6" : "#d1d5db",
                      }}
                      activeOpacity={0.8}
                    >
                      {isCreating && <ButtonLoading size={14} style="dots" />}
                      <Text
                        className="text-gray-900 text-lg text-center font-bold"
                        style={{ letterSpacing: -0.3 }}
                      >
                        {isCreating
                          ? "Creating..."
                          : isStep3Valid
                          ? "Create Room"
                          : "Select a Category"}
                      </Text>
                    </TouchableOpacity>
                  </View>
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
