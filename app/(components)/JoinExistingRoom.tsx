import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
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
import { useTranslation } from "../hooks/useTranslation";
import { UserPreferencesService } from "../services/userPreferencesService";
import AvatarSelection from "./AvatarSelection";
import ModalButton from "./ModalButton";
import NameInput from "./NameInput";

interface JoinExistingRoomProps {
  visible: boolean;
  onClose: () => void;
  onJoinRoom: (
    userName: string,
    roomCode: string,
    avatar?: string
  ) => Promise<void>;
}

const JoinExistingRoom: React.FC<JoinExistingRoomProps> = ({
  visible,
  onClose,
  onJoinRoom,
}) => {
  const { t } = useTranslation();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [roomCode, setRoomCode] = useState<string>("");
  const [userNameFocused, setUserNameFocused] = useState<boolean>(false);
  const [roomCodeFocused, setRoomCodeFocused] = useState<boolean>(false);
  const [isJoining, setIsJoining] = useState<boolean>(false);

  // Load saved preferences
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

  // Save avatar
  useEffect(() => {
    if (selectedAvatar) {
      UserPreferencesService.saveAvatar(selectedAvatar);
    }
  }, [selectedAvatar]);

  // Save username
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

  const handleJoin = async () => {
    if (userName.trim() && roomCode.trim() && selectedAvatar && !isJoining) {
      setIsJoining(true);
      try {
        await onJoinRoom(
          userName.trim(),
          roomCode.trim().toUpperCase(),
          selectedAvatar
        );
        setStep(1);
        setSelectedAvatar(null);
        setUserName("");
        setRoomCode("");
      } catch (error) {
        console.error("Error joining room:", error);
      } finally {
        setIsJoining(false);
      }
    }
  };

  const isStep1Valid = selectedAvatar !== null;
  const isStep2Valid = userName.trim().length > 0;
  const isStep3Valid = roomCode.trim().length > 0;

  const StepIndicator = ({ currentStep }: { currentStep: number }) => (
    <View className="flex-row justify-center gap-2 mb-6">
      {[1, 2, 3].map((s) => {
        let bgClass = "bg-gray-100";
        if (s === currentStep) bgClass = "bg-blue-400";
        else if (s < currentStep) bgClass = "bg-blue-200";

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
  );

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
          className="flex-1 bg-black/40 justify-center items-center px-5 backdrop-blur-sm"
          onPress={handleClose}
        >
          <Pressable
            className="w-full max-w-[400px] bg-white rounded-[32px] p-6"
            onPress={(e) => e.stopPropagation()}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 5,
            }}
          >
            {/* Header / Navigation Buttons */}
            <View className="flex-row justify-between items-center absolute top-4 left-4 right-4 z-20">
              <View>
                {step > 1 && (
                  <TouchableOpacity
                    onPress={handleBack}
                    className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center border border-gray-100"
                  >
                    <Ionicons name="arrow-back" size={20} color="#374151" />
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                onPress={handleClose}
                className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center border border-gray-100"
              >
                <Ionicons name="close" size={20} color="#374151" />
              </TouchableOpacity>
            </View>

            <View className="h-8" />

            {/* STEP 1: Avatar Selection */}
            {step === 1 && (
              <View>
                <StepIndicator currentStep={1} />
                <AvatarSelection
                  selectedAvatar={selectedAvatar}
                  onAvatarSelect={setSelectedAvatar}
                  theme="blue"
                />
                <ModalButton
                  onPress={handleContinueFromStep1}
                  disabled={!isStep1Valid}
                  text={t("joinRoom.continue")}
                  disabledText={t("joinRoom.selectAvatar")}
                  variant="blue"
                  className="mt-8"
                />
              </View>
            )}

            {/* STEP 2: Name Input */}
            {step === 2 && (
              <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <StepIndicator currentStep={2} />

                <View className="py-4">
                  <NameInput
                    userName={userName}
                    onUserNameChange={setUserName}
                    userNameFocused={userNameFocused}
                    onUserNameFocus={() => setUserNameFocused(true)}
                    onUserNameBlur={() => setUserNameFocused(false)}
                  />
                </View>

                <ModalButton
                  onPress={handleContinueFromStep2}
                  disabled={!isStep2Valid}
                  text={t("joinRoom.continue")}
                  disabledText={t("joinRoom.enterYourName")}
                  variant="blue"
                  className="mt-6"
                />
              </ScrollView>
            )}

            {/* STEP 3: Room Code */}
            {step === 3 && (
              <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <StepIndicator currentStep={3} />

                <Text
                  className="text-2xl font-bold text-slate-800 text-center mb-2"
                  style={{ fontFamily: "MerriweatherSans_700Bold" }}
                >
                  {t("joinRoom.enterRoomCode")}
                </Text>

                <Text
                  className="text-sm text-slate-500 text-center mb-8"
                  style={{ fontFamily: "MerriweatherSans_400Regular" }}
                >
                  {t("joinRoom.askPartnerForCode")}
                </Text>

                <View className="mb-6">
                  <Text
                    className="text-sm font-semibold text-slate-700 mb-2 ml-1"
                    style={{ fontFamily: "MerriweatherSans_600SemiBold" }}
                  >
                    {t("joinRoom.roomCode")}
                  </Text>

                  <View
                    className="w-full bg-gray-50 rounded-2xl border"
                    style={{
                      borderColor: "#E2E8F0",
                      borderWidth: 1,
                    }}
                  >
                    <TextInput
                      value={roomCode}
                      onChangeText={(text) => {
                        const sanitizedText = text
                          .toLocaleUpperCase("en-US")
                          .replace(/[^A-Z0-9]/g, "")
                          .slice(0, 16);

                        setRoomCode(sanitizedText);
                      }}
                      onFocus={() => setRoomCodeFocused(true)}
                      onBlur={() => setRoomCodeFocused(false)}
                      placeholder={t("joinRoom.enterRoomCodePlaceholder")}
                      placeholderTextColor="#94A3B8"
                      autoCapitalize="none"
                      returnKeyType="done"
                      onSubmitEditing={handleJoin}
                      className="px-5 py-4 text-slate-900 text-lg"
                      style={{
                        fontFamily: "MerriweatherSans_600SemiBold",
                        letterSpacing: 2,
                      }}
                      maxLength={16}
                    />
                  </View>
                </View>

                <ModalButton
                  onPress={handleJoin}
                  disabled={!isStep3Valid}
                  isLoading={isJoining}
                  text={t("joinRoom.joinRoom")}
                  disabledText={t("joinRoom.enterRoomCodeButton")}
                  loadingText={t("joinRoom.joining")}
                  variant="blue"
                  showLoadingIndicator={true}
                />
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default JoinExistingRoom;
