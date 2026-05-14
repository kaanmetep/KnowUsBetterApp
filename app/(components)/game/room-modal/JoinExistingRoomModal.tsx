import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useTranslation } from "../../../hooks/useTranslation";
import { UserPreferencesService } from "../../../services/userPreferencesService";
import AvatarStep from "./AvatarStep";
import JoinRoomCodeStep from "./JoinRoomCodeStep";
import NameStep from "./NameStep";
import StepIndicator from "./StepIndicator";

interface JoinExistingRoomModalProps {
  visible: boolean;
  onClose: () => void;
  onJoinRoom: (
    userName: string,
    roomCode: string,
    avatar?: string
  ) => Promise<void>;
}

const JoinExistingRoomModal: React.FC<JoinExistingRoomModalProps> = ({
  visible,
  onClose,
  onJoinRoom,
}) => {
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();
  const isSmallScreen = height < 760;
  const isVerySmallScreen = width <= 350 || height <= 670;
  const step3Scale = isVerySmallScreen ? 0.84 : isSmallScreen ? 0.92 : 1;
  const modalButtonMarginTop = 16 * step3Scale;
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
                <StepIndicator
                  currentStep={1}
                  isStep1Valid={isStep1Valid}
                  isStep2Valid={isStep2Valid}
                  onStepPress={(pressedStep) => {
                    if (pressedStep === 1) setStep(1);
                    if (pressedStep === 2 && isStep1Valid) setStep(2);
                    if (pressedStep === 3 && isStep1Valid && isStep2Valid) setStep(3);
                  }}
                  variant="blue"
                  className="mb-3"
                />
                <AvatarStep
                  selectedAvatar={selectedAvatar}
                  onAvatarSelect={setSelectedAvatar}
                  onContinue={handleContinueFromStep1}
                  isValid={isStep1Valid}
                  variant="blue"
                  modalButtonMarginTop={modalButtonMarginTop}
                  buttonText={t("joinRoom.continue")}
                  buttonDisabledText={t("joinRoom.selectAvatar")}
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
                <StepIndicator
                  currentStep={2}
                  isStep1Valid={isStep1Valid}
                  isStep2Valid={isStep2Valid}
                  onStepPress={(pressedStep) => {
                    if (pressedStep === 1) setStep(1);
                    if (pressedStep === 2 && isStep1Valid) setStep(2);
                    if (pressedStep === 3 && isStep1Valid && isStep2Valid) setStep(3);
                  }}
                  variant="blue"
                  className="mb-3"
                />

                <NameStep
                  userName={userName}
                  onUserNameChange={setUserName}
                  onUserNameFocus={() => setUserNameFocused(true)}
                  onUserNameBlur={() => setUserNameFocused(false)}
                  onContinue={handleContinueFromStep2}
                  isValid={isStep2Valid}
                  variant="blue"
                  modalButtonMarginTop={modalButtonMarginTop}
                  buttonText={t("joinRoom.continue")}
                  buttonDisabledText={t("joinRoom.enterYourName")}
                />
              </ScrollView>
            )}

            {step === 3 && (
              <JoinRoomCodeStep
                isStep1Valid={isStep1Valid}
                isStep2Valid={isStep2Valid}
                onStepPress={(pressedStep) => {
                  if (pressedStep === 1) setStep(1);
                  if (pressedStep === 2 && isStep1Valid) setStep(2);
                  if (pressedStep === 3 && isStep1Valid && isStep2Valid) setStep(3);
                }}
                roomCode={roomCode}
                onRoomCodeChange={setRoomCode}
                onRoomCodeFocus={() => setRoomCodeFocused(true)}
                onRoomCodeBlur={() => setRoomCodeFocused(false)}
                onJoin={handleJoin}
                isStep3Valid={isStep3Valid}
                isJoining={isJoining}
              />
            )}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default JoinExistingRoomModal;
