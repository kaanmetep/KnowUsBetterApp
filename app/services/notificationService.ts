import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import en from "../locales/en.json";
import es from "../locales/es.json";
import tr from "../locales/tr.json";
import { UserPreferencesService } from "./userPreferencesService";

const DAILY_REWARD_NOTIFICATION_STORAGE_KEY =
  "@KnowUsBetter:notifications:dailyRewardId";

const PUSH_TOKEN_STORAGE_KEY = "@KnowUsBetter:notifications:lastPushToken";

const DAILY_REWARD_IDENTIFIER = "daily-reward-ready";
const DEV_DAILY_REWARD_REMINDER_DELAY_MS = 15 * 1000;

type SupportedLanguage = "en" | "tr" | "es";

const DAILY_REWARD_TEXTS = {
  en: {
    title: en.dailyReward.notificationTitle,
    body: en.dailyReward.notificationBody,
  },
  tr: {
    title: tr.dailyReward.notificationTitle,
    body: tr.dailyReward.notificationBody,
  },
  es: {
    title: es.dailyReward.notificationTitle,
    body: es.dailyReward.notificationBody,
  },
} as const;

class NotificationServiceClass {
  private initialized = false;

  private async getDailyRewardContent(): Promise<Notifications.NotificationContentInput> {
    const savedLanguage = await UserPreferencesService.getLanguage();
    const language: SupportedLanguage =
      savedLanguage === "tr" || savedLanguage === "es" ? savedLanguage : "en";
    const text = DAILY_REWARD_TEXTS[language];

    return {
      title: text.title,
      body: text.body,
      sound: true,
    };
  }

  initialize() {
    if (this.initialized) return;

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    this.initialized = true;
  }

  async requestPermissionsIfNeeded(): Promise<boolean> {
    if (Platform.OS !== "ios") {
      return false;
    }

    const current = await Notifications.getPermissionsAsync();
    if (current.granted || current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
      return true;
    }

    const requested = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });

    return (
      requested.granted ||
      requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
    );
  }

  async registerPushToken(appUserId: string): Promise<string | null> {
    if (Platform.OS !== "ios") {
      return null;
    }

    if (!Device.isDevice) {
      return null;
    }

    const hasPermission = await this.requestPermissionsIfNeeded();
    if (!hasPermission) {
      return null;
    }

    const tokenResponse = await Notifications.getDevicePushTokenAsync();
    const token = String(tokenResponse.data || "");
    if (!token) {
      return null;
    }

    const lastToken = await AsyncStorage.getItem(PUSH_TOKEN_STORAGE_KEY);
    if (lastToken === token) {
      return token;
    }

    const backendUrl = Constants.expoConfig?.extra?.backendUrl as string | undefined;
    if (!backendUrl) {
      return token;
    }

    try {
      const response = await fetch(`${backendUrl}/notifications/register-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appUserId,
          token,
          platform: "ios",
          provider: "apns",
        }),
      });

      if (!response.ok) {
        return token;
      }

      await AsyncStorage.setItem(PUSH_TOKEN_STORAGE_KEY, token);
      return token;
    } catch {
      return token;
    }
  }

  async scheduleDailyRewardReminder(nextDailyRewardAt: Date | null): Promise<void> {
    if (Platform.OS !== "ios") {
      return;
    }

    await this.cancelDailyRewardReminder();

    if (!nextDailyRewardAt) {
      return;
    }

    const reminderDate = __DEV__
      ? new Date(Date.now() + DEV_DAILY_REWARD_REMINDER_DELAY_MS)
      : nextDailyRewardAt;

    if (reminderDate.getTime() <= Date.now()) {
      return;
    }

    const hasPermission = await this.requestPermissionsIfNeeded();
    if (!hasPermission) {
      return;
    }

    const dailyRewardContent = await this.getDailyRewardContent();

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: dailyRewardContent,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminderDate,
      },
      identifier: DAILY_REWARD_IDENTIFIER,
    });

    await AsyncStorage.setItem(
      DAILY_REWARD_NOTIFICATION_STORAGE_KEY,
      notificationId
    );
  }

  async cancelDailyRewardReminder(): Promise<void> {
    if (Platform.OS !== "ios") {
      return;
    }

    const notificationId = await AsyncStorage.getItem(
      DAILY_REWARD_NOTIFICATION_STORAGE_KEY
    );

    if (notificationId) {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      await AsyncStorage.removeItem(DAILY_REWARD_NOTIFICATION_STORAGE_KEY);
    }
  }
}

export const NotificationService = new NotificationServiceClass();
