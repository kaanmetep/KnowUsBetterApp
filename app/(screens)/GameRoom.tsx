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
import { useTranslation } from "../hooks/useTranslation";
import {
  getCategoryById,
  getCategoryCoinsRequired,
  getCategoryLabel,
} from "../services/categoryService";
import { CoinStorageService } from "../services/coinStorageService";
import { purchaseService } from "../services/purchaseService";
import socketService, { Room } from "../services/socketService";

const GameRoom = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { spendCoins } = useCoins();
  const { t, selectedLanguage } = useTranslation();

  // Only get roomCode from params
  const roomCode = (params.roomCode as string) || "DEMO123";

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
  const [isStartingGame, setIsStartingGame] = useState(false);
  const [coinsPendingSpend, setCoinsPendingSpend] = useState(0);
  const [categoryDisplayName, setCategoryDisplayName] = useState<string | null>(
    null
  );
  const [categoryColor, setCategoryColor] = useState<string | null>(null);

  // Track when app goes to background
  const backgroundTimeRef = useRef<number | null>(null);

  let [fontsLoaded] = useFonts({
    MerriweatherSans_400Regular,
    MerriweatherSans_700Bold,
  });

  const getCoinLabel = (count: number) =>
    count === 1 ? t("gameRoom.coinSingular") : t("gameRoom.coinPlural");

  useEffect(() => {
    const categoryId = room?.settings?.category;
    if (!categoryId) {
      setCategoryDisplayName(null);
      setCategoryColor(null);
      return;
    }

    let isMounted = true;
    const loadCategoryLabel = async () => {
      const categoryData = await getCategoryById(categoryId);
      if (isMounted) {
        setCategoryDisplayName(
          getCategoryLabel(categoryData, selectedLanguage)
        );
        setCategoryColor(categoryData?.color || null);
      }
    };
    loadCategoryLabel();

    return () => {
      isMounted = false;
    };
  }, [room?.settings?.category, selectedLanguage]);

  const ensureUserHasCoins = async (amount: number): Promise<boolean> => {
    if (amount <= 0) {
      return true;
    }

    try {
      const appUserId = await purchaseService.getAppUserId();
      if (!appUserId) {
        throw new Error("Missing app user id");
      }

      const balance = await CoinStorageService.fetchBalanceFromSupabase(
        appUserId
      );

      if (balance === null) {
        throw new Error("Unable to read balance");
      }

      if (balance < amount) {
        const coinLabel = getCoinLabel(amount);
        if (Platform.OS === "web") {
          window.alert(
            t("gameRoom.notEnoughCoinsWeb", {
              coinsRequired: amount,
              coinLabel,
            })
          );
        } else {
          Alert.alert(
            t("gameRoom.notEnoughCoinsTitle"),
            t("gameRoom.notEnoughCoinsMessage", {
              coinsRequired: amount,
              coinLabel,
            })
          );
        }
        return false;
      }

      return true;
    } catch (error) {
      console.error("❌ Failed to verify coin balance:", error);
      if (Platform.OS === "web") {
        window.alert(t("gameRoom.failedToStartGame"));
      } else {
        Alert.alert(t("gameRoom.errorTitle"), t("gameRoom.failedToStartGame"));
      }
      return false;
    }
  };

  // Socket.io event listeners and cleanup
  useEffect(() => {
    // Load current room data on mount
    const loadRoomData = async () => {
      try {
        const roomData = await socketService.getRoom(roomCode);
        setRoom(roomData);
      } catch (error) {
        console.error("❌ Failed to load room data:", error);
      }
    };

    loadRoomData();

    // New player joined
    const handlePlayerJoined = (data: any) => {
      if (data.room) {
        setRoom(data.room);
      }
    };

    // Player left
    const handlePlayerLeft = (data: any) => {
      if (data.room) {
        setRoom(data.room);
      }
    };

    // Game started
    const handleGameStarted = (data: any) => {
      if (data.room) {
        setRoom(data.room);
      }

      // Reset all game-related states (especially important if user was in GameFinished screen)
      setGameFinishedData(null);
      setRoundResult(null);
      setNotifications([]);

      // Set new game state
      setGameState("countdown");
      setCurrentQuestion(data.question);
      setTotalQuestions(data.totalQuestions);
      setCurrentQuestionIndex(0);
      setQuestionDuration(data.duration || 15); // Default to 15 seconds if not provided
      setSelectedAnswer(null);
      setHasSubmitted(false);
      setOpponentAnswered(false);
      setOpponentName(null);
    };

    // Player answered
    const handlePlayerAnswered = (data: any) => {
      setOpponentAnswered(true);
      if (data.playerName) {
        setOpponentName(data.playerName);
      }
    };

    // Round completed
    const handleRoundCompleted = (data: any) => {
      if (data.playerAnswers) {
        data.playerAnswers.forEach((playerAnswer: any, index: number) => {});
      }
      // Show round results for 5 seconds (backend handles the timing)
      setRoundResult(data);
      setNotifications([]); // Clear notifications when showing round result
      setOpponentName(null); // Clear opponent name when showing round result
    };

    // Next question
    const handleNextQuestion = (data: any) => {
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
      // Show alert
      const cancelMessage = data.message || t("gameRoom.gameCancelledMessage");
      if (Platform.OS === "web") {
        window.alert(cancelMessage);
      } else {
        Alert.alert(
          t("gameRoom.gameCancelledTitle"),
          cancelMessage,
          [{ text: t("common.ok") }],
          { cancelable: false }
        );
      }

      // Update room state
      if (data.room) {
        setRoom(data.room);
      }

      // Reset game state to waiting
      setGameState("waiting");

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
      setCoinsPendingSpend(0);
      setCategoryDisplayName(null);
      setCategoryColor(null);
    };

    // Player kicked (for remaining players)
    const handlePlayerKicked = (data: any) => {
      if (data.room) {
        setRoom(data.room);
      }
    };

    // Kicked from room (for the kicked player)
    const handleKickedFromRoom = (data: any) => {
      const message = data.message || t("gameRoom.kickedMessage");

      // First, navigate back
      router.back();

      // Then show alert after a short delay to ensure navigation completes
      setTimeout(() => {
        if (Platform.OS === "web") {
          window.alert(message);
        } else {
          Alert.alert(
            t("gameRoom.kickedTitle"),
            message,
            [{ text: t("common.ok") }],
            {
              cancelable: false,
            }
          );
        }
      }, 100);
    };

    // Room error handler (for kick errors and other room errors)
    const handleRoomError = (error: any) => {
      const errorMessage = error?.message || t("gameRoom.genericError");
      if (Platform.OS === "web") {
        window.alert(errorMessage);
      } else {
        Alert.alert(t("gameRoom.errorTitle"), errorMessage);
      }
    };

    // Critical error handler (redirects to StartOptionsScreen)
    const handleCriticalError = (error: any) => {
      const errorMessage = error?.message || t("gameRoom.criticalErrorMessage");

      // Show alert first
      if (Platform.OS === "web") {
        window.alert(errorMessage);
      } else {
        Alert.alert(
          t("gameRoom.errorTitle"),
          errorMessage,
          [{ text: t("common.ok") }],
          {
            cancelable: false,
          }
        );
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
          try {
            // Check if user is still in the room
            const roomData = await socketService.getRoom(roomCode);
            const currentSocketId = socketService.getSocketId();

            // Check if current user is in the room
            const isUserInRoom = roomData.players.some(
              (player) => player.id === currentSocketId
            );

            if (!isUserInRoom) {
              // User was removed from room, redirect to StartOptionsScreen
              router.replace("/StartOptionsScreen");
            } else {
              // User is still in room, update room state
              setRoom(roomData);
            }
          } catch (error) {
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
      // Leave room when navigating away
      socketService.leaveRoom(roomCode).catch((error) => {});

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

  const resetToWaitingRoom = () => {
    setGameState("waiting");
    setGameFinishedData(null);
    setCurrentQuestion(null);
    setRoundResult(null);
    setSelectedAnswer(null);
    setHasSubmitted(false);
    setOpponentAnswered(false);
    setNotifications([]);
    setCoinsPendingSpend(0);
    setCategoryDisplayName(null);
    setCategoryColor(null);
  };

  // Handlers
  const handleLeaveRoom = async () => {
    const confirmLeave = async () => {
      try {
        await socketService.leaveRoom(roomCode);
        router.back();
      } catch (error) {
        console.error("❌ Error leaving room:", error);
        // Even if error occurs, go back
        router.back();
      }
    };

    // Web platform uses window.confirm
    if (Platform.OS === "web") {
      const confirmed = window.confirm(t("gameRoom.leaveConfirm"));
      if (confirmed) {
        await confirmLeave();
      }
    } else {
      // Mobile platforms use Alert
      Alert.alert(
        t("gameRoom.leaveRoomTitle"),
        t("gameRoom.leaveConfirm"),
        [
          { text: t("common.cancel"), style: "cancel" },
          {
            text: t("gameRoom.leaveButton"),
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
    if (canStartGame && !isStartingGame) {
      setIsStartingGame(true);
      try {
        // Determine coins needed and verify balance up front
        const category = room?.settings?.category || "just_friends";
        const coinsRequired = await getCategoryCoinsRequired(category);

        if (!(await ensureUserHasCoins(coinsRequired))) {
          setIsStartingGame(false);
          setCoinsPendingSpend(0);
          return;
        }

        setCoinsPendingSpend(coinsRequired > 0 ? coinsRequired : 0);
        await socketService.startGame(roomCode);
      } catch (error: any) {
        console.error("❌ Error starting game:", error);
        const message = error?.message || t("gameRoom.failedToStartGame");
        if (Platform.OS === "web") {
          window.alert(message);
        } else {
          Alert.alert(t("gameRoom.errorTitle"), message);
        }
      } finally {
        setIsStartingGame(false);
      }
    }
  };

  const handleSelectAnswer = (answer: string) => {
    if (!hasSubmitted && currentQuestion) {
      setSelectedAnswer(answer);
      socketService.submitAnswer(currentQuestion.id, answer);
      setHasSubmitted(true);
    }
  };

  const handleKickPlayer = (playerId: string) => {
    const player = room?.players.find((p) => p.id === playerId);
    const playerName = player?.name || t("gameRoom.defaultPlayerName");

    // Check if game is active
    if (room?.status === "playing") {
      if (Platform.OS === "web") {
        window.alert(t("gameRoom.cannotKickDuringGame"));
      } else {
        Alert.alert(
          t("gameRoom.errorTitle"),
          t("gameRoom.cannotKickDuringGame")
        );
      }
      return;
    }

    // Confirmation dialog
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        t("gameRoom.kickConfirm", { playerName })
      );
      if (confirmed) {
        socketService.kickPlayer(roomCode, playerId);
      }
    } else {
      Alert.alert(
        t("gameRoom.kickPlayerTitle"),
        t("gameRoom.kickConfirm", { playerName }),
        [
          { text: t("common.cancel"), style: "cancel" },
          {
            text: t("gameRoom.kickButton"),
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

  const handleCountdownComplete = async () => {
    if (coinsPendingSpend > 0) {
      const success = await spendCoins(coinsPendingSpend);
      if (!success) {
        const coinLabel = getCoinLabel(coinsPendingSpend);
        const message = t("gameRoom.notEnoughCoinsMessage", {
          coinsRequired: coinsPendingSpend,
          coinLabel,
        });
        if (Platform.OS === "web") {
          window.alert(message);
        } else {
          Alert.alert(t("gameRoom.errorTitle"), message);
        }
        resetToWaitingRoom();
        return;
      }
    }
    setCoinsPendingSpend(0);
    setGameState("playing");
  };

  // Loading state
  if (!fontsLoaded || !room) {
    return null;
  }

  // Render countdown screen
  if (gameState === "countdown") {
    const opponentPlayer = room?.players?.find((p: any) => p.id !== mySocketId);
    const opponentDisplayName =
      opponentPlayer?.name || t("gameRoom.partnerLabel");
    return (
      <Countdown
        onComplete={handleCountdownComplete}
        opponentName={opponentDisplayName}
        onCancel={handleLeaveRoom}
        categoryName={categoryDisplayName || undefined}
        categoryColor={categoryColor || undefined}
      />
    );
  }

  // Render game play screen
  if (gameState === "playing" && currentQuestion) {
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
        categoryId={room?.settings?.category}
      />
    );
  }

  // Render game finished screen
  if (gameState === "finished" && gameFinishedData) {
    // Get player names from room
    const currentPlayer = room?.players?.find((p: any) => p.id === mySocketId);
    const currentPlayerName = currentPlayer?.name || t("gameRoom.youLabel");
    const opponentPlayer = room?.players?.find((p: any) => p.id !== mySocketId);
    const opponentPlayerName =
      opponentPlayer?.name || t("gameRoom.partnerLabel");

    return (
      <GameFinished
        matchScore={gameFinishedData.matchScore}
        totalQuestions={gameFinishedData.totalQuestions}
        percentage={gameFinishedData.percentage}
        completedRounds={gameFinishedData.completedRounds}
        displayDuration={questionDuration + 5}
        currentPlayerName={currentPlayerName}
        opponentPlayerName={opponentPlayerName}
        onComplete={resetToWaitingRoom}
      />
    );
  }

  // Render waiting room
  return (
    <WaitingRoom
      room={room}
      roomCode={roomCode}
      mySocketId={mySocketId}
      isMe={isMe}
      onStartGame={handleStartGame}
      onLeaveRoom={handleLeaveRoom}
      onKickPlayer={handleKickPlayer}
      isStartingGame={isStartingGame}
    />
  );
};

export default GameRoom;
