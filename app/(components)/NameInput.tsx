import React from "react";
import { Text, TextInput, View } from "react-native";
import { useTranslation } from "../hooks/useTranslation";

interface NameInputProps {
  userName: string;
  onUserNameChange: (name: string) => void;
  userNameFocused: boolean;
  onUserNameFocus: () => void;
  onUserNameBlur: () => void;
}

const NameInput: React.FC<NameInputProps> = ({
  userName,
  onUserNameChange,
  userNameFocused,
  onUserNameFocus,
  onUserNameBlur,
}) => {
  const { t } = useTranslation();
  return (
    <View className="mt-6">
      <Text
        className="text-lg font-bold text-gray-900 mb-1"
        style={{ fontFamily: "MerriweatherSans_700Bold" }}
      >
        {t("createRoom.enterYourNameTitle")}
      </Text>
      <Text
        className="text-sm text-gray-600 mb-3"
        style={{ fontFamily: "MerriweatherSans_400Regular" }}
      >
        {t("createRoom.tellUsHowToCallYou")}
      </Text>

      <View className="relative">
        {/* Shadow */}
        <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-xl" />

        {/* Input Container */}
        <View
          className={`relative bg-white rounded-xl ${
            userNameFocused
              ? "border-4 border-gray-900"
              : "border-2 border-gray-900"
          }`}
        >
          <TextInput
            value={userName}
            onChangeText={onUserNameChange}
            onFocus={onUserNameFocus}
            onBlur={onUserNameBlur}
            placeholder={t("createRoom.enterYourNamePlaceholder")}
            placeholderTextColor="#9ca3af"
            className="px-4 py-3 text-gray-900 text-base"
            style={
              {
                fontFamily: "MerriweatherSans_400Regular",
                outline: "none",
              } as any
            }
            maxLength={16}
          />
        </View>
      </View>
    </View>
  );
};

export default NameInput;
