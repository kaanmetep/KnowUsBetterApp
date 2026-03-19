import AsyncStorage from "@react-native-async-storage/async-storage";
import * as StoreReview from "expo-store-review";

const STORAGE_KEYS = {
  GAMES_COMPLETED: "store_review_games_completed",
};

// Ask for review after these game counts: 2nd, 5th, 8th game
const REVIEW_TRIGGER_GAMES = [2, 5, 8];

class StoreReviewService {
  /**
   * Call this after every completed game.
   * It will automatically decide whether to show the review popup.
   * Best triggered when the user had a good experience (high match score).
   */
  /**
   * IMPORTANT: This function is called every game, but the popup will ONLY show: based on REVIEW_TRIGGER_GAMES array.
   *
   * Apple/Google still decide if/when the native review prompt is actually shown.
   *
   * @param matchPercentage
   */
  async onGameCompleted(matchPercentage: number): Promise<void> {
    try {
      // Only ask for review if the user had a good experience (>= 60%)
      // If score is low, don't even count this game for review purposes.
      if (matchPercentage < 60) {
        return; // Exit early - no popup, no counting
      }

      // Increment game counter (only counts games with >= 60% match)
      const gamesCompleted = await this.incrementGamesCompleted();
      
      // Check if we should show the popup based on REVIEW_TRIGGER_GAMES array.
      const shouldAsk = await this.shouldRequestReview(gamesCompleted);

      if (shouldAsk) {
        await this.requestReview();
      }
      // If shouldAsk is false, function just ends - no popup, no action
    } catch (error) {
      // Silently fail - review prompts should never break the app
      console.log("StoreReview: error in onGameCompleted", error);
    }
  }

  private async incrementGamesCompleted(): Promise<number> {
    const current = await AsyncStorage.getItem(STORAGE_KEYS.GAMES_COMPLETED);
    const count = (current ? parseInt(current, 10) : 0) + 1;
    await AsyncStorage.setItem(STORAGE_KEYS.GAMES_COMPLETED, count.toString());
    return count;
  }

  private async shouldRequestReview(gamesCompleted: number): Promise<boolean> {
    // Check if we're at a trigger point
    if (!REVIEW_TRIGGER_GAMES.includes(gamesCompleted)) return false;
    return true;
  }

  private async requestReview(): Promise<void> {
    const isAvailable = await StoreReview.isAvailableAsync();
    if (!isAvailable) return;

    // Small delay so the review prompt doesn't feel abrupt.
    await new Promise((resolve) => setTimeout(resolve, 1500));

    await StoreReview.requestReview();
  }
}

export const storeReviewService = new StoreReviewService();
