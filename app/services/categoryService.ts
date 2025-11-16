import AsyncStorage from "@react-native-async-storage/async-storage";
import { Language } from "../contexts/LanguageContext";
import { getSupabaseClient } from "../lib/supabaseClient";

export interface CategoryLabels {
  category_en?: string;
  category_tr?: string;
  category_es?: string;
  [key: string]: string | undefined;
}

export interface Category {
  id: string;
  labels: CategoryLabels;
  color: string;
  iconName: string;
  iconType: "FontAwesome6" | "MaterialCommunityIcons";
  coinsRequired: number;
  isPremium: boolean;
  orderIndex: number;
}

const CATEGORIES_STORAGE_KEY = "@KnowUsBetter:categories";
const CATEGORIES_TIMESTAMP_KEY = "@KnowUsBetter:categories_timestamp";
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

let categoriesCache: Category[] | null = null;
let cacheTimestamp: number | null = null;

const loadFromStorage = async (): Promise<Category[] | null> => {
  try {
    const data = await AsyncStorage.getItem(CATEGORIES_STORAGE_KEY);
    const timestamp = await AsyncStorage.getItem(CATEGORIES_TIMESTAMP_KEY);

    if (!data || !timestamp) return null;

    const age = Date.now() - parseInt(timestamp, 10);
    if (age < CACHE_DURATION) {
      return JSON.parse(data) as Category[];
    }

    return null;
  } catch (error) {
    console.warn("Failed to load categories from storage:", error);
    return null;
  }
};

const saveToStorage = async (categories: Category[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      CATEGORIES_STORAGE_KEY,
      JSON.stringify(categories)
    );
    await AsyncStorage.setItem(CATEGORIES_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.warn("Failed to save categories to storage:", error);
  }
};

export const getCategories = async (): Promise<Category[]> => {
  const now = Date.now();

  // Check memory cache
  if (
    categoriesCache &&
    cacheTimestamp &&
    now - cacheTimestamp < CACHE_DURATION
  ) {
    return categoriesCache;
  }

  // Check AsyncStorage
  const stored = await loadFromStorage();
  if (stored) {
    categoriesCache = stored;
    cacheTimestamp = now;
    return stored;
  }

  // Fetch from Supabase
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
      color: cat.color,
      iconName: cat.icon_name,
      iconType: cat.icon_type as "FontAwesome6" | "MaterialCommunityIcons",
      coinsRequired: cat.coins_required || 0,
      isPremium: cat.is_premium || false,
      orderIndex: cat.order_index || 0,
    }));

    categoriesCache = categories;
    cacheTimestamp = now;
    await saveToStorage(categories);

    return categories;
  } catch (error) {
    console.error("Exception fetching categories:", error);
    return [];
  }
};

export const getCategoryById = async (
  categoryId: string
): Promise<Category | null> => {
  const categories = await getCategories();
  return categories.find((cat) => cat.id === categoryId) || null;
};

export const getCategoryCoinsRequired = async (
  categoryId: string
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
  language: Language = "en"
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
    (val) => val && val.trim().length > 0
  ) as string[];
  if (availableLabels.length > 0) return availableLabels[0];

  // Last resort
  return "Unknown";
};

export const clearCategoriesCache = async (): Promise<void> => {
  categoriesCache = null;
  cacheTimestamp = null;

  try {
    await AsyncStorage.multiRemove([
      CATEGORIES_STORAGE_KEY,
      CATEGORIES_TIMESTAMP_KEY,
    ]);
  } catch (error) {
    console.warn("Failed to clear categories cache:", error);
  }
};
