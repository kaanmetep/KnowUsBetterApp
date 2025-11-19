require("dotenv").config();

module.exports = {
  expo: {
    name: "KnowUsBetter",
    slug: "KnowUsBetter",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/logo.png",
    scheme: "knowusbetter",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.knowusbetter.app",
      buildNumber: "3",
      googleServicesFile: "./GoogleService-Info.plist",
      associatedDomains: ["applinks:knowusbetter.app"],
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
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
        "@react-native-firebase/app",
        {
          android: {
            googleServicesFile: "./google-services.json",
          },
          ios: {
            googleServicesFile: "./GoogleService-Info.plist",
          },
        },
      ],
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
      supabaseUrl:
        process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "",
      supabaseAnonKey:
        process.env.EXPO_PUBLIC_SUPABASE_KEY ||
        process.env.SUPABASE_ANON_KEY ||
        "",
      backendUrl:
        process.env.EXPO_PUBLIC_BACKEND_URL ||
        process.env.BACKEND_URL ||
        "https://knowusbetterapp-backend.onrender.com",
    },
    runtimeVersion: {
      policy: "appVersion",
    },
    updates: {
      url: "https://u.expo.dev/1b13a2b1-07c3-4edd-a098-5bf4c6931d22",
    },
  },
};
