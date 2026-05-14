import React from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import { useTranslation } from "../../../hooks/useTranslation";
import ModalButton from "../../ui/ModalButton";
import StepIndicator from "./StepIndicator";

interface JoinRoomCodeStepProps {
  isStep1Valid: boolean;
  isStep2Valid: boolean;
  onStepPress: (step: 1 | 2 | 3) => void;
  roomCode: string;
  onRoomCodeChange: (code: string) => void;
  onRoomCodeFocus: () => void;
  onRoomCodeBlur: () => void;
  onJoin: () => void;
  isStep3Valid: boolean;
  isJoining: boolean;
}

const JoinRoomCodeStep: React.FC<JoinRoomCodeStepProps> = ({
  isStep1Valid,
  isStep2Valid,
  onStepPress,
  roomCode,
  onRoomCodeChange,
  onRoomCodeFocus,
  onRoomCodeBlur,
  onJoin,
  isStep3Valid,
  isJoining,
}) => {
  const { t } = useTranslation();

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <StepIndicator
        currentStep={3}
        isStep1Valid={isStep1Valid}
        isStep2Valid={isStep2Valid}
        onStepPress={onStepPress}
        variant="blue"
        className="mb-3"
      />

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

              onRoomCodeChange(sanitizedText);
            }}
            onFocus={onRoomCodeFocus}
            onBlur={onRoomCodeBlur}
            placeholder={t("joinRoom.enterRoomCodePlaceholder")}
            placeholderTextColor="#94A3B8"
            autoCapitalize="none"
            returnKeyType="done"
            onSubmitEditing={onJoin}
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
        onPress={onJoin}
        disabled={!isStep3Valid}
        isLoading={isJoining}
        text={t("joinRoom.joinRoom")}
        disabledText={t("joinRoom.enterRoomCodeButton")}
        loadingText={t("joinRoom.joining")}
        variant="blue"
        showLoadingIndicator={true}
      />
    </ScrollView>
  );
};

export default JoinRoomCodeStep;
