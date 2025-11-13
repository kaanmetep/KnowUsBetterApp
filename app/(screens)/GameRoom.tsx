import {
  MerriweatherSans_400Regular,
  MerriweatherSans_700Bold,
} from "@expo-google-fonts/merriweather-sans";
import { useFonts } from "@expo-google-fonts/merriweather-sans/useFonts";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Alert, AppState, AppStateStatus, Platform } from "react-native";
import Countdown from "../(components)/Countdown";
import GameFinished from "../(components)/GameFinished";
import GamePlay from "../(components)/GamePlay";
import WaitingRoom from "../(components)/WaitingRoom";
import { useCoins } from "../contexts/CoinContext";
import socketService, { Room } from "../services/socketService";

const GameRoom = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { spendCoins } = useCoins();

  // Only get roomCode from params
  const roomCode = (params.roomCode as string) || "DEMO123";

  // Category coin requirements mapping
  const getCategoryCoinsRequired = (categoryId: string): number => {
    const categoryCoinsMap: Record<string, number> = {
      just_friends: 0,
      we_just_met: 0,
      long_term: 1,
      spicy: 2,
    };
    return categoryCoinsMap[categoryId] || 0;
  };

  const [room, setRoom] = useState<Room | null>(null);

  // Game state
  const [gameState, setGameState] = useState<
    "waiting" | "countdown" | "playing" | "finished"
  >("waiting");
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionDuration, setQuestionDuration] = useState<number>(15); // Default 15 seconds
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [opponentAnswered, setOpponentAnswered] = useState(false);
  const [opponentName, setOpponentName] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [roundResult, setRoundResult] = useState<any>(null);
  const [gameFinishedData, setGameFinishedData] = useState<{
    matchScore: number;
    totalQuestions: number;
    percentage: number;
    completedRounds: any[];
  } | null>(null);

  // Track when app goes to background
  const backgroundTimeRef = useRef<number | null>(null);

  let [fontsLoaded] = useFonts({
    MerriweatherSans_400Regular,
    MerriweatherSans_700Bold,
  });

  // Socket.io event listeners and cleanup
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
      console.log("⏱️ Question duration:", data.duration);

      if (data.room) {
        setRoom(data.room);
      }
      setGameState("countdown");
      setCurrentQuestion(data.question);
      setTotalQuestions(data.totalQuestions);
      setCurrentQuestionIndex(0);
      setQuestionDuration(data.duration || 15); // Default to 15 seconds if not provided
      setSelectedAnswer(null);
      setHasSubmitted(false);
      setOpponentAnswered(false);
      setOpponentName(null);

      console.log("✅ State updated - gameState should be 'countdown'");
    };

    // Player answered
    const handlePlayerAnswered = (data: any) => {
      console.log("✅ Player answered:", data);
      setOpponentAnswered(true);
      if (data.playerName) {
        setOpponentName(data.playerName);
      }
    };

    // Round completed
    const handleRoundCompleted = (data: any) => {
      console.log("🎯 Round completed:", data);
      // Show round results for 5 seconds (backend handles the timing)
      setRoundResult(data);
      setNotifications([]); // Clear notifications when showing round result
      setOpponentName(null); // Clear opponent name when showing round result
    };

    // Next question
    const handleNextQuestion = (data: any) => {
      console.log("➡️ Next question:", data);
      setCurrentQuestion(data.question);
      setCurrentQuestionIndex(data.currentQuestionIndex);
      if (data.duration) {
        setQuestionDuration(data.duration);
      }
      setSelectedAnswer(null);
      setHasSubmitted(false);
      setOpponentAnswered(false);
      setOpponentName(null); // Clear opponent name when moving to next question
      setNotifications([]); // Clear notifications when moving to next question
      setRoundResult(null); // Clear round result for new question
    };

    // Game finished
    const handleGameFinished = (data: any) => {
      console.log("🏁 Game finished!", data);
      setGameState("finished");
      setGameFinishedData({
        matchScore: data.matchScore,
        totalQuestions: data.totalQuestions,
        percentage: data.percentage,
        completedRounds: data.completedRounds || [],
      });
    };

    // Game cancelled (player left during game)
    const handleGameCancelled = (data: any) => {
      console.log("⚠️ Game cancelled:", data);

      // Show alert
      if (Platform.OS === "web") {
        window.alert(
          data.message || "Game was cancelled because a player left."
        );
      } else {
        Alert.alert(
          "Game Cancelled",
          data.message || "Game was cancelled because a player left.",
          [{ text: "OK" }],
          { cancelable: false }
        );
      }

      // Update room state
      if (data.room) {
        setRoom(data.room);
      }

      // Reset game state to waiting
      setGameState("waiting");

      // Clear game data
      setCurrentQuestion(null);
      setTotalQuestions(0);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setHasSubmitted(false);
      setOpponentAnswered(false);
      setOpponentName(null);
      setNotifications([]);
      setRoundResult(null);
      setGameFinishedData(null);
    };

    // Player kicked (for remaining players)
    const handlePlayerKicked = (data: any) => {
      console.log("🚫 Player kicked:", data);
      if (data.room) {
        setRoom(data.room);
      }
    };

    // Kicked from room (for the kicked player)
    const handleKickedFromRoom = (data: any) => {
      console.log("🚫 You were kicked from room:", data);
      const message =
        data.message || "You were kicked from the room by the host.";

      // First, navigate back
      router.back();

      // Then show alert after a short delay to ensure navigation completes
      setTimeout(() => {
        if (Platform.OS === "web") {
          window.alert(message);
        } else {
          Alert.alert("Kicked from Room", message, [{ text: "OK" }], {
            cancelable: false,
          });
        }
      }, 100);
    };

    // Room error handler (for kick errors and other room errors)
    const handleRoomError = (error: any) => {
      console.error("❌ Room error:", error);
      const errorMessage = error?.message || "An error occurred";
      if (Platform.OS === "web") {
        window.alert(errorMessage);
      } else {
        Alert.alert("Error", errorMessage);
      }
    };

    // Critical error handler (redirects to StartOptionsScreen)
    const handleCriticalError = (error: any) => {
      console.error("🔴 Critical error:", error);
      const errorMessage = error?.message || "A critical error occurred";

      // Show alert first
      if (Platform.OS === "web") {
        window.alert(errorMessage);
      } else {
        Alert.alert("Error", errorMessage, [{ text: "OK" }], {
          cancelable: false,
        });
      }

      // Navigate to StartOptionsScreen
      router.replace("/StartOptionsScreen");
    };

    // Register event listeners
    socketService.onPlayerJoined(handlePlayerJoined);
    socketService.onPlayerLeft(handlePlayerLeft);
    socketService.onGameStarted(handleGameStarted);
    socketService.onPlayerAnswered(handlePlayerAnswered);
    socketService.onRoundCompleted(handleRoundCompleted);
    socketService.onNextQuestion(handleNextQuestion);
    socketService.onGameFinished(handleGameFinished);
    socketService.onGameCancelled(handleGameCancelled);
    socketService.onPlayerKicked(handlePlayerKicked);
    socketService.onKickedFromRoom(handleKickedFromRoom);
    socketService.onRoomError(handleRoomError);
    socketService.onCriticalError(handleCriticalError);

    // Handle AppState changes - check room status when app comes to foreground
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === "background" || nextAppState === "inactive") {
        // App went to background - save the time
        backgroundTimeRef.current = Date.now();
      } else if (nextAppState === "active") {
        // App came to foreground - always check room status regardless of time
        if (backgroundTimeRef.current !== null) {
          const timeInBackground = Date.now() - backgroundTimeRef.current;
          console.log(
            "📱 App resumed after",
            timeInBackground,
            "ms - checking room status"
          );

          try {
            // Check if user is still in the room
            const roomData = await socketService.getRoom(roomCode);
            const currentSocketId = socketService.getSocketId();

            // Check if current user is in the room
            const isUserInRoom = roomData.players.some(
              (player) => player.id === currentSocketId
            );

            if (!isUserInRoom) {
              console.log(
                "🚪 User is not in room anymore - redirecting to StartOptionsScreen"
              );
              // User was removed from room, redirect to StartOptionsScreen
              router.replace("/StartOptionsScreen");
            } else {
              // User is still in room, update room state
              setRoom(roomData);
            }
          } catch (error) {
            console.error("❌ Error checking room status:", error);
            // If we can't check room status, assume user was removed
            router.replace("/StartOptionsScreen");
          }

          backgroundTimeRef.current = null;
        }
      }
    };

    const appStateSubscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    // Cleanup - remove event listeners and leave room when component unmounts
    return () => {
      console.log("🧹 GameRoom cleanup - leaving room");

      // Leave room when navigating away
      socketService.leaveRoom(roomCode).catch((error) => {
        console.error("❌ Error leaving room during cleanup:", error);
      });

      // Remove event listeners
      socketService.offPlayerJoined(handlePlayerJoined);
      socketService.offPlayerLeft(handlePlayerLeft);
      socketService.offGameStarted(handleGameStarted);
      socketService.offPlayerAnswered(handlePlayerAnswered);
      socketService.offRoundCompleted(handleRoundCompleted);
      socketService.offNextQuestion(handleNextQuestion);
      socketService.offGameFinished(handleGameFinished);
      socketService.offGameCancelled(handleGameCancelled);
      socketService.offPlayerKicked(handlePlayerKicked);
      socketService.offKickedFromRoom(handleKickedFromRoom);
      socketService.offRoomError(handleRoomError);
      socketService.offCriticalError(handleCriticalError);
      appStateSubscription.remove();
    };
  }, [roomCode, router]);

  // Get socket ID
  const mySocketId = socketService.getSocket()?.id;

  // Helper function to check if a player is the current user
  const isMe = (playerId: string) => {
    return playerId === mySocketId;
  };

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
        // Deduct coins when starting the game
        const category = room?.settings?.category || "just_friends";
        const coinsRequired = getCategoryCoinsRequired(category);

        if (coinsRequired > 0) {
          const hasEnoughCoins = await spendCoins(coinsRequired);
          if (!hasEnoughCoins) {
            if (Platform.OS === "web") {
              window.alert(
                `Not enough coins to start the game. Required: ${coinsRequired} coins.`
              );
            } else {
              Alert.alert(
                "Not Enough Coins",
                `You need ${coinsRequired} coins to start this game.`
              );
            }
            return;
          }
        }

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

  const handleSelectAnswer = (answer: string) => {
    if (!hasSubmitted && currentQuestion) {
      setSelectedAnswer(answer);
      console.log("📝 Submitting answer:", answer);
      socketService.submitAnswer(currentQuestion.id, answer);
      setHasSubmitted(true);
    }
  };

  const handleKickPlayer = (playerId: string) => {
    const player = room?.players.find((p) => p.id === playerId);
    const playerName = player?.name || "Player";

    // Check if game is active
    if (room?.status === "playing") {
      if (Platform.OS === "web") {
        window.alert("Cannot kick players during active game");
      } else {
        Alert.alert("Error", "Cannot kick players during active game");
      }
      return;
    }

    // Confirmation dialog
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        `Are you sure you want to kick ${playerName} from the room?`
      );
      if (confirmed) {
        socketService.kickPlayer(roomCode, playerId);
      }
    } else {
      Alert.alert(
        "Kick Player",
        `Are you sure you want to kick ${playerName} from the room?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Kick",
            style: "destructive",
            onPress: () => {
              socketService.kickPlayer(roomCode, playerId);
            },
          },
        ],
        { cancelable: true }
      );
    }
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

  // Render countdown screen
  if (gameState === "countdown") {
    console.log("⏱️ Rendering Countdown component");
    return (
      <Countdown
        onComplete={() => {
          console.log("✅ Countdown complete, starting game");
          console.log("📊 Current question exists:", !!currentQuestion);
          setGameState("playing");
        }}
      />
    );
  }

  // Render game play screen
  if (gameState === "playing" && currentQuestion) {
    console.log("🎮 Rendering GamePlay component");
    return (
      <GamePlay
        currentQuestion={currentQuestion}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={totalQuestions}
        questionDuration={questionDuration}
        selectedAnswer={selectedAnswer}
        hasSubmitted={hasSubmitted}
        opponentAnswered={opponentAnswered}
        opponentName={opponentName}
        notifications={notifications}
        roundResult={roundResult}
        onSelectAnswer={handleSelectAnswer}
        roomCode={roomCode}
        currentPlayerId={socketService.getSocketId()}
      />
    );
  }

  // Render game finished screen
  if (gameState === "finished" && gameFinishedData) {
    console.log("🏁 Rendering GameFinished component");

    // Get player names from room
    const currentPlayer = room?.players?.find((p: any) => p.id === mySocketId);
    const currentPlayerName = currentPlayer?.name || "You";
    const opponentPlayer = room?.players?.find((p: any) => p.id !== mySocketId);
    const opponentPlayerName = opponentPlayer?.name || "Partner";

    return (
      <GameFinished
        matchScore={gameFinishedData.matchScore}
        totalQuestions={gameFinishedData.totalQuestions}
        percentage={gameFinishedData.percentage}
        completedRounds={gameFinishedData.completedRounds}
        displayDuration={questionDuration + 5}
        currentPlayerName={currentPlayerName}
        opponentPlayerName={opponentPlayerName}
        onComplete={() => {
          console.log(
            "✅ Game finished display complete, returning to waiting room"
          );
          // Reset game state and return to waiting room
          setGameState("waiting");
          setGameFinishedData(null);
          setCurrentQuestion(null);
          setRoundResult(null);
          setSelectedAnswer(null);
          setHasSubmitted(false);
          setOpponentAnswered(false);
          setNotifications([]);
        }}
      />
    );
  }

  // Render waiting room
  console.log("⏳ Rendering WaitingRoom component");
  console.log("🔍 gameState:", gameState);
  console.log("🔍 currentQuestion:", currentQuestion);
  return (
    <WaitingRoom
      room={room}
      roomCode={roomCode}
      mySocketId={mySocketId}
      isMe={isMe}
      onStartGame={handleStartGame}
      onLeaveRoom={handleLeaveRoom}
      onKickPlayer={handleKickPlayer}
    />
  );
};

export default GameRoom;
