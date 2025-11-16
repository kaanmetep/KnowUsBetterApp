const { withNativeWind } = require("nativewind/metro");
const { getSentryExpoConfig } = require("@sentry/react-native/metro");

const config = getSentryExpoConfig(__dirname);

// Resolve Firebase modules to stub in Expo Go
const originalResolveRequest = config.resolver?.resolveRequest;
const path = require("path");
config.resolver = config.resolver || {};
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Redirect Firebase modules to stub in Expo Go
  if (moduleName.startsWith("@react-native-firebase/")) {
    return {
      type: "sourceFile",
      filePath: path.resolve(__dirname, "app/services/firebaseStub.js"),
    };
  }

  // Use original resolver for other modules
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./app/globals.css" });
