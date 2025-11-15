import { io, Socket } from "socket.io-client";

const SOCKET_URL = "http://192.168.1.133:3000";

// Category type is now a string (category ID from Supabase)
// Use categoryService.getCategories() to get available categories
export type Category = string;

export interface RoomSettings {
  maxPlayers: number;
  totalQuestions: number;
  category: Category;
  questionDuration: number;
}

export interface Question {
  id: string; // UUID from Supabase
  texts: {
    text_en: string;
    text_tr: string;
    text_es: string; // Spanish
  };
  category: Category;
  haveAnswers: boolean; // true = has answers, false = only yes/no answers
  answers: string[]; // answers to the question
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  score: number;
  answeredQuestions: any[];
}

export interface Room {
  roomCode: string;
  createdAt: number;
  status: "waiting" | "playing" | "finished";
  players: Player[];
  currentQuestionIndex: number;
  questions: Question[];
  settings: RoomSettings;
}

class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;

  connect() {
    if (!this.socket) {
      console.log("🔌 Connecting to socket...");

      this.socket = io(SOCKET_URL, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
      });

      this.socket.on("connect", async () => {
        this.isConnected = true;
        console.log("✅ Connected to socket:", this.socket?.id);

        // When socket connection is established, register the user with the backend
        // To be able to send coin updates from the backend via webhook to this socket
        try {
          const { purchaseService } = await import("./purchaseService");
          const appUserId = await purchaseService.getAppUserId();
          if (appUserId && this.socket) {
            this.socket.emit("register-user", appUserId);
            console.log("📝 Registered user with socket:", appUserId);
          }
        } catch (error) {
          console.warn("⚠️ Failed to register user with socket:", error);
        }
      });

      this.socket.on("disconnect", (reason) => {
        this.isConnected = false;
        console.log("❌ Disconnected from socket:", reason);
      });

      this.socket.on("connect_error", (error) => {
        console.error("🔴 Connection error:", error.message);
      });
    }
    return this.socket;
  }

  // Check connection status
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // Create room
  createRoom(
    playerName: string,
    avatar: string,
    category: string
  ): Promise<{ roomCode: string; player: Player; category: string }> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error("Socket connection not found"));
        return;
      }

      console.log(
        `🏠 Creating room with ${playerName} and avatar is: ${avatar} and category is: ${category}...`
      );

      this.socket.emit("create-room", { playerName, avatar, category });

      this.socket.once("room-created", (data) => {
        console.log("✅ Room is created:", data);
        resolve(data);
      });

      this.socket.once("room-error", (error) => {
        console.error("❌ Error creating room:", error);
        reject(error);
      });

      // Timeout
      setTimeout(() => {
        reject(new Error("Timeout: Room not created"));
      }, 5000);
    });
  }

  // Join room
  joinRoom(
    roomCode: string,
    playerName: string,
    avatar: string
  ): Promise<{ roomCode: string; player: Player; room: Room }> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error("Socket connection not found"));
        return;
      }

      console.log("👥 Joining room...", { roomCode, playerName, avatar });

      this.socket.emit("join-room", { roomCode, playerName, avatar });

      this.socket.once("room-joined", (data) => {
        console.log("✅ Joined room:", data);
        resolve(data);
      });

      this.socket.once("room-error", (error) => {
        console.error("❌ Error joining room:", error);
        reject(error);
      });

      // Timeout
      setTimeout(() => {
        reject(new Error("Timeout: Joined room"));
      }, 5000);
    });
  }

  // Get room information
  getRoom(roomCode: string): Promise<Room> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error("Socket connection not found"));
        return;
      }

      this.socket.emit("get-room", { roomCode });

      this.socket.once("room-data", (room) => {
        resolve(room);
      });

      this.socket.once("room-error", (error) => {
        reject(error);
      });

      setTimeout(() => {
        reject(new Error("Timeout: Room information not found"));
      }, 5000);
    });
  }

  // Leave room
  leaveRoom(roomCode: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error("Socket connection not found"));
        return;
      }

      console.log("🚪 Leaving room...", { roomCode });

      this.socket.emit("leave-room", { roomCode });

      this.socket.once("room-left", () => {
        console.log("✅ Left room successfully");
        resolve();
      });

      this.socket.once("room-error", (error) => {
        console.error("❌ Error leaving room:", error);
        reject(error);
      });

      // Timeout
      setTimeout(() => {
        reject(new Error("Timeout: Leave room"));
      }, 5000);
    });
  }

  // Start game (Host only)
  startGame(roomCode: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error("Socket connection not found"));
        return;
      }

      console.log("🎮 Starting game...", { roomCode });

      this.socket.emit("start-game", { roomCode });

      this.socket.once("game-started", () => {
        console.log("✅ Game started successfully");
        resolve();
      });

      this.socket.once("room-error", (error) => {
        console.error("❌ Error starting game:", error);
        reject(error);
      });

      // Timeout
      setTimeout(() => {
        reject(new Error("Timeout: Start game"));
      }, 10000);
    });
  }

  // Submit answer
  submitAnswer(questionId: string, answer: string): void {
    if (!this.socket) {
      console.error("❌ Socket connection not found");
      return;
    }

    console.log("📝 Submitting answer...", { questionId, answer });
    this.socket.emit("submit-answer", { questionId, answer });
  }

  // Kick player (Host only)
  kickPlayer(roomCode: string, targetPlayerId: string): void {
    if (!this.socket) {
      console.error("❌ Socket connection not found");
      return;
    }

    console.log("🚫 Kicking player...", { roomCode, targetPlayerId });
    this.socket.emit("kick-player", { roomCode, targetPlayerId });
  }

  // Event listeners
  onPlayerJoined(callback: (data: { player: Player; room: Room }) => void) {
    this.socket?.on("player-joined", callback);
  }

  onPlayerLeft(
    callback: (data: { playerId: string; room: Room | null }) => void
  ) {
    this.socket?.on("player-left", callback);
  }

  // Event listener'ı kaldır
  offPlayerJoined(callback?: (...args: any[]) => void) {
    this.socket?.off("player-joined", callback);
  }

  offPlayerLeft(callback?: (...args: any[]) => void) {
    this.socket?.off("player-left", callback);
  }

  // Game event listeners
  onGameStarted(
    callback: (data: {
      room: Room;
      question: any;
      totalQuestions: number;
    }) => void
  ) {
    this.socket?.on("game-started", callback);
  }

  onPlayerAnswered(
    callback: (data: { playerId: string; playerName: string }) => void
  ) {
    this.socket?.on("player-answered", callback);
  }

  onRoundCompleted(
    callback: (data: {
      allPlayersAnswered: boolean;
      isMatched: boolean;
      playerAnswers: any[];
      question: any;
      matchScore: number;
      totalQuestions: number;
      percentage: number;
    }) => void
  ) {
    this.socket?.on("round-completed", callback);
  }

  onNextQuestion(
    callback: (data: {
      question: any;
      currentQuestionIndex: number;
      totalQuestions: number;
    }) => void
  ) {
    this.socket?.on("next-question", callback);
  }

  onGameFinished(
    callback: (data: {
      matchScore: number;
      totalQuestions: number;
      percentage: number;
      completedRounds: any[];
    }) => void
  ) {
    this.socket?.on("game-finished", callback);
  }

  // Remove game event listeners
  offGameStarted(callback?: (...args: any[]) => void) {
    this.socket?.off("game-started", callback);
  }

  offPlayerAnswered(callback?: (...args: any[]) => void) {
    this.socket?.off("player-answered", callback);
  }

  offRoundCompleted(callback?: (...args: any[]) => void) {
    this.socket?.off("round-completed", callback);
  }

  offNextQuestion(callback?: (...args: any[]) => void) {
    this.socket?.off("next-question", callback);
  }

  offGameFinished(callback?: (...args: any[]) => void) {
    this.socket?.off("game-finished", callback);
  }

  // Kick event listeners
  onKickedFromRoom(
    callback: (data: { message: string; roomCode: string }) => void
  ) {
    this.socket?.on("kicked-from-room", callback);
  }

  onPlayerKicked(
    callback: (data: {
      playerId: string;
      playerName: string;
      room: Room;
    }) => void
  ) {
    this.socket?.on("player-kicked", callback);
  }

  // Remove kick event listeners
  offKickedFromRoom(callback?: (...args: any[]) => void) {
    this.socket?.off("kicked-from-room", callback);
  }

  offPlayerKicked(callback?: (...args: any[]) => void) {
    this.socket?.off("player-kicked", callback);
  }

  // Room error listener (general error handler)
  onRoomError(callback: (error: { message: string }) => void) {
    this.socket?.on("room-error", callback);
  }

  offRoomError(callback?: (...args: any[]) => void) {
    this.socket?.off("room-error", callback);
  }

  // Critical error listener (redirects to StartOptionsScreen)
  onCriticalError(callback: (error: { message: string }) => void) {
    this.socket?.on("critical-error", callback);
  }

  offCriticalError(callback?: (...args: any[]) => void) {
    this.socket?.off("critical-error", callback);
  }

  // Game cancelled listener
  onGameCancelled(callback: (data: { message: string; room: Room }) => void) {
    this.socket?.on("game-cancelled", callback);
  }

  offGameCancelled(callback?: (...args: any[]) => void) {
    this.socket?.off("game-cancelled", callback);
  }

  // Get socket (for special cases)
  getSocket(): Socket | null {
    return this.socket;
  }

  // Get current socket ID
  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  // Close connection
  disconnect() {
    if (this.socket) {
      console.log("🔌 Closing socket connection...");
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Chat functions
  sendMessage(roomCode: string, message: string): void {
    if (!this.socket) {
      console.error("❌ Socket not connected");
      return;
    }
    console.log("💬 Sending message:", { roomCode, message });
    this.socket.emit("send-message", { roomCode, message });
  }

  onChatMessage(
    callback: (data: {
      playerId: string;
      playerName: string;
      avatar: string;
      message: string;
      timestamp: number;
    }) => void
  ): void {
    if (!this.socket) {
      console.error("❌ Socket not connected");
      return;
    }
    this.socket.on("chat-message", callback);
  }

  offChatMessage(
    callback: (data: {
      playerId: string;
      playerName: string;
      avatar: string;
      message: string;
      timestamp: number;
    }) => void
  ): void {
    if (!this.socket) {
      return;
    }
    this.socket.off("chat-message", callback);
  }

  spendCoins(data: {
    appUserId: string;
    amount: number;
    transactionType?: "game_start" | "refund" | "admin";
  }): void {
    if (!this.socket) {
      console.error("❌ Socket not connected");
      return;
    }
    console.log("💰 Spending coins via backend:", data);
    this.socket.emit("spend-coins", data);
  }

  /**
   * Listen for coin spent notifications from the backend
   */
  onCoinsSpent(
    callback: (data: {
      appUserId: string;
      newBalance: number;
      success: boolean;
      error?: string;
    }) => void
  ): void {
    const socket = this.connect();

    if (!socket) {
      console.error("❌ Failed to establish socket connection");
      return;
    }

    if (socket.connected) {
      socket.on("coins-spent", callback);
    } else {
      socket.once("connect", () => {
        socket.on("coins-spent", callback);
      });
    }
  }

  /**
   * Remove coin spent listener
   */
  offCoinsSpent(
    callback?: (data: {
      appUserId: string;
      newBalance: number;
      success: boolean;
      error?: string;
    }) => void
  ): void {
    if (!this.socket) {
      return;
    }
    this.socket.off("coins-spent", callback);
  }

  /**
   * Listen for coin added notifications from the backend via webhook
   */
  onCoinsAdded(
    callback: (data: {
      appUserId: string;
      newBalance: number;
      success: boolean;
      error?: string;
    }) => void
  ): void {
    // Connect to socket (if not connected)
    const socket = this.connect();

    if (!socket) {
      console.error("❌ Failed to establish socket connection");
      return;
    }

    // If socket is already connected, add listener directly
    if (socket.connected) {
      socket.on("coins-added", callback);
    } else {
      // Wait for socket to connect
      socket.once("connect", () => {
        socket.on("coins-added", callback);
      });
    }
  }

  /**
   * Remove coin added listener
   */
  offCoinsAdded(
    callback?: (data: {
      appUserId: string;
      newBalance: number;
      success: boolean;
      error?: string;
    }) => void
  ): void {
    if (!this.socket) {
      return;
    }
    this.socket.off("coins-added", callback);
  }
}

export default new SocketService();
