import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  Platform,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Rect } from "react-native-svg";
import { useCoins } from "../../contexts/CoinContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { useTranslation } from "../../hooks/useTranslation";
import {
  Category,
  CategoryGroup,
  getCategories,
  getCategoryById,
  getCategoryGroupLabel,
  getCategoryGroups,
  getCategoryLabel,
} from "../../services/categoryService";
import { getAppConfig } from "../../services/appConfigService";
import { Room } from "../../services/socketService";
import { getAvatarImage } from "../../utils/avatarUtils";
import CoinBalanceDisplay from "../coins/CoinBalanceDisplay";
import CoinPurchaseModal from "../coins/CoinPurchaseModal";
import RateAppFeedbackModal from "../profile/RateAppFeedbackModal";
import SettingsButton from "../settings/SettingsButton";
import SettingsModal from "../settings/SettingsModal";
import ButtonLoading from "../ui/ButtonLoading";
import Logo from "../ui/Logo";

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
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoryModalScrollContainerH, setCategoryModalScrollContainerH] =
    useState(0);
  const [categoryModalScrollContentH, setCategoryModalScrollContentH] =
    useState(0);
  const categoryModalScrollY = useRef(new Animated.Value(0)).current;
  const categoryModalScrollViewRef = useRef<ScrollView>(null);
  const categoryModalScrollOffsetRef = useRef(0);
  const sheetSlideAnim = useRef(new Animated.Value(400)).current;
  const { selectedLanguage } = useLanguage();
  const { coins } = useCoins();
  const { t } = useTranslation();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dashOffsetAnim = useRef(new Animated.Value(0)).current;
  const startButtonGlowAnim = useRef(new Animated.Value(0)).current;
  const dashAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const coinWarningPulseAnim = useRef(new Animated.Value(1)).current;
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isSmallScreen = height < 760;
  const isVerySmallScreen = width <= 350 || height <= 670;
  const step3Scale = isVerySmallScreen ? 0.84 : isSmallScreen ? 0.92 : 1;
  const isIphone = Platform.OS === "ios";
  const isCompactIphoneWidth = isIphone && width <= 393;
  const isLargeIphoneWidth = isIphone && width > 393 && width <= 430;
  const categoryDensityScale = isCompactIphoneWidth
    ? 0.86
    : isLargeIphoneWidth
      ? 0.92
      : 1;
  const categoryNameScale = categoryDensityScale;
  const groupIconById: Record<string, keyof typeof Ionicons.glyphMap> = {
    see_your_match: "people-outline",
    know_each_other: "chatbubbles-outline",
    who_knows_better: "school-outline",
  };

  const isBigIphone = isIphone && width >= 393;
  const categoryModalListMaxHeight = isVerySmallScreen
    ? 292
    : isSmallScreen
      ? 334
      : isBigIphone
        ? 432
        : isIphone
          ? 452
          : 430;
  const categoryModalScrollbarPadding = 8;
  const categoryModalTrackHeight = Math.max(
    0,
    categoryModalScrollContainerH - categoryModalScrollbarPadding * 2,
  );
  const categoryModalThumbHeight =
    categoryModalScrollContentH > 0 && categoryModalTrackHeight > 0
      ? Math.min(
          categoryModalTrackHeight,
          Math.max(
            32,
            (categoryModalScrollContainerH / categoryModalScrollContentH) *
              categoryModalTrackHeight,
          ),
        )
      : categoryModalTrackHeight || 32;
  const categoryModalMaxScroll = Math.max(
    1,
    categoryModalScrollContentH - categoryModalScrollContainerH,
  );
  const categoryModalThumbY = categoryModalScrollY.interpolate({
    inputRange: [0, categoryModalMaxScroll],
    outputRange: [
      categoryModalScrollbarPadding,
      Math.max(
        categoryModalScrollbarPadding,
        categoryModalScrollContainerH -
          categoryModalThumbHeight -
          categoryModalScrollbarPadding,
      ),
    ],
    extrapolate: "clamp",
  });

  const resetCategoryModalScroll = useCallback(() => {
    categoryModalScrollOffsetRef.current = 0;
    categoryModalScrollY.setValue(0);
    categoryModalScrollViewRef.current?.scrollTo({ y: 0, animated: false });
  }, [categoryModalScrollY]);

  const participants = room.players || [];
  const isSmallPhone = width <= 375 && height <= 700;
  const isVerySmallPhone = width <= 350 || height <= 640;
  const uiScale = isVerySmallPhone ? 0.78 : isSmallPhone ? 0.88 : 1;
  const roomCodeScale = isVerySmallPhone ? 0.72 : isSmallPhone ? 0.8 : 1;
  const categorySheetScale = isVerySmallPhone ? 0.8 : isSmallPhone ? 0.9 : 1;
  const headerTop = Math.max(insets.top + 6, 12);
  const logoTopSpacing = Math.max(headerTop - 12, 31);
  const isHost = participants.find((p) => p.id === mySocketId)?.isHost || false;
  const hasEnoughPlayers =
    participants.length >= getAppConfig().gameplay.room.minPlayersToStart;
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
      ]),
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
        }),
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
        ]),
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
        ]),
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

  useEffect(() => {
    if (!showCategoryModal) return;
    const id = requestAnimationFrame(() => {
      resetCategoryModalScroll();
    });
    return () => cancelAnimationFrame(id);
  }, [showCategoryModal, resetCategoryModalScroll]);

  const category = room.settings?.category || "just_friends";
  const displayCategoryInfo = categoryInfo || {
    id: category,
    labels: {},
    groupId: null,
    color: "#f3f4f6",
    iconName: "handshake",
    iconType: "FontAwesome6" as const,
    coinsRequired: 0,
    isPremium: false,
    recentlyAdded: false,
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
    const needCats = allCategories.length === 0;
    const needGroups = categoryGroups.length === 0;
    if (!needCats && !needGroups) return;
    setLoadingCategories(true);
    try {
      const [cats, groups] = await Promise.all([
        needCats ? getCategories() : Promise.resolve(allCategories),
        needGroups ? getCategoryGroups() : Promise.resolve(categoryGroups),
      ]);
      if (needCats) setAllCategories(cats);
      if (needGroups) setCategoryGroups(groups);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleSelectCategory = (newCategoryId: string) => {
    if (newCategoryId === category || !onChangeCategory) return;
    setShowCategoryModal(false);
    onChangeCategory(newCategoryId).catch(() => {});
  };

  return (
    <View
      className="flex-1 bg-white"
      style={{ paddingTop: isSmallPhone ? 10 : 16 }}
    >
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
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.45)",
          }}
        >
          {/* Backdrop tap area */}
          <TouchableOpacity
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            activeOpacity={1}
            onPress={() => setShowCategoryModal(false)}
          />
          <Animated.View
            style={{
              backgroundColor: "#fff",
              borderTopLeftRadius: 28 * categorySheetScale,
              borderTopRightRadius: 28 * categorySheetScale,
              maxHeight: isVerySmallPhone
                ? "68%"
                : isSmallPhone
                  ? "72%"
                  : "78%",
              paddingHorizontal: 16 * categorySheetScale,
              paddingBottom: 24 * categorySheetScale,
              transform: [{ translateY: sheetSlideAnim }],
            }}
          >
            {/* Handle bar */}
            <View
              style={{
                alignItems: "center",
                paddingTop: 12 * categorySheetScale,
                paddingBottom: 8 * categorySheetScale,
              }}
            >
              <View
                style={{
                  width: 40 * categorySheetScale,
                  height: 4 * categorySheetScale,
                  borderRadius: 999,
                  backgroundColor: "#e2e8f0",
                }}
              />
            </View>

            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: 8 * categorySheetScale,
                paddingBottom: 10 * categorySheetScale,
              }}
            >
              <Text
                style={{
                  fontFamily: "MerriweatherSans_700Bold",
                  fontSize: 18 * categorySheetScale,
                  color: "#1e293b",
                  flex: 1,
                  paddingLeft: 6 * step3Scale,
                }}
              >
                {t("waitingRoom.changeCategoryTitle")}
              </Text>
              <TouchableOpacity
                onPress={() => setShowCategoryModal(false)}
                activeOpacity={0.7}
                style={{
                  width: 32 * categorySheetScale,
                  height: 32 * categorySheetScale,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 999,
                  backgroundColor: "#f1f5f9",
                }}
              >
                <Ionicons
                  name="close"
                  size={18 * categorySheetScale}
                  color="#64748b"
                />
              </TouchableOpacity>
            </View>

            {/* Category List */}
            {loadingCategories ? (
              <View style={{ paddingVertical: 40, alignItems: "center" }}>
                <ActivityIndicator size="small" color="#94a3b8" />
              </View>
            ) : (
              <View
                style={{
                  marginBottom: 8 * categorySheetScale,
                  borderRadius: 20 * step3Scale,
                  overflow: "hidden",
                  maxHeight: categoryModalListMaxHeight,
                  flexDirection: "row",
                  backgroundColor: "#fdfdfe",
                  shadowColor: "#475569",
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.22,
                  shadowRadius: 30,
                  elevation: 10,
                }}
              >
                <ScrollView
                  ref={categoryModalScrollViewRef}
                  style={{ flex: 1 }}
                  contentContainerStyle={{
                    paddingHorizontal: 9 * step3Scale,
                    paddingTop: 9 * step3Scale,
                    paddingBottom: 9 * step3Scale,
                  }}
                  scrollEnabled
                  nestedScrollEnabled
                  showsVerticalScrollIndicator={false}
                  onScroll={(e) => {
                    const offsetY = e.nativeEvent.contentOffset.y;
                    categoryModalScrollOffsetRef.current = offsetY;
                    categoryModalScrollY.setValue(offsetY);
                  }}
                  scrollEventThrottle={16}
                  onLayout={(e) =>
                    setCategoryModalScrollContainerH(
                      e.nativeEvent.layout.height,
                    )
                  }
                  onContentSizeChange={(_, h) =>
                    setCategoryModalScrollContentH(h)
                  }
                >
                  {(() => {
                    const categoriesByGroupId = allCategories.reduce<
                      Record<string, Category[]>
                    >((acc, c) => {
                      const key = c.groupId || "__ungrouped__";
                      if (!acc[key]) acc[key] = [];
                      acc[key].push(c);
                      return acc;
                    }, {});
                    Object.values(categoriesByGroupId).forEach((items) =>
                      items.sort((a, b) => a.orderIndex - b.orderIndex),
                    );
                    const groupedCategories = categoryGroups
                      .sort((a, b) => a.orderIndex - b.orderIndex)
                      .map((g) => ({
                        key: g.id,
                        title: getCategoryGroupLabel(g, selectedLanguage),
                        icon: groupIconById[g.id] || "albums-outline",
                        items: categoriesByGroupId[g.id] || [],
                      }))
                      .filter((g) => g.items.length > 0);

                    return groupedCategories.map((group, groupIndex) => (
                      <View key={group.key}>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: 10 * step3Scale,
                            marginTop:
                              groupIndex === 0
                                ? 2 * step3Scale
                                : 6 * step3Scale,
                            paddingHorizontal: 2 * step3Scale,
                          }}
                        >
                          <Ionicons
                            name={group.icon as any}
                            size={13 * step3Scale}
                            color="#94a3b8"
                          />
                          <Text
                            style={{
                              marginLeft: 6 * step3Scale,
                              fontFamily: "MerriweatherSans_600SemiBold",
                              fontSize: 11.5 * step3Scale,
                              color: "#94a3b8",
                            }}
                          >
                            {group.title}
                          </Text>
                        </View>
                        {group.items.map((cat) => {
                          const isSelected = cat.id === category;
                          return (
                            <TouchableOpacity
                              key={cat.id}
                              onPress={() => handleSelectCategory(cat.id)}
                              activeOpacity={0.8}
                              className="mb-3 flex-row items-center justify-between"
                              style={{
                                borderRadius:
                                  16 * step3Scale * categoryDensityScale,
                                paddingHorizontal: 16 * step3Scale,
                                paddingVertical:
                                  14 * step3Scale * categoryDensityScale,
                                backgroundColor: cat.color,
                                borderWidth: isSelected ? 2 : 0,
                                borderColor: isSelected
                                  ? "rgba(0,0,0,0.1)"
                                  : "transparent",
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.05,
                                shadowRadius: 4,
                                elevation: 2,
                              }}
                            >
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  flex: 1,
                                }}
                              >
                                <View
                                  style={{
                                    width:
                                      40 * step3Scale * categoryDensityScale,
                                    height:
                                      40 * step3Scale * categoryDensityScale,
                                    borderRadius: 999,
                                    backgroundColor: "rgba(255,255,255,0.4)",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginRight: 12 * step3Scale,
                                  }}
                                >
                                  {cat.iconType === "MaterialCommunityIcons" ? (
                                    <MaterialCommunityIcons
                                      name={cat.iconName as any}
                                      size={
                                        19 * step3Scale * categoryDensityScale
                                      }
                                      color="#1f2937"
                                    />
                                  ) : (
                                    <FontAwesome6
                                      name={cat.iconName as any}
                                      size={
                                        17 * step3Scale * categoryDensityScale
                                      }
                                      color="#1f2937"
                                    />
                                  )}
                                </View>
                                <Text
                                  numberOfLines={1}
                                  style={{
                                    fontFamily: "MerriweatherSans_600SemiBold",
                                    fontSize:
                                      16 * step3Scale * categoryNameScale,
                                    color: "#0f172a",
                                    flex: 1,
                                    marginRight: 8 * step3Scale,
                                  }}
                                >
                                  {getCategoryLabel(cat, selectedLanguage)}
                                </Text>
                                {cat.isPremium && cat.coinsRequired > 0 && (
                                  <View
                                    style={{
                                      flexDirection: "row",
                                      alignItems: "center",
                                      backgroundColor: "#facc15",
                                      borderRadius:
                                        8 * step3Scale * categoryDensityScale,
                                      paddingHorizontal: 10 * step3Scale,
                                      paddingVertical:
                                        6 * step3Scale * categoryDensityScale,
                                      marginRight: isSelected
                                        ? 8 * step3Scale
                                        : 0,
                                    }}
                                  >
                                    <FontAwesome6
                                      name="coins"
                                      size={
                                        10 * step3Scale * categoryDensityScale
                                      }
                                      color="#713f12"
                                    />
                                    <Text
                                      style={{
                                        fontFamily: "MerriweatherSans_700Bold",
                                        fontSize:
                                          12 *
                                          step3Scale *
                                          categoryDensityScale,
                                        color: "#713f12",
                                        marginLeft: 6 * step3Scale,
                                      }}
                                    >
                                      {cat.coinsRequired}
                                    </Text>
                                  </View>
                                )}
                              </View>
                              {isSelected && (
                                <View
                                  style={{
                                    marginLeft: 12 * step3Scale,
                                    width:
                                      22 * step3Scale * categoryDensityScale,
                                    height:
                                      22 * step3Scale * categoryDensityScale,
                                    borderRadius: 999,
                                    backgroundColor: "rgba(255,255,255,0.4)",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Ionicons
                                    name="checkmark"
                                    size={
                                      15 * step3Scale * categoryDensityScale
                                    }
                                    color="#1f2937"
                                  />
                                </View>
                              )}
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    ));
                  })()}
                </ScrollView>

                <View
                  style={{
                    width: 14,
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      position: "absolute",
                      top: categoryModalScrollbarPadding,
                      bottom: categoryModalScrollbarPadding,
                      width: 2,
                      left: 6,
                      backgroundColor: "rgba(0,0,0,0.07)",
                      borderRadius: 1,
                    }}
                  />
                  <Animated.View
                    style={{
                      position: "absolute",
                      left: 4,
                      width: 6,
                      height: categoryModalThumbHeight,
                      backgroundColor: "rgba(100, 116, 139, 0.55)",
                      borderRadius: 3,
                      transform: [{ translateY: categoryModalThumbY }],
                    }}
                  />
                </View>
              </View>
            )}
          </Animated.View>
        </View>
      </Modal>

      <View
        className="absolute left-6 z-50 flex-row items-center gap-2"
        style={{
          top: headerTop,
          left: isSmallPhone ? 12 : 24,
          transform: [
            { scale: isVerySmallPhone ? 0.9 : isSmallPhone ? 0.96 : 1 },
          ],
        }}
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
        style={{ top: headerTop, right: isSmallPhone ? 12 : 24 }}
      >
        <SettingsButton onPress={() => setShowSettingsModal(true)} />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: isVerySmallPhone
            ? headerTop + 38
            : isSmallPhone
              ? headerTop + 30
              : 0,
          paddingBottom:
            (isVerySmallPhone ? 104 : isSmallPhone ? 84 : 40) +
            Math.max(insets.bottom - 4, 0),
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      >
        {!isSmallPhone && (
          <View style={{ marginTop: logoTopSpacing + 36 }}>
            <Logo size="tiny" />
          </View>
        )}
        <View
          className="px-6 mt-4"
          style={{
            paddingHorizontal: isSmallPhone ? 16 : 24,
            marginTop: isSmallPhone ? 6 : 16,
          }}
        >
          {/* Room Code Section */}
          <View
            className="items-center"
            style={{ marginBottom: (isSmallPhone ? 16 : 32) * uiScale }}
          >
            <Text
              className="text-center text-slate-500 mb-4"
              style={{
                fontFamily: "MerriweatherSans_400Regular",
                fontSize: 14 * roomCodeScale,
              }}
            >
              {t("waitingRoom.shareCodeWithPartner")}
            </Text>
            <View
              className="bg-white w-full items-center"
              style={{
                borderRadius: 32 * roomCodeScale,
                paddingHorizontal: 32 * roomCodeScale,
                paddingVertical: 28 * roomCodeScale,
                shadowColor: "#fe9ea2",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              <Text
                className="font-bold text-slate-800 mb-4"
                style={{
                  fontSize: 46 * roomCodeScale,
                  letterSpacing: 8 * roomCodeScale,
                  fontFamily: "MerriweatherSans_700Bold",
                }}
              >
                {roomCode}
              </Text>

              {/* Copy Button */}
              <TouchableOpacity
                onPress={handleCopyCode}
                className="bg-amber-50 rounded-full flex-row items-center"
                style={{
                  paddingHorizontal: 24 * roomCodeScale,
                  paddingVertical: 12 * roomCodeScale,
                  gap: 8 * roomCodeScale,
                }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={copied ? "checkmark-circle" : "copy-outline"}
                  size={18 * roomCodeScale}
                  color="#d97706"
                />
                <Text
                  className="text-amber-700 font-semibold"
                  style={{
                    fontFamily: "MerriweatherSans_700Bold",
                    fontSize: 14 * roomCodeScale,
                  }}
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
          <View style={{ marginBottom: (isSmallPhone ? 14 : 32) * uiScale }}>
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
                      <View
                        className="w-12 h-12 rounded-full items-center justify-center bg-slate-100"
                        style={{ overflow: "hidden" }}
                      >
                        {participant.avatar &&
                        getAvatarImage(participant.avatar) ? (
                          <Image
                            source={getAvatarImage(participant.avatar)}
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: 24,
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
                  borderRadius: 24 * uiScale,
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
                    borderRadius: 24 * uiScale,
                    paddingVertical: 18 * uiScale,
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
                        fontSize: 18 * uiScale,
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
            className="items-center"
            style={{ paddingVertical: 16 * uiScale }}
            activeOpacity={0.7}
          >
            <Text
              className="text-slate-400 font-semibold"
              style={{
                fontFamily: "MerriweatherSans_700Bold",
                fontSize: 15 * uiScale,
              }}
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
