import { Entypo, Feather, FontAwesome6 } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type MainMenuActionButtonProps = {
  type: "create" | "join";
  scale: number;
  title: string;
  subtitle: string;
  onPress: () => void;
};

const MainMenuActionButton = ({
  type,
  scale,
  title,
  subtitle,
  onPress,
}: MainMenuActionButtonProps) => {
  const isCreate = type === "create";

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        backgroundColor: isCreate ? "#C94B6A" : "white",
        borderRadius: 20 * scale,
        paddingVertical: 18 * scale,
        paddingHorizontal: 22 * scale,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: isCreate ? 0 : 1.5,
        borderColor: isCreate ? "transparent" : "#EDCDD7",
        shadowColor: "#C94B6A",
        shadowOffset: { width: 0, height: isCreate ? 6 : 3 },
        shadowOpacity: isCreate ? 0.32 : 0.07,
        shadowRadius: isCreate ? 14 : 8,
        elevation: isCreate ? 8 : 3,
      }}
    >
      <View
        style={{
          width: 42 * scale,
          height: 42 * scale,
          borderRadius: 13 * scale,
          backgroundColor: isCreate ? "rgba(255,255,255,0.18)" : "#FFF0F3",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 16 * scale,
        }}
      >
        {isCreate ? (
          <Entypo name="plus" size={22 * scale} color="white" />
        ) : (
          <FontAwesome6 name="user-group" size={17 * scale} color="#C94B6A" />
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: "MerriweatherSans_700Bold",
            fontSize: 16 * scale,
            color: isCreate ? "white" : "#1E293B",
            letterSpacing: 0.1,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontFamily: "MerriweatherSans_400Regular",
            fontSize: 12 * scale,
            color: isCreate ? "rgba(255,255,255,0.7)" : "#94A3B8",
            marginTop: 2,
          }}
        >
          {subtitle}
        </Text>
      </View>
      <Feather
        name="chevron-right"
        size={19 * scale}
        color={isCreate ? "rgba(255,255,255,0.65)" : "#C94B6A"}
      />
    </TouchableOpacity>
  );
};

export default MainMenuActionButton;
