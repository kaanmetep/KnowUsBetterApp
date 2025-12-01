import AsyncStorage from "@react-native-async-storage/async-storage";

const USERNAME_STORAGE_KEY = "@KnowUsBetter:username";
const AVATAR_STORAGE_KEY = "@KnowUsBetter:avatar";
const LANGUAGE_STORAGE_KEY = "@KnowUsBetter:language";
const TERMS_ACCEPTED_KEY = "@KnowUsBetter:termsAccepted";
const ONBOARDING_COMPLETED_KEY = "@KnowUsBetter:onboardingCompleted";

export class UserPreferencesService {
  /**
   * Save username to device storage
   */
  static async saveUsername(username: string): Promise<void> {
    try {
      await AsyncStorage.setItem(USERNAME_STORAGE_KEY, username);
    } catch (error) {
      console.warn("⚠️ Failed to save username:", error);
    }
  }

  /**
   * Get username from device storage
   */
  static async getUsername(): Promise<string | null> {
    try {
      const username = await AsyncStorage.getItem(USERNAME_STORAGE_KEY);
      return username;
    } catch (error) {
      console.warn("⚠️ Failed to get username:", error);
      return null;
    }
  }

  /**
   * Save avatar to device storage
   */
  static async saveAvatar(avatar: string): Promise<void> {
    try {
      await AsyncStorage.setItem(AVATAR_STORAGE_KEY, avatar);
    } catch (error) {
      console.warn("⚠️ Failed to save avatar:", error);
    }
  }

  /**
   * Get avatar from device storage
   */
  static async getAvatar(): Promise<string | null> {
    try {
      const avatar = await AsyncStorage.getItem(AVATAR_STORAGE_KEY);
      return avatar;
    } catch (error) {
      console.warn("⚠️ Failed to get avatar:", error);
      return null;
    }
  }

  /**
   * Save language preference to device storage
   */
  static async saveLanguage(language: string): Promise<void> {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch (error) {
      console.warn("⚠️ Failed to save language:", error);
    }
  }

  /**
   * Get language preference from device storage
   */
  static async getLanguage(): Promise<string | null> {
    try {
      const language = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      return language;
    } catch (error) {
      console.warn("⚠️ Failed to get language:", error);
      return null;
    }
  }

  /**
   * Clear all user preferences
   */
  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        USERNAME_STORAGE_KEY,
        AVATAR_STORAGE_KEY,
        LANGUAGE_STORAGE_KEY,
        TERMS_ACCEPTED_KEY,
        ONBOARDING_COMPLETED_KEY,
      ]);
    } catch (error) {
      console.warn("⚠️ Failed to clear user preferences:", error);
    }
  }

  /**
   * Save terms acceptance status to device storage
   */
  static async setTermsAccepted(isAccepted: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(
        TERMS_ACCEPTED_KEY,
        JSON.stringify(isAccepted)
      );
    } catch (error) {
      console.warn("⚠️ Failed to save terms acceptance:", error);
    }
  }

  /**
   * Get terms acceptance status from device storage
   */
  static async hasAcceptedTerms(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(TERMS_ACCEPTED_KEY);
      return value ? JSON.parse(value) === true : false;
    } catch (error) {
      console.warn("⚠️ Failed to read terms acceptance:", error);
      return false;
    }
  }

  /**
   * Save onboarding completion status to device storage
   */
  static async setOnboardingCompleted(isCompleted: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(
        ONBOARDING_COMPLETED_KEY,
        JSON.stringify(isCompleted)
      );
    } catch (error) {
      console.warn("⚠️ Failed to save onboarding completion:", error);
    }
  }

  /**
   * Get onboarding completion status from device storage
   */
  static async hasCompletedOnboarding(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
      return value ? JSON.parse(value) === true : false;
    } catch (error) {
      console.warn("⚠️ Failed to read onboarding completion:", error);
      return false;
    }
  }
}
