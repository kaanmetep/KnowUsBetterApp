import React from "react";
import { View } from "react-native";
import AvatarSelection from "../../profile/AvatarSelection";
import ModalButton from "../../ui/ModalButton";
import type { ModalButtonVariant } from "../../ui/modalButtonVariant";

interface AvatarStepProps {
  selectedAvatar: string | null;
  onAvatarSelect: (avatar: string) => void;
  onContinue: () => void;
  isValid: boolean;
  variant: ModalButtonVariant;
  modalButtonMarginTop: number;
  buttonText: string;
  buttonDisabledText: string;
}

const AvatarStep: React.FC<AvatarStepProps> = ({
  selectedAvatar,
  onAvatarSelect,
  onContinue,
  isValid,
  variant,
  modalButtonMarginTop,
  buttonText,
  buttonDisabledText,
}) => {
  return (
    <View>
      <AvatarSelection
        selectedAvatar={selectedAvatar}
        onAvatarSelect={onAvatarSelect}
      />
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

export default AvatarStep;
