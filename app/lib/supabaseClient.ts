import { createClient, SupabaseClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

const APP_ENV = (Constants.expoConfig?.extra?.environment as string | undefined) || "";
const EXPO_PUBLIC_SUPABASE_URL = Constants.expoConfig?.extra?.supabaseUrl || "";
const EXPO_PUBLIC_SUPABASE_KEY =
  Constants.expoConfig?.extra?.supabaseAnonKey || "";

let supabaseClient: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (supabaseClient) {
    return supabaseClient;
  }

  if (!EXPO_PUBLIC_SUPABASE_URL || !EXPO_PUBLIC_SUPABASE_KEY) {
    console.warn(
      "⚠️ Supabase URL or Anon Key is missing. Please set supabaseUrl and supabaseAnonKey under expo.extra."
    );
    return null;
  }

  supabaseClient = createClient(
    EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          "X-Client-Info": "knowusbetter-mobile-app",
        },
      },
    }
  );
  console.log("Supabase initialized", {
    environment: APP_ENV || "unknown",
    url: EXPO_PUBLIC_SUPABASE_URL,
  });

  return supabaseClient;
};
