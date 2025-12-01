import React from "react";
import { Text, TextInput, View } from "react-native";
import { useTranslation } from "../hooks/useTranslation";

interface NameInputProps {
  userName: string;
  onUserNameChange: (name: string) => void;
  onUserNameFocus: () => void;
  onUserNameBlur: () => void;
}

const NameInput: React.FC<NameInputProps> = ({
  userName,
  onUserNameChange,
  onUserNameFocus,
  onUserNameBlur,
}) => {
  const { t } = useTranslation();

  return (
    <View className="mt-6">
      <Text
        className="text-lg font-bold text-slate-800 mb-1"
        style={{ fontFamily: "MerriweatherSans_700Bold" }}
      >
        {t("createRoom.enterYourNameTitle")}
      </Text>
      <Text
        className="text-sm text-slate-500 mb-4"
        style={{ fontFamily: "MerriweatherSans_400Regular" }}
      >
        {t("createRoom.tellUsHowToCallYou")}
      </Text>

      <View
        style={{
          borderRadius: 16,
        }}
      >
        <TextInput
          value={userName}
          onChangeText={onUserNameChange}
          onFocus={onUserNameFocus}
          onBlur={onUserNameBlur}
          placeholder={t("createRoom.enterYourNamePlaceholder")}
          placeholderTextColor="#94a3b8"
          className="px-5 py-4 text-slate-800 text-base bg-white"
          style={
            {
              fontFamily: "MerriweatherSans_400Regular",
              outline: "none",
              borderRadius: 16,
              borderWidth: 1.5,
              borderColor: "#e2e8f0",
            } as any
          }
          maxLength={16}
        />
      </View>
    </View>
  );
};

export default NameInput;
