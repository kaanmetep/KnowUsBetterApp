import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { getSupabaseClient } from "../lib/supabaseClient";

const COIN_TABLE = "coins";
const APP_ENV =
  (Constants.expoConfig?.extra?.environment as string | undefined) || "prod";

const getCoinStorageKey = (appUserId: string): string =>
  `@KnowUsBetter:coins:${APP_ENV}:${appUserId}`;

export class CoinStorageService {
  static async fetchBalance(appUserId: string): Promise<number | null> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return CoinStorageService.fetchBalanceFromDevice(appUserId);
    }

    const { data, error } = await supabase
      .from(COIN_TABLE)
      .select("balance")
      .eq("app_user_id", appUserId)
      .maybeSingle();

    if (error) {
      console.warn(`⚠️ Database coin fetch failed: ${error.message}`);
      return CoinStorageService.fetchBalanceFromDevice(appUserId);
    }

    if (data?.balance !== undefined && data?.balance !== null) {
      await AsyncStorage.setItem(
        getCoinStorageKey(appUserId),
        data.balance.toString(),
      );
      return data.balance;
    }

    return CoinStorageService.fetchBalanceFromDevice(appUserId);
  }

  /**
   * Fetch balance ONLY from Database (no device fallback)
   * Used for critical operations like spending coins where we need the real balance
   * Returns null if Database is unavailable or query fails
   */
  static async fetchAuthoritativeBalance(
    appUserId: string,
  ): Promise<number | null> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.warn("⚠️ Database client not available");
      return null;
    }

    const { data, error } = await supabase
      .from(COIN_TABLE)
      .select("balance")
      .eq("app_user_id", appUserId)
      .maybeSingle();

    if (error) {
      console.error(
        `❌ Database query error: ${error.message}, appUserId: ${appUserId}`,
      );
      return null;
    }

    if (data?.balance !== undefined && data?.balance !== null) {
      // Update local storage with the real balance from Database
      await AsyncStorage.setItem(
        getCoinStorageKey(appUserId),
        data.balance.toString(),
      );
      return data.balance;
    }

    // No record found in Database
    return null;
  }

  /**
   * Save coin balance only to local storage
   * The write operation to database is done by the backend via webhook
   */
  static async saveBalance(appUserId: string, balance: number): Promise<void> {
    await AsyncStorage.setItem(
      getCoinStorageKey(appUserId),
      balance.toString(),
    );
  }

  private static async fetchBalanceFromDevice(
    appUserId: string,
  ): Promise<number | null> {
    const storedCoins = await AsyncStorage.getItem(
      getCoinStorageKey(appUserId),
    );
    if (storedCoins === null) {
      return null;
    }
    const parsedCoins = parseInt(storedCoins, 10);
    // If parsing fails (NaN), return null instead
    if (Number.isNaN(parsedCoins)) {
      return null;
    }
    return parsedCoins;
  }
}
