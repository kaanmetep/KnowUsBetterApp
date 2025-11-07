import * as Linking from "expo-linking";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { LanguageProvider } from "./contexts/LanguageContext";
import "./globals.css";

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
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
      <Stack screenOptions={{ headerShown: false }} />
    </LanguageProvider>
  );
}
