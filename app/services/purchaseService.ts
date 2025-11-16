import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";
import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
  PurchasesOffering,
  PurchasesPackage,
} from "react-native-purchases";

const REVENUECAT_API_KEY_IOS =
  Constants.expoConfig?.extra?.revenueCatApiKeyIOS || "";
const REVENUECAT_API_KEY_ANDROID =
  Constants.expoConfig?.extra?.revenueCatApiKeyAndroid || "";

const getRevenueCatApiKey = (): string => {
  if (Platform.OS === "ios") {
    return REVENUECAT_API_KEY_IOS;
  } else if (Platform.OS === "android") {
    return REVENUECAT_API_KEY_ANDROID;
  }
  return "";
};

class PurchaseService {
  private isInitialized = false;
  private currentAppUserId: string | null = null;

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log("✅ PurchaseService already initialized");
      return;
    }

    // RevenueCat doesn't work on web
    if (Platform.OS === "web") {
      console.log("⚠️ RevenueCat is not supported on web platform");
      return;
    }

    try {
      Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

      const apiKey = getRevenueCatApiKey();

      if (!apiKey || apiKey === "") {
        console.warn(
          `⚠️ RevenueCat API key not set for ${
            Platform.OS
          }. Please add REVENUECAT_API_KEY_${Platform.OS.toUpperCase()}.`
        );
        return;
      }

      const appUserID = await this.getOrCreateAppUserId();
      this.currentAppUserId = appUserID;

      if (Platform.OS === "ios") {
        Purchases.configure({
          apiKey,
          appUserID,
        });
      } else if (Platform.OS === "android") {
        Purchases.configure({
          apiKey,
          appUserID,
        });
      }

      this.isInitialized = true;
      this.getOfferings();
      console.log(`✅ RevenueCat initialized successfully for ${Platform.OS}`);
    } catch (error) {
      console.error("❌ Error initializing RevenueCat:", error);
      throw error;
    }
  }

  async getOfferings(): Promise<PurchasesOffering | null> {
    if (Platform.OS === "web") {
      return null;
    }

    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const offerings = await Purchases.getOfferings();
      console.log("📦 All offerings:", JSON.stringify(offerings, null, 2));
      console.log("📦 Current offering:", offerings.current?.identifier);
      console.log(
        "📦 Available packages:",
        offerings.current?.availablePackages.length || 0
      );

      if (offerings.current?.availablePackages) {
        offerings.current.availablePackages.forEach((pkg, index) => {
          console.log(`📦 Package ${index + 1}:`, {
            identifier: pkg.identifier,
            productId: pkg.product.identifier,
            price: pkg.product.priceString,
          });
        });
      }

      // Collect all packages from all offerings, removing duplicates by product identifier
      const packageMap = new Map<string, PurchasesPackage>();

      // Add packages from current offering
      if (offerings.current?.availablePackages) {
        offerings.current.availablePackages.forEach((pkg) => {
          const productId = pkg.product.identifier;
          if (!packageMap.has(productId)) {
            packageMap.set(productId, pkg);
          }
        });
      }

      // Add packages from all other offerings
      if (offerings.all) {
        Object.values(offerings.all).forEach((offering) => {
          if (
            offering &&
            offering !== offerings.current &&
            offering.availablePackages
          ) {
            offering.availablePackages.forEach((pkg) => {
              const productId = pkg.product.identifier;
              if (!packageMap.has(productId)) {
                packageMap.set(productId, pkg);
              }
            });
          }
        });
      }

      // Convert map to array
      const allPackages = Array.from(packageMap.values());

      // Create a combined offering with all packages
      if (allPackages.length > 0 && offerings.current) {
        return {
          ...offerings.current,
          availablePackages: allPackages,
        };
      }

      return offerings.current;
    } catch (error) {
      console.error("❌ Error fetching offerings:", error);
      return null;
    }
  }

  async purchasePackage(
    packageToPurchase: PurchasesPackage
  ): Promise<CustomerInfo> {
    if (Platform.OS === "web") {
      throw new Error("Purchases are not supported on web platform");
    }

    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const { customerInfo } = await Purchases.purchasePackage(
        packageToPurchase
      );

      return customerInfo;
    } catch (error: any) {
      console.error("❌ Purchase error:", error);

      if (error.code === "PURCHASE_CANCELLED") {
        throw new Error("Purchase cancelled by user");
      }

      throw error;
    }
  }

  async restorePurchases(): Promise<CustomerInfo> {
    if (Platform.OS === "web") {
      throw new Error("Purchases are not supported on web platform");
    }

    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const customerInfo = await Purchases.restorePurchases();
      console.log("✅ Purchases restored:", customerInfo);
      return customerInfo;
    } catch (error) {
      console.error("❌ Error restoring purchases:", error);
      throw error;
    }
  }

  async getCustomerInfo(): Promise<CustomerInfo> {
    if (Platform.OS === "web") {
      throw new Error("Purchases are not supported on web platform");
    }

    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      return await Purchases.getCustomerInfo();
    } catch (error) {
      console.error("❌ Error getting customer info:", error);
      throw error;
    }
  }

  async getAppUserId(): Promise<string> {
    if (this.currentAppUserId) {
      return this.currentAppUserId;
    }

    const appUserId = await this.getOrCreateAppUserId();
    this.currentAppUserId = appUserId;
    return appUserId;
  }

  private async getOrCreateAppUserId(): Promise<string> {
    try {
      const storedAppUserId = await AsyncStorage.getItem(
        PurchaseService.APP_USER_ID_STORAGE_KEY
      );

      if (storedAppUserId) {
        this.currentAppUserId = storedAppUserId;
        return storedAppUserId;
      }

      const newAppUserId = this.generateAnonymousAppUserId();
      await AsyncStorage.setItem(
        PurchaseService.APP_USER_ID_STORAGE_KEY,
        newAppUserId
      );
      this.currentAppUserId = newAppUserId;
      return newAppUserId;
    } catch {
      console.warn(
        "⚠️ Unable to read/write RevenueCat appUserId from AsyncStorage. Falling back to anonymous ID in memory."
      );
      const fallbackId = this.generateAnonymousAppUserId();
      this.currentAppUserId = fallbackId;
      return fallbackId;
    }
  }

  private generateAnonymousAppUserId(): string {
    const randomUuid =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;

    return `anon-${randomUuid}`;
  }

  private static readonly APP_USER_ID_STORAGE_KEY =
    "@knowusbetter/revenuecat-app-user-id";
}

export const purchaseService = new PurchaseService();
