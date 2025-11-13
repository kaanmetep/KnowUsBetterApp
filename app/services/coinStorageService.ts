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
    return parseInt(storedCoins, 10);
  }
}
