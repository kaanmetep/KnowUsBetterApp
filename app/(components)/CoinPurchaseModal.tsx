import {
  MerriweatherSans_400Regular,
  MerriweatherSans_700Bold,
} from "@expo-google-fonts/merriweather-sans";
import { useFonts } from "@expo-google-fonts/merriweather-sans/useFonts";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PurchasesPackage } from "react-native-purchases";
import { useCoins } from "../contexts/CoinContext";
import { useTranslation } from "../hooks/useTranslation";
import { purchaseService } from "../services/purchaseService";

interface CoinPurchaseModalProps {
  visible: boolean;
  onClose: () => void;
}

interface CoinPackage {
  identifier: string;
  coins: number;
  price: string;
  package: PurchasesPackage | null;
}

const CoinPurchaseModal: React.FC<CoinPurchaseModalProps> = ({
  visible,
  onClose,
}) => {
  const { addCoins, refreshCoins } = useCoins();
  const { t } = useTranslation();
  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  let [fontsLoaded] = useFonts({
    MerriweatherSans_400Regular,
    MerriweatherSans_700Bold,
  });

  useEffect(() => {
    if (visible) {
      loadPackages();
    }
  }, [visible]);

  const loadPackages = async () => {
    try {
      setLoading(true);
      setError(null);

      const offering = await purchaseService.getOfferings();

      if (!offering || !offering.availablePackages.length) {
        console.warn("⚠️ No packages found in RevenueCat");
        setError(t("coins.noPackagesAvailable"));
        setPackages([]);
        setLoading(false);
        return;
      }

      // Format revenuecat packages
      // Only show coins_10 and coins_30 packages
      const formattedPackages: CoinPackage[] = offering.availablePackages
        .filter((pkg) => {
          const productId = pkg.product.identifier;
          return productId === "coins_10" || productId === "coins_30";
        })
        .map((pkg) => {
          // Extract coin amount from product identifier (coins_10 -> 10, coins_30 -> 30)
          const productId = pkg.product.identifier;
          const coinsMatch = productId.match(/(\d+)/);
          const coins = coinsMatch ? parseInt(coinsMatch[1], 10) : 0;

          return {
            identifier: pkg.product.identifier, // Use product identifier (coins_10, coins_30)
            coins,
            price: pkg.product.priceString,
            package: pkg,
          };
        })
        .sort((a, b) => a.coins - b.coins); // Sort by coin amount ascending

      setPackages(formattedPackages);
    } catch (error: any) {
      console.error("❌ Error loading packages:", error);
      setError(t("coins.failedToLoadPackages"));
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (coinPackage: CoinPackage) => {
    if (!coinPackage.package) {
      setError(t("coins.packagesNotConfigured"));
      return;
    }

    try {
      setPurchasing(coinPackage.identifier);
      setError(null);

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Purchase package via RevenueCat
      await purchaseService.purchasePackage(coinPackage.package);

      // Frontend optimistic update (until webhook is received from backend)
      // Webhook received, CoinContext listener will automatically update balance
      await addCoins(coinPackage.coins);

      // Haptic feedback - success notification
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      onClose();
    } catch (error: any) {
      console.error("❌ Purchase error:", error);

      if (error.message === "Purchase cancelled by user") {
        setError(null); // If the user cancelled the purchase, don't show an error
      } else {
        setError(error.message || t("coins.purchaseFailed"));
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setPurchasing(null);
    }
  };

  const handleRestore = async () => {
    try {
      setLoading(true);
      setError(null);

      await purchaseService.restorePurchases();
      await refreshCoins();

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onClose();
    } catch (error: any) {
      console.error("❌ Restore error:", error);
      setError(t("coins.failedToRestore"));
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  if (!fontsLoaded) {
    return (
      <Modal visible={visible} transparent>
        <View className="flex-1 justify-center items-center bg-black/50">
          <Text style={{ color: "white" }}>{t("common.loading")}</Text>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
      statusBarTranslucent={true}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.7)",
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={onClose}
      >
        <Pressable
          style={{
            width: "90%",
            maxWidth: 420,
          }}
          onPress={() => {}}
        >
          {/* Shadow */}
          <View className="absolute top-[4px] left-[4px] right-[-4px] bottom-[-4px] bg-gray-900 rounded-[20px]" />

          {/* Content Container */}
          <View className="relative bg-gray-100 border-2 border-gray-900 rounded-[20px] p-6">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
              <View className="flex-row items-center gap-2">
                <FontAwesome6 name="coins" size={24} color="#991b1b" />
                <Text
                  className="text-gray-900 text-2xl font-bold"
                  style={{
                    fontFamily: "MerriweatherSans_700Bold",
                    letterSpacing: -0.5,
                  }}
                >
                  {t("coins.title")}
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                className="w-8 h-8 items-center justify-center"
                activeOpacity={0.7}
              >
                <Text
                  className="text-gray-900 text-3xl"
                  style={{ fontFamily: "MerriweatherSans_700Bold" }}
                >
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View>
              {/* Loading State */}
              {loading && (
                <View className="py-16 items-center">
                  <ActivityIndicator size="large" color="#991b1b" />
                  <Text
                    className="text-gray-700 mt-4 text-base"
                    style={{
                      fontFamily: "MerriweatherSans_400Regular",
                      letterSpacing: -0.2,
                    }}
                  >
                    {t("coins.loadingPackages")}
                  </Text>
                </View>
              )}

              {/* Error Message */}
              {error && (
                <View className="relative mb-4">
                  <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-xl" />
                  <View className="relative bg-red-50 border-2 border-gray-900 rounded-xl p-4">
                    <Text
                      className="text-red-800 text-sm text-center font-semibold"
                      style={{
                        fontFamily: "MerriweatherSans_400Regular",
                        letterSpacing: -0.2,
                      }}
                    >
                      {error}
                    </Text>
                  </View>
                </View>
              )}

              {/* Packages */}
              {!loading && packages.length > 0 && (
                <View className="gap-3 mb-4">
                  {packages.map((pkg) => {
                    const isPurchasing = purchasing === pkg.identifier;
                    const isDisabled = purchasing !== null;

                    // Determine gradient colors based on package
                    const getGradientColors = (): [string, string, string] => {
                      if (pkg.coins === 30) {
                        return ["#fee2e2", "#fecaca", "#f87171"]; // Vibrant red gradient for 30 coins
                      }
                      return ["#ffffff", "#f9fafb", "#f3f4f6"]; // Clean white gradient for 10 coins
                    };

                    return (
                      <TouchableOpacity
                        key={pkg.identifier}
                        onPress={() => handlePurchase(pkg)}
                        disabled={isDisabled || !pkg.package}
                        activeOpacity={0.85}
                      >
                        <View className="relative">
                          {/* Shadow */}
                          <View className="absolute top-[3px] left-[3px] right-[-3px] bottom-[-3px] bg-gray-900 rounded-[16px]" />

                          {/* Content with Gradient - Horizontal long layout */}
                          <View
                            className={`relative border-2 border-gray-900 rounded-[16px] overflow-hidden ${
                              isDisabled ? "opacity-50" : ""
                            }`}
                          >
                            <LinearGradient
                              colors={getGradientColors()}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                              style={{
                                padding: 14,
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              {/* Left Side - Coin Info */}
                              <View className="flex-1 flex-row items-center gap-3">
                                {/* Coin Icon */}
                                <View className="relative">
                                  <View className="absolute top-[1px] left-[1px] right-[-1px] bottom-[-1px] bg-gray-900 rounded-full" />
                                  <View className="relative bg-white border-2 border-gray-900 rounded-full p-2">
                                    <FontAwesome6
                                      name="coins"
                                      size={20}
                                      color="#991b1b"
                                    />
                                  </View>
                                </View>

                                {/* Coin Amount */}
                                <View>
                                  <Text
                                    className="text-gray-900 text-2xl font-bold"
                                    style={{
                                      fontFamily: "MerriweatherSans_700Bold",
                                      letterSpacing: -0.4,
                                    }}
                                  >
                                    {pkg.coins.toLocaleString()}
                                  </Text>
                                  <Text
                                    className="text-gray-700 text-sm"
                                    style={{
                                      fontFamily: "MerriweatherSans_400Regular",
                                      letterSpacing: -0.2,
                                    }}
                                  >
                                    {pkg.coins === 1
                                      ? t("coins.coin")
                                      : t("coins.coins")}
                                  </Text>
                                </View>
                              </View>

                              {/* Right Side - Price */}
                              <View className="items-end">
                                <Text
                                  className="text-gray-900 text-2xl font-bold"
                                  style={{
                                    fontFamily: "MerriweatherSans_700Bold",
                                    letterSpacing: -0.6,
                                  }}
                                >
                                  {pkg.price}
                                </Text>
                                {isPurchasing && (
                                  <ActivityIndicator
                                    size="small"
                                    color="#991b1b"
                                    className="mt-1.5"
                                  />
                                )}
                              </View>
                            </LinearGradient>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Restore Purchases */}
              <TouchableOpacity
                onPress={handleRestore}
                disabled={loading || purchasing !== null}
                className="mt-2"
                activeOpacity={0.7}
              >
                <Text
                  className="text-center text-gray-700 text-sm"
                  style={{
                    fontFamily: "MerriweatherSans_400Regular",
                    textDecorationLine: "underline",
                  }}
                >
                  {t("coins.restorePurchases")}
                </Text>
              </TouchableOpacity>

              {/* Info Text */}
              <Text
                className="text-center text-gray-600 text-xs mt-4"
                style={{
                  fontFamily: "MerriweatherSans_400Regular",
                  lineHeight: 16,
                }}
              >
                {Platform.OS === "ios"
                  ? t("coins.paymentChargedApple")
                  : t("coins.paymentChargedGoogle")}
              </Text>

              {/* Device Specific Info */}
              <Text
                className="text-center text-gray-500 text-xs mt-2"
                style={{
                  fontFamily: "MerriweatherSans_400Regular",
                  lineHeight: 16,
                }}
              >
                {t("coins.deviceSpecific")}
              </Text>

              {/* Support Info */}
              <Text
                className="text-center text-gray-500 text-xs mt-1"
                style={{
                  fontFamily: "MerriweatherSans_400Regular",
                  lineHeight: 16,
                }}
              >
                {t("coins.deviceSpecificSupport")}
              </Text>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default CoinPurchaseModal;
