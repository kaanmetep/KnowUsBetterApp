import { io, Socket } from "socket.io-client";

const SOCKET_URL = "http://192.168.1.133:3000";

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
  questions: any[];
  settings: {
    category: string;
    maxPlayers: number;
    questionCount: number;
  };
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

      this.socket.on("connect", () => {
        this.isConnected = true;
        console.log("✅ Connected to socket:", this.socket?.id);
      });

      this.socket.on("disconnect", (reason) => {
        this.isConnected = false;
        console.log("❌ Disconnected from socket:", reason);
      });

      this.socket.on("connect_error", (error) => {
        console.error("🔴 Bağlantı hatası:", error.message);
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

  // Get socket (for special cases)
  getSocket(): Socket | null {
    return this.socket;
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
}

export default new SocketService();
