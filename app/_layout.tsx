import Constants from "expo-constants";
import * as Linking from "expo-linking";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { CoinProvider } from "./contexts/CoinContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import "./globals.css";
import { AnalyticsService } from "./services/analyticsService";
import { purchaseService } from "./services/purchaseService";

// Only initialize Sentry in development/production builds (not in Expo Go)
const isExpoGo = Constants.executionEnvironment === "storeClient";
let Sentry: any = null;

if (!isExpoGo) {
  try {
    Sentry = require("@sentry/react-native");
    Sentry.init({
      dsn: "https://b8a5647efe4cca95caa9a4c0cf76eb84@o4510375600521216.ingest.us.sentry.io/4510375610482688",
      sendDefaultPii: true,
      enableLogs: true,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1,
      integrations: [Sentry.mobileReplayIntegration()],
    });
  } catch (error) {
    console.warn("⚠️ Sentry not available:", error);
  }
}

function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    // Initialize RevenueCat
    purchaseService.initialize().catch((error) => {
      console.error("Failed to initialize RevenueCat:", error);
    });

    // Initialize Firebase Analytics and set user ID
    const initializeAnalytics = async () => {
      try {
        // Set user ID if available
        const userId = await purchaseService.getAppUserId();
        if (userId) {
          await AnalyticsService.setUserId(userId);
        }
        // Log app open event
        await AnalyticsService.logEvent("app_open");
      } catch (error) {
        console.warn("⚠️ Failed to initialize analytics:", error);
      }
    };
    initializeAnalytics();

    // Handle deep linking when app is opened from a link
    const handleDeepLink = (event: { url: string }) => {
      const { hostname, path, queryParams } = Linking.parse(event.url);

      // - https://knowusbetter.app/join/ABC123
      if ((hostname === "join" || hostname === "knowusbetter.app") && path) {
        // Extract room code from path
        const pathParts = path.split("/").filter(Boolean);
        const roomCode = pathParts[pathParts.length - 1] || pathParts[0];

        if (roomCode) {
          // Small delay to ensure router is mounted
          setTimeout(() => {
            router.push({
              pathname: "/GameRoom",
              params: {
                roomCode: roomCode,
                category: "unknown",
                hostName: "Guest",
                isHost: "false",
              },
            });
          }, 200);
        }
      }
    };

    // Check if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    // Listen for deep links while app is running
    const subscription = Linking.addEventListener("url", handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, [router]);

  return (
    <LanguageProvider>
      <CoinProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </CoinProvider>
    </LanguageProvider>
  );
}

// Wrap with Sentry only if available (not in Expo Go)
export default Sentry && Sentry.wrap ? Sentry.wrap(RootLayout) : RootLayout;
