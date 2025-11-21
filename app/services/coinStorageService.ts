import AsyncStorage from "@react-native-async-storage/async-storage";
import { getSupabaseClient } from "../lib/supabaseClient";

const COIN_TABLE = "coins";
const COIN_STORAGE_KEY = "@KnowUsBetter:coins";

export class CoinStorageService {
  static async fetchBalance(appUserId: string): Promise<number | null> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return CoinStorageService.fetchBalanceFromDevice();
    }

    const { data, error } = await supabase
      .from(COIN_TABLE)
      .select("balance")
      .eq("app_user_id", appUserId)
      .maybeSingle();

    if (error) {
      console.warn(`⚠️ Supabase coin fetch failed: ${error.message}`);
      return CoinStorageService.fetchBalanceFromDevice();
    }

    if (data?.balance !== undefined && data?.balance !== null) {
      await AsyncStorage.setItem(COIN_STORAGE_KEY, data.balance.toString());
      return data.balance;
    }

    return CoinStorageService.fetchBalanceFromDevice();
  }

  /**
   * Fetch balance ONLY from Supabase (no device fallback)
   * Used for critical operations like spending coins where we need the real balance
   * Returns null if Supabase is unavailable or query fails
   */
  static async fetchBalanceFromSupabase(
    appUserId: string
  ): Promise<number | null> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.warn("⚠️ Supabase client not available");
      return null;
    }

    const { data, error } = await supabase
      .from(COIN_TABLE)
      .select("balance")
      .eq("app_user_id", appUserId)
      .maybeSingle();

    if (error) {
      console.error(
        `❌ Supabase query error: ${error.message}, appUserId: ${appUserId}`
      );
      return null;
    }

    if (data?.balance !== undefined && data?.balance !== null) {
      // Update local storage with the real balance from Supabase
      await AsyncStorage.setItem(COIN_STORAGE_KEY, data.balance.toString());
      return data.balance;
    }

    // No record found in Supabase
    return null;
  }

  /**
   * Save coin balance only to local storage
   * The write operation to Supabase is done by the backend via webhook
   */
  static async saveBalance(appUserId: string, balance: number): Promise<void> {
    await AsyncStorage.setItem(COIN_STORAGE_KEY, balance.toString());
  }

  private static async fetchBalanceFromDevice(): Promise<number | null> {
    const storedCoins = await AsyncStorage.getItem(COIN_STORAGE_KEY);
    if (storedCoins === null) {
      return null;
    }
    const parsedCoins = parseInt(storedCoins, 10);
    // If parsing fails (NaN), return null instead
    if (Number.isNaN(parsedCoins)) {
      console.warn(
        `⚠️ Invalid coin value in storage: "${storedCoins}". Returning null.`
      );
      return null;
    }
    return parsedCoins;
  }
}
