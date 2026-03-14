import AsyncStorage from "@react-native-async-storage/async-storage";
import { Language } from "../contexts/LanguageContext";
import { getSupabaseClient } from "../lib/supabaseClient";

export interface AnnouncementTranslations {
  en?: string;
  tr?: string;
  es?: string;
  [key: string]: string | undefined;
}

export interface Announcement {
  id: string;
  title: AnnouncementTranslations;
  message: AnnouncementTranslations;
  isActive: boolean;
  priority: number;
  startDate: string | null;
  endDate: string | null;
  actionUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

const ANNOUNCEMENT_LATEST_KEY = "@KnowUsBetter:announcement_latest";
const ANNOUNCEMENT_ALL_KEY = "@KnowUsBetter:announcement_all";
const ANNOUNCEMENT_TIMESTAMP_KEY = "@KnowUsBetter:announcement_timestamp";
const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours
const STALE_WHILE_REVALIDATE = 24 * 60 * 60 * 1000; // 24 hours

let latestAnnouncementCache: Announcement | null = null;
let allAnnouncementsCache: Announcement[] | null = null;
let cacheTimestamp: number | null = null;

const loadFromStorage = async (): Promise<{
  latest: Announcement | null;
  all: Announcement[];
  timestamp: number | null;
}> => {
  try {
    const latestData = await AsyncStorage.getItem(ANNOUNCEMENT_LATEST_KEY);
    const allData = await AsyncStorage.getItem(ANNOUNCEMENT_ALL_KEY);
    const timestampData = await AsyncStorage.getItem(ANNOUNCEMENT_TIMESTAMP_KEY);

    if (!latestData || !allData || !timestampData) {
      return { latest: null, all: [], timestamp: null };
    }

    const timestamp = parseInt(timestampData, 10);
    const age = Date.now() - timestamp;

    if (age < STALE_WHILE_REVALIDATE) {
      return {
        latest: JSON.parse(latestData) as Announcement,
        all: JSON.parse(allData) as Announcement[],
        timestamp,
      };
    }

    return { latest: null, all: [], timestamp: null };
  } catch (error) {
    console.warn("Failed to load announcements from storage:", error);
    return { latest: null, all: [], timestamp: null };
  }
};

const saveToStorage = async (
  latest: Announcement | null,
  all: Announcement[]
): Promise<void> => {
  try {
    if (latest) {
      await AsyncStorage.setItem(ANNOUNCEMENT_LATEST_KEY, JSON.stringify(latest));
    }
    await AsyncStorage.setItem(ANNOUNCEMENT_ALL_KEY, JSON.stringify(all));
    await AsyncStorage.setItem(ANNOUNCEMENT_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.warn("Failed to save announcements to storage:", error);
  }
};

const isAnnouncementActive = (announcement: any): boolean => {
  const now = new Date();
  
  if (announcement.start_date) {
    const startDate = new Date(announcement.start_date);
    if (now < startDate) return false;
  }
  
  if (announcement.end_date) {
    const endDate = new Date(announcement.end_date);
    if (now > endDate) return false;
  }
  
  return true;
};

const fetchFromSupabase = async (): Promise<{
  latest: Announcement | null;
  all: Announcement[];
}> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.warn("Supabase client not available");
    return { latest: null, all: [] };
  }

  try {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .eq("is_active", true)
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching announcements:", error);
      return { latest: null, all: [] };
    }

    if (!data || data.length === 0) {
      return { latest: null, all: [] };
    }

    // Filter by date range
    const activeAnnouncements = data.filter(isAnnouncementActive);

    if (activeAnnouncements.length === 0) {
      return { latest: null, all: [] };
    }

    const announcements: Announcement[] = activeAnnouncements.map((item) => ({
      id: item.id,
      title: item.title || {},
      message: item.message || {},
      isActive: item.is_active,
      priority: item.priority || 0,
      startDate: item.start_date,
      endDate: item.end_date,
      actionUrl: item.action_url,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));

    const latest = announcements[0] || null;
    const all = announcements;

    // Update cache
    latestAnnouncementCache = latest;
    allAnnouncementsCache = all;
    cacheTimestamp = Date.now();
    await saveToStorage(latest, all);

    return { latest, all };
  } catch (error) {
    console.error("Exception fetching announcements:", error);
    return { latest: null, all: [] };
  }
};

export const getLatestAnnouncement = async (
  language: Language = "en"
): Promise<Announcement | null> => {
  const now = Date.now();

  // Check memory cache
  if (
    latestAnnouncementCache &&
    cacheTimestamp &&
    now - cacheTimestamp < CACHE_DURATION
  ) {
    return latestAnnouncementCache;
  }

  // Check AsyncStorage
  const stored = await loadFromStorage();
  if (stored.latest && stored.timestamp) {
    const age = now - stored.timestamp;
    if (age < CACHE_DURATION) {
      latestAnnouncementCache = stored.latest;
      allAnnouncementsCache = stored.all;
      cacheTimestamp = stored.timestamp;
      return stored.latest;
    } else if (age < STALE_WHILE_REVALIDATE) {
      // Stale but usable - return it and fetch in background
      fetchFromSupabase().catch(console.error);
      return stored.latest;
    }
  }

  // Fetch from Supabase
  const { latest } = await fetchFromSupabase();
  return latest;
};

export const getAllAnnouncements = async (): Promise<Announcement[]> => {
  const now = Date.now();

  // Check memory cache
  if (
    allAnnouncementsCache &&
    cacheTimestamp &&
    now - cacheTimestamp < CACHE_DURATION
  ) {
    return allAnnouncementsCache;
  }

  // Check AsyncStorage
  const stored = await loadFromStorage();
  if (stored.all.length > 0 && stored.timestamp) {
    const age = now - stored.timestamp;
    if (age < CACHE_DURATION) {
      allAnnouncementsCache = stored.all;
      latestAnnouncementCache = stored.latest;
      cacheTimestamp = stored.timestamp;
      return stored.all;
    } else if (age < STALE_WHILE_REVALIDATE) {
      // Stale but usable - return it and fetch in background
      fetchFromSupabase().catch(console.error);
      return stored.all;
    }
  }

  // Fetch from Supabase
  const { all } = await fetchFromSupabase();
  return all;
};

export const getAnnouncementText = (
  announcement: Announcement | null,
  field: "title" | "message",
  language: Language = "en"
): string => {
  if (!announcement) return "";

  const translations = announcement[field];
  if (!translations) return "";

  // Get text for selected language
  const text = translations[language];
  if (text) return text;

  // Fallback to English
  if (translations.en) return translations.en;

  // Fallback to any available language
  const availableTexts = Object.values(translations).filter(
    (val) => val && val.trim().length > 0
  ) as string[];
  if (availableTexts.length > 0) return availableTexts[0];

  return "";
};

export const clearAnnouncementsCache = async (): Promise<void> => {
  latestAnnouncementCache = null;
  allAnnouncementsCache = null;
  cacheTimestamp = null;

  try {
    await AsyncStorage.multiRemove([
      ANNOUNCEMENT_LATEST_KEY,
      ANNOUNCEMENT_ALL_KEY,
      ANNOUNCEMENT_TIMESTAMP_KEY,
    ]);
  } catch (error) {
    console.warn("Failed to clear announcements cache:", error);
  }
};
