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
        {avatars.map((avatar) => {
          const scaleAnim = useRef(new Animated.Value(1)).current;
          const isSelected = selectedAvatar === avatar.id;

          useEffect(() => {
            Animated.spring(scaleAnim, {
              toValue: isSelected ? 1.1 : 1,
              useNativeDriver: true,
              tension: 50,
              friction: 7,
            }).start();
          }, [isSelected]);

          return (
            <TouchableOpacity
              key={avatar.id}
              onPress={() => onAvatarSelect(avatar.id)}
              activeOpacity={0.8}
            >
              <Animated.View
                className="relative"
                style={{
                  transform: [{ scale: scaleAnim }],
                }}
              >
                {selectedAvatar === avatar.id && (
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
                    borderColor:
                      selectedAvatar === avatar.id
                        ? borderColor
                        : "transparent",
                    shadowColor:
                      selectedAvatar === avatar.id ? borderColor : "#000",
                    shadowOffset: {
                      width: 0,
                      height: selectedAvatar === avatar.id ? 4 : 1,
                    },
                    shadowOpacity: selectedAvatar === avatar.id ? 0.25 : 0.1,
                    shadowRadius: selectedAvatar === avatar.id ? 6 : 2,
                    elevation: selectedAvatar === avatar.id ? 6 : 2,
                  }}
                >
                  <Image
                    source={avatar.path}
                    style={{ width: 75, height: 75 }}
                    contentFit="contain"
                  />
                </View>
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default AvatarSelection;
