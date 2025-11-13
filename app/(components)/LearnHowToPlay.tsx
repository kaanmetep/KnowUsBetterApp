import { FontAwesome5, FontAwesome6 } from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface LearnHowToPlayProps {
  visible: boolean;
  onClose: () => void;
}

type Step = 1 | 2 | 3;

const steps = [
  {
    id: 1,
    iconName: "user-group",
    iconType: "FontAwesome6",
    title: "Create or Join a Room",
    description: "Create a room or join your friend's room.",
  },
  {
    id: 2,
    iconName: "question-circle",
    iconType: "FontAwesome5",
    title: "Answer Questions",
    description: "Answer questions to get to know your partner better.",
  },
  {
    id: 3,
    iconName: "heart",
    iconType: "FontAwesome5",
    title: "Check Your Match",
    description: "See your match percentage with your partner!",
  },
];

const LearnHowToPlay: React.FC<LearnHowToPlayProps> = ({
  visible,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleClose = () => {
    setCurrentStep(1);
    slideAnim.setValue(0);
    fadeAnim.setValue(1);
    onClose();
  };

  const animateTransition = (newStep: Step, direction: "next" | "prev") => {
    // Fade out and slide
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: direction === "next" ? -30 : 30,
        duration: 150,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Change content in the middle
      setCurrentStep(newStep);

      // Reset position for fade in
      slideAnim.setValue(direction === "next" ? 30 : -30);

      // Fade in and slide back
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 150,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleNext = () => {
    if (currentStep < 3) {
      animateTransition((currentStep + 1) as Step, "next");
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      animateTransition((currentStep - 1) as Step, "prev");
    }
  };

  const handleStepClick = (step: Step) => {
    if (step !== currentStep) {
      animateTransition(step, step > currentStep ? "next" : "prev");
    }
  };

  const currentStepData = steps[currentStep - 1];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable
        className="flex-1 bg-black/50 justify-center items-center px-6"
        onPress={handleClose}
      >
        <Pressable
          className="w-full max-w-[400px]"
          onPress={(e) => e.stopPropagation()}
        >
          {/* Modal Container */}
          <View className="relative">
            {/* Shadow */}
            <View className="absolute top-[4px] left-[4px] right-[-4px] bottom-[-4px] bg-gray-900 rounded-2xl" />

            {/* Modal Content */}
            <View className="relative bg-primary border-4 border-gray-900 rounded-2xl p-6">
              {/* Close Button */}
              <TouchableOpacity
                onPress={handleClose}
                className="absolute top-4 right-4 z-10"
              >
                <View className="relative">
                  <View className="absolute top-[1px] left-[1px] right-[-1px] bottom-[-1px] bg-gray-900 rounded-full" />
                  <View className="relative bg-white border-2 border-gray-900 rounded-full w-8 h-8 items-center justify-center">
                    <Text className="text-gray-900 text-lg font-bold">×</Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Step Indicator */}
              <View className="flex-row justify-center gap-2 mb-6">
                {[1, 2, 3].map((step) => (
                  <TouchableOpacity
                    key={step}
                    onPress={() => handleStepClick(step as Step)}
                    activeOpacity={0.8}
                  >
                    <View
                      className={`w-8 h-2 rounded-full ${
                        currentStep === step
                          ? "bg-[#ffe4e6] border-2"
                          : "bg-gray-300"
                      } border-gray-900`}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Header */}
              <Text
                className="text-2xl font-bold text-gray-900 text-center mb-6"
                style={{ fontFamily: "MerriweatherSans_700Bold" }}
              >
                How to Play
              </Text>

              {/* Animated Card Content */}
              <Animated.View
                style={{
                  opacity: fadeAnim,
                  transform: [{ translateX: slideAnim }],
                }}
              >
                {/* Icon */}
                <View className="items-center mb-4">
                  <View className="relative">
                    <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-2xl" />
                    <View className="relative bg-white border-4 border-gray-900 rounded-2xl w-20 h-20 items-center justify-center">
                      {currentStepData.iconType === "FontAwesome6" ? (
                        <FontAwesome6
                          name={currentStepData.iconName as any}
                          size={36}
                          color="#1f2937"
                        />
                      ) : (
                        <FontAwesome5
                          name={currentStepData.iconName as any}
                          size={36}
                          color="#1f2937"
                        />
                      )}
                    </View>
                  </View>
                </View>

                {/* Step Title */}
                <Text
                  className="text-xl font-bold text-gray-900 text-center mb-3"
                  style={{ fontFamily: "MerriweatherSans_700Bold" }}
                >
                  {currentStepData.title}
                </Text>

                {/* Step Description */}
                <Text
                  className="text-sm text-gray-600 text-center mb-6 leading-6"
                  style={{ fontFamily: "MerriweatherSans_400Regular" }}
                >
                  {currentStepData.description}
                </Text>

                {/* Step Counter */}
                <View className="flex-row justify-center mb-6">
                  <View className="bg-gray-100 border-2 border-gray-900 rounded-full px-4 py-1">
                    <Text
                      className="text-gray-900 font-semibold"
                      style={{ fontFamily: "MerriweatherSans_700Bold" }}
                    >
                      Step {currentStep} of 3
                    </Text>
                  </View>
                </View>
              </Animated.View>

              {/* Navigation Buttons */}
              <View className="flex-row justify-between items-center gap-3">
                {/* Previous Button */}
                <TouchableOpacity
                  onPress={handlePrev}
                  disabled={currentStep === 1}
                  className="flex-1"
                >
                  <View className="relative">
                    <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-xl" />
                    <View
                      className={`relative border-2 border-gray-900 rounded-xl py-3 px-4 flex-row items-center justify-center gap-2 ${
                        currentStep === 1 ? "bg-gray-200" : "bg-white"
                      }`}
                    >
                      <Ionicons
                        name="arrow-back"
                        size={18}
                        color={currentStep === 1 ? "#9ca3af" : "#1a1a1a"}
                      />
                      <Text
                        className={`font-semibold ${
                          currentStep === 1 ? "text-gray-400" : "text-gray-900"
                        }`}
                        style={{ fontFamily: "MerriweatherSans_700Bold" }}
                      >
                        Previous
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Next/Got It Button */}
                <TouchableOpacity
                  onPress={currentStep === 3 ? handleClose : handleNext}
                  className="flex-1"
                >
                  <View className="relative">
                    <View className="absolute top-[2px] left-[2px] right-[-2px] bottom-[-2px] bg-gray-900 rounded-xl" />
                    <View className="relative bg-[#ffe4e6] border-2 border-gray-900 rounded-xl py-3 px-4 flex-row items-center justify-center gap-2">
                      <Text
                        className="text-gray-900 font-semibold"
                        style={{ fontFamily: "MerriweatherSans_700Bold" }}
                      >
                        {currentStep === 3 ? "Got it!" : "Next"}
                      </Text>
                      {currentStep !== 3 && (
                        <Ionicons
                          name="arrow-forward"
                          size={18}
                          color="#1a1a1a"
                        />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default LearnHowToPlay;
