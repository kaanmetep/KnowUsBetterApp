import AsyncStorage from "@react-native-async-storage/async-storage";
import { getSupabaseClient } from "../lib/supabaseClient";
import { getAppConfig } from "./appConfigService";

export const getDailyRewardIntervalMs = (): number =>
  getAppConfig().economy.dailyReward.intervalMs;
export const getDailyRewardAmount = (): number =>
  getAppConfig().economy.dailyReward.amount;

const NEXT_CLAIM_KEY = "@KnowUsBetter:dailyReward:nextClaimAt";

export interface DailyRewardEligibility {
  eligible: boolean;
  nextClaimAt: Date | null;
}

export class DailyRewardService {
  static async checkEligibility(
    appUserId: string
  ): Promise<DailyRewardEligibility> {
    if (__DEV__) {
      try { await AsyncStorage.removeItem(NEXT_CLAIM_KEY); } catch {}
    }

    try {
      const stored = await AsyncStorage.getItem(NEXT_CLAIM_KEY);
      if (stored) {
        const nextClaimAt = new Date(stored);
        const remainingMs = nextClaimAt.getTime() - Date.now();
        if (remainingMs > 0 && remainingMs <= getDailyRewardIntervalMs()) {
          return { eligible: false, nextClaimAt };
        }
      }
    } catch {}

    const supabase = getSupabaseClient();
    if (!supabase) {
      return { eligible: true, nextClaimAt: null };
    }

    try {
      const { data, error } = await supabase
        .from("coins")
        .select("last_daily_reward_at")
        .eq("app_user_id", appUserId)
        .maybeSingle();

      if (error || !data?.last_daily_reward_at) {
        return { eligible: true, nextClaimAt: null };
      }

      const lastClaimedAt = new Date(data.last_daily_reward_at);
      const nextClaimAt = new Date(
        lastClaimedAt.getTime() + getDailyRewardIntervalMs()
      );

      if (nextClaimAt <= new Date()) {
        return { eligible: true, nextClaimAt: null };
      }

      await AsyncStorage.setItem(NEXT_CLAIM_KEY, nextClaimAt.toISOString());
      return { eligible: false, nextClaimAt };
    } catch {
      return { eligible: true, nextClaimAt: null };
    }
  }

  static async setNextClaimAt(isoString: string): Promise<void> {
    try {
      await AsyncStorage.setItem(NEXT_CLAIM_KEY, isoString);
    } catch {}
  }
}
