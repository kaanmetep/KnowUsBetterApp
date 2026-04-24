import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import ButtonLoading from "./ButtonLoading";

interface ModalButtonProps {
  onPress: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  text: string;
  disabledText?: string;
  loadingText?: string;
  variant?: "blue" | "pink";
  className?: string;
  showLoadingIndicator?: boolean;
}

const ModalButton: React.FC<ModalButtonProps> = ({
  onPress,
  disabled = false,
  isLoading = false,
  text,
  disabledText,
  loadingText,
  variant = "blue",
  className = "",
  showLoadingIndicator = false,
}) => {
  const theme = {
    blue: {
      gradient: ["#F0F9FF", "#E0F2FE", "#D1E9FF"] as const,
      borderColor: "#E0F2FE",
      shadowColor: "#BFDBFE",
      textColor: "#1E293B",
    },
    pink: {
      gradient: ["#FFF5F5", "#FFE3E3", "#FFDADA"] as const,
      borderColor: "#FFF0F0",
      shadowColor: "#FECACA",
      textColor: "#1E293B",
    },
    disabled: {
      gradient: ["#F8FAFC", "#F1F5F9", "#E2E8F0"] as const,
      borderColor: "#F1F5F9",
      shadowColor: "transparent",
      textColor: "#94A3B8",
    },
  };

  const isButtonDisabled = disabled || isLoading;
  const activeTheme = isButtonDisabled ? theme.disabled : theme[variant];

  // Display text logic
  let displayText = text;
  if (isLoading && loadingText) {
    displayText = loadingText;
  } else if (isButtonDisabled && disabledText) {
    displayText = disabledText;
  }

  return (
    <View className={`w-full ${className}`}>
      <TouchableOpacity
        onPress={onPress}
        disabled={isButtonDisabled}
        activeOpacity={0.9}
        style={{
          borderRadius: 24,
        }}
      >
        <LinearGradient
          colors={activeTheme.gradient as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 24,
            borderWidth: 1,
            borderColor: activeTheme.borderColor,
            paddingVertical: 16,
            paddingHorizontal: 24,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            gap: 8,
          }}
        >
          {isLoading && showLoadingIndicator && (
            <ButtonLoading size={14} style="dots" />
          )}
          <Text
            style={{
              fontFamily: "MerriweatherSans_700Bold",
              fontSize: 18,
              fontWeight: "700",
              color: activeTheme.textColor,
              letterSpacing: 0.5,
              textAlign: "center",
            }}
          >
            {displayText}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

export default ModalButton;
