import Constants from "expo-constants";

const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  Constants.expoConfig?.extra?.backendUrl ||
  "https://knowusbetterapp-backend.onrender.com";

export interface AppPublicConfig {
  economy: {
    aiAnalysis: {
      enabled: boolean;
      coinCost: number;
    };
    dailyReward: {
      amount: number;
      intervalMs: number;
      claimTimeoutMs: number;
    };
    balanceSync: {
      maxRetries: number;
      retryDelaysMs: number[];
    };
  };
  gameplay: {
    room: {
      minPlayersToStart: number;
    };
    defaults: {
      questionDurationSec: number;
    };
  };
  network: {
    socket: {
      connectTimeoutMs: number;
      reconnectAttempts: number;
      reconnectDelayMs: number;
    };
    rpcTimeoutMs: {
      default: number;
      startGame: number;
    };
  };
  content: {
    categories: {
      cacheTtlMs: number;
    };
    announcements: {
      cacheTtlMs: number;
      staleWhileRevalidateMs: number;
    };
  };
  growth: {
    storeReview: {
      triggerGames: number[];
      minMatchPercent: number;
      promptDelayMs: number;
    };
  };
}

const DEFAULT_APP_CONFIG: AppPublicConfig = {
  economy: {
    aiAnalysis: {
      enabled: true,
      coinCost: 3,
    },
    dailyReward: {
      amount: 1,
      intervalMs: 6 * 60 * 60 * 1000,
      claimTimeoutMs: 10000,
    },
    balanceSync: {
      maxRetries: 5,
      retryDelaysMs: [500, 1000, 2000, 3000, 5000],
    },
  },
  gameplay: {
    room: {
      minPlayersToStart: 2,
    },
    defaults: {
      questionDurationSec: 15,
    },
  },
  network: {
    socket: {
      connectTimeoutMs: 10000,
      reconnectAttempts: 5,
      reconnectDelayMs: 1000,
    },
    rpcTimeoutMs: {
      default: 5000,
      startGame: 10000,
    },
  },
  content: {
    categories: {
      cacheTtlMs: 60 * 60 * 1000,
    },
    announcements: {
      cacheTtlMs: 12 * 60 * 60 * 1000,
      staleWhileRevalidateMs: 24 * 60 * 60 * 1000,
    },
  },
  growth: {
    storeReview: {
      triggerGames: [2, 5, 8],
      minMatchPercent: 60,
      promptDelayMs: 1500,
    },
  },
};

let currentConfig: AppPublicConfig = DEFAULT_APP_CONFIG;

const deepMerge = <T extends Record<string, any>>(
  target: T,
  source?: Partial<T>
): T => {
  if (!source) return target;
  const result: Record<string, any> = { ...target };
  for (const key of Object.keys(source)) {
    const sourceValue = source[key];
    const targetValue = result[key];
    if (
      sourceValue &&
      typeof sourceValue === "object" &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === "object" &&
      !Array.isArray(targetValue)
    ) {
      result[key] = deepMerge(targetValue, sourceValue as Record<string, any>);
    } else if (sourceValue !== undefined) {
      result[key] = sourceValue;
    }
  }
  return result as T;
};

export const loadAppConfig = async (): Promise<AppPublicConfig> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/config/public`);
    if (!response.ok) {
      return currentConfig;
    }
    const data = (await response.json()) as Partial<AppPublicConfig>;
    currentConfig = deepMerge(DEFAULT_APP_CONFIG, data);
  } catch (error) {
    console.warn("Failed to load app config:", error);
  }
  return currentConfig;
};

export const getAppConfig = (): AppPublicConfig => currentConfig;
