import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import type { ClientMessage } from "../../packages/shared-types";
import { QuizRoom } from "./QuizRoom";
import { send, generateQuizCode } from "./utils";
import jwt from "jsonwebtoken";

const JWT_SECRET = "super-secret-kahoot-key-2024";
const PORT = 3001;

const rooms = new Map<string, QuizRoom>();
const clientRoomMap = new Map<WebSocket, { room: QuizRoom; playerId: string }>();
const hostRoomMap = new Map<WebSocket, QuizRoom>();

const httpServer = createServer((_req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Quiz WebSocket Server is running");
});

const wss = new WebSocketServer({ server: httpServer });

console.log(`[Server] Starting on port ${PORT}...`);

wss.on("connection", (ws: WebSocket) => {
  console.log("[Server] New WebSocket connection");

  ws.on("message", (raw: Buffer) => {
    let message: ClientMessage;

    try {
      message = JSON.parse(raw.toString()) as ClientMessage;
    } catch {
      send(ws, { type: "error", message: "Invalid JSON message" });
      return;
    }

    console.log("[Server] Message received:", message.type);

    switch (message.type) {
      case "join": {
        const roomCode = message.quizCode.toUpperCase();
        const room = rooms.get(roomCode);

        if (!room) {
          send(ws, { type: "error", message: "This quiz code does not exist." });
          break;
        }

        if (room.phase !== "lobby") {
          send(ws, {
            type: "error",
            message: "This quiz has already started or is finished.",
          });
          break;
        }

        const playerId = room.addPlayer(message.name, ws);
        clientRoomMap.set(ws, { room, playerId });

        const sessionKey = room.getPlayerSessionKey(playerId);
        if (!sessionKey) {
          send(ws, { type: "error", message: "Player session cannot be created." });
          break;
        }

        const token = jwt.sign(
          { playerId, quizCode: roomCode, sessionKey },
          JWT_SECRET,
          { expiresIn: "2h" },
        );

        send(ws, { type: "session", token, playerId });
        break;
      }

      case "answer": {
        const clientData = clientRoomMap.get(ws);

        if (!clientData) {
          send(ws, {
            type: "error",
            message: "You are not connected to any room.",
          });
          break;
        }

        clientData.room.handleAnswer(clientData.playerId, message.choiceIndex);
        break;
      }

      case "host:create": {
        const code = generateQuizCode();
        const id = Date.now().toString();
        const room = new QuizRoom(id, code);

        room.hostWs = ws;
        room.title = message.title;
        room.questions = message.questions;

        rooms.set(code, room);
        hostRoomMap.set(ws, room);

        send(ws, { type: "sync", phase: "lobby", data: { quizCode: code } });
        console.log(`[Server] Quiz "${room.title}" created with code: ${code}`);
        break;
      }

      case "host:start": {
        const room = hostRoomMap.get(ws);
        if (!room) {
          send(ws, { type: "error", message: "You are not host of any room." });
          break;
        }

        room.start();
        break;
      }

      case "host:next": {
        const room = hostRoomMap.get(ws);
        if (!room) {
          send(ws, { type: "error", message: "You are not host of any room." });
          break;
        }

        room.nextQuestion();
        break;
      }

      case "host:end": {
        const room = hostRoomMap.get(ws);
        if (!room) {
          send(ws, { type: "error", message: "You are not host of any room." });
          break;
        }

        room.end();
        rooms.delete(room.code);
        hostRoomMap.delete(ws);

        for (const [playerWs, data] of clientRoomMap.entries()) {
          if (data.room.id === room.id) {
            clientRoomMap.delete(playerWs);
          }
        }
        break;
      }

      case "reconnect": {
        try {
          const decoded = jwt.verify(message.token, JWT_SECRET) as {
            playerId: string;
            quizCode: string;
            sessionKey?: string;
          };

          const room = rooms.get(decoded.quizCode);
          if (!room) {
            send(ws, { type: "error", message: "The room no longer exists." });
            break;
          }

          if (
            typeof decoded.sessionKey !== "string" ||
            !room.isValidSession(decoded.playerId, decoded.sessionKey)
          ) {
            send(ws, {
              type: "error",
              message: "Invalid or expired reconnect session.",
            });
            break;
          }

          const oldWs = room.reconnectPlayer(decoded.playerId, ws);

          if (oldWs !== null) {
            clientRoomMap.delete(oldWs);

            if (oldWs.readyState === WebSocket.OPEN) {
              oldWs.close(1000, "Reconnected from another tab/device");
            }

            clientRoomMap.set(ws, { room, playerId: decoded.playerId });

            const currentScore = room.scores.get(decoded.playerId) || 0;
            send(ws, {
              type: "sync",
              phase: room.phase,
              data: { score: currentScore, reconnected: true },
            });

            console.log(`[Server] Player ${decoded.playerId} reconnected successfully.`);
          } else {
            send(ws, {
              type: "error",
              message: "Player not found in this room.",
            });
          }
        } catch {
          send(ws, {
            type: "error",
            message: "Invalid or corrupted token. Reconnect denied.",
          });
        }
        break;
      }

      default: {
        send(ws, { type: "error", message: "Unknown message type" });
      }
    }
  });

  ws.on("close", () => {
    console.log("[Server] Connection closed");

    if (clientRoomMap.has(ws)) {
      clientRoomMap.delete(ws);
    }

    if (hostRoomMap.has(ws)) {
      const room = hostRoomMap.get(ws);
      if (room) {
        rooms.delete(room.code);
      }
      hostRoomMap.delete(ws);
    }
  });

  ws.on("error", (err: Error) => {
    console.error("[Server] WebSocket error:", err.message);
  });
});

httpServer.listen(PORT, () => {
  console.log(`[Server] WebSocket server started on ws://localhost:${PORT}`);
});
