import { Image } from "expo-image";
import React, { useEffect, useRef } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "../hooks/useTranslation";

interface AvatarSelectionProps {
  selectedAvatar: string | null;
  onAvatarSelect: (avatarId: string) => void;
  theme?: "red" | "blue";
}

const avatars = [
  {
    id: "boy_avatar_1",
    path: require("../../assets/images/avatars/boy_avatar_1.png"),
  },
  {
    id: "boy_avatar_2",
    path: require("../../assets/images/avatars/boy_avatar_2.png"),
  },
  {
    id: "boy_avatar_3",
    path: require("../../assets/images/avatars/boy_avatar_3.png"),
  },
  {
    id: "boy_avatar_4",
    path: require("../../assets/images/avatars/boy_avatar_4.png"),
  },
  {
    id: "girl_avatar_1",
    path: require("../../assets/images/avatars/girl_avatar_1.png"),
  },
  {
    id: "girl_avatar_2",
    path: require("../../assets/images/avatars/girl_avatar_2.png"),
  },
  {
    id: "girl_avatar_3",
    path: require("../../assets/images/avatars/girl_avatar_3.png"),
  },
  {
    id: "girl_avatar_4",
    path: require("../../assets/images/avatars/girl_avatar_4.png"),
  },
];

const AvatarSelection: React.FC<AvatarSelectionProps> = ({
  selectedAvatar,
  onAvatarSelect,
  theme = "red",
}) => {
  const { t } = useTranslation();
  const borderColor = "#9ca3af";
  return (
    <View>
      <Text
        className="text-xl font-bold text-gray-900 mb-1"
        style={{ fontFamily: "MerriweatherSans_700Bold" }}
      >
        {t("createRoom.chooseYourAvatar")}
      </Text>
      <Text
        className="text-sm text-gray-600 mb-4"
        style={{ fontFamily: "MerriweatherSans_400Regular" }}
      >
        {t("createRoom.pickAvatar")}
      </Text>

      <View className="flex-row flex-wrap justify-center gap-2">
        {avatars.map((avatar) => (
          <AvatarOption
            key={avatar.id}
            avatarId={avatar.id}
            imageSource={avatar.path}
            isSelected={selectedAvatar === avatar.id}
            onPress={onAvatarSelect}
            borderColor={borderColor}
          />
        ))}
      </View>
    </View>
  );
};

export default AvatarSelection;

interface AvatarOptionProps {
  avatarId: string;
  imageSource: ReturnType<typeof require>;
  isSelected: boolean;
  onPress: (avatarId: string) => void;
  borderColor: string;
}

const AvatarOption: React.FC<AvatarOptionProps> = ({
  avatarId,
  imageSource,
  isSelected,
  onPress,
  borderColor,
}) => {
  const scaleAnim = useRef(new Animated.Value(1));

  useEffect(() => {
    Animated.spring(scaleAnim.current, {
      toValue: isSelected ? 1.1 : 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  }, [isSelected]);

  return (
    <TouchableOpacity onPress={() => onPress(avatarId)} activeOpacity={0.8}>
      <Animated.View
        className="relative"
        style={{
          transform: [{ scale: scaleAnim.current }],
        }}
      >
        {isSelected && (
          <View
            className="absolute rounded-full"
            style={{
              top: -3,
              left: -3,
              right: -3,
              bottom: -3,
              backgroundColor: borderColor,
              opacity: 0.15,
            }}
          />
        )}
        <View
          className="relative rounded-full overflow-hidden"
          style={{
            backgroundColor: "#ffffff",
            padding: 4,
            borderWidth: 2.5,
            borderColor: isSelected ? borderColor : "transparent",
            shadowColor: isSelected ? borderColor : "#000",
            shadowOffset: {
              width: 0,
              height: isSelected ? 4 : 1,
            },
            shadowOpacity: isSelected ? 0.25 : 0.1,
            shadowRadius: isSelected ? 6 : 2,
            elevation: isSelected ? 6 : 2,
          }}
        >
          <Image
            source={imageSource}
            style={{ width: 75, height: 75 }}
            contentFit="contain"
          />
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};
