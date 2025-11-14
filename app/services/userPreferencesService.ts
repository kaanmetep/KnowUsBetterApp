import AsyncStorage from "@react-native-async-storage/async-storage";

const USERNAME_STORAGE_KEY = "@KnowUsBetter:username";
const AVATAR_STORAGE_KEY = "@KnowUsBetter:avatar";

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
   * Clear all user preferences
   */
  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        USERNAME_STORAGE_KEY,
        AVATAR_STORAGE_KEY,
      ]);
    } catch (error) {
      console.warn("⚠️ Failed to clear user preferences:", error);
    }
  }
}
