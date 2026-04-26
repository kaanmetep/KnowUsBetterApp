import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as Clipboard from "expo-clipboard";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Rect } from "react-native-svg";
import { useCoins } from "../../contexts/CoinContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { useTranslation } from "../../hooks/useTranslation";
import {
  Category,
  getCategories,
  getCategoryById,
  getCategoryLabel,
} from "../../services/categoryService";
import { Room } from "../../services/socketService";
import { getAvatarImage } from "../../utils/avatarUtils";
import ButtonLoading from "../ui/ButtonLoading";
import CoinBalanceDisplay from "../coins/CoinBalanceDisplay";
import CoinPurchaseModal from "../coins/CoinPurchaseModal";
import Logo from "../ui/Logo";
import RateAppFeedbackModal from "../profile/RateAppFeedbackModal";
import SettingsButton from "../settings/SettingsButton";
import SettingsModal from "../settings/SettingsModal";

const AnimatedRect = Animated.createAnimatedComponent(Rect);

interface WaitingRoomProps {
  room: Room;
  roomCode: string;
  mySocketId: string | undefined;
  isMe: (playerId: string) => boolean;
  onStartGame: () => void;
  onLeaveRoom: () => void;
  onKickPlayer?: (playerId: string) => void;
  onChangeCategory?: (categoryId: string) => Promise<void>;
  isStartingGame?: boolean;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({
  room,
  roomCode,
  mySocketId,
  isMe,
  onStartGame,
  onLeaveRoom,
  onKickPlayer,
  onChangeCategory,
  isStartingGame = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showRateAppModal, setShowRateAppModal] = useState(false);
  const [categoryInfo, setCategoryInfo] = useState<Category | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const sheetSlideAnim = useRef(new Animated.Value(400)).current;
  const { selectedLanguage } = useLanguage();
  const { coins } = useCoins();
  const { t } = useTranslation();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dashOffsetAnim = useRef(new Animated.Value(0)).current;
  const startButtonGlowAnim = useRef(new Animated.Value(0)).current;
  const dashAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const coinWarningPulseAnim = useRef(new Animated.Value(1)).current;

  const participants = room.players || [];
  const headerTop = Math.max(Constants.statusBarHeight + 12, 16);
  const logoTopSpacing = Math.max(headerTop - 12, 31);
  const isHost = participants.find((p) => p.id === mySocketId)?.isHost || false;
  const hasEnoughPlayers = participants.length >= 2;
  const canStartGame = hasEnoughPlayers;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  useEffect(() => {
    if (participants.length < 2) {
      if (dashAnimationRef.current) {
        dashAnimationRef.current.stop();
        dashAnimationRef.current = null;
      }
      dashOffsetAnim.setValue(0);
      const animation = Animated.loop(
        Animated.timing(dashOffsetAnim, {
          toValue: -15,
          duration: 800,
          easing: Easing.linear,
          useNativeDriver: false,
        })
      );
      dashAnimationRef.current = animation;
      animation.start();
    } else {
      if (dashAnimationRef.current) {
        dashAnimationRef.current.stop();
        dashAnimationRef.current = null;
      }
    }
    return () => {};
  }, [participants.length]);

  useEffect(() => {
    if (canStartGame) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(startButtonGlowAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(startButtonGlowAnim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      startButtonGlowAnim.setValue(0);
    }
  }, [canStartGame, startButtonGlowAnim]);

  useEffect(() => {
    if (
      categoryInfo?.isPremium &&
      categoryInfo.coinsRequired &&
      coins < categoryInfo.coinsRequired
    ) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(coinWarningPulseAnim, {
            toValue: 0.6,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(coinWarningPulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      return () => {
        pulseAnimation.stop();
      };
    } else {
      coinWarningPulseAnim.setValue(1);
    }
  }, [categoryInfo, coins, coinWarningPulseAnim]);

  useEffect(() => {
    const loadCategoryInfo = async () => {
      const category = room.settings?.category || "just_friends";
      const categoryData = await getCategoryById(category);
      setCategoryInfo(categoryData);
    };
    loadCategoryInfo();
  }, [room.settings?.category]);

  useEffect(() => {
    if (showCategoryModal) {
      sheetSlideAnim.setValue(400);
      Animated.spring(sheetSlideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 28,
        stiffness: 320,
        mass: 0.8,
      }).start();
    }
  }, [showCategoryModal]);

  const category = room.settings?.category || "just_friends";
  const displayCategoryInfo = categoryInfo || {
    id: category,
    labels: {},
    color: "#f3f4f6",
    iconName: "handshake",
    iconType: "FontAwesome6" as const,
    coinsRequired: 0,
    isPremium: false,
    orderIndex: 0,
  };
  const roomLink = `https://knowusbetter.app/join/${roomCode}`;

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareLink = async () => {
    try {
      await Share.share({
        message: t("waitingRoom.shareMessage", { code: roomCode }),
        url: roomLink,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleBuyCoins = () => {
    setShowPurchaseModal(true);
  };

  const handleOpenCategoryModal = async () => {
    setShowCategoryModal(true);
    if (allCategories.length === 0) {
      setLoadingCategories(true);
      const cats = await getCategories();
      setAllCategories(cats);
      setLoadingCategories(false);
    }
  };

  const handleSelectCategory = (newCategoryId: string) => {
    if (newCategoryId === category || !onChangeCategory) return;
    setShowCategoryModal(false);
    onChangeCategory(newCategoryId).catch(() => {});
  };

  return (
    <View className="flex-1 bg-white pt-16">
      <CoinPurchaseModal
        visible={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
      />

      <SettingsModal
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onBuyCoins={() => {
          setShowSettingsModal(false);
          setShowPurchaseModal(true);
        }}
        onRequestRateApp={() => setShowRateAppModal(true)}
      />

      <RateAppFeedbackModal
        visible={showRateAppModal}
        onClose={() => setShowRateAppModal(false)}
      />

      {/* Category Change Modal */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View
          style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.45)" }}
        >
          {/* Backdrop tap area */}
          <TouchableOpacity
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
            activeOpacity={1}
            onPress={() => setShowCategoryModal(false)}
          />
          <Animated.View
            style={{
              backgroundColor: "#fff",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              maxHeight: "78%",
              paddingBottom: 32,
              transform: [{ translateY: sheetSlideAnim }],
            }}
          >
            {/* Handle bar */}
            <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 8 }}>
              <View style={{ width: 40, height: 4, borderRadius: 999, backgroundColor: "#e2e8f0" }} />
            </View>

            {/* Header */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, paddingTop: 8, paddingBottom: 4 }}>
              <Text
                style={{
                  fontFamily: "MerriweatherSans_700Bold",
                  fontSize: 18,
                  color: "#1e293b",
                }}
              >
                {t("waitingRoom.changeCategoryTitle")}
              </Text>
              <TouchableOpacity
                onPress={() => setShowCategoryModal(false)}
                activeOpacity={0.7}
                style={{ width: 32, height: 32, alignItems: "center", justifyContent: "center", borderRadius: 999, backgroundColor: "#f1f5f9" }}
              >
                <Ionicons name="close" size={18} color="#64748b" />
              </TouchableOpacity>
            </View>
            <Text
              style={{ fontFamily: "MerriweatherSans_400Regular", fontSize: 12, color: "#94a3b8", paddingHorizontal: 24, paddingBottom: 12 }}
            >
              {t("waitingRoom.changeCategorySubtitle")}
            </Text>

            {/* Category List */}
            {loadingCategories ? (
              <View style={{ paddingVertical: 40, alignItems: "center" }}>
                <ActivityIndicator size="small" color="#94a3b8" />
              </View>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                bounces={false}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}
              >
                {allCategories.map((cat) => {
                  const isSelected = cat.id === category;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => handleSelectCategory(cat.id)}
                      activeOpacity={0.8}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: cat.color,
                        borderRadius: 16,
                        padding: 14,
                        marginBottom: 10,
                        borderWidth: isSelected ? 2 : 0,
                        borderColor: isSelected ? "rgba(0,0,0,0.12)" : "transparent",
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 4,
                        elevation: 2,
                      }}
                    >
                      {/* Category Icon */}
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 999,
                          backgroundColor: "rgba(255,255,255,0.4)",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 12,
                        }}
                      >
                        {cat.iconType === "MaterialCommunityIcons" ? (
                          <MaterialCommunityIcons
                            name={cat.iconName as any}
                            size={20}
                            color="#1f2937"
                          />
                        ) : (
                          <FontAwesome6
                            name={cat.iconName as any}
                            size={18}
                            color="#1f2937"
                          />
                        )}
                      </View>

                      {/* Category Name */}
                      <Text
                        numberOfLines={1}
                        style={{
                          fontFamily: "MerriweatherSans_700Bold",
                          fontSize: 15,
                          color: "#1f2937",
                          flex: 1,
                          marginRight: 8,
                        }}
                      >
                        {getCategoryLabel(cat, selectedLanguage)}
                      </Text>

                      {/* Coin badge for premium categories */}
                      {cat.isPremium && cat.coinsRequired > 0 && (
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            backgroundColor: "#facc15",
                            borderRadius: 8,
                            paddingHorizontal: 10,
                            paddingVertical: 6,
                            marginRight: isSelected ? 8 : 0,
                          }}
                        >
                          <FontAwesome6 name="coins" size={10} color="#713f12" />
                          <Text
                            style={{
                              fontFamily: "MerriweatherSans_700Bold",
                              fontSize: 12,
                              color: "#713f12",
                              marginLeft: 5,
                            }}
                          >
                            {cat.coinsRequired}
                          </Text>
                        </View>
                      )}

                      {/* Checkmark */}
                      {isSelected && (
                        <View
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 999,
                            backgroundColor: "rgba(255,255,255,0.4)",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Ionicons name="checkmark" size={16} color="#1f2937" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </Animated.View>
        </View>
      </Modal>

      <View
        className="absolute left-6 z-50 flex-row items-center gap-2"
        style={{ top: headerTop }}
      >
        <CoinBalanceDisplay onBuyCoins={handleBuyCoins} />
        <TouchableOpacity
          onPress={handleBuyCoins}
          activeOpacity={0.7}
          className="bg-amber-50 border border-amber-300 rounded-full px-2.5 py-1.5 flex-row items-center justify-center gap-1 shadow-sm shadow-amber-100/50"
        >
          <View className="bg-amber-100 w-4 h-4 rounded-full items-center justify-center">
            <FontAwesome5 name="plus" size={8} color="#B45309" />
          </View>
          <Text
            className="text-amber-800 font-bold text-xs"
            style={{ fontFamily: "MerriweatherSans_700Bold" }}
          >
            {t("coins.buyCoins")}
          </Text>
        </TouchableOpacity>
      </View>

      <View
        className="absolute right-6 z-50 flex-row items-center justify-end gap-3"
        style={{ top: headerTop }}
      >
        <SettingsButton onPress={() => setShowSettingsModal(true)} />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginTop: logoTopSpacing }}>
          <Logo size="tiny" />
        </View>
        <View className="px-6 mt-4">
          {/* Room Code Section */}
          <View className="mb-8 items-center">
            <Text
              className="text-center text-slate-500 text-sm mb-4"
              style={{ fontFamily: "MerriweatherSans_400Regular" }}
            >
              {t("waitingRoom.shareCodeWithPartner")}
            </Text>
            <View
              className="bg-white w-full rounded-[32px] p-8 items-center"
              style={{
                shadowColor: "#fe9ea2",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              <Text
                className="text-5xl font-bold text-slate-800 tracking-widest mb-4"
                style={{
                  letterSpacing: 8,
                  fontFamily: "MerriweatherSans_700Bold",
                }}
              >
                {roomCode}
              </Text>

              {/* Copy Button */}
              <TouchableOpacity
                onPress={handleCopyCode}
                className="bg-amber-50 rounded-full px-6 py-3 flex-row items-center gap-2"
                activeOpacity={0.7}
              >
                <Ionicons
                  name={copied ? "checkmark-circle" : "copy-outline"}
                  size={18}
                  color="#d97706"
                />
                <Text
                  className="text-amber-700 font-semibold"
                  style={{ fontFamily: "MerriweatherSans_700Bold" }}
                >
                  {copied ? t("waitingRoom.copied") : t("waitingRoom.copyCode")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Category Badge */}
          <View className="items-center mb-8">
            <TouchableOpacity
              onPress={isHost ? handleOpenCategoryModal : undefined}
              activeOpacity={isHost ? 0.7 : 1}
              disabled={!isHost}
              className="rounded-full px-5 py-3 flex-row items-center gap-3 bg-slate-50 border border-slate-200"
            >
              {displayCategoryInfo.iconType === "MaterialCommunityIcons" ? (
                <MaterialCommunityIcons
                  name={displayCategoryInfo.iconName as any}
                  size={20}
                  color="#475569"
                />
              ) : (
                <FontAwesome6
                  name={displayCategoryInfo.iconName as any}
                  size={18}
                  color="#475569"
                />
              )}
              <Text
                className="text-slate-700 font-semibold"
                style={{ fontFamily: "MerriweatherSans_400Regular" }}
              >
                {getCategoryLabel(displayCategoryInfo, selectedLanguage)}
              </Text>
              {isHost && (
                <Ionicons name="chevron-down" size={14} color="#94a3b8" />
              )}
            </TouchableOpacity>

            {/* Coin Warning */}
            {isHost &&
              categoryInfo?.isPremium &&
              categoryInfo.coinsRequired &&
              coins < categoryInfo.coinsRequired &&
              !isStartingGame && (
                <Animated.View
                  style={{
                    opacity: coinWarningPulseAnim,
                    marginTop: 12,
                  }}
                >
                  <View className="bg-red-50 border border-red-100 rounded-xl px-4 py-2 flex-row items-center gap-2">
                    <Ionicons name="alert-circle" size={16} color="#ef4444" />
                    <Text
                      className="text-red-600 text-xs font-semibold"
                      style={{ fontFamily: "MerriweatherSans_700Bold" }}
                    >
                      {t("waitingRoom.needCoins", {
                        required: categoryInfo.coinsRequired,
                        current: coins,
                      })}
                    </Text>
                  </View>
                </Animated.View>
              )}
          </View>

          {/* Participants Section */}
          <View className="mb-8">
            <View className="flex-row items-center justify-between mb-4 px-1">
              <Text
                className="text-slate-800 text-lg font-bold"
                style={{ fontFamily: "MerriweatherSans_700Bold" }}
              >
                {t("waitingRoom.participants", { count: participants.length })}
              </Text>
              {participants.length < 2 && (
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <View className="bg-blue-50 rounded-full px-3 py-1">
                    <Text
                      className="text-blue-600 text-xs font-semibold"
                      style={{ fontFamily: "MerriweatherSans_400Regular" }}
                    >
                      {t("waitingRoom.waiting")}
                    </Text>
                  </View>
                </Animated.View>
              )}
            </View>

            <View className="gap-4">
              {participants.map((participant) => {
                const isCurrentUser = isMe(participant.id);
                const canKick = isHost && !isCurrentUser && onKickPlayer;

                return (
                  // Card
                  <View
                    key={participant.id}
                    className="bg-white rounded-2xl p-4 flex-row items-center justify-between border border-slate-50"
                    style={{
                      shadowColor: "#cbd5e1",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                  >
                    <View className="flex-row items-center gap-4">
                      <View className="w-12 h-12 rounded-full items-center justify-center bg-slate-100" style={{ overflow: "hidden" }}>
                        {participant.avatar &&
                        getAvatarImage(participant.avatar) ? (
                          <Image
                            source={getAvatarImage(participant.avatar)}
                            style={{ 
                              width: 48, 
                              height: 48,
                              borderRadius: 24
                            }}
                            contentFit="contain"
                          />
                        ) : (
                          <FontAwesome5 name="user" size={16} color="#94a3b8" />
                        )}
                      </View>
                      <View>
                        <View className="flex-row items-center gap-2">
                          <Text
                            className="text-slate-800 font-semibold text-base"
                            style={{ fontFamily: "MerriweatherSans_700Bold" }}
                          >
                            {participant.name}
                          </Text>
                          {isCurrentUser && (
                            <View className="bg-slate-100 px-2 py-0.5 rounded-md">
                              <Text
                                className="text-slate-500 text-[10px] font-bold"
                                style={{
                                  fontFamily: "MerriweatherSans_700Bold",
                                }}
                              >
                                {t("waitingRoom.you")}
                              </Text>
                            </View>
                          )}
                        </View>
                        {participant.isHost && (
                          <Text
                            className="text-amber-500 text-xs mt-0.5"
                            style={{
                              fontFamily: "MerriweatherSans_400Regular",
                            }}
                          >
                            {t("waitingRoom.roomHost")}
                          </Text>
                        )}
                      </View>
                    </View>
                    {canKick && (
                      <TouchableOpacity
                        onPress={() => onKickPlayer(participant.id)}
                        className="bg-red-50 p-2 rounded-xl"
                        activeOpacity={0.7}
                      >
                        <MaterialCommunityIcons
                          name="account-remove"
                          size={20}
                          color="#ef4444"
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}

              {/* Waiting Dashed Box */}
              {participants.length < 2 && (
                <View
                  className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-50 relative"
                  style={{
                    shadowColor: "#cbd5e1",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <Svg
                    width="100%"
                    height="100%"
                    style={{ position: "absolute" }}
                  >
                    <AnimatedRect
                      x="0"
                      y="0"
                      width="100%"
                      height="100%"
                      stroke="#cbd5e1"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray="10 6"
                      strokeDashoffset={dashOffsetAnim}
                      rx="16"
                    />
                  </Svg>

                  <View className="p-4 flex-row items-center justify-between">
                    <View className="flex-row items-center gap-4">
                      {/* Placeholder Avatar */}
                      <View className="w-12 h-12 rounded-full bg-slate-200/50 items-center justify-center">
                        <MaterialCommunityIcons
                          name="account-question"
                          size={24}
                          color="#94a3b8"
                        />
                      </View>

                      {/* Text Area */}
                      <View className="flex-1">
                        <Text
                          className="text-slate-500 font-bold text-base"
                          style={{ fontFamily: "MerriweatherSans_700Bold" }}
                        >
                          {t("waitingRoom.waiting")}...
                        </Text>
                        <Text
                          className="text-slate-400 text-xs italic mt-0.5"
                          style={{ fontFamily: "MerriweatherSans_400Regular" }}
                        >
                          {t("waitingRoom.waitingForAnotherPlayer")}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          {isHost && (
            <View className="mb-4">
              {/* START BUTTON */}
              <TouchableOpacity
                onPress={onStartGame}
                disabled={!hasEnoughPlayers || isStartingGame}
                activeOpacity={0.9}
                style={{
                  borderRadius: 24,
                  shadowColor: "#FECACA",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: !hasEnoughPlayers || isStartingGame ? 0 : 0.4,
                  shadowRadius: 12,
                  elevation: 8,
                }}
              >
                <LinearGradient
                  colors={
                    !hasEnoughPlayers || isStartingGame
                      ? ["#F1F5F9", "#E2E8F0"]
                      : ["#FFF5F5", "#FFE3E3", "#FFDADA"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    borderRadius: 24,
                    paddingVertical: 18,
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor:
                      !hasEnoughPlayers || isStartingGame
                        ? "#F1F5F9"
                        : "#FFF0F0",
                  }}
                >
                  <View className="flex-row items-center gap-3">
                    {isStartingGame && <ButtonLoading size={16} style="dots" />}
                    <Text
                      style={{
                        fontFamily: "MerriweatherSans_700Bold",
                        fontSize: 18,
                        color:
                          !hasEnoughPlayers || isStartingGame
                            ? "#94A3B8"
                            : "#1E293B",
                        letterSpacing: 0.5,
                      }}
                    >
                      {isStartingGame
                        ? t("waitingRoom.starting")
                        : hasEnoughPlayers
                        ? t("waitingRoom.startGame")
                        : t("waitingRoom.waitingForPlayers")}
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* Leave Room Button */}
          <TouchableOpacity
            onPress={onLeaveRoom}
            className="py-4 items-center"
            activeOpacity={0.7}
          >
            <Text
              className="text-slate-400 font-semibold"
              style={{ fontFamily: "MerriweatherSans_700Bold" }}
            >
              {t("waitingRoom.leaveRoom")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default WaitingRoom;
