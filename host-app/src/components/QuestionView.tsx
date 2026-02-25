// ============================================================
// QuestionView - Affichage de la question en cours (cote host)
// ============================================================

import type { QuizQuestion } from "@shared/index";

interface QuestionViewProps {
  /** La question en cours (sans correctIndex) */
  question: Omit<QuizQuestion, "correctIndex">;
  /** Index de la question (0-based) */
  index: number;
  /** Nombre total de questions */
  total: number;
  /** Temps restant en secondes */
  remaining: number;
  /** Nombre de joueurs ayant repondu */
  answerCount: number;
  /** Nombre total de joueurs */
  totalPlayers: number;
}

export default function QuestionView({
  question,
  index,
  total,
  remaining,
  answerCount,
  totalPlayers,
}: QuestionViewProps) {
  // Logique pour calculer la couleur du timer en fonction du temps restant
  let timerClass = "countdown-circle";
  if (remaining <= 3) {
    timerClass += " danger"; // Rouge clignotant (selon ton CSS)
  } else if (remaining <= 10) {
    timerClass += " warning"; // Orange
  }

  return (
    <div className="phase-container">
      {/* En-tête : Progression dans le quiz */}
      <div className="question-header">
        Question {index + 1} / {total}
      </div>

      {/* Affichage du compte à rebours */}
      <div className="countdown">
        <div className={timerClass}>{remaining}</div>
      </div>

      {/* Texte de la question écrit en grand */}
      <h2 className="question-text">{question.text}</h2>

      {/* Grille des 4 choix de réponses (purement visuel pour le Host) */}
      <div className="choices-grid">
        {question.choices.map((choice, i) => (
          // On peut supposer que ton CSS contient des couleurs Kahoot-like (ex: .choice-color-1)
          <div key={i} className={`choice-card choice-color-${i + 1}`}>
            {choice}
          </div>
        ))}
      </div>

      {/* Compteur en temps réel des joueurs qui ont "lock" leur réponse */}
      <div className="answer-counter">
        {answerCount} / {totalPlayers} réponses reçues
      </div>
    </div>
  );
}
