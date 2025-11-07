import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface CreateNewRoomProps {
  visible: boolean;
  onClose: () => void;
  onCreateRoom: (userName: string, category: string, avatar?: string) => void;
}

type Category = {
  id: string;
  label: string;
  color: string;
  isPremium?: boolean;
  coinsRequired?: number;
};

const categories: Category[] = [
  {
    id: "just_friends",
    label: "🤝 We're Just Friends",
    color: "#fef3c7",
  },
  {
    id: "we_just_met",
    label: "💞 We Just Met",
    color: "#fee4e6",
  },
  {
    id: "long_term",
    label: "💍 Long-Term Lovers",
    color: "#e0f2fe",
    isPremium: true,
    coinsRequired: 1,
  },
  {
    id: "spicy",
    label: "🔥 Spicy & Flirty",
    color: "#f87171",
    isPremium: true,
    coinsRequired: 2,
  },
];

const CreateNewRoom: React.FC<CreateNewRoomProps> = ({
  visible,
  onClose,
  onCreateRoom,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [userNameFocused, setUserNameFocused] = useState<boolean>(false);

  const handleClose = () => {
    setStep(1);
    setSelectedCategory(null);
    setUserName("");
    setUserNameFocused(false);
    onClose();
  };

  const handleContinue = () => {
    if (userName.trim().length > 0) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleCreate = () => {
    if (selectedCategory && userName.trim()) {
      onCreateRoom(userName.trim(), selectedCategory, "😊" as string);
      setStep(1);
      setSelectedCategory(null);
      setUserName("");
    }
  };

  const isNameValid = userName.trim().length > 0;
  const isCategoryValid = selectedCategory !== null;

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
            {/* STEP 1: Name Input */}
            {step === 1 && (
              <View className="relative">
                {/* Shadow */}
                <View className="absolute top-[4px] left-[4px] right-[-4px] bottom-[-4px] bg-gray-900 rounded-2xl" />

                {/* Modal Content */}
                <View className="relative bg-primary border-4 border-gray-900 rounded-2xl p-6">
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
                        if (isNameValid) {
                          setStep(2);
                        }
                      }}
                      activeOpacity={0.8}
                      disabled={!isNameValid}
                    >
                      <View
                        className={`w-8 h-2 rounded-full ${
                          isNameValid ? "bg-gray-300" : "bg-gray-200"
                        } border-gray-900`}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Title */}
                  <Text
                    className="text-2xl font-bold text-gray-900 text-center mb-2"
                    style={{ fontFamily: "MerriweatherSans_700Bold" }}
                  >
                    What's Your Name?
                  </Text>

                  <Text
                    className="text-sm text-gray-600 text-center mb-6"
                    style={{ fontFamily: "MerriweatherSans_400Regular" }}
                  >
                    Tell us how we should call you
                  </Text>

                  {/* User Name Input */}
                  <View className="mb-6">
                    <View className="relative">
                      {/* Shadow */}
                      <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-xl" />

                      {/* Input Container */}
                      <View
                        className={`relative bg-white rounded-xl ${
                          userNameFocused
                            ? "border-4 border-gray-900"
                            : "border-2 border-gray-900"
                        }`}
                      >
                        <TextInput
                          value={userName}
                          onChangeText={setUserName}
                          onFocus={() => setUserNameFocused(true)}
                          onBlur={() => setUserNameFocused(false)}
                          placeholder="Enter your name"
                          placeholderTextColor="#9ca3af"
                          className="px-4 py-3 text-gray-900 text-base"
                          style={
                            {
                              fontFamily: "MerriweatherSans_400Regular",
                              outline: "none",
                            } as any
                          }
                          maxLength={20}
                        />
                      </View>
                    </View>
                  </View>

                  {/* Continue Button */}
                  <View className="relative">
                    <View className="absolute top-[3px] left-[3px] right-[-3px] bottom-[-3px] bg-gray-900 rounded-[14px]" />
                    <TouchableOpacity
                      onPress={handleContinue}
                      disabled={!isNameValid}
                      className={`relative border-2 border-gray-900 rounded-[14px] py-4 px-8 ${
                        isNameValid ? "bg-[#ffe4e6]" : "bg-gray-300"
                      }`}
                      activeOpacity={0.8}
                    >
                      <Text
                        className="text-gray-900 text-lg text-center font-bold"
                        style={{ letterSpacing: -0.3 }}
                      >
                        Continue →
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* STEP 2: Category Selection */}
            {step === 2 && (
              <View className="relative">
                {/* Shadow */}
                <View className="absolute top-[4px] left-[4px] right-[-4px] bottom-[-4px] bg-gray-900 rounded-2xl" />

                {/* Modal Content */}
                <View className="relative bg-primary border-4 border-gray-900 rounded-2xl p-6">
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
                              <View className="flex-row items-center gap-2 flex-1">
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
                        <Text>You have: 0 coins</Text>
                      </Text>
                    </View>
                  </View>

                  {/* Buy Coins Button */}
                  <View className="mb-4">
                    <TouchableOpacity
                      onPress={() => {
                        // TODO: Navigate to coin purchase
                      }}
                      activeOpacity={0.8}
                    >
                      <View className="flex-row items-center justify-center gap-2 py-2">
                        <Text
                          className="text-amber-600 text-sm font-semibold underline"
                          style={{ fontFamily: "MerriweatherSans_400Regular" }}
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
                      disabled={!isCategoryValid}
                      className={`relative border-2 border-gray-900 rounded-[14px] py-4 px-8 ${
                        isCategoryValid ? "bg-[#ffe4e6]" : "bg-gray-300"
                      }`}
                      activeOpacity={0.8}
                    >
                      <Text
                        className="text-gray-900 text-lg text-center font-bold"
                        style={{ letterSpacing: -0.3 }}
                      >
                        {isCategoryValid ? "Create Room" : "Select a Category"}
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
