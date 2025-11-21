import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { CoinStorageService } from "../services/coinStorageService";
import { purchaseService } from "../services/purchaseService";
import socketService from "../services/socketService";

interface CoinContextType {
  coins: number;
  addCoins: (amount: number) => Promise<void>;
  spendCoins: (amount: number) => Promise<boolean>;
  refreshCoins: () => Promise<void>;
  isLoading: boolean;
}

const CoinContext = createContext<CoinContextType | undefined>(undefined);

export const useCoins = () => {
  const context = useContext(CoinContext);
  if (!context) {
    throw new Error("useCoins must be used within a CoinProvider");
  }
  return context;
};

interface CoinProviderProps {
  children: ReactNode;
}

export const CoinProvider = ({ children }: CoinProviderProps) => {
  const [coins, setCoins] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [appUserId, setAppUserId] = useState<string | null>(null);

  // Load coins when the app is opened
  useEffect(() => {
    loadCoins();
  }, []);

  // Connect to socket and listen for coin updates from the backend via webhook
  useEffect(() => {
    if (!appUserId) {
      return; // Don't add listener if appUserId is not available
    }

    const handleCoinsAdded = (data: {
      appUserId: string;
      newBalance: number;
      success: boolean;
      error?: string;
    }) => {
      // Only update coins if it's the current user
      if (data.appUserId === appUserId) {
        if (data.success) {
          // Update balance with the new balance received from the backend
          setCoins(data.newBalance);
          // Save to local storage (DATABASE is already updated by the backend)
          if (appUserId) {
            CoinStorageService.saveBalance(appUserId, data.newBalance);
          }
        } else {
          // Webhook failed, revert optimistic update. Server will handle the balance update.
          console.error(
            `❌ Webhook failed to add coins: ${
              data.error || "Unknown error"
            }. Reverting optimistic update.`
          );
          // Load real balance from server
          loadCoins();
        }
      }
    };

    const handleCoinsSpent = (data: {
      appUserId: string;
      newBalance: number;
      success: boolean;
      error?: string;
    }) => {
      // Only update coins if it's the current user
      if (data.appUserId === appUserId) {
        if (data.success) {
          // Update balance with the new balance received from the backend
          setCoins(data.newBalance);
          // Save to local storage (Supabase is already updated by the backend)
          if (appUserId) {
            CoinStorageService.saveBalance(appUserId, data.newBalance);
          }
        } else {
          // Backend failed to spend coins, revert optimistic update
          console.error(
            `❌ Backend failed to spend coins: ${
              data.error || "Unknown error"
            }. Reverting optimistic update.`
          );
          // Load real balance from server
          loadCoins();
        }
      }
    };

    // Add listeners (socketService checks if the socket is connected)
    socketService.onCoinsAdded(handleCoinsAdded);
    socketService.onCoinsSpent(handleCoinsSpent);

    return () => {
      socketService.offCoinsAdded(handleCoinsAdded);
      socketService.offCoinsSpent(handleCoinsSpent);
    };
  }, [appUserId]);

  const loadCoins = async () => {
    try {
      setIsLoading(true);
      const id = await purchaseService.getAppUserId();
      setAppUserId(id);

      const existingBalance = await CoinStorageService.fetchBalance(id);
      if (existingBalance !== null && !Number.isNaN(existingBalance)) {
        setCoins(existingBalance);
        return;
      }

      setCoins(0);
    } catch (error) {
      console.error("❌ Error loading coins:", error);
      setCoins(0);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Optimistic update: Add coins (only local state and AsyncStorage)
   * Actual coin addition is done by the backend via webhook
   * If the webhook fails, the listener will automatically revert the optimistic update
   */
  const addCoins = async (amount: number) => {
    // Validate amount (security: prevent negative or invalid values)
    if (!amount || amount <= 0 || !Number.isFinite(amount)) {
      console.warn("⚠️ Invalid coin amount:", amount);
      return;
    }

    // Prevent unrealistically large amounts (security: max 100,000 coins per transaction)
    if (amount > 100000) {
      console.warn("⚠️ Coin amount too large:", amount);
      return;
    }

    // CRITICAL FIX: Ensure appUserId is set in context before adding coins
    // This ensures the webhook listener is active and can process the backend webhook
    // This is especially important after app restart where appUserId might not be set yet
    if (!appUserId) {
      await loadCoins();
    }

    const newCoins = coins + amount;
    setCoins(newCoins);

    try {
      const id = appUserId || (await purchaseService.getAppUserId());
      if (id) {
        await CoinStorageService.saveBalance(id, newCoins);
      }
    } catch (error) {
      console.warn("⚠️ Failed to save coins locally:", error);
    }
  };

  /**
   * Spend coins - Checks balance first, then sends request to backend
   * Backend will deduct coins using secret key (RLS bypass)
   */
  const spendCoins = async (amount: number): Promise<boolean> => {
    try {
      // Validate amount (security: prevent negative or invalid values)
      if (!amount || amount <= 0 || !Number.isFinite(amount)) {
        console.warn("⚠️ Invalid coin amount:", amount);
        return false;
      }

      // Prevent unrealistically large amounts (security: max 100,000 coins per transaction)
      if (amount > 100000) {
        console.warn("⚠️ Coin amount too large:", amount);
        return false;
      }

      // CRITICAL FIX: Always get fresh appUserId from purchaseService, NEVER trust state.
      // State might be stale/old, especially right after app startup or coin purchase
      // This ensures we always use the correct, current appUserId
      const currentAppUserId = await purchaseService.getAppUserId();
      if (!currentAppUserId) {
        console.error(
          "❌ Unable to get current appUserId from purchaseService"
        );
        return false;
      }

      // CRITICAL: If appUserId from service is different from state, update state and reload
      if (currentAppUserId !== appUserId) {
        setAppUserId(currentAppUserId);
        // Reload coins with correct appUserId to ensure webhook listener is active
        await loadCoins();
      }

      // Use the fresh, correct appUserId from service (NOT from state)
      const id = currentAppUserId;

      // CRITICAL FIX: If context state has more coins than expected, refresh first
      // This handles the case where coins were just purchased and webhook might have updated Supabase
      // but we want to make sure we have the latest balance before spending
      if (coins >= amount) {
        // Refresh from Supabase first to ensure we have the latest balance
        await refreshCoins();
      }

      // Fetch real balance from Supabase ONLY (no device fallback for security)
      // Try up to 5 times with increasing delays in case of temporary Supabase sync issues
      // This handles the case where coins were just purchased and backend webhook hasn't updated Supabase yet
      let realBalance: number | null = null;
      const maxRetries = 5;
      const retryDelays = [500, 1000, 2000, 3000, 5000]; // Increasing delays

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        realBalance = await CoinStorageService.fetchBalanceFromSupabase(id);

        // If we got a valid balance and it's enough, break
        if (
          realBalance !== null &&
          realBalance !== undefined &&
          !Number.isNaN(realBalance) &&
          realBalance >= amount
        ) {
          break;
        }

        // If this is not the last attempt and we got null/NaN, wait and retry
        if (attempt < maxRetries && realBalance === null) {
          const delay = retryDelays[attempt - 1] || 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        // If balance is valid but insufficient, break (don't retry)
        if (
          realBalance !== null &&
          realBalance !== undefined &&
          !Number.isNaN(realBalance)
        ) {
          break;
        }
      }

      if (
        realBalance === null ||
        realBalance === undefined ||
        Number.isNaN(realBalance)
      ) {
        console.error(
          `❌ Unable to fetch balance from Supabase after ${maxRetries} attempts. Cannot proceed with spending coins.`
        );
        return false;
      }

      // Check if user has enough coins
      if (realBalance < amount) {
        console.error(
          `❌ Not enough coins. Required: ${amount}, Available: ${realBalance}, Context state: ${coins}, appUserId: ${id}`
        );
        // Update local state with real balance (in case it was out of sync)
        setCoins(realBalance);
        return false;
      }

      // Optimistic update (until the backend response is received)
      const newCoins = realBalance - amount;
      setCoins(newCoins);
      await CoinStorageService.saveBalance(id, newCoins);

      // Send request to backend to deduct coins
      socketService.spendCoins({
        appUserId: id,
        amount: amount,
        transactionType: "game_start",
      });
      return true;
    } catch (error) {
      console.error("❌ Error spending coins:", error);
      return false;
    }
  };

  const refreshCoins = async () => {
    await loadCoins();
  };

  return (
    <CoinContext.Provider
      value={{
        coins,
        addCoins,
        spendCoins,
        refreshCoins,
        isLoading,
      }}
    >
      {children}
    </CoinContext.Provider>
  );
};
