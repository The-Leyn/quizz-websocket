// ============================================================
// Player App - Composant principal
// ============================================================

import { useState, useEffect, useRef } from "react";
import { useWebSocket } from "./hooks/useWebSocket";
import type { QuizPhase, QuizQuestion } from "@shared/index";
import JoinScreen from "./components/JoinScreen";
import WaitingLobby from "./components/WaitingLobby";
import AnswerScreen from "./components/AnswerScreen";
import FeedbackScreen from "./components/FeedbackScreen";
import ScoreScreen from "./components/ScoreScreen";

const WS_URL = "ws://localhost:3001";

function App() {
  const { status, sendMessage, lastMessage } = useWebSocket(WS_URL);

  const [phase, setPhase] = useState<QuizPhase | "join" | "feedback">("join");
  const [playerName, setPlayerName] = useState("");
  const [players, setPlayers] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Omit<
    QuizQuestion,
    "correctIndex"
  > | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [rankings, setRankings] = useState<{ name: string; score: number }[]>(
    [],
  );
  const [error, setError] = useState<string | undefined>(undefined);

  const playerIdRef = useRef<string | null>(null);
  const myAnswerIndexRef = useRef<number | null>(null);

  useEffect(() => {
    if (status === "connected") {
      const savedToken = sessionStorage.getItem("kahoot_token");
      const savedQuizCode = sessionStorage.getItem("kahoot_quizCode");

      if (savedToken && savedQuizCode) {
        sendMessage({
          type: "reconnect",
          quizCode: savedQuizCode,
          token: savedToken,
        });
      }
    }
  }, [status, sendMessage]);

  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case "session": {
        sessionStorage.setItem("kahoot_token", lastMessage.token);
        playerIdRef.current = lastMessage.playerId;
        break;
      }

      case "sync": {
        const data = lastMessage.data as any;
        if (data && data.reconnected) {
          setScore(data.score || 0);
          setPhase(lastMessage.phase as any);
          setError(undefined);

          // 🛠️ CORRECTION PAGE BLANCHE : On restaure la question en cours
          if (data.currentQuestion) {
            setCurrentQuestion(data.currentQuestion);
            setRemaining(data.remaining || 0);
            setHasAnswered(data.hasAnswered || false);
          }
        }
        break;
      }
      case "joined": {
        setPlayers(lastMessage.players);
        setPhase("lobby");
        setError(undefined);
        break;
      }

      case "question": {
        setCurrentQuestion(lastMessage.question);
        setRemaining(lastMessage.question.timerSec);
        setHasAnswered(false);
        myAnswerIndexRef.current = null;
        setPhase("question");
        break;
      }

      case "tick": {
        setRemaining(lastMessage.remaining);
        break;
      }

      case "results": {
        const isCorrect = myAnswerIndexRef.current === lastMessage.correctIndex;
        setLastCorrect(isCorrect);

        const currentId = playerIdRef.current;
        if (
          currentId &&
          lastMessage.scores &&
          lastMessage.scores[currentId] !== undefined
        ) {
          setScore(lastMessage.scores[currentId]);
        }

        setPhase("feedback");
        break;
      }

      case "leaderboard": {
        setRankings(lastMessage.rankings);
        setPhase("leaderboard");
        break;
      }

      case "ended": {
        setPhase("ended");
        sessionStorage.removeItem("kahoot_token");
        sessionStorage.removeItem("kahoot_quizCode");
        break;
      }

      case "error": {
        setError(lastMessage.message);
        if (
          lastMessage.message.includes("Token") ||
          lastMessage.message.includes("salle n'existe plus")
        ) {
          sessionStorage.removeItem("kahoot_token");
          sessionStorage.removeItem("kahoot_quizCode");
        }
        break;
      }
    }
  }, [lastMessage]);

  const handleJoin = (code: string, name: string) => {
    setPlayerName(name);
    sessionStorage.setItem("kahoot_quizCode", code);
    sendMessage({ type: "join", quizCode: code, name });
  };

  const handleAnswer = (choiceIndex: number) => {
    if (hasAnswered || !currentQuestion) return;

    setHasAnswered(true);
    myAnswerIndexRef.current = choiceIndex;
    sendMessage({
      type: "answer",
      questionId: currentQuestion.id,
      choiceIndex,
    });
  };

  const renderPhase = () => {
    switch (phase) {
      case "join":
        return <JoinScreen onJoin={handleJoin} error={error} />;
      case "lobby":
        return <WaitingLobby players={players} />;
      case "question":
        return currentQuestion ? (
          <AnswerScreen
            question={currentQuestion}
            remaining={remaining}
            onAnswer={handleAnswer}
            hasAnswered={hasAnswered}
          />
        ) : null;
      case "feedback":
      case "results":
        return <FeedbackScreen correct={lastCorrect} score={score} />;
      case "leaderboard":
        return <ScoreScreen rankings={rankings} playerName={playerName} />;
      case "ended":
        return (
          <div className="phase-container">
            <h1>Quiz terminé !</h1>
            <p className="ended-message">Merci d'avoir participé !</p>
            <button
              className="btn-primary"
              onClick={() => {
                setPhase("join");
                playerIdRef.current = null;
                setScore(0);
              }}
            >
              Rejoindre un autre quiz
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h2>Quiz Player</h2>
        <span className={`status-badge status-${status}`}>
          {status === "connected"
            ? "Connecté"
            : status === "connecting"
              ? "Connexion..."
              : "Déconnecté"}
        </span>
      </header>
      <main className="app-main">{renderPhase()}</main>
    </div>
  );
}

export default App;
