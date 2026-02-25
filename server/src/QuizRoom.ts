// ============================================================
// QuizRoom - Logique d'une salle de quiz
// ============================================================

import WebSocket from "ws";
import crypto from "crypto";
import type {
  QuizQuestion,
  QuizPhase,
  ServerMessage,
} from "../../packages/shared-types";
import { send, broadcast } from "./utils";

/** Represente un joueur connecte */
interface Player {
  id: string;
  name: string;
  ws: WebSocket;
}

export class QuizRoom {
  readonly id: string;
  readonly code: string;
  phase: QuizPhase = "lobby";
  hostWs: WebSocket | null = null;
  players: Map<string, Player> = new Map();
  questions: QuizQuestion[] = [];
  title: string = "";
  currentQuestionIndex: number = -1;
  answers: Map<string, number> = new Map();
  scores: Map<string, number> = new Map();
  timerId: ReturnType<typeof setInterval> | null = null;
  remaining: number = 0;

  constructor(id: string, code: string) {
    this.id = id;
    this.code = code;
  }

  addPlayer(name: string, ws: WebSocket): string {
    const id = crypto.randomUUID(); // Génère un ID unique

    this.players.set(id, { id, name, ws });
    this.scores.set(id, 0);

    // Récupérer uniquement les noms pour le broadcast
    const playerNames = Array.from(this.players.values()).map((p) => p.name);

    this.broadcastToAll({ type: "joined", playerId: id, players: playerNames });

    return id;
  }

  start(): void {
    if (this.phase !== "lobby") return;
    if (this.players.size === 0) return; // Sécurité : pas de quiz sans joueurs

    this.nextQuestion();
  }

  nextQuestion(): void {
    if (this.timerId) clearInterval(this.timerId);

    this.currentQuestionIndex++;

    // Vérifier si c'est la fin du quiz
    if (this.currentQuestionIndex >= this.questions.length) {
      this.broadcastLeaderboard();
      return;
    }

    this.answers.clear();
    this.phase = "question";

    const question = this.questions[this.currentQuestionIndex];
    this.remaining = question.timerSec;

    this.broadcastQuestion();

    // Démarrer le compte à rebours (1 tick par seconde)
    this.timerId = setInterval(() => this.tick(), 1000);
  }

  handleAnswer(playerId: string, choiceIndex: number): void {
    if (this.phase !== "question") return;
    if (this.answers.has(playerId)) return; // Le joueur a déjà répondu

    this.answers.set(playerId, choiceIndex);

    const question = this.questions[this.currentQuestionIndex];

    // Calcul du score si la réponse est correcte
    if (choiceIndex === question.correctIndex) {
      const points =
        1000 + Math.round(500 * (this.remaining / question.timerSec));
      const currentScore = this.scores.get(playerId) || 0;
      this.scores.set(playerId, currentScore + points);
    }

    // Si tout le monde a répondu, on coupe court au timer
    if (this.answers.size === this.players.size) {
      this.timeUp();
    }
  }

  private tick(): void {
    this.remaining--;
    this.broadcastToAll({ type: "tick", remaining: this.remaining });

    if (this.remaining <= 0) {
      this.timeUp();
    }
  }

  private timeUp(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.phase = "results";
    this.broadcastResults();
  }

  private getPlayerWsList(): WebSocket[] {
    return Array.from(this.players.values()).map((p) => p.ws);
  }

  private broadcastToAll(message: ServerMessage): void {
    if (this.hostWs) {
      send(this.hostWs, message);
    }
    broadcast(this.getPlayerWsList(), message);
  }

  private broadcastQuestion(): void {
    const question = this.questions[this.currentQuestionIndex];

    // Destructuration pour exclure `correctIndex` et ne pas tricher côté client
    const { correctIndex, ...safeQuestion } = question;

    this.broadcastToAll({
      type: "question",
      question: safeQuestion,
      index: this.currentQuestionIndex,
      total: this.questions.length,
    });
  }

  private broadcastResults(): void {
    const question = this.questions[this.currentQuestionIndex];
    const distribution = new Array(question.choices.length).fill(0);

    // Calcul de la répartition des réponses
    for (const choice of this.answers.values()) {
      if (choice >= 0 && choice < distribution.length) {
        distribution[choice]++;
      }
    }

    // Formatage des scores ({ "Nom du joueur": score })
    const scoresRecord: Record<string, number> = {};
    for (const [playerId, player] of this.players.entries()) {
      scoresRecord[player.name] = this.scores.get(playerId) || 0;
    }

    this.broadcastToAll({
      type: "results",
      correctIndex: question.correctIndex,
      distribution,
      scores: scoresRecord,
    });
  }

  broadcastLeaderboard(): void {
    this.phase = "leaderboard";

    // Construction et tri du classement
    const rankings = Array.from(this.players.values())
      .map((player) => ({
        name: player.name,
        score: this.scores.get(player.id) || 0,
      }))
      .sort((a, b) => b.score - a.score); // Décroissant

    this.broadcastToAll({ type: "leaderboard", rankings });
  }

  end(): void {
    if (this.timerId) clearInterval(this.timerId);
    this.phase = "ended";
    this.broadcastToAll({ type: "ended" });
  }

  // Bonus

  // Pour reconnecter un joueur qui a perdu sa connexion
  reconnectPlayer(playerId: string, newWs: WebSocket): boolean {
    const player = this.players.get(playerId);

    if (!player) return false;

    player.ws = newWs;

    return true;
  }
}
