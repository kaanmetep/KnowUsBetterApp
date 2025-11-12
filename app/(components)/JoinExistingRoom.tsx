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
import AvatarSelection from "./AvatarSelection";
import NameInput from "./NameInput";

interface JoinExistingRoomProps {
  visible: boolean;
  onClose: () => void;
  onJoinRoom: (userName: string, roomCode: string, avatar?: string) => void;
}

const JoinExistingRoom: React.FC<JoinExistingRoomProps> = ({
  visible,
  onClose,
  onJoinRoom,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [roomCode, setRoomCode] = useState<string>("");
  const [userNameFocused, setUserNameFocused] = useState<boolean>(false);
  const [roomCodeFocused, setRoomCodeFocused] = useState<boolean>(false);

  const handleClose = () => {
    setStep(1);
    setSelectedAvatar(null);
    setUserName("");
    setRoomCode("");
    setUserNameFocused(false);
    setRoomCodeFocused(false);
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

  const handleJoin = () => {
    if (userName.trim() && roomCode.trim() && selectedAvatar) {
      onJoinRoom(
        userName.trim(),
        roomCode.trim().toUpperCase(),
        selectedAvatar
      );
      setStep(1);
      setSelectedAvatar(null);
      setUserName("");
      setRoomCode("");
    }
  };

  const isStep1Valid = selectedAvatar !== null;
  const isStep2Valid = userName.trim().length > 0;
  const isStep3Valid = roomCode.trim().length > 0;

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
                      <View className="w-8 h-2 rounded-full bg-[#dbeafe] border-2 border-gray-900" />
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
                    theme="blue"
                  />

                  {/* Continue Button */}
                  <View className="relative mt-6">
                    <View className="absolute top-[3px] left-[3px] right-[-3px] bottom-[-3px] bg-gray-900 rounded-[14px]" />
                    <TouchableOpacity
                      onPress={handleContinueFromStep1}
                      disabled={!isStep1Valid}
                      className="relative border-2 border-gray-900 rounded-[14px] py-4 px-8"
                      style={{
                        backgroundColor: isStep1Valid ? "#dbeafe" : "#d1d5db",
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
                        <View className="w-8 h-2 rounded-full bg-[#dbeafe] border-2 border-gray-900" />
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
                          backgroundColor: isStep2Valid ? "#dbeafe" : "#d1d5db",
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

            {/* STEP 3: Room Code */}
            {step === 3 && (
              <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
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
                        <View className="w-8 h-2 rounded-full bg-gray-300 border-gray-900" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setStep(3)}
                        activeOpacity={0.8}
                      >
                        <View className="w-8 h-2 rounded-full bg-[#dbeafe] border-2 border-gray-900" />
                      </TouchableOpacity>
                    </View>

                    {/* Title */}
                    <Text
                      className="text-2xl font-bold text-gray-900 text-center mb-2"
                      style={{ fontFamily: "MerriweatherSans_700Bold" }}
                    >
                      Enter Room Code
                    </Text>

                    <Text
                      className="text-sm text-gray-600 text-center mb-6"
                      style={{ fontFamily: "MerriweatherSans_400Regular" }}
                    >
                      Ask your partner for the room code
                    </Text>

                    {/* Room Code Input */}
                    <View className="mb-6">
                      <Text
                        className="text-sm font-semibold text-gray-900 mb-2"
                        style={{ fontFamily: "MerriweatherSans_400Regular" }}
                      >
                        Room Code
                      </Text>
                      <View className="relative">
                        {/* Shadow */}
                        <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-xl" />

                        {/* Input Container */}
                        <View
                          className={`relative bg-white rounded-xl ${
                            roomCodeFocused
                              ? "border-4 border-gray-900"
                              : "border-2 border-gray-900"
                          }`}
                        >
                          <TextInput
                            value={roomCode}
                            onChangeText={setRoomCode}
                            onFocus={() => setRoomCodeFocused(true)}
                            onBlur={() => setRoomCodeFocused(false)}
                            placeholder="Enter room code"
                            placeholderTextColor="#9ca3af"
                            autoCapitalize="characters"
                            className="px-4 py-3 text-gray-900 text-base"
                            style={
                              {
                                fontFamily: "MerriweatherSans_400Regular",
                                outline: "none",
                              } as any
                            }
                          />
                        </View>
                      </View>
                    </View>

                    {/* Join Button */}
                    <View className="relative">
                      <View className="absolute top-[3px] left-[3px] right-[-3px] bottom-[-3px] bg-gray-900 rounded-[14px]" />
                      <TouchableOpacity
                        onPress={handleJoin}
                        disabled={!isStep3Valid}
                        className="relative border-2 border-gray-900 rounded-[14px] py-4 px-8"
                        style={{
                          backgroundColor: isStep3Valid ? "#dbeafe" : "#d1d5db",
                        }}
                        activeOpacity={0.8}
                      >
                        <Text
                          className="text-gray-900 text-lg text-center font-bold"
                          style={{ letterSpacing: -0.3 }}
                        >
                          {isStep3Valid ? "Join Room" : "Enter Room Code"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default JoinExistingRoom;
