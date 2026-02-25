// ============================================================
// Serveur WebSocket - Point d'entree
// ============================================================

import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import type { ClientMessage } from "../../packages/shared-types";
import { QuizRoom } from "./QuizRoom";
import { send, generateQuizCode } from "./utils";
import jwt from "jsonwebtoken";
const JWT_SECRET = "super-secret-kahoot-key-2024";
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

        // Bonus envoyer un token de session pour reconnexion
        const token = jwt.sign({ playerId, quizCode: roomCode }, JWT_SECRET, {
          expiresIn: "2h",
        });
        send(ws, { type: "session", token, playerId });

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
      // ============================================================
      // Un joueur tente de se reconnecter suite à une coupure
      // ============================================================
      case "reconnect": {
        try {
          // 1. Vérifier et décoder le token cryptographique
          const decoded = jwt.verify(message.token, JWT_SECRET) as {
            playerId: string;
            quizCode: string;
          };

          const room = rooms.get(decoded.quizCode);
          if (!room) {
            send(ws, { type: "error", message: "La salle n'existe plus." });
            break;
          }

          // 2. Tenter la reconnexion dans la room
          const oldWs = room.reconnectPlayer(decoded.playerId, ws);

          if (oldWs !== null) {
            // --- CORRECTION DE LA FUITE DE MÉMOIRE ---
            // On supprime l'ancienne connexion de la map globale
            clientRoomMap.delete(oldWs);

            // On ferme l'ancienne connexion si elle est toujours accrochée (zombie)
            if (oldWs.readyState === WebSocket.OPEN) {
              oldWs.close(1000, "Reconnexion depuis un autre onglet/appareil");
            }

            // 3. Mettre à jour la map globale avec le NOUVEAU WebSocket
            clientRoomMap.set(ws, { room, playerId: decoded.playerId });

            // 4. PRÉPARER LES DONNÉES DE RESTAURATION
            const currentScore = room.scores.get(decoded.playerId) || 0;
            const hasAnswered = room.answers.has(decoded.playerId); // Le joueur a-t-il déjà voté ?

            let questionData = null;
            // Si on est en pleine question, on prépare le texte et les choix (sans la réponse !)
            if (room.phase === "question") {
              const q = room.questions[room.currentQuestionIndex];
              const { correctIndex, ...safeQuestion } = q;
              questionData = safeQuestion;
            }

            // 5. Renvoyer le 'sync' super-complet
            send(ws, {
              type: "sync",
              phase: room.phase,
              data: {
                score: currentScore,
                reconnected: true,
                hasAnswered: hasAnswered,
                currentQuestion: questionData,
                remaining: room.remaining,
              },
            });

            console.log(
              `[Server] Joueur ${decoded.playerId} reconnecté avec succès ! Ancienne session nettoyée.`,
            );
          } else {
            send(ws, {
              type: "error",
              message: "Joueur introuvable dans cette salle.",
            });
          }
        } catch (err) {
          send(ws, {
            type: "error",
            message: "Token invalide ou corrompu. Reconnexion refusée.",
          });
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
