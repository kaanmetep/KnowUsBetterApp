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
        setPackages([]);
        return;
      }

      const formattedPackages: CoinPackage[] = offering.availablePackages
        .filter((pkg) => {
          const productId = pkg.product.identifier;
          return productId === "coins_10" || productId === "coins_30";
        })
        .map((pkg) => {
          const productId = pkg.product.identifier;
          const coinsMatch = productId.match(/(\d+)/);
          const coins = coinsMatch ? parseInt(coinsMatch[1], 10) : 0;

          return {
            identifier: pkg.product.identifier,
            coins,
            price: pkg.product.priceString,
            package: pkg,
          };
        })
        .sort((a, b) => a.coins - b.coins);

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
    if (!coinPackage.package) return;

    try {
      setPurchasing(coinPackage.identifier);
      setError(null);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await purchaseService.purchasePackage(coinPackage.package);
      await addCoins(coinPackage.coins);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onClose();
    } catch (error: any) {
      if (error.message !== "Purchase cancelled by user") {
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
      setError(t("coins.failedToRestore"));
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;
  if (!fontsLoaded) return null;

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
          backgroundColor: "rgba(0,0,0,0.6)",
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={onClose}
      >
        <Pressable
          style={{
            width: "90%",
            maxWidth: 400,
          }}
          onPress={() => {}}
        >
          {/* Main Card */}
          <View className="bg-white rounded-[28px] p-6 shadow-2xl shadow-black/15">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 bg-red-50 rounded-full items-center justify-center">
                  <FontAwesome6 name="coins" size={20} color="#dc2626" />
                </View>
                <Text
                  className="text-slate-800 text-2xl font-bold"
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
                className="w-8 h-8 items-center justify-center bg-slate-100 rounded-full"
                activeOpacity={0.7}
              >
                <FontAwesome6 name="xmark" size={14} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View>
              {loading && (
                <View className="py-12 items-center">
                  <ActivityIndicator size="large" color="#dc2626" />
                  <Text
                    className="text-slate-500 mt-4 text-sm"
                    style={{ fontFamily: "MerriweatherSans_400Regular" }}
                  >
                    {t("coins.loadingPackages")}
                  </Text>
                </View>
              )}

              {error && (
                <View className="bg-red-50 rounded-xl p-4 mb-4 border border-red-100">
                  <Text
                    className="text-red-600 text-sm text-center"
                    style={{ fontFamily: "MerriweatherSans_400Regular" }}
                  >
                    {error}
                  </Text>
                </View>
              )}

              {!loading && packages.length > 0 && (
                <View className="gap-3 mb-4">
                  {packages.map((pkg) => {
                    const isPurchasing = purchasing === pkg.identifier;
                    const isDisabled = purchasing !== null;

                    const getGradientColors = (): [string, string, string] => {
                      if (pkg.coins === 30) {
                        return ["#fff1f2", "#ffe4e6", "#fecdd3"];
                      }
                      return ["#f8fafc", "#f1f5f9", "#e2e8f0"];
                    };

                    return (
                      <TouchableOpacity
                        key={pkg.identifier}
                        onPress={() => handlePurchase(pkg)}
                        disabled={isDisabled || !pkg.package}
                        activeOpacity={0.9}
                      >
                        <View
                          className={`rounded-[20px] overflow-hidden border border-slate-100 shadow-sm shadow-slate-200 ${
                            isDisabled ? "opacity-50" : ""
                          }`}
                        >
                          <LinearGradient
                            colors={getGradientColors()}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{
                              padding: 16,
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <View className="flex-1 flex-row items-center gap-3">
                              <View className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm">
                                <FontAwesome6
                                  name="coins"
                                  size={18}
                                  color="#dc2626"
                                />
                              </View>

                              <View>
                                <Text
                                  className="text-slate-800 text-xl font-bold"
                                  style={{
                                    fontFamily: "MerriweatherSans_700Bold",
                                  }}
                                >
                                  {pkg.coins.toLocaleString()}
                                </Text>
                                <Text
                                  className="text-slate-500 text-xs font-bold uppercase tracking-wide"
                                  style={{
                                    fontFamily: "MerriweatherSans_700Bold",
                                  }}
                                >
                                  {pkg.coins === 1
                                    ? t("coins.coin")
                                    : t("coins.coins")}
                                </Text>
                              </View>
                            </View>

                            <View className="bg-white/60 px-4 py-2 rounded-xl">
                              {isPurchasing ? (
                                <ActivityIndicator
                                  size="small"
                                  color="#dc2626"
                                />
                              ) : (
                                <Text
                                  className="text-slate-900 text-base font-bold"
                                  style={{
                                    fontFamily: "MerriweatherSans_700Bold",
                                  }}
                                >
                                  {pkg.price}
                                </Text>
                              )}
                            </View>
                          </LinearGradient>
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
                className="mt-2 py-2"
                activeOpacity={0.7}
              >
                <Text
                  className="text-center text-slate-400 text-xs font-bold uppercase tracking-widest underline"
                  style={{
                    fontFamily: "MerriweatherSans_700Bold",
                  }}
                >
                  {t("coins.restorePurchases")}
                </Text>
              </TouchableOpacity>

              <View className="mt-4 gap-1">
                <Text
                  className="text-center text-slate-400 text-[10px]"
                  style={{
                    fontFamily: "MerriweatherSans_400Regular",
                    lineHeight: 14,
                  }}
                >
                  {Platform.OS === "ios"
                    ? t("coins.paymentChargedApple")
                    : t("coins.paymentChargedGoogle")}
                </Text>

                <Text
                  className="text-center text-slate-400 text-[10px]"
                  style={{
                    fontFamily: "MerriweatherSans_400Regular",
                    lineHeight: 14,
                  }}
                >
                  {t("coins.deviceSpecific")}
                </Text>

                <Text
                  className="text-center text-slate-400 text-[10px]"
                  style={{
                    fontFamily: "MerriweatherSans_400Regular",
                    lineHeight: 14,
                  }}
                >
                  {t("coins.deviceSpecificSupport")}
                </Text>
              </View>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default CoinPurchaseModal;
