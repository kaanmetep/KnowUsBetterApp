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
    "top-left": "absolute top-20 left-6 z-50",
    "top-right": "absolute top-20 right-6 z-50",
    "bottom-left": "absolute bottom-12 left-6 z-50",
    "bottom-right": "absolute bottom-12 right-6 z-50",
  };

  const containerClasses =
    style === "absolute"
      ? `${positionClasses[position]} flex-row items-center gap-3   `
      : "flex-row items-center gap-3";

  return (
    <View className={containerClasses}>
      <TouchableOpacity
        onPress={onBuyCoins}
        activeOpacity={0.8}
        className="bg-white border border-amber-200 rounded-full px-4 py-2 flex-row items-center gap-2 shadow-amber-100/50"
      >
        <View className="bg-amber-50 w-6 h-6 rounded-full items-center justify-center">
          <FontAwesome6 name="coins" size={12} color="#F59E0B" />
        </View>
        <Text
          className="text-slate-700 text-sm font-bold"
          style={{ fontFamily: "MerriweatherSans_700Bold" }}
        >
          {coins}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default CoinBalanceDisplay;
