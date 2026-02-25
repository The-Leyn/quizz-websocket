import WebSocket from "ws";
import crypto from "crypto";
import type {
  QuizQuestion,
  QuizPhase,
  ServerMessage,
} from "../../packages/shared-types";
import { send, broadcast } from "./utils";

interface Player {
  id: string;
  name: string;
  ws: WebSocket;
  sessionKey: string;
}

export class QuizRoom {
  readonly id: string;
  readonly code: string;
  phase: QuizPhase = "lobby";
  hostWs: WebSocket | null = null;
  players: Map<string, Player> = new Map();
  questions: QuizQuestion[] = [];
  title = "";
  currentQuestionIndex = -1;
  answers: Map<string, number> = new Map();
  scores: Map<string, number> = new Map();
  timerId: ReturnType<typeof setInterval> | null = null;
  remaining = 0;

  constructor(id: string, code: string) {
    this.id = id;
    this.code = code;
  }

  addPlayer(name: string, ws: WebSocket): string {
    const id = crypto.randomUUID();
    const sessionKey = crypto.randomUUID();

    this.players.set(id, { id, name, ws, sessionKey });
    this.scores.set(id, 0);

    const playerNames = Array.from(this.players.values()).map((p) => p.name);
    this.broadcastToAll({ type: "joined", playerId: id, players: playerNames });

    return id;
  }

  getPlayerSessionKey(playerId: string): string | null {
    const player = this.players.get(playerId);
    if (!player) return null;
    return player.sessionKey;
  }

  isValidSession(playerId: string, sessionKey: string): boolean {
    const player = this.players.get(playerId);
    if (!player) return false;
    return player.sessionKey === sessionKey;
  }

  start(): void {
    if (this.phase !== "lobby") return;
    if (this.players.size === 0) return;

    this.nextQuestion();
  }

  nextQuestion(): void {
    if (this.timerId) clearInterval(this.timerId);

    this.currentQuestionIndex++;

    if (this.currentQuestionIndex >= this.questions.length) {
      this.broadcastLeaderboard();
      return;
    }

    this.answers.clear();
    this.phase = "question";

    const question = this.questions[this.currentQuestionIndex];
    this.remaining = question.timerSec;

    this.broadcastQuestion();
    this.timerId = setInterval(() => this.tick(), 1000);
  }

  handleAnswer(playerId: string, choiceIndex: number): void {
    if (this.phase !== "question") return;
    if (this.answers.has(playerId)) return;

    this.answers.set(playerId, choiceIndex);

    const question = this.questions[this.currentQuestionIndex];

    if (choiceIndex === question.correctIndex) {
      const points = 1000 + Math.round(500 * (this.remaining / question.timerSec));
      const currentScore = this.scores.get(playerId) || 0;
      this.scores.set(playerId, currentScore + points);
    }

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

    for (const choice of this.answers.values()) {
      if (choice >= 0 && choice < distribution.length) {
        distribution[choice]++;
      }
    }

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

    const rankings = Array.from(this.players.values())
      .map((player) => ({
        name: player.name,
        score: this.scores.get(player.id) || 0,
      }))
      .sort((a, b) => b.score - a.score);

    this.broadcastToAll({ type: "leaderboard", rankings });
  }

  end(): void {
    if (this.timerId) clearInterval(this.timerId);
    this.phase = "ended";
    this.broadcastToAll({ type: "ended" });
  }

  reconnectPlayer(playerId: string, newWs: WebSocket): WebSocket | null {
    const player = this.players.get(playerId);
    if (!player) {
      return null;
    }

    const oldWs = player.ws;
    player.ws = newWs;

    return oldWs;
  }
}
