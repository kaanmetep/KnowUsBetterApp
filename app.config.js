require("dotenv").config();

module.exports = {
  expo: {
    name: "KnowUsBetter",
    slug: "KnowUsBetter",
    version: "1.0.4",
    orientation: "portrait",
    icon: "./assets/images/logo.png",
    scheme: "knowusbetter",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.knowusbetter.app",
      buildNumber: "8",
      googleServicesFile: "./GoogleService-Info.plist",
      associatedDomains: ["applinks:knowusbetter.app"],
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSUserNotificationUsageDescription:
          "We use notifications to remind you when daily rewards are ready and to announce new content.",
      },
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/logo.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.knowusbetter.app",
      versionCode: 1,
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "https",
              host: "knowusbetter.app",
              pathPrefix: "/join",
            },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],
    },
    web: {
      output: "static",
      favicon: "./assets/images/logo.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/logo.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000",
          },
        },
      ],
      "expo-font",
      [
        "expo-media-library",
        {
          photosPermission:
            "Allow KnowUsBetter to save your game results to your photos.",
          savePhotosPermission:
            "Allow KnowUsBetter to save your game results to your photos.",
          isAccessMediaLocationEnabled: true,
        },
      ],
      [
        "expo-notifications",
        {
          sounds: [],
        },
      ],
      [
        "./plugins/withLocalizedIosNotificationsPermission",
        {
          translations: {
            en: "We use notifications to remind you when daily rewards are ready and to announce new content.",
            tr: "Günlük ödülleriniz hazır olduğunda sizi bilgilendirmek ve yeni içerikleri duyurmak için bildirimleri kullanıyoruz.",
            es: "Usamos notificaciones para avisarte cuando tus recompensas diarias estén listas y para anunciar contenido nuevo.",
          },
        },
      ],
      "@sentry/react-native",
      "expo-localization",
      "expo-web-browser",
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: "1b13a2b1-07c3-4edd-a098-5bf4c6931d22",
      },
      revenueCatApiKeyIOS:
        process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS ||
        process.env.REVENUECAT_API_KEY_IOS ||
        "",
      revenueCatApiKeyAndroid:
        process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID ||
        process.env.REVENUECAT_API_KEY_ANDROID ||
        "",
      environment:
        process.env.EXPO_PUBLIC_ENVIRONMENT ||
        process.env.ENVIRONMENT ||
        "",
      supabaseUrl: (() => {
        const env = process.env.EXPO_PUBLIC_ENVIRONMENT || process.env.ENVIRONMENT || "";
        if (env === "dev") {
          return process.env.EXPO_PUBLIC_SUPABASE_URL_DEV ||
            process.env.SUPABASE_URL_DEV ||
            process.env.EXPO_PUBLIC_SUPABASE_URL ||
            process.env.SUPABASE_URL ||
            "";
        }
        return process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
      })(),
      supabaseAnonKey: (() => {
        const env = process.env.EXPO_PUBLIC_ENVIRONMENT || process.env.ENVIRONMENT || "";
        if (env === "dev") {
          return process.env.EXPO_PUBLIC_SUPABASE_KEY_DEV ||
            process.env.SUPABASE_ANON_KEY_DEV ||
            process.env.EXPO_PUBLIC_SUPABASE_KEY ||
            process.env.SUPABASE_ANON_KEY ||
            "";
        }
        return process.env.EXPO_PUBLIC_SUPABASE_KEY ||
          process.env.SUPABASE_ANON_KEY ||
          "";
      })(),
      backendUrl: (() => {
        const env = process.env.EXPO_PUBLIC_ENVIRONMENT || process.env.ENVIRONMENT || "";
        if (env === "dev") {
          return process.env.EXPO_PUBLIC_BACKEND_URL || "http://192.168.1.133:3000";
        }
        return process.env.EXPO_PUBLIC_BACKEND_URL || "https://knowusbetterapp-backend.onrender.com";
      })(),
    },
    runtimeVersion: {
      policy: "appVersion",
    },
    updates: {
      url: "https://u.expo.dev/1b13a2b1-07c3-4edd-a098-5bf4c6931d22",
    },
  },
};
