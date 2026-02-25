// ============================================================
// Serveur WebSocket - Point d'entree
// ============================================================

import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import type { ClientMessage } from "../../packages/shared-types";
import { QuizRoom } from "./QuizRoom";
import { send, generateQuizCode } from "./utils";

const PORT = 3001;

// ---- Stockage global des salles ----
/** Map des salles : code du quiz -> QuizRoom */
const rooms = new Map<string, QuizRoom>();

/** Map inverse pour retrouver la salle d'un joueur : WebSocket -> { room, playerId } */
const clientRoomMap = new Map<
  WebSocket,
  { room: QuizRoom; playerId: string }
>();

/** Map pour retrouver la salle du host : WebSocket -> QuizRoom */
const hostRoomMap = new Map<WebSocket, QuizRoom>();

// ---- Creation du serveur HTTP + WebSocket ----
const httpServer = createServer((_req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Quiz WebSocket Server is running");
});

const wss = new WebSocketServer({ server: httpServer });

console.log(`[Server] Demarrage sur le port ${PORT}...`);

// ---- Gestion des connexions WebSocket ----
wss.on("connection", (ws: WebSocket) => {
  console.log("[Server] Nouvelle connexion WebSocket");

  ws.on("message", (raw: Buffer) => {
    // --- Parsing du message JSON ---
    let message: ClientMessage;
    try {
      message = JSON.parse(raw.toString()) as ClientMessage;
    } catch {
      send(ws, { type: "error", message: "Message JSON invalide" });
      return;
    }

    console.log("[Server] Message recu:", message.type);

    // --- Routage par type de message ---
    switch (message.type) {
      // ============================================================
      // Un joueur veut rejoindre un quiz
      // ============================================================
      case "join": {
        const roomCode = message.quizCode.toUpperCase();
        const room = rooms.get(roomCode);

        if (!room) {
          send(ws, { type: "error", message: "Ce code de quiz n'existe pas." });
          break;
        }

        if (room.phase !== "lobby") {
          send(ws, {
            type: "error",
            message: "Ce quiz a déjà commencé ou est terminé.",
          });
          break;
        }

        const playerId = room.addPlayer(message.name, ws);
        clientRoomMap.set(ws, { room, playerId });
        break;
      }

      // ============================================================
      // Un joueur envoie sa reponse
      // ============================================================
      case "answer": {
        const clientData = clientRoomMap.get(ws);

        if (!clientData) {
          send(ws, {
            type: "error",
            message: "Vous n'êtes connecté à aucune salle.",
          });
          break;
        }

        clientData.room.handleAnswer(clientData.playerId, message.choiceIndex);
        break;
      }

      // ============================================================
      // Le host cree un nouveau quiz
      // ============================================================
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

        console.log(`[Server] Quiz "${room.title}" cree avec le code: ${code}`);
        break;
      }

      // ============================================================
      // Le host demarre le quiz
      // ============================================================
      case "host:start": {
        const room = hostRoomMap.get(ws);
        if (!room) {
          send(ws, {
            type: "error",
            message: "Vous n'êtes l'hôte d'aucune salle.",
          });
          break;
        }
        room.start();
        break;
      }

      // ============================================================
      // Le host passe a la question suivante
      // ============================================================
      case "host:next": {
        const room = hostRoomMap.get(ws);
        if (!room) {
          send(ws, {
            type: "error",
            message: "Vous n'êtes l'hôte d'aucune salle.",
          });
          break;
        }
        room.nextQuestion();
        break;
      }

      // ============================================================
      // Le host termine le quiz
      // ============================================================
      case "host:end": {
        const room = hostRoomMap.get(ws);
        if (!room) {
          send(ws, {
            type: "error",
            message: "Vous n'êtes l'hôte d'aucune salle.",
          });
          break;
        }

        room.end();
        rooms.delete(room.code);
        hostRoomMap.delete(ws);

        // Nettoyer tous les joueurs associés à cette room
        for (const [playerWs, data] of clientRoomMap.entries()) {
          if (data.room.id === room.id) {
            clientRoomMap.delete(playerWs);
          }
        }
        break;
      }

      default: {
        send(ws, { type: "error", message: `Type de message inconnu` });
      }
    }
  });

  // --- Gestion de la deconnexion ---
  ws.on("close", () => {
    console.log("[Server] Connexion fermee");

    // Si c'était un joueur
    if (clientRoomMap.has(ws)) {
      clientRoomMap.delete(ws);
    }

    // Si c'était un host
    if (hostRoomMap.has(ws)) {
      const room = hostRoomMap.get(ws);
      if (room) {
        // En cas de déconnexion brutale du host, on supprime la room
        rooms.delete(room.code);
      }
      hostRoomMap.delete(ws);
    }
  });

  ws.on("error", (err: Error) => {
    console.error("[Server] Erreur WebSocket:", err.message);
  });
});

// ---- Demarrage du serveur ----
httpServer.listen(PORT, () => {
  console.log(`[Server] Serveur WebSocket demarre sur ws://localhost:${PORT}`);
});
