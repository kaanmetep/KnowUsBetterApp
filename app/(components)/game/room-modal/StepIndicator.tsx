import React from "react";
import { TouchableOpacity, View } from "react-native";
import type { ModalButtonVariant } from "../../ui/modalButtonVariant";

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3;
  isStep1Valid: boolean;
  isStep2Valid: boolean;
  onStepPress: (step: 1 | 2 | 3) => void;
  variant: ModalButtonVariant;
  className?: string;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  isStep1Valid,
  isStep2Valid,
  onStepPress,
  variant,
  className = "mb-6",
}) => {
  return (
    <View className={`flex-row justify-center gap-2 ${className}`}>
      {[1, 2, 3].map((step) => {
        let bgClass = "bg-gray-100";
        if (step === currentStep)
          bgClass = variant === "pink" ? "bg-rose-400" : "bg-blue-400";
        else if (step < currentStep)
          bgClass = variant === "pink" ? "bg-rose-200" : "bg-blue-200";

        return (
          <TouchableOpacity
            key={step}
            onPress={() => onStepPress(step as 1 | 2 | 3)}
            disabled={
              (step === 2 && !isStep1Valid) ||
              (step === 3 && (!isStep1Valid || !isStep2Valid))
            }
            activeOpacity={0.8}
          >
            <View className={`w-8 h-1.5 rounded-full ${bgClass}`} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default StepIndicator;
