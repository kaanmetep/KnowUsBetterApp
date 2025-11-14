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
          console.log(
            `✅ Coins updated via webhook. New balance: ${data.newBalance}`
          );
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
          console.log(
            `✅ Coins spent via backend. New balance: ${data.newBalance}`
          );
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

    console.log(`✅ Added ${amount} coins (optimistic). Total: ${newCoins}`);
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

      // Get the real balance from Supabase first (for validation)
      // Must fetch from Supabase only, not from client (client can be manipulated)
      const id = appUserId || (await purchaseService.getAppUserId());
      if (!id) {
        console.error("❌ Unable to get appUserId");
        return false;
      }

      // Fetch real balance from Supabase ONLY (no device fallback for security)
      const realBalance = await CoinStorageService.fetchBalanceFromSupabase(id);

      if (
        realBalance === null ||
        realBalance === undefined ||
        Number.isNaN(realBalance)
      ) {
        console.error(
          "❌ Unable to fetch balance from Supabase. Cannot proceed with spending coins."
        );
        return false;
      }

      // Check if user has enough coins
      if (realBalance < amount) {
        console.warn(
          `⚠️ Not enough coins. Required: ${amount}, Available: ${realBalance}`
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

      console.log(
        `✅ Spent ${amount} coins (optimistic). Previous: ${realBalance}, Remaining: ${newCoins}`
      );
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
