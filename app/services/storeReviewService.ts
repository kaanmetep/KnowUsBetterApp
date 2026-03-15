import AsyncStorage from "@react-native-async-storage/async-storage";
import * as StoreReview from "expo-store-review";

const STORAGE_KEYS = {
  GAMES_COMPLETED: "store_review_games_completed",
  LAST_REVIEW_REQUEST: "store_review_last_request",
  REVIEW_REQUEST_COUNT: "store_review_request_count",
};

// Ask for review after these game counts: 3rd, 8th, 20th game
const REVIEW_TRIGGER_GAMES = [3, 8, 20];

// Minimum days between review requests (Apple allows max 3/year)
const MIN_DAYS_BETWEEN_REQUESTS = 90;

class StoreReviewService {
  /**
   * Call this after every completed game.
   * It will automatically decide whether to show the review popup.
   * Best triggered when the user had a good experience (high match score).
   */
  /**
   * Call this after every completed game.
   * It will automatically decide whether to show the review popup.
   * 
   * IMPORTANT: This function is called every game, but the popup will ONLY show:
   * - On the 3rd, 8th, or 20th completed game (with >= 60% match score)
   * - If at least 90 days have passed since the last request
   * - If we haven't already requested 3 times this year
   * 
   * @param matchPercentage - The match percentage from the game
   * @param onShouldShowModal - Optional callback to show custom feedback modal (growth hack)
   */
  async onGameCompleted(
    matchPercentage: number,
    onShouldShowModal?: () => void
  ): Promise<void> {
    try {
      // Only ask for review if the user had a good experience (>= 60%)
      // If score is low, don't even count this game for review purposes
      if (matchPercentage < 60) {
        return; // Exit early - no popup, no counting
      }

      // Increment game counter (only counts games with >= 60% match)
      const gamesCompleted = await this.incrementGamesCompleted();
      
      // Check if we should show the popup (only true on 3rd, 8th, 20th game + time/count checks)
      const shouldAsk = await this.shouldRequestReview(gamesCompleted);

      if (shouldAsk) {
        // Growth hack: Show custom feedback modal first (if callback provided)
        // Otherwise, show native review popup directly
        if (onShouldShowModal) {
          // Small delay so the modal doesn't feel abrupt
          setTimeout(() => {
            onShouldShowModal();
          }, 1500);
        } else {
          // Fallback: direct native review popup
          await this.requestReview();
        }
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

    // Check minimum days since last request
    const lastRequest = await AsyncStorage.getItem(
      STORAGE_KEYS.LAST_REVIEW_REQUEST
    );
    if (lastRequest) {
      const daysSince =
        (Date.now() - parseInt(lastRequest, 10)) / (1000 * 60 * 60 * 24);
      if (daysSince < MIN_DAYS_BETWEEN_REQUESTS) return false;
    }

    // Check total request count (Apple allows max 3/year)
    const requestCount = await AsyncStorage.getItem(
      STORAGE_KEYS.REVIEW_REQUEST_COUNT
    );
    if (requestCount && parseInt(requestCount, 10) >= 3) return false;

    return true;
  }

  private async requestReview(): Promise<void> {
    const isAvailable = await StoreReview.isAvailableAsync();
    if (!isAvailable) return;

    // Small delay so the review prompt doesn't feel abrupt
    await new Promise((resolve) => setTimeout(resolve, 1500));

    await StoreReview.requestReview();

    // Record this request
    await AsyncStorage.setItem(
      STORAGE_KEYS.LAST_REVIEW_REQUEST,
      Date.now().toString()
    );
    const currentCount = await AsyncStorage.getItem(
      STORAGE_KEYS.REVIEW_REQUEST_COUNT
    );
    const newCount = (currentCount ? parseInt(currentCount, 10) : 0) + 1;
    await AsyncStorage.setItem(
      STORAGE_KEYS.REVIEW_REQUEST_COUNT,
      newCount.toString()
    );
  }
}

export const storeReviewService = new StoreReviewService();
