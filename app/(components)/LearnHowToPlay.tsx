import { FontAwesome5, FontAwesome6 } from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "../hooks/useTranslation";

interface LearnHowToPlayProps {
  visible: boolean;
  onClose: () => void;
}

type Step = 1 | 2 | 3;

const COLORS = {
  primaryDark: "#fe9ea2",
  textDark: "#1e293b",
  textLight: "#64748b",
};

const LearnHowToPlay: React.FC<LearnHowToPlayProps> = ({
  visible,
  onClose,
}) => {
  const { t, selectedLanguage } = useTranslation();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const steps = useMemo(
    () => [
      {
        id: 1,
        iconName: "user-group",
        iconType: "FontAwesome6",
        title: t("learnHowToPlay.step1Title"),
        description: t("learnHowToPlay.step1Description"),
      },
      {
        id: 2,
        iconName: "question-circle",
        iconType: "FontAwesome5",
        title: t("learnHowToPlay.step2Title"),
        description: t("learnHowToPlay.step2Description"),
      },
      {
        id: 3,
        iconName: "heart",
        iconType: "FontAwesome5",
        title: t("learnHowToPlay.step3Title"),
        description: t("learnHowToPlay.step3Description"),
      },
    ],
    [t, selectedLanguage]
  );

  const handleClose = () => {
    setCurrentStep(1);
    onClose();
  };

  useEffect(() => {
    if (visible) {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [currentStep, visible]);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const currentStepData = steps[currentStep - 1];

  const softShadowStyle = Platform.select({
    ios: {
      shadowColor: COLORS.textDark,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
    },
    android: {
      elevation: 8,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <Pressable
        className="flex-1 bg-slate-900/60 justify-center items-center px-6"
        onPress={handleClose}
      >
        <Pressable
          className="w-full max-w-[420px] bg-white rounded-[32px] p-8 relative"
          style={softShadowStyle}
          onPress={(e) => e.stopPropagation()}
        >
          <TouchableOpacity
            onPress={handleClose}
            className="absolute top-6 right-6 z-10 bg-slate-100 p-2 rounded-full"
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={22} color={COLORS.textLight} />
          </TouchableOpacity>

          <Text
            className="text-3xl font-bold text-slate-800 text-center mt-4 mb-8"
            style={{ fontFamily: "MerriweatherSans_700Bold" }}
          >
            {t("learnHowToPlay.title")}
          </Text>

          <Animated.View className="items-center" style={{ opacity: fadeAnim }}>
            <View className="mb-6 relative">
              <View
                className="w-24 h-24 rounded-full items-center justify-center"
                style={{ backgroundColor: "#fe9ea240" }}
              >
                {currentStepData.iconType === "FontAwesome6" ? (
                  <FontAwesome6
                    name={currentStepData.iconName as any}
                    size={36}
                    color={COLORS.primaryDark}
                  />
                ) : (
                  <FontAwesome5
                    name={currentStepData.iconName as any}
                    size={36}
                    color={COLORS.primaryDark}
                  />
                )}
              </View>
            </View>

            <Text
              className="text-2xl font-bold text-slate-800 text-center mb-4"
              style={{ fontFamily: "MerriweatherSans_700Bold" }}
            >
              {currentStepData.title}
            </Text>

            <Text
              className="text-base text-slate-600 text-center mb-8 leading-7 px-2"
              style={{ fontFamily: "MerriweatherSans_400Regular" }}
            >
              {currentStepData.description}
            </Text>
          </Animated.View>

          <View className="flex-row justify-center gap-3 mb-8">
            {[1, 2, 3].map((step) => (
              <View
                key={step}
                className={`h-2 rounded-full ${
                  currentStep === step ? "w-8" : "bg-slate-200 w-2"
                }`}
                style={
                  currentStep === step ? { backgroundColor: "#fe9ea2" } : {}
                }
              />
            ))}
          </View>

          <View className="flex-row items-center gap-4">
            <TouchableOpacity
              onPress={handlePrev}
              disabled={currentStep === 1}
              className={`flex-1 py-4 rounded-2xl flex-row items-center justify-center gap-2 ${
                currentStep === 1 ? "opacity-0" : "bg-slate-100"
              }`}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={20} color={COLORS.textDark} />
              <Text
                className="font-bold text-slate-700 text-base"
                style={{ fontFamily: "MerriweatherSans_700Bold" }}
              >
                {t("learnHowToPlay.previous")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={currentStep === 3 ? handleClose : handleNext}
              className="flex-1 py-4 rounded-2xl flex-row items-center justify-center gap-2 shadow-sm"
              style={{
                backgroundColor: "#fe9ea2",
                shadowColor: "#fe9ea2",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3,
              }}
              activeOpacity={0.9}
            >
              <Text
                className="text-white font-bold text-base"
                style={{ fontFamily: "MerriweatherSans_700Bold" }}
              >
                {currentStep === 3
                  ? t("learnHowToPlay.gotIt")
                  : t("learnHowToPlay.next")}
              </Text>
              {currentStep !== 3 && (
                <Ionicons name="arrow-forward" size={20} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default LearnHowToPlay;
