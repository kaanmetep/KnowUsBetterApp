import Feather from "@expo/vector-icons/Feather";
import React from "react";
import { TouchableOpacity } from "react-native";

interface SettingsButtonProps {
  onPress: () => void;
  variant?: "classic" | "modern";
}

const SettingsButton: React.FC<SettingsButtonProps> = ({
  onPress,
  variant = "classic",
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      // Senior Touch: Tam yuvarlak, ince kenarlık, yumuşak gölge ve Slate-500 ikon rengi
      className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm shadow-slate-200 border border-slate-100"
    >
      <Feather name="settings" size={18} color="#64748B" />
    </TouchableOpacity>
  );
};

export default SettingsButton;
