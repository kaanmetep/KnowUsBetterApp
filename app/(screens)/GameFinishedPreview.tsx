import React from "react";
import { ScrollView, View } from "react-native";
import GameFinished from "../(components)/GameFinished";

const mockCompletedRounds = [
  {
    question: { text: "Do you prefer coffee or tea?" },
    isMatched: false,
  },
  {
    question: { text: "Are you a morning person or a night owl?" },
    isMatched: false,
  },
  {
    question: { text: "Do you enjoy cooking?" },
    isMatched: true,
  },
  {
    question: { text: "Do you like to travel?" },
    isMatched: false,
  },
  {
    question: { text: "Are you an introvert or an extrovert?" },
    isMatched: false,
  },
  {
    question: { text: "Do you prefer mountains or beaches?" },
    isMatched: true,
  },
  {
    question: { text: "Do you like spicy food?" },
    isMatched: true,
  },
  {
    question: { text: "Are you a cat person or a dog person?" },
    isMatched: false,
  },
  {
    question: { text: "Do you enjoy reading books?" },
    isMatched: true,
  },
  {
    question: { text: "Do you like to exercise regularly?" },
    isMatched: true,
  },
];

const GameFinishedPreview = () => {
  return (
    <View className="flex-1 bg-primary">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View>
          <GameFinished
            matchScore={7}
            totalQuestions={10}
            percentage={80}
            completedRounds={mockCompletedRounds}
            displayDuration={30}
            currentPlayerName="Alice"
            opponentPlayerName="Bob"
            onComplete={() => console.log("GameFinishedPreview complete")}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default GameFinishedPreview;
