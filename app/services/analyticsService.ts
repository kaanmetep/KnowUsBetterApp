import { Platform } from "react-native";

// Only import Firebase Analytics on native platforms
let analytics: any = null;
if (Platform.OS !== "web") {
  try {
    analytics = require("@react-native-firebase/analytics").default;
  } catch (error) {
    console.warn("⚠️ Firebase Analytics not available:", error);
  }
}

export class AnalyticsService {
  /**
   * Check if analytics is available
   */
  private static isAvailable(): boolean {
    return Platform.OS !== "web" && analytics !== null;
  }

  /**
   * Log a custom event
   */
  static async logEvent(eventName: string, params?: Record<string, any>) {
    if (!this.isAvailable()) {
      return;
    }
    try {
      await analytics().logEvent(eventName, params);
    } catch (error) {
      console.warn("⚠️ Failed to log analytics event:", error);
    }
  }

  /**
   * Set user properties
   */
  static async setUserProperty(name: string, value: string) {
    if (!this.isAvailable()) return;
    try {
      await analytics().setUserProperty(name, value);
    } catch (error) {
      console.warn("⚠️ Failed to set user property:", error);
    }
  }

  /**
   * Set user ID
   */
  static async setUserId(userId: string) {
    if (!this.isAvailable()) return;
    try {
      await analytics().setUserId(userId);
    } catch (error) {
      console.warn("⚠️ Failed to set user ID:", error);
    }
  }

  /**
   * Reset analytics data (for testing/logout)
   */
  static async resetAnalyticsData() {
    if (!this.isAvailable()) return;
    try {
      await analytics().resetAnalyticsData();
    } catch (error) {
      console.warn("⚠️ Failed to reset analytics data:", error);
    }
  }

  /**
   * Enable/disable analytics collection
   */
  static async setAnalyticsCollectionEnabled(enabled: boolean) {
    if (!this.isAvailable()) return;
    try {
      await analytics().setAnalyticsCollectionEnabled(enabled);
    } catch (error) {
      console.warn("⚠️ Failed to set analytics collection:", error);
    }
  }

  // Common event helpers
  static async logScreenView(screenName: string, screenClass?: string) {
    await this.logEvent("screen_view", {
      screen_name: screenName,
      screen_class: screenClass || screenName,
    });
  }

  static async logButtonClick(buttonName: string, location?: string) {
    await this.logEvent("button_click", {
      button_name: buttonName,
      location: location,
    });
  }

  static async logGameStart(category: string, roomCode?: string) {
    await this.logEvent("game_start", {
      category: category,
      room_code: roomCode,
    });
  }

  static async logGameFinish(category: string, roomCode?: string) {
    await this.logEvent("game_finish", {
      category: category,
      room_code: roomCode,
    });
  }

  static async logRoomCreate(roomCode: string) {
    await this.logEvent("room_create", {
      room_code: roomCode,
    });
  }

  static async logRoomJoin(roomCode: string) {
    await this.logEvent("room_join", {
      room_code: roomCode,
    });
  }

  static async logPurchase(productId: string, price: number, currency: string) {
    await this.logEvent("purchase", {
      product_id: productId,
      price: price,
      currency: currency,
    });
  }

  static async logLanguageChange(language: string) {
    await this.logEvent("language_change", {
      language: language,
    });
  }
}
