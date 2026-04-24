import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import Constants from "expo-constants";
import { UserPreferencesService } from "../../services/userPreferencesService";
import CoinPurchaseModal from "../coins/CoinPurchaseModal";
import LanguageSelector from "../settings/LanguageSelector";
import LoadingScreen from "../ui/LoadingScreen";
import OnboardingStep1 from "./OnboardingStep1";
import OnboardingStep2 from "./OnboardingStep2";
import OnboardingStep3 from "./OnboardingStep3";
import RateAppFeedbackModal from "../profile/RateAppFeedbackModal";
import SettingsButton from "../settings/SettingsButton";
import SettingsModal from "../settings/SettingsModal";

const OnboardingSteps = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const [isPurchaseModalVisible, setIsPurchaseModalVisible] = useState(false);
  const [isRateAppModalVisible, setIsRateAppModalVisible] = useState(false);
  const headerTop = Math.max(Constants.statusBarHeight + 12, 16);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    // In development mode, always show onboarding (skip check)
    if (__DEV__) {
      setIsLoading(false);
      return;
    }

    try {
      const hasCompleted =
        await UserPreferencesService.hasCompletedOnboarding();
      if (hasCompleted) {
        // User has already completed onboarding, redirect to StartOptionsScreen
        router.replace("/StartOptionsScreen");
      } else {
        // Show onboarding
        setIsLoading(false);
      }
    } catch (error) {
      console.warn("⚠️ Failed to check onboarding status:", error);
      // If error, show onboarding anyway
      setIsLoading(false);
    }
  };

  const handleStep1Next = () => {
    setCurrentStep(2);
  };

  const handleStep2Next = () => {
    setCurrentStep(3);
  };

  const handleStep2Previous = () => {
    setCurrentStep(1);
  };

  const handleStep3Next = () => {
    completeOnboarding();
  };

  const handleStep3Previous = () => {
    setCurrentStep(2);
  };

  const completeOnboarding = async () => {
    // In development mode, skip saving completion status
    if (!__DEV__) {
      try {
        await UserPreferencesService.setOnboardingCompleted(true);
      } catch (error) {
        console.warn("⚠️ Failed to save onboarding completion:", error);
      }
    }
    router.replace("/StartOptionsScreen");
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Render current step
  return (
    <View className="flex-1 relative">
      {/* Top bar with Language Selector and Settings */}
      <View
        className="absolute right-6 flex-row  items-center justify-end z-50 gap-4"
        style={{ top: headerTop }}
      >
        <LanguageSelector position="none" />
        <SettingsButton onPress={() => setIsSettingsModalVisible(true)} />
      </View>

      {/* Current step content */}
      {(() => {
        switch (currentStep) {
          case 1:
            return <OnboardingStep1 onNext={handleStep1Next} />;
          case 2:
            return (
              <OnboardingStep2
                onNext={handleStep2Next}
                onPrevious={handleStep2Previous}
              />
            );
          case 3:
            return (
              <OnboardingStep3
                onNext={handleStep3Next}
                onPrevious={handleStep3Previous}
              />
            );
          default:
            return <OnboardingStep1 onNext={handleStep1Next} />;
        }
      })()}

      {/* Settings Modal */}
      <SettingsModal
        visible={isSettingsModalVisible}
        onClose={() => setIsSettingsModalVisible(false)}
        onBuyCoins={() => {
          setIsSettingsModalVisible(false);
          setIsPurchaseModalVisible(true);
        }}
        onRequestRateApp={() => setIsRateAppModalVisible(true)}
      />

      {/* Coin Purchase Modal */}
      <CoinPurchaseModal
        visible={isPurchaseModalVisible}
        onClose={() => setIsPurchaseModalVisible(false)}
      />

      <RateAppFeedbackModal
        visible={isRateAppModalVisible}
        onClose={() => setIsRateAppModalVisible(false)}
      />
    </View>
  );
};

export default OnboardingSteps;
