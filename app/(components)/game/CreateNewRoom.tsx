import { Ionicons } from "@expo/vector-icons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useCoins } from "../../contexts/CoinContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { useTranslation } from "../../hooks/useTranslation";
import {
  Category,
  getCategories,
  getCategoryLabel,
} from "../../services/categoryService";
import { UserPreferencesService } from "../../services/userPreferencesService";
import AvatarSelection from "../profile/AvatarSelection";
import ContactUsButton from "../profile/ContactUsButton";
import ModalButton from "../ui/ModalButton";
import NameInput from "../profile/NameInput";

interface CreateNewRoomProps {
  visible: boolean;
  onClose: () => void;
  onCreateRoom: (
    userName: string,
    category: string,
    avatar?: string
  ) => Promise<void>;
  onBuyCoins?: () => void;
}

const CreateNewRoom: React.FC<CreateNewRoomProps> = ({
  visible,
  onClose,
  onCreateRoom,
  onBuyCoins,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [userNameFocused, setUserNameFocused] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);
  const [categoryContainerHeight, setCategoryContainerHeight] = useState(0);
  const [categoryContentHeight, setCategoryContentHeight] = useState(0);
  const categoryScrollY = useRef(new Animated.Value(0)).current;
  const categoryScrollViewRef = useRef<ScrollView>(null);
  const categoryScrollOffsetRef = useRef(0);
  const hasShownCategoryDepthHintRef = useRef(false);
  const categoryHintAnimRef = useRef(new Animated.Value(0)).current;
  const { coins } = useCoins();
  const { selectedLanguage } = useLanguage();
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();
  const loadingOpacity = useRef(new Animated.Value(0.4)).current;
  const newBadgeScale = useRef(new Animated.Value(1)).current;
  const isSmallScreen = height < 760;
  const isVerySmallScreen = width <= 350 || height <= 670;
  const step3Scale = isVerySmallScreen ? 0.84 : isSmallScreen ? 0.92 : 1;

  useEffect(() => {
    const loadCategories = async () => {
      setCategoriesLoading(true);
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error("❌ Error loading categories:", error);
      } finally {
        setCategoriesLoading(false);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    loadingOpacity.setValue(0.1);
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(loadingOpacity, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(loadingOpacity, {
          toValue: 0.4,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => {
      pulse.stop();
      pulse.reset();
    };
  }, []);

  useEffect(() => {
    newBadgeScale.setValue(1);
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(newBadgeScale, {
          toValue: 1.08,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(newBadgeScale, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => {
      pulse.stop();
      pulse.reset();
    };
  }, [newBadgeScale]);

  useEffect(() => {
    if (visible) loadSavedPreferences();
  }, [visible]);

  const loadSavedPreferences = async () => {
    try {
      const savedUsername = await UserPreferencesService.getUsername();
      const savedAvatar = await UserPreferencesService.getAvatar();
      if (savedUsername) setUserName(savedUsername);
      if (savedAvatar) setSelectedAvatar(savedAvatar);
    } catch (error) {
      console.warn("⚠️ Failed to load saved preferences:", error);
    }
  };

  useEffect(() => {
    if (selectedAvatar) UserPreferencesService.saveAvatar(selectedAvatar);
  }, [selectedAvatar]);

  useEffect(() => {
    if (userName.trim().length > 0) {
      const timeoutId = setTimeout(() => {
        UserPreferencesService.saveUsername(userName.trim());
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [userName]);

  const resetCategoryScroll = () => {
    categoryScrollY.setValue(0);
    categoryScrollViewRef.current?.scrollTo({ y: 0, animated: false });
  };

  const handleClose = () => {
    resetCategoryScroll();
    hasShownCategoryDepthHintRef.current = false;
    setStep(1);
    setSelectedAvatar(null);
    setSelectedCategory(null);
    setUserName("");
    setUserNameFocused(false);
    onClose();
  };

  const handleContinueFromStep1 = () => {
    if (selectedAvatar) setStep(2);
  };

  const handleContinueFromStep2 = () => {
    if (userName.trim().length > 0) {
      resetCategoryScroll();
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
    else if (step === 3) {
      hasShownCategoryDepthHintRef.current = false;
      setStep(2);
    }
  };

  const handleCreate = async () => {
    if (selectedCategory && userName.trim() && selectedAvatar && !isCreating) {
      const category = categories.find((c) => c.id === selectedCategory);
      if (category?.coinsRequired && coins < category.coinsRequired) {
        onBuyCoins?.();
        return;
      }

      setIsCreating(true);
      try {
        await onCreateRoom(userName.trim(), selectedCategory, selectedAvatar);
        setStep(1);
        setSelectedAvatar(null);
        setSelectedCategory(null);
        setUserName("");
      } catch (error) {
        console.error("Error creating room:", error);
      } finally {
        setIsCreating(false);
      }
    }
  };

  const isStep1Valid = selectedAvatar !== null;
  const isStep2Valid = userName.trim().length > 0;
  const isStep3Valid = selectedCategory !== null;
  const categoryMaxHeight = isVerySmallScreen ? 252 : isSmallScreen ? 292 : 388;

  const scrollbarPadding = 8;
  const trackHeight = Math.max(0, categoryContainerHeight - scrollbarPadding * 2);
  const categoryThumbHeight =
    categoryContentHeight > 0 && trackHeight > 0
      ? Math.min(
          trackHeight,
          Math.max(32, (categoryContainerHeight / categoryContentHeight) * trackHeight)
        )
      : trackHeight || 32;
  const categoryMaxScroll = Math.max(1, categoryContentHeight - categoryContainerHeight);
  const categoryThumbY = categoryScrollY.interpolate({
    inputRange: [0, categoryMaxScroll],
    outputRange: [
      scrollbarPadding,
      Math.max(scrollbarPadding, categoryContainerHeight - categoryThumbHeight - scrollbarPadding),
    ],
    extrapolate: "clamp",
  });

  useEffect(() => {
    const listenerId = categoryHintAnimRef.addListener(({ value }) => {
      categoryScrollViewRef.current?.scrollTo({ y: value, animated: false });
    });

    return () => {
      categoryHintAnimRef.removeListener(listenerId);
    };
  }, [categoryHintAnimRef]);

  const triggerCategoryDepthHint = () => {
    if (hasShownCategoryDepthHintRef.current) return;
    if (categoryContentHeight <= categoryContainerHeight + 8) return;

    const startY = categoryScrollOffsetRef.current;
    const targetY = Math.min(
      categoryMaxScroll,
      startY + Math.max(80, categoryContainerHeight * 0.3),
    );

    if (targetY <= startY + 4) return;

    hasShownCategoryDepthHintRef.current = true;
    categoryHintAnimRef.stopAnimation();
    categoryHintAnimRef.setValue(startY);
    Animated.timing(categoryHintAnimRef, {
      toValue: targetY,
      duration: 950,
      useNativeDriver: false,
    }).start();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <Pressable
          className="flex-1 bg-black/40 justify-center items-center px-4"
          onPress={handleClose}
        >
          <Pressable
            className="w-full bg-white rounded-3xl p-6"
            onPress={(e) => e.stopPropagation()}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 5,
              maxHeight: isVerySmallScreen ? "86%" : "90%",
            }}
          >
            <ScrollView
              scrollEnabled={isSmallScreen}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                flexGrow: 1,
                paddingBottom: isSmallScreen ? 12 : 0,
              }}
            >
              {/* Header: Close & Back Buttons */}
              <View className="flex-row justify-between items-center absolute top-4 left-4 right-4 z-20">
                <View>
                  {step > 1 && (
                    <TouchableOpacity
                      onPress={handleBack}
                      className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center"
                    >
                      <Ionicons name="arrow-back" size={20} color="#374151" />
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity
                  onPress={handleClose}
                  className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center"
                >
                  <Ionicons name="close" size={20} color="#374151" />
                </TouchableOpacity>
              </View>

              <View className="h-8" />

              {/* STEP INDICATOR */}
              <View className="flex-row justify-center gap-2 mb-6">
                {[1, 2, 3].map((s) => {
                  let bgClass = "bg-gray-100";
                  if (s === step) bgClass = "bg-rose-400";
                  else if (s < step) bgClass = "bg-rose-200";

                  return (
                    <TouchableOpacity
                      key={s}
                      onPress={() => {
                        if (s === 1) setStep(1);
                        if (s === 2 && isStep1Valid) setStep(2);
                        if (s === 3 && isStep1Valid && isStep2Valid) setStep(3);
                      }}
                      disabled={
                        (s === 2 && !isStep1Valid) ||
                        (s === 3 && (!isStep1Valid || !isStep2Valid))
                      }
                      activeOpacity={0.8}
                    >
                      <View className={`w-8 h-1.5 rounded-full ${bgClass}`} />
                    </TouchableOpacity>
                  );
                })}
              </View>

            {/* --- STEP 1: AVATAR --- */}
            {step === 1 && (
              <View>
                <AvatarSelection
                  selectedAvatar={selectedAvatar}
                  onAvatarSelect={setSelectedAvatar}
                  theme="red"
                />
                <View className="mt-8">
                  <ModalButton
                    onPress={handleContinueFromStep1}
                    disabled={!isStep1Valid}
                    text={t("createRoom.continue")}
                    disabledText={t("createRoom.selectAvatar")}
                    variant="pink"
                  />
                </View>
              </View>
            )}

            {/* --- STEP 2: NAME --- */}
            {step === 2 && (
              <View>
                <View className="pt-2 pb-4">
                  <NameInput
                    userName={userName}
                    onUserNameChange={setUserName}
                    userNameFocused={userNameFocused}
                    onUserNameFocus={() => setUserNameFocused(true)}
                    onUserNameBlur={() => setUserNameFocused(false)}
                  />
                </View>
                <View className="mt-6">
                  <ModalButton
                    onPress={handleContinueFromStep2}
                    disabled={!isStep2Valid}
                    text={t("createRoom.continue")}
                    disabledText={t("createRoom.enterYourName")}
                    variant="pink"
                  />
                </View>
              </View>
            )}

            {/* --- STEP 3: CATEGORY --- */}
            {step === 3 && (
              <View>
                <Text
                  className="font-bold text-slate-800 text-center mb-1"
                  style={{
                    fontFamily: "MerriweatherSans_700Bold",
                    fontSize: 32 * step3Scale,
                  }}
                >
                  {t("createRoom.chooseYourVibe")}
                </Text>

                <Text
                  className="text-slate-500 text-center"
                  style={{
                    fontFamily: "MerriweatherSans_400Regular",
                    fontSize: 14 * step3Scale,
                    marginBottom: 20 * step3Scale,
                  }}
                >
                  {t("createRoom.pickCategory")}
                </Text>

                <View
                  className="mb-4"
                  style={{
                    borderRadius: 20 * step3Scale,
                    overflow: "hidden",
                    maxHeight: categoryMaxHeight,
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
                    ref={categoryScrollViewRef}
                    style={{ flex: 1 }}
                    contentContainerStyle={{
                      paddingHorizontal: 9 * step3Scale,
                      paddingTop: 9 * step3Scale,
                      paddingBottom: 9 * step3Scale,
                    }}
                    scrollEnabled={true}
                    nestedScrollEnabled
                    showsVerticalScrollIndicator={false}
                    onScroll={(e) => {
                      const offsetY = e.nativeEvent.contentOffset.y;
                      categoryScrollOffsetRef.current = offsetY;
                      categoryScrollY.setValue(offsetY);
                    }}
                    scrollEventThrottle={16}
                    onLayout={(e) =>
                      setCategoryContainerHeight(e.nativeEvent.layout.height)
                    }
                    onContentSizeChange={(_, h) => setCategoryContentHeight(h)}
                  >
                  {categoriesLoading ? (
                    <View className="py-8 items-center">
                      <Animated.Text
                        className="text-slate-400"
                        style={{
                          fontFamily: "MerriweatherSans_400Regular",
                          opacity: loadingOpacity,
                        }}
                      >
                        {t("createRoom.loadingCategories")}
                      </Animated.Text>
                    </View>
                  ) : categories.length === 0 ? (
                    <View className="py-4 items-center">
                      <Text
                        className="text-slate-500"
                        style={{ fontFamily: "MerriweatherSans_400Regular" }}
                      >
                        {t("createRoom.noCategoriesAvailable")}
                      </Text>
                      <View className="mt-4">
                        <ContactUsButton
                          position="none"
                          text={t("createRoom.reportIssue")}
                        />
                      </View>
                    </View>
                  ) : (
                    categories.map((category, index) => {
                      const isSelected = selectedCategory === category.id;

                      const borderColor = isSelected
                        ? "rgba(0,0,0,0.1)"
                        : "transparent";
                      const borderWidth = isSelected ? 2 : 0;

                      return (
                        <TouchableOpacity
                          key={category.id}
                          onPress={() => {
                            setSelectedCategory(category.id);
                            if (index >= 3) triggerCategoryDepthHint();
                          }}
                          className="mb-2.5 flex-row items-center justify-between relative overflow-visible"
                          activeOpacity={0.8}
                          style={{
                            borderRadius: 16 * step3Scale,
                            paddingHorizontal: 16 * step3Scale,
                            paddingVertical: 14 * step3Scale,
                            backgroundColor: category.color,
                            borderWidth: borderWidth,
                            borderColor: borderColor,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.05,
                            shadowRadius: 4,
                            elevation: 2,
                          }}
                        >
                          {category.recentlyAdded && (
                            <Animated.View
                              className="absolute bg-white rounded-full z-20"
                              style={{
                                top: -8 * step3Scale,
                                right: -8 * step3Scale,
                                paddingHorizontal: 8 * step3Scale,
                                paddingVertical: 2 * step3Scale,
                                transform: [{ scale: newBadgeScale }],
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.12,
                                shadowRadius: 2,
                                elevation: 2,
                              }}
                            >
                              <Text
                                className="font-bold text-rose-500"
                                style={{ fontSize: 10 * step3Scale }}
                              >
                                {t("common.new")}
                              </Text>
                            </Animated.View>
                          )}
                          <View className="flex-row items-center flex-1">
                            <View
                              className="bg-white/40 items-center justify-center"
                              style={{
                                width: 40 * step3Scale,
                                height: 40 * step3Scale,
                                borderRadius: 999,
                                marginRight: 12 * step3Scale,
                              }}
                            >
                              {category.iconType ===
                              "MaterialCommunityIcons" ? (
                                <MaterialCommunityIcons
                                  name={category.iconName as any}
                                  size={19 * step3Scale}
                                  color="#1f2937"
                                />
                              ) : (
                                <FontAwesome6
                                  name={category.iconName as any}
                                  size={17 * step3Scale}
                                  color="#1f2937"
                                />
                              )}
                            </View>

                            <Text
                              className="font-semibold text-slate-900 flex-1"
                              style={{
                                fontFamily: "MerriweatherSans_600SemiBold",
                                fontSize: 16 * step3Scale,
                                marginRight: 8 * step3Scale,
                              }}
                              numberOfLines={1}
                            >
                              {getCategoryLabel(category, selectedLanguage)}
                            </Text>

                            {category.isPremium && (
                              <View
                                className="bg-yellow-400 flex-row items-center shadow-sm"
                                style={{
                                  borderRadius: 8 * step3Scale,
                                  paddingHorizontal: 10 * step3Scale,
                                  paddingVertical: 6 * step3Scale,
                                }}
                              >
                                <FontAwesome6
                                  name="coins"
                                  size={10 * step3Scale}
                                  color="#713f12"
                                />
                                <Text
                                  className="text-yellow-900 font-bold"
                                  style={{
                                    fontSize: 12 * step3Scale,
                                    marginLeft: 6 * step3Scale,
                                  }}
                                >
                                  {category.coinsRequired}
                                </Text>
                              </View>
                            )}
                          </View>

                          {/* Checkmark */}
                          {isSelected && (
                            <View
                              className="rounded-full bg-white/40 items-center justify-center"
                              style={{
                                marginLeft: 12 * step3Scale,
                                width: 22 * step3Scale,
                                height: 22 * step3Scale,
                              }}
                            >
                              <Ionicons
                                name="checkmark"
                                size={15 * step3Scale}
                                color="#1f2937"
                              />
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })
                  )}
                  </ScrollView>

                  {/* Custom always-visible scrollbar */}
                  <View
                    style={{
                      width: 12,
                      alignItems: "center",
                    }}
                  >
                    {/* Track */}
                    <View
                      style={{
                        position: "absolute",
                        top: scrollbarPadding,
                        bottom: scrollbarPadding,
                        width: 2,
                        backgroundColor: "rgba(0,0,0,0.07)",
                        borderRadius: 1,
                      }}
                    />
                    {/* Thumb */}
                    <Animated.View
                      style={{
                        position: "absolute",
                        left: 4,
                        width: 4,
                        height: categoryThumbHeight,
                        backgroundColor: "rgba(100, 116, 139, 0.55)",
                        borderRadius: 2,
                        transform: [{ translateY: categoryThumbY }],
                      }}
                    />
                  </View>
                </View>

                <View
                  className="items-center justify-center mb-2"
                  style={{ gap: 8 * step3Scale }}
                >
                  <View
                    className="bg-amber-50 rounded-full border border-amber-100"
                    style={{
                      paddingHorizontal: 16 * step3Scale,
                      paddingVertical: 6 * step3Scale,
                    }}
                  >
                    <Text
                      className="text-amber-700 font-medium"
                      style={{
                        fontFamily: "MerriweatherSans_400Regular",
                        fontSize: 12 * step3Scale,
                      }}
                    >
                      <FontAwesome6
                        name="coins"
                        size={12 * step3Scale}
                        color="#b45309"
                      />
                      {"  "}
                      <Text>{t("coins.youHave", { coins })}</Text>
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => onBuyCoins?.()}
                    className="bg-amber-100 rounded-full border border-amber-200 active:bg-amber-200 mt-2"
                    style={{
                      paddingHorizontal: 16 * step3Scale,
                      paddingVertical: 6 * step3Scale,
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      className="text-amber-700 font-semibold"
                      style={{
                        fontFamily: "MerriweatherSans_600SemiBold",
                        fontSize: 12 * step3Scale,
                      }}
                    >
                      {t("coins.buyCoins")}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={{ marginTop: 16 * step3Scale }}>
                  <ModalButton
                    onPress={handleCreate}
                    disabled={!isStep3Valid}
                    isLoading={isCreating}
                    text={t("createRoom.createRoom")}
                    disabledText={t("createRoom.selectCategory")}
                    loadingText={t("createRoom.creating")}
                    variant="pink"
                    showLoadingIndicator={true}
                  />
                </View>
              </View>
            )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CreateNewRoom;
