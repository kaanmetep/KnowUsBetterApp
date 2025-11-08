import {
  MerriweatherSans_400Regular,
  MerriweatherSans_700Bold,
} from "@expo-google-fonts/merriweather-sans";
import { useFonts } from "@expo-google-fonts/merriweather-sans/useFonts";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Platform } from "react-native";
import GamePlay from "../(components)/GamePlay";
import WaitingRoom from "../(components)/WaitingRoom";
import socketService, { Room } from "../services/socketService";

const GameRoom = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Only get roomCode from params
  const roomCode = (params.roomCode as string) || "DEMO123";

  const [room, setRoom] = useState<Room | null>(null);

  // Game state
  const [gameState, setGameState] = useState<
    "waiting" | "playing" | "finished"
  >("waiting");
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [opponentAnswered, setOpponentAnswered] = useState(false);

  let [fontsLoaded] = useFonts({
    MerriweatherSans_400Regular,
    MerriweatherSans_700Bold,
  });

  // Socket.io event listeners
  useEffect(() => {
    console.log("🎮 GameRoom mounted - roomCode:", roomCode);

    // Load current room data on mount
    const loadRoomData = async () => {
      try {
        const roomData = await socketService.getRoom(roomCode);
        console.log("📋 Current room data loaded:", roomData);
        setRoom(roomData);
      } catch (error) {
        console.error("❌ Failed to load room data:", error);
      }
    };

    loadRoomData();

    // New player joined
    const handlePlayerJoined = (data: any) => {
      console.log("👥 New player joined:", data);

      if (data.room) {
        setRoom(data.room);

        // Show notification
        if (Platform.OS === "web") {
          alert(`🎉 New Player! ${data.player.name} joined the room!`);
        } else {
          Alert.alert("🎉 New Player!", `${data.player.name} joined the room!`);
        }
      }
    };

    // Player left
    const handlePlayerLeft = (data: any) => {
      console.log("🚪 Player left:", data);

      if (data.room) {
        setRoom(data.room);
      }
    };

    // Game started
    const handleGameStarted = (data: any) => {
      console.log("🎮 Game started!", data);
      console.log("📊 Current question:", data.question);
      console.log("📊 Total questions:", data.totalQuestions);

      if (data.room) {
        setRoom(data.room);
      }
      setGameState("playing");
      setCurrentQuestion(data.question);
      setTotalQuestions(data.totalQuestions);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setHasSubmitted(false);
      setOpponentAnswered(false);

      console.log("✅ State updated - gameState should be 'playing'");
    };

    // Player answered
    const handlePlayerAnswered = (data: any) => {
      console.log("✅ Player answered:", data);
      setOpponentAnswered(true);
    };

    // Round completed
    const handleRoundCompleted = (data: any) => {
      console.log("🎯 Round completed:", data);
      // TODO: Show round results with match/no match
      // Reset for next question
      setSelectedAnswer(null);
      setHasSubmitted(false);
      setOpponentAnswered(false);
    };

    // Next question
    const handleNextQuestion = (data: any) => {
      console.log("➡️ Next question:", data);
      setCurrentQuestion(data.question);
      setCurrentQuestionIndex(data.currentQuestionIndex);
      setSelectedAnswer(null);
      setHasSubmitted(false);
      setOpponentAnswered(false);
    };

    // Game finished
    const handleGameFinished = (data: any) => {
      console.log("🏁 Game finished!", data);
      setGameState("finished");
      // TODO: Navigate to results screen with final percentage
    };

    // Register event listeners
    socketService.onPlayerJoined(handlePlayerJoined);
    socketService.onPlayerLeft(handlePlayerLeft);
    socketService.onGameStarted(handleGameStarted);
    socketService.onPlayerAnswered(handlePlayerAnswered);
    socketService.onRoundCompleted(handleRoundCompleted);
    socketService.onNextQuestion(handleNextQuestion);
    socketService.onGameFinished(handleGameFinished);

    // Cleanup - remove event listeners when component unmounts
    return () => {
      console.log("🧹 GameRoom cleanup");
      socketService.offPlayerJoined(handlePlayerJoined);
      socketService.offPlayerLeft(handlePlayerLeft);
      socketService.offGameStarted(handleGameStarted);
      socketService.offPlayerAnswered(handlePlayerAnswered);
      socketService.offRoundCompleted(handleRoundCompleted);
      socketService.offNextQuestion(handleNextQuestion);
      socketService.offGameFinished(handleGameFinished);
    };
  }, [roomCode]);

  // Get socket ID
  const mySocketId = socketService.getSocket()?.id;

  // Handlers
  const handleLeaveRoom = async () => {
    const confirmLeave = async () => {
      try {
        await socketService.leaveRoom(roomCode);
        console.log("✅ Successfully left the room");
        router.back();
      } catch (error) {
        console.error("❌ Error leaving room:", error);
        // Even if error occurs, go back
        router.back();
      }
    };

    // Web platform uses window.confirm
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Are you sure you want to leave this room?"
      );
      if (confirmed) {
        await confirmLeave();
      }
    } else {
      // Mobile platforms use Alert
      Alert.alert(
        "Leave Room",
        "Are you sure you want to leave this room?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Leave",
            style: "destructive",
            onPress: confirmLeave,
          },
        ],
        { cancelable: true }
      );
    }
  };

  const handleStartGame = async () => {
    const canStartGame = (room?.players?.length || 0) >= 2;
    if (canStartGame) {
      try {
        console.log("🎮 Starting game");
        await socketService.startGame(roomCode);
      } catch (error: any) {
        console.error("❌ Error starting game:", error);
        if (Platform.OS === "web") {
          window.alert(error?.message || "Failed to start game");
        } else {
          Alert.alert("Error", error?.message || "Failed to start game");
        }
      }
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer && currentQuestion && !hasSubmitted) {
      console.log("📝 Submitting answer:", selectedAnswer);
      socketService.submitAnswer(currentQuestion.id, selectedAnswer);
      setHasSubmitted(true);
    }
  };

  const handleSelectAnswer = (answer: string) => {
    setSelectedAnswer(answer);
  };

  // Loading state
  if (!fontsLoaded || !room) {
    return null;
  }

  // Debug render logic
  console.log("🔍 Render check:", {
    gameState,
    hasQuestion: !!currentQuestion,
    questionText: currentQuestion?.text,
  });

  // Render game play screen
  if (gameState === "playing" && currentQuestion) {
    console.log("🎮 Rendering GamePlay component");
    return (
      <GamePlay
        currentQuestion={currentQuestion}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={totalQuestions}
        selectedAnswer={selectedAnswer}
        hasSubmitted={hasSubmitted}
        opponentAnswered={opponentAnswered}
        onSelectAnswer={handleSelectAnswer}
        onSubmitAnswer={handleSubmitAnswer}
      />
    );
  }

  // Render waiting room
  console.log("⏳ Rendering WaitingRoom component");
  return (
    <WaitingRoom
      room={room}
      roomCode={roomCode}
      mySocketId={mySocketId}
      onStartGame={handleStartGame}
      onLeaveRoom={handleLeaveRoom}
    />
  );
};

export default GameRoom;
