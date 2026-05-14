import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useCoins } from "../../../contexts/CoinContext";
import { useTranslation } from "../../../hooks/useTranslation";
import {
  Category,
  CategoryGroup,
  getCategories,
  getCategoryGroups,
} from "../../../services/categoryService";
import { UserPreferencesService } from "../../../services/userPreferencesService";
import AvatarStep from "./AvatarStep";
import ChooseCategoryStep from "./ChooseCategoryStep";
import NameStep from "./NameStep";
import StepIndicator from "./StepIndicator";

interface CreateNewRoomModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateRoom: (
    userName: string,
    category: string,
    avatar?: string,
  ) => Promise<void>;
  onBuyCoins?: () => void;
}

const CreateNewRoomModal: React.FC<CreateNewRoomModalProps> = ({
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
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);
  const [categoryContainerHeight, setCategoryContainerHeight] = useState(0);
  const [categoryContentHeight, setCategoryContentHeight] = useState(0);
  const categoryScrollY = useRef(new Animated.Value(0)).current;
  const categoryScrollViewRef = useRef<ScrollView>(null);
  const categoryScrollOffsetRef = useRef(0);
  const hasShownCategoryDepthHintRef = useRef(false);
  const categoryHintAnimRef = useRef(new Animated.Value(0)).current;
  const { coins } = useCoins();
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();
  const loadingOpacity = useRef(new Animated.Value(0.4)).current;
  const newBadgeScale = useRef(new Animated.Value(1)).current;
  const isSmallScreen = height < 760;
  const isVerySmallScreen = width <= 350 || height <= 670;
  const step3Scale = isVerySmallScreen ? 0.84 : isSmallScreen ? 0.92 : 1;
  const isIphone = Platform.OS === "ios";
  const isCompactIphoneWidth = isIphone && width <= 393;
  const isLargeIphoneWidth = isIphone && width > 393 && width <= 430;
  const isBigIphone = isIphone && width >= 393;
  const step3HeadingScale = isCompactIphoneWidth
    ? 0.9
    : isLargeIphoneWidth
      ? 0.96
      : 1;
  const categoryDensityScale = isCompactIphoneWidth
    ? 0.86
    : isLargeIphoneWidth
      ? 0.92
      : 1;
  const categoryNameScale = categoryDensityScale;

  useEffect(() => {
    const shouldLoad = __DEV__ ? visible && step === 3 : true;
    if (!shouldLoad) return;

    let cancelled = false;
    const loadCategories = async () => {
      setCategoriesLoading(true);
      try {
        const [categoriesData, categoryGroupsData] = await Promise.all([
          getCategories(),
          getCategoryGroups(),
        ]);
        if (!cancelled) {
          setCategories(categoriesData);
          setCategoryGroups(categoryGroupsData);
        }
      } catch (error) {
        console.error("❌ Error loading categories:", error);
      } finally {
        if (!cancelled) setCategoriesLoading(false);
      }
    };
    loadCategories();
    return () => {
      cancelled = true;
    };
  }, [visible, step]);

  // Effect for loading animation
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
      ]),
    );
    pulse.start();
    return () => {
      pulse.stop();
      pulse.reset();
    };
  }, []);

  // Effect for new badge animation
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
      ]),
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

  const resetCategoryScroll = useCallback(() => {
    categoryHintAnimRef.stopAnimation();
    categoryHintAnimRef.setValue(0);
    categoryScrollOffsetRef.current = 0;
    categoryScrollY.setValue(0);
    categoryScrollViewRef.current?.scrollTo({ y: 0, animated: false });
  }, []);

  useEffect(() => {
    if (step !== 3) {
      categoryHintAnimRef.stopAnimation();
      categoryHintAnimRef.setValue(0);
      categoryScrollOffsetRef.current = 0;
      categoryScrollY.setValue(0);
      return;
    }
    const id = requestAnimationFrame(() => {
      resetCategoryScroll();
    });
    return () => cancelAnimationFrame(id);
  }, [step, resetCategoryScroll]);

  const enterStep2 = () => {
    setSelectedCategory(null);
    resetCategoryScroll();
    hasShownCategoryDepthHintRef.current = false;
    setStep(2);
  };

  const resetModalState = () => {
    resetCategoryScroll();
    hasShownCategoryDepthHintRef.current = false;
    setStep(1);
    setSelectedAvatar(null);
    setSelectedCategory(null);
    setUserName("");
    setUserNameFocused(false);
  };

  const handleClose = () => {
    if (isCreating) return;
    resetModalState();
    onClose();
  };

  const handleContinueFromStep1 = () => {
    if (selectedAvatar) enterStep2();
  };

  const handleContinueFromStep2 = () => {
    if (userName.trim().length > 0) {
      resetCategoryScroll();
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
    else if (step === 3) enterStep2();
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
        resetModalState();
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
  const categoryMaxHeight = isVerySmallScreen
    ? 292
    : isSmallScreen
      ? 334
      : isBigIphone
        ? 432
        : isIphone
          ? 452
          : 430;

  const scrollbarPadding = 8;
  const trackHeight = Math.max(
    0,
    categoryContainerHeight - scrollbarPadding * 2,
  );
  const categoryThumbHeight =
    categoryContentHeight > 0 && trackHeight > 0
      ? Math.min(
          trackHeight,
          Math.max(
            32,
            (categoryContainerHeight / categoryContentHeight) * trackHeight,
          ),
        )
      : trackHeight || 32;
  const categoryMaxScroll = Math.max(
    1,
    categoryContentHeight - categoryContainerHeight,
  );
  const categoryThumbY = categoryScrollY.interpolate({
    inputRange: [0, categoryMaxScroll],
    outputRange: [
      scrollbarPadding,
      Math.max(
        scrollbarPadding,
        categoryContainerHeight - categoryThumbHeight - scrollbarPadding,
      ),
    ],
    extrapolate: "clamp",
  });

  useEffect(() => {
    const listenerId = categoryHintAnimRef.addListener(({ value }) => {
      categoryScrollOffsetRef.current = value;
      categoryScrollY.setValue(value);
      categoryScrollViewRef.current?.scrollTo({ y: value, animated: false });
    });

    return () => {
      categoryHintAnimRef.removeListener(listenerId);
    };
  }, [categoryHintAnimRef, categoryScrollY]);

  const triggerCategoryDepthHint = (globalIndex: number) => {
    if (hasShownCategoryDepthHintRef.current) return;
    if (categoryContentHeight <= categoryContainerHeight + 8) return;

    const startY = categoryScrollOffsetRef.current;
    if (startY > 48) return;
    const baseDistance = Math.max(80, categoryContainerHeight * 0.3);
    const extraDistance = Math.max(0, globalIndex - 3) * 10;
    const hintDistance = baseDistance + extraDistance;
    const targetY = Math.min(categoryMaxScroll, startY + hintDistance);

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
              maxHeight: isVerySmallScreen
                ? "86%"
                : isBigIphone
                  ? "87%"
                  : "90%",
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

              <View className="h-6" />

              <StepIndicator
                currentStep={step}
                isStep1Valid={isStep1Valid}
                isStep2Valid={isStep2Valid}
                onStepPress={(pressedStep) => {
                  if (pressedStep === 1) setStep(1);
                  if (pressedStep === 2 && isStep1Valid) enterStep2();
                  if (pressedStep === 3 && isStep1Valid && isStep2Valid)
                    setStep(3);
                }}
                variant="pink"
              />

              {/* --- STEP 1: AVATAR --- */}
              {step === 1 && (
                <AvatarStep
                  selectedAvatar={selectedAvatar}
                  onAvatarSelect={setSelectedAvatar}
                  onContinue={handleContinueFromStep1}
                  isValid={isStep1Valid}
                  variant="pink"
                  modalButtonMarginTop={16 * step3Scale}
                  buttonText={t("createRoom.continue")}
                  buttonDisabledText={t("createRoom.selectAvatar")}
                />
              )}

              {/* --- STEP 2: NAME --- */}
              {step === 2 && (
                <NameStep
                  userName={userName}
                  onUserNameChange={setUserName}
                  onUserNameFocus={() => setUserNameFocused(true)}
                  onUserNameBlur={() => setUserNameFocused(false)}
                  onContinue={handleContinueFromStep2}
                  isValid={isStep2Valid}
                  variant="pink"
                  modalButtonMarginTop={16 * step3Scale}
                  buttonText={t("createRoom.continue")}
                  buttonDisabledText={t("createRoom.enterYourName")}
                />
              )}
              {/* --- STEP 3: CHOOSE CATEGORY --- */}
              {step === 3 && (
                <ChooseCategoryStep
                  step3Scale={step3Scale}
                  step3HeadingScale={step3HeadingScale}
                  categoryDensityScale={categoryDensityScale}
                  categoryNameScale={categoryNameScale}
                  categoryMaxHeight={categoryMaxHeight}
                  scrollbarPadding={scrollbarPadding}
                  categoryThumbHeight={categoryThumbHeight}
                  categoryThumbY={categoryThumbY}
                  categoryScrollViewRef={categoryScrollViewRef}
                  categoryScrollOffsetRef={categoryScrollOffsetRef}
                  categoryScrollY={categoryScrollY}
                  onCategoryContainerLayout={setCategoryContainerHeight}
                  onCategoryContentSizeChange={setCategoryContentHeight}
                  categoriesLoading={categoriesLoading}
                  categories={categories}
                  categoryGroups={categoryGroups}
                  selectedCategory={selectedCategory}
                  onCategoryPress={(categoryId, globalIndex) => {
                    setSelectedCategory(categoryId);
                    if (globalIndex >= 3) triggerCategoryDepthHint(globalIndex);
                  }}
                  loadingOpacity={loadingOpacity}
                  newBadgeScale={newBadgeScale}
                  coins={coins}
                  onBuyCoins={onBuyCoins}
                  onCreatePress={handleCreate}
                  isStep3Valid={isStep3Valid}
                  isCreating={isCreating}
                />
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CreateNewRoomModal;
