import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useCoins } from "../contexts/CoinContext";

interface CoinBalanceDisplayProps {
  onBuyCoins: () => void;
  style?: "default" | "absolute";
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

const CoinBalanceDisplay: React.FC<CoinBalanceDisplayProps> = ({
  onBuyCoins,
  style = "default",
  position = "top-left",
}) => {
  const { coins } = useCoins();

  const positionClasses = {
    "top-left": "absolute top-20 left-6 z-10",
    "top-right": "absolute top-20 right-6 z-10",
    "bottom-left": "absolute bottom-12 left-6 z-10",
    "bottom-right": "absolute bottom-20 right-6 z-10",
  };

  const containerClasses =
    style === "absolute"
      ? `${positionClasses[position]} flex-row items-center gap-2`
      : "flex-row items-center gap-2";

  return (
    <View className={containerClasses}>
      {/* Coin Display */}
      <View className="relative">
        <View className="absolute top-[1px] left-[1px] right-[-1px] bottom-[-1px] bg-gray-900 rounded-full" />
        <View className="relative bg-white border-2 border-gray-900 rounded-full px-4 py-2 flex-row items-center gap-2">
          <FontAwesome6 name="coins" size={16} color="#991b1b" />
          <Text
            className="text-gray-900 font-semibold"
            style={{ fontFamily: "MerriweatherSans_700Bold" }}
          >
            {coins}
          </Text>
        </View>
      </View>

      {/* Buy Coins Button */}
      <View className="relative">
        <View className="absolute top-[1px] left-[1px] right-[-1px] bottom-[-1px] bg-gray-900 rounded-full" />
        <TouchableOpacity
          onPress={onBuyCoins}
          className="relative bg-amber-200 border-2 border-gray-900 rounded-full px-4 py-2 flex-row items-center gap-2"
          activeOpacity={0.8}
        >
          <FontAwesome6 name="plus" size={14} color="#991b1b" />
          <Text
            className="text-gray-900 font-semibold text-xs"
            style={{ fontFamily: "MerriweatherSans_700Bold" }}
          >
            Buy Coins
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CoinBalanceDisplay;
