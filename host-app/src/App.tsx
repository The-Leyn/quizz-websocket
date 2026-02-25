// ============================================================
// Host App - Composant principal
// ============================================================

import { useState, useEffect } from "react";
import { useWebSocket } from "./hooks/useWebSocket";
import type { QuizPhase, QuizQuestion } from "@shared/index";
import CreateQuiz from "./components/CreateQuiz";
import Lobby from "./components/Lobby";
import QuestionView from "./components/QuestionView";
import Results from "./components/Results";
import Leaderboard from "./components/Leaderboard";

const WS_URL = "ws://localhost:3001";

function App() {
  const { status, sendMessage, lastMessage } = useWebSocket(WS_URL);

  // --- Etats de l'application ---
  const [phase, setPhase] = useState<QuizPhase | "create">("create");
  const [quizCode, setQuizCode] = useState("");
  const [players, setPlayers] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Omit<
    QuizQuestion,
    "correctIndex"
  > | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questionTotal, setQuestionTotal] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [answerCount, setAnswerCount] = useState(0);
  const [correctIndex, setCorrectIndex] = useState(-1);
  const [distribution, setDistribution] = useState<number[]>([]);
  const [rankings, setRankings] = useState<{ name: string; score: number }[]>(
    [],
  );

  // --- Traitement des messages du serveur ---
  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case "sync": {
        // Le serveur nous confirme la création et donne le code
        if (lastMessage.phase === "lobby") {
          const data = lastMessage.data as { quizCode: string };
          setQuizCode(data.quizCode);
          setPhase("lobby");
        }
        break;
      }

      case "joined": {
        // Un nouveau joueur est arrivé
        setPlayers(lastMessage.players);
        break;
      }

      case "question": {
        // Une nouvelle question commence
        setCurrentQuestion(lastMessage.question);
        setQuestionIndex(lastMessage.index);
        setQuestionTotal(lastMessage.total);
        setRemaining(lastMessage.question.timerSec);
        setAnswerCount(0); // On remet le compteur de réponses à zéro
        setPhase("question");
        break;
      }

      case "tick": {
        // Le chrono défile
        setRemaining(lastMessage.remaining);
        break;
      }

      case "results": {
        // Le temps est écoulé, on affiche les barres de résultats
        setCorrectIndex(lastMessage.correctIndex);
        setDistribution(lastMessage.distribution);

        // La somme du tableau de distribution donne le nombre total de votants
        const totalVotes = lastMessage.distribution.reduce(
          (acc, curr) => acc + curr,
          0,
        );
        setAnswerCount(totalVotes);

        setPhase("results");
        break;
      }

      case "leaderboard": {
        // Affichage du podium
        setRankings(lastMessage.rankings);
        setPhase("leaderboard");
        break;
      }

      case "ended": {
        // Fin de partie
        setPhase("ended");
        // Optionnel : on pourrait réinitialiser les states ici si on veut rejouer propre
        break;
      }

      case "error": {
        // Une erreur est survenue (ex: connexion perdue, mauvaise manip)
        console.error("Erreur serveur:", lastMessage.message);
        alert(`Erreur: ${lastMessage.message}`);
        break;
      }
      case "playerAnswered": {
        setAnswerCount(lastMessage.count);
        break;
      }
    }
  }, [lastMessage]);

  // --- Handlers (Actions déclenchées par l'utilisateur) ---

  const handleCreateQuiz = (title: string, questions: QuizQuestion[]) => {
    sendMessage({ type: "host:create", title, questions });
  };

  const handleStart = () => {
    sendMessage({ type: "host:start" });
  };

  const handleNext = () => {
    sendMessage({ type: "host:next" });
  };

  // --- Rendu par phase ---
  const renderPhase = () => {
    switch (phase) {
      case "create":
        return <CreateQuiz onSubmit={handleCreateQuiz} />;

      case "lobby":
        return (
          <Lobby quizCode={quizCode} players={players} onStart={handleStart} />
        );

      case "question":
        return currentQuestion ? (
          <QuestionView
            question={currentQuestion}
            index={questionIndex}
            total={questionTotal}
            remaining={remaining}
            answerCount={answerCount}
            totalPlayers={players.length}
          />
        ) : null;

      case "results":
        return currentQuestion ? (
          <Results
            correctIndex={correctIndex}
            distribution={distribution}
            choices={currentQuestion.choices}
            onNext={handleNext}
          />
        ) : null;

      case "leaderboard":
        return <Leaderboard rankings={rankings} />;

      case "ended":
        return (
          <div className="phase-container">
            <h1>Quiz terminé !</h1>
            <button
              className="btn-primary"
              onClick={() => {
                setPhase("create");
                setPlayers([]);
              }}
            >
              Créer un nouveau quiz
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
        <h2>Quiz Host</h2>
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
