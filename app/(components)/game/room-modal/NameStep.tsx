import React from "react";
import { View } from "react-native";
import NameInput from "../../profile/NameInput";
import ModalButton from "../../ui/ModalButton";
import type { ModalButtonVariant } from "../../ui/modalButtonVariant";

interface NameStepProps {
  userName: string;
  onUserNameChange: (name: string) => void;
  onUserNameFocus: () => void;
  onUserNameBlur: () => void;
  onContinue: () => void;
  isValid: boolean;
  variant: ModalButtonVariant;
  modalButtonMarginTop: number;
  buttonText: string;
  buttonDisabledText: string;
}

const NameStep: React.FC<NameStepProps> = ({
  userName,
  onUserNameChange,
  onUserNameFocus,
  onUserNameBlur,
  onContinue,
  isValid,
  variant,
  modalButtonMarginTop,
  buttonText,
  buttonDisabledText,
}) => {
  return (
    <View>
      <View className="pt-2 pb-4">
        <NameInput
          userName={userName}
          onUserNameChange={onUserNameChange}
          onUserNameFocus={onUserNameFocus}
          onUserNameBlur={onUserNameBlur}
        />
      </View>
      <View style={{ marginTop: modalButtonMarginTop }}>
        <ModalButton
          onPress={onContinue}
          disabled={!isValid}
          text={buttonText}
          disabledText={buttonDisabledText}
          variant={variant}
        />
      </View>
    </View>
  );
};

export default NameStep;
