import { Ionicons } from "@expo/vector-icons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React from "react";
import {
  Animated,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLanguage } from "../../../contexts/LanguageContext";
import { useTranslation } from "../../../hooks/useTranslation";
import {
  Category,
  CategoryGroup,
  getCategoryGroupLabel,
  getCategoryLabel,
} from "../../../services/categoryService";
import ContactUsButton from "../../profile/ContactUsButton";
import ModalButton from "../../ui/ModalButton";

interface ChooseCategoryStepProps {
  step3Scale: number;
  step3HeadingScale: number;
  categoryDensityScale: number;
  categoryNameScale: number;
  categoryMaxHeight: number;
  scrollbarPadding: number;
  categoryThumbHeight: number;
  categoryThumbY: Animated.AnimatedInterpolation<number>;
  categoryScrollViewRef: React.RefObject<ScrollView | null>;
  categoryScrollOffsetRef: React.MutableRefObject<number>;
  categoryScrollY: Animated.Value;
  onCategoryContainerLayout: (height: number) => void;
  onCategoryContentSizeChange: (height: number) => void;
  categoriesLoading: boolean;
  categories: Category[];
  categoryGroups: CategoryGroup[];
  selectedCategory: string | null;
  onCategoryPress: (categoryId: string, globalIndex: number) => void;
  loadingOpacity: Animated.Value;
  newBadgeScale: Animated.Value;
  coins: number;
  onBuyCoins?: () => void;
  onCreatePress: () => void;
  isStep3Valid: boolean;
  isCreating: boolean;
}

const ChooseCategoryStep: React.FC<ChooseCategoryStepProps> = ({
  step3Scale,
  step3HeadingScale,
  categoryDensityScale,
  categoryNameScale,
  categoryMaxHeight,
  scrollbarPadding,
  categoryThumbHeight,
  categoryThumbY,
  categoryScrollViewRef,
  categoryScrollOffsetRef,
  categoryScrollY,
  onCategoryContainerLayout,
  onCategoryContentSizeChange,
  categoriesLoading,
  categories,
  categoryGroups,
  selectedCategory,
  onCategoryPress,
  loadingOpacity,
  newBadgeScale,
  coins,
  onBuyCoins,
  onCreatePress,
  isStep3Valid,
  isCreating,
}) => {
  const { t } = useTranslation();
  const { selectedLanguage } = useLanguage();
  const renderGroupIcon = (
    iconType: CategoryGroup["iconType"],
    iconName: string,
    size: number,
    color: string
  ) => {
    if (iconType === "MaterialCommunityIcons") {
      return (
        <MaterialCommunityIcons
          name={iconName as any}
          size={size}
          color={color}
        />
      );
    }
    if (iconType === "FontAwesome6") {
      return <FontAwesome6 name={iconName as any} size={size} color={color} />;
    }
    return <Ionicons name={iconName as any} size={size} color={color} />;
  };

  const renderCategoryIcon = (
    category: Category,
    size: number,
    color: string
  ) => {
    if (category.iconType === "MaterialCommunityIcons") {
      return (
        <MaterialCommunityIcons
          name={category.iconName as any}
          size={size}
          color={color}
        />
      );
    }
    return <FontAwesome6 name={category.iconName as any} size={size} color={color} />;
  };

  return (
    <View>
      <Text
        className="font-bold text-slate-800 text-center mb-1"
        style={{
          fontFamily: "MerriweatherSans_700Bold",
          fontSize: 32 * step3Scale * step3HeadingScale,
          marginTop: 8 * step3Scale,
        }}
      >
        {t("createRoom.chooseYourVibe")}
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
            onCategoryContainerLayout(e.nativeEvent.layout.height)
          }
          onContentSizeChange={(_, h) => onCategoryContentSizeChange(h)}
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
                style={{
                  fontFamily: "MerriweatherSans_400Regular",
                }}
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
            (() => {
              const categoriesByGroupId = categories.reduce<
                Record<string, Category[]>
              >((acc, category) => {
                const key = category.groupId || "__ungrouped__";
                if (!acc[key]) acc[key] = [];
                acc[key].push(category);
                return acc;
              }, {});

              Object.values(categoriesByGroupId).forEach((groupedItems) => {
                groupedItems.sort((a, b) => a.orderIndex - b.orderIndex);
              });

              const groupedCategories = categoryGroups
                .sort((a, b) => a.orderIndex - b.orderIndex)
                .map((group) => ({
                  key: group.id,
                  title: getCategoryGroupLabel(group, selectedLanguage),
                  iconName: group.iconName,
                  iconType: group.iconType,
                  items: categoriesByGroupId[group.id] || [],
                }))
                .filter((group) => group.items.length > 0);

              let globalIndex = -1;

              return groupedCategories.map((group, groupIndex) => (
                <View key={group.key}>
                  <View
                    className="flex-row items-center"
                    style={{
                      marginBottom: 10 * step3Scale,
                      marginTop:
                        groupIndex === 0 ? 2 * step3Scale : 6 * step3Scale,
                      paddingHorizontal: 2 * step3Scale,
                    }}
                  >
                    {renderGroupIcon(
                      group.iconType,
                      group.iconName,
                      13 * step3Scale,
                      "#94a3b8"
                    )}
                    <Text
                      className="text-slate-400"
                      style={{
                        marginLeft: 6 * step3Scale,
                        fontFamily: "MerriweatherSans_600SemiBold",
                        fontSize: 11.5 * step3Scale,
                      }}
                    >
                      {group.title}
                    </Text>
                  </View>

                  {group.items.map((category) => {
                    globalIndex += 1;
                    const currentGlobalIndex = globalIndex;
                    const isSelected = selectedCategory === category.id;

                    const borderColor = isSelected
                      ? "rgba(0,0,0,0.1)"
                      : "transparent";
                    const borderWidth = isSelected ? 2 : 0;

                    return (
                      <TouchableOpacity
                        key={category.id}
                        onPress={() =>
                          onCategoryPress(category.id, currentGlobalIndex)
                        }
                        className="mb-3 flex-row items-center justify-between relative overflow-visible"
                        activeOpacity={0.8}
                        style={{
                          borderRadius: 16 * step3Scale * categoryDensityScale,
                          paddingHorizontal: 16 * step3Scale,
                          paddingVertical:
                            14 * step3Scale * categoryDensityScale,
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
                              width: 40 * step3Scale * categoryDensityScale,
                              height: 40 * step3Scale * categoryDensityScale,
                              borderRadius: 999,
                              marginRight: 12 * step3Scale,
                            }}
                          >
                            {renderCategoryIcon(
                              category,
                              category.iconType === "MaterialCommunityIcons"
                                ? 19 * step3Scale * categoryDensityScale
                                : 17 * step3Scale * categoryDensityScale,
                              "#1f2937"
                            )}
                          </View>

                          <Text
                            className="font-semibold text-slate-900 flex-1"
                            style={{
                              fontFamily: "MerriweatherSans_600SemiBold",
                              fontSize: 16 * step3Scale * categoryNameScale,
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
                                borderRadius:
                                  8 * step3Scale * categoryDensityScale,
                                paddingHorizontal: 10 * step3Scale,
                                paddingVertical:
                                  6 * step3Scale * categoryDensityScale,
                              }}
                            >
                              <FontAwesome6
                                name="coins"
                                size={10 * step3Scale * categoryDensityScale}
                                color="#713f12"
                              />
                              <Text
                                className="text-yellow-900 font-bold"
                                style={{
                                  fontSize:
                                    12 * step3Scale * categoryDensityScale,
                                  marginLeft: 6 * step3Scale,
                                }}
                              >
                                {category.coinsRequired}
                              </Text>
                            </View>
                          )}
                        </View>

                        {isSelected && (
                          <View
                            className="rounded-full bg-white/40 items-center justify-center"
                            style={{
                              marginLeft: 12 * step3Scale,
                              width: 22 * step3Scale * categoryDensityScale,
                              height: 22 * step3Scale * categoryDensityScale,
                            }}
                          >
                            <Ionicons
                              name="checkmark"
                              size={15 * step3Scale * categoryDensityScale}
                              color="#1f2937"
                            />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ));
            })()
          )}
        </ScrollView>

        <View
          style={{
            width: 12,
            alignItems: "center",
          }}
        >
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
            <FontAwesome6 name="coins" size={12 * step3Scale} color="#b45309" />
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
          onPress={onCreatePress}
          disabled={!isStep3Valid}
          isLoading={isCreating}
          text={t("createRoom.createRoom")}
          disabledText={t("createRoom.selectCategory")}
          loadingText={t("createRoom.creating")}
          showLoadingIndicator={true}
          variant="pink"
        />
      </View>
    </View>
  );
};

export default ChooseCategoryStep;
