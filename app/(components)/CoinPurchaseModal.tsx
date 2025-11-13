import {
  MerriweatherSans_400Regular,
  MerriweatherSans_700Bold,
} from "@expo-google-fonts/merriweather-sans";
import { useFonts } from "@expo-google-fonts/merriweather-sans/useFonts";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PurchasesPackage } from "react-native-purchases";
import { useCoins } from "../contexts/CoinContext";
import { purchaseService } from "../services/purchaseService";

interface CoinPurchaseModalProps {
  visible: boolean;
  onClose: () => void;
}

interface CoinPackage {
  identifier: string;
  title: string;
  coins: number;
  price: string;
  package: PurchasesPackage | null;
  popular?: boolean;
}

const CoinPurchaseModal: React.FC<CoinPurchaseModalProps> = ({
  visible,
  onClose,
}) => {
  const { addCoins, refreshCoins } = useCoins();
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

      console.log(
        "📦 Packages count:",
        offering?.availablePackages.length || 0
      );

      if (!offering || !offering.availablePackages.length) {
        console.warn("⚠️ No packages found in RevenueCat");
        setError(
          "No packages available. Please configure products in RevenueCat."
        );
        setPackages([]);
        setLoading(false);
        return;
      }

      // Format revenuecat packages
      const formattedPackages: CoinPackage[] = offering.availablePackages.map(
        (pkg, index) => {
          // Extract coin amount from package identifier (e.g. coins_100 -> 100)
          const coinsMatch = pkg.identifier.match(/(\d+)/);
          const coins = coinsMatch ? parseInt(coinsMatch[1], 10) : 0;

          return {
            identifier: pkg.identifier,
            title: getPackageTitle(coins),
            coins,
            price: pkg.product.priceString,
            package: pkg,
            popular: index === 1, // Make second package popular
          };
        }
      );

      setPackages(formattedPackages);
    } catch (error: any) {
      console.error("❌ Error loading packages:", error);
      setError("Failed to load packages. Please try again.");
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  const getPackageTitle = (coins: number): string => {
    if (coins >= 30) return "Mega Pack";
    if (coins >= 20) return "Value Pack";
    if (coins >= 10) return "Popular Pack";
    return "Starter Pack";
  };

  const handlePurchase = async (coinPackage: CoinPackage) => {
    if (!coinPackage.package) {
      setError(
        "Packages are not configured yet. Please set up RevenueCat products."
      );
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
        setError(error.message || "Purchase failed. Please try again.");
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
      setError("Failed to restore purchases. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  if (!fontsLoaded) {
    return (
      <Modal visible={visible} transparent>
        <View className="flex-1 justify-center items-center bg-black/50">
          <Text style={{ color: "white" }}>Loading...</Text>
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
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.7)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: "90%",
            maxWidth: 400,
            backgroundColor: "white",
            borderRadius: 20,
            padding: 20,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Text
              style={{ fontSize: 24, fontWeight: "bold", color: "#1f2937" }}
            >
              Buy Coins
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ fontSize: 24, color: "#1f2937" }}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View>
            {/* Loading State */}
            {loading && (
              <View className="py-12 items-center">
                <ActivityIndicator size="large" color="#991b1b" />
                <Text
                  className="text-gray-600 mt-4"
                  style={{ fontFamily: "MerriweatherSans_400Regular" }}
                >
                  Loading packages...
                </Text>
              </View>
            )}

            {/* Error Message */}
            {error && (
              <View className="bg-red-50 border-2 border-red-200 rounded-xl p-3 mb-4">
                <Text
                  className="text-red-700 text-sm text-center"
                  style={{ fontFamily: "MerriweatherSans_400Regular" }}
                >
                  {error}
                </Text>
              </View>
            )}

            {/* Packages */}
            {!loading && packages.length > 0 && (
              <View className="gap-3 mb-4">
                {packages.map((pkg) => {
                  const isPurchasing = purchasing === pkg.identifier;
                  const isDisabled = purchasing !== null;

                  return (
                    <TouchableOpacity
                      key={pkg.identifier}
                      onPress={() => handlePurchase(pkg)}
                      disabled={isDisabled || !pkg.package}
                      activeOpacity={0.8}
                    >
                      <View className="relative">
                        {/* Shadow */}
                        <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-xl" />

                        {/* Content */}
                        <View
                          className={`relative border-2 border-gray-900 rounded-xl p-4 flex-row items-center justify-between ${
                            pkg.popular ? "bg-amber-50" : "bg-white"
                          } ${isDisabled ? "opacity-50" : ""}`}
                        >
                          <View className="flex-1">
                            <View className="flex-row items-center gap-2 mb-1">
                              <Text
                                className="text-lg font-bold text-gray-900"
                                style={{
                                  fontFamily: "MerriweatherSans_700Bold",
                                }}
                              >
                                {pkg.title}
                              </Text>
                              {pkg.popular && (
                                <View className="bg-amber-300 border border-amber-400 rounded-full px-2 py-0.5">
                                  <Text
                                    className="text-xs font-semibold text-amber-900"
                                    style={{
                                      fontFamily: "MerriweatherSans_700Bold",
                                    }}
                                  >
                                    POPULAR
                                  </Text>
                                </View>
                              )}
                            </View>
                            <View className="flex-row items-center gap-2">
                              <FontAwesome6
                                name="coins"
                                size={16}
                                color="#991b1b"
                              />
                              <Text
                                className="text-gray-700 font-semibold"
                                style={{
                                  fontFamily: "MerriweatherSans_400Regular",
                                }}
                              >
                                {pkg.coins.toLocaleString()} Coins
                              </Text>
                            </View>
                          </View>

                          <View className="items-end">
                            <Text
                              className="text-xl font-bold text-gray-900"
                              style={{
                                fontFamily: "MerriweatherSans_700Bold",
                              }}
                            >
                              {pkg.price}
                            </Text>
                            {isPurchasing && (
                              <ActivityIndicator
                                size="small"
                                color="#991b1b"
                                className="mt-1"
                              />
                            )}
                          </View>
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
              className="mt-4"
            >
              <Text
                className="text-center text-gray-600 text-sm underline"
                style={{ fontFamily: "MerriweatherSans_400Regular" }}
              >
                Restore Purchases
              </Text>
            </TouchableOpacity>

            {/* Info Text */}
            <Text
              className="text-center text-gray-500 text-xs mt-4"
              style={{ fontFamily: "MerriweatherSans_400Regular" }}
            >
              {Platform.OS === "ios"
                ? "Payment will be charged to your Apple ID account"
                : "Payment will be charged to your Google Play account"}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CoinPurchaseModal;
