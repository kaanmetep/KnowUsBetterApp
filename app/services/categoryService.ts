import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Language } from "../contexts/LanguageContext";
import { getSupabaseClient } from "../lib/supabaseClient";
import { getAppConfig } from "./appConfigService";

export interface CategoryLabels {
  category_en?: string;
  category_tr?: string;
  category_es?: string;
  [key: string]: string | undefined;
}

export interface Category {
  id: string;
  labels: CategoryLabels;
  groupId: string | null;
  color: string;
  iconName: string;
  iconType: "FontAwesome6" | "MaterialCommunityIcons";
  coinsRequired: number;
  isPremium: boolean;
  recentlyAdded: boolean;
  orderIndex: number;
}

export interface CategoryGroup {
  id: string;
  labels: CategoryLabels;
  orderIndex: number;
  iconName: string;
  iconType: "Ionicons" | "FontAwesome6" | "MaterialCommunityIcons";
}

const APP_ENV =
  (Constants.expoConfig?.extra?.environment as string | undefined) || "prod";
const CATEGORIES_STORAGE_KEY = `@KnowUsBetter:categories:${APP_ENV}`;
const CATEGORIES_TIMESTAMP_KEY = `@KnowUsBetter:categories_timestamp:${APP_ENV}`;
const CATEGORY_GROUPS_STORAGE_KEY = `@KnowUsBetter:category_groups:${APP_ENV}`;
const CATEGORY_GROUPS_TIMESTAMP_KEY = `@KnowUsBetter:category_groups_timestamp:${APP_ENV}`;

let categoriesCache: Category[] | null = null;
let categoriesCacheTimestamp: number | null = null;
let categoryGroupsCache: CategoryGroup[] | null = null;
let categoryGroupsCacheTimestamp: number | null = null;

const loadCategoriesFromStorage = async (): Promise<Category[] | null> => {
  try {
    const data = await AsyncStorage.getItem(CATEGORIES_STORAGE_KEY);
    const timestamp = await AsyncStorage.getItem(CATEGORIES_TIMESTAMP_KEY);

    if (!data || !timestamp) return null;

    const age = Date.now() - parseInt(timestamp, 10);
    if (age < getAppConfig().content.categories.cacheTtlMs) {
      return JSON.parse(data) as Category[];
    }

    return null;
  } catch (error) {
    console.warn("Failed to load categories from storage:", error);
    return null;
  }
};

const saveCategoriesToStorage = async (
  categories: Category[],
): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      CATEGORIES_STORAGE_KEY,
      JSON.stringify(categories),
    );
    await AsyncStorage.setItem(CATEGORIES_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.warn("Failed to save categories to storage:", error);
  }
};

const loadCategoryGroupsFromStorage = async (): Promise<
  CategoryGroup[] | null
> => {
  try {
    const data = await AsyncStorage.getItem(CATEGORY_GROUPS_STORAGE_KEY);
    const timestamp = await AsyncStorage.getItem(CATEGORY_GROUPS_TIMESTAMP_KEY);

    if (!data || !timestamp) return null;

    const age = Date.now() - parseInt(timestamp, 10);
    if (age < getAppConfig().content.categories.cacheTtlMs) {
      return JSON.parse(data) as CategoryGroup[];
    }

    return null;
  } catch (error) {
    console.warn("Failed to load category groups from storage:", error);
    return null;
  }
};

const saveCategoryGroupsToStorage = async (
  categoryGroups: CategoryGroup[],
): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      CATEGORY_GROUPS_STORAGE_KEY,
      JSON.stringify(categoryGroups),
    );
    await AsyncStorage.setItem(
      CATEGORY_GROUPS_TIMESTAMP_KEY,
      Date.now().toString(),
    );
  } catch (error) {
    console.warn("Failed to save category groups to storage:", error);
  }
};

export const clearCategoriesCache = async (): Promise<void> => {
  categoriesCache = null;
  categoriesCacheTimestamp = null;

  try {
    await AsyncStorage.multiRemove([
      CATEGORIES_STORAGE_KEY,
      CATEGORIES_TIMESTAMP_KEY,
    ]);
  } catch (error) {
    console.warn("Failed to clear categories cache:", error);
  }
};

export const clearCategoryGroupsCache = async (): Promise<void> => {
  categoryGroupsCache = null;
  categoryGroupsCacheTimestamp = null;

  try {
    await AsyncStorage.multiRemove([
      CATEGORY_GROUPS_STORAGE_KEY,
      CATEGORY_GROUPS_TIMESTAMP_KEY,
    ]);
  } catch (error) {
    console.warn("Failed to clear category groups cache:", error);
  }
};

export const getCategories = async (): Promise<Category[]> => {
  const now = Date.now();

  if (__DEV__) {
    await clearCategoriesCache();
  }

  // 1. Check memory cache
  if (
    categoriesCache &&
    categoriesCacheTimestamp &&
    now - categoriesCacheTimestamp <
      getAppConfig().content.categories.cacheTtlMs
  ) {
    return categoriesCache;
  }

  // 2. Did it miss the memory cache? then check AsyncStorage
  const stored = await loadCategoriesFromStorage();
  if (stored) {
    categoriesCache = stored;
    categoriesCacheTimestamp = now;
    return stored;
  }

  // 3. Did it miss the memory cache and AsyncStorage? then fetch from Supabase
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.warn("Supabase client not available");
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("order_index", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    const categories: Category[] = data.map((cat) => ({
      id: cat.id,
      labels: (cat.labels as CategoryLabels) || {},
      groupId: cat.group_id || null,
      color: cat.color,
      iconName: cat.icon_name,
      iconType: cat.icon_type as "FontAwesome6" | "MaterialCommunityIcons",
      coinsRequired: cat.coins_required || 0,
      isPremium: cat.is_premium || false,
      recentlyAdded: cat.recently_added || false,
      orderIndex: cat.order_index || 0,
    }));
    categoriesCache = categories;
    categoriesCacheTimestamp = now;
    await saveCategoriesToStorage(categories);

    return categories;
  } catch (error) {
    console.error("Exception fetching categories:", error);
    return [];
  }
};

export const getCategoryGroups = async (): Promise<CategoryGroup[]> => {
  const now = Date.now();

  if (__DEV__) {
    await clearCategoryGroupsCache();
  }

  if (
    categoryGroupsCache &&
    categoryGroupsCacheTimestamp &&
    now - categoryGroupsCacheTimestamp <
      getAppConfig().content.categories.cacheTtlMs
  ) {
    return categoryGroupsCache;
  }

  const stored = await loadCategoryGroupsFromStorage();
  if (stored) {
    categoryGroupsCache = stored;
    categoryGroupsCacheTimestamp = now;
    return stored;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    console.warn("Supabase client not available");
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("category_groups")
      .select("id, labels, order_index, icon_name, icon_type")
      .order("order_index", { ascending: true });

    if (error) {
      console.error("Error fetching category groups:", error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    const categoryGroups = data.map((group) => ({
      id: group.id,
      labels: (group.labels as CategoryLabels) || {},
      orderIndex: group.order_index || 0,
      iconName: group.icon_name || "albums-outline",
      iconType:
        (group.icon_type as
          | "Ionicons"
          | "FontAwesome6"
          | "MaterialCommunityIcons") || "Ionicons",
    }));
    categoryGroupsCache = categoryGroups;
    categoryGroupsCacheTimestamp = now;
    await saveCategoryGroupsToStorage(categoryGroups);
    return categoryGroups;
  } catch (error) {
    console.error("Exception fetching category groups:", error);
    return [];
  }
};

export const getCategoryById = async (
  categoryId: string,
): Promise<Category | null> => {
  const categories = await getCategories();
  return categories.find((cat) => cat.id === categoryId) || null;
};

export const getCategoryCoinsRequired = async (
  categoryId: string,
): Promise<number> => {
  const category = await getCategoryById(categoryId);
  return category?.coinsRequired || 0;
};

/**
 * Get category label based on selected language
 * @param category - Category object
 * @param language - Selected language (en, tr, es)
 * @returns Category label in the selected language, or fallback to English, or "Unknown"
 */
export const getCategoryLabel = (
  category: Category | null,
  language: Language = "en",
): string => {
  if (!category) return "Unknown";

  const labelKey = `category_${language}`;
  const label = category.labels[labelKey];

  // If label exists for the selected language, return it
  if (label) return label;

  // Fallback to English if available
  if (category.labels.category_en) return category.labels.category_en;

  // Fallback to any available label
  const availableLabels = Object.values(category.labels).filter(
    (val) => val && val.trim().length > 0,
  ) as string[];
  if (availableLabels.length > 0) return availableLabels[0];

  // Last resort
  return "Unknown";
};

export const getCategoryGroupLabel = (
  categoryGroup: CategoryGroup | null,
  language: Language = "en",
): string => {
  if (!categoryGroup) return "Unknown";

  const labelKey = `category_${language}`;
  const label = categoryGroup.labels[labelKey];

  if (label) return label;
  if (categoryGroup.labels.category_en) return categoryGroup.labels.category_en;

  const availableLabels = Object.values(categoryGroup.labels).filter(
    (val) => val && val.trim().length > 0,
  ) as string[];
  if (availableLabels.length > 0) return availableLabels[0];

  return "Unknown";
};
