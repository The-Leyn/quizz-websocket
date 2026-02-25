// ============================================================
// AnswerScreen - Boutons de réponse colorés
// ============================================================

import { useState } from "react";
import type { QuizQuestion } from "@shared/index";

interface AnswerScreenProps {
  /** La question en cours (sans correctIndex) */
  question: Omit<QuizQuestion, "correctIndex">;
  /** Temps restant en secondes */
  remaining: number;
  /** Callback quand le joueur clique sur un choix */
  onAnswer: (choiceIndex: number) => void;
  /** Si true, le joueur a déjà répondu */
  hasAnswered: boolean;
}

export default function AnswerScreen({
  question,
  remaining,
  onAnswer,
  hasAnswered,
}: AnswerScreenProps) {
  // On stocke l'index du choix cliqué pour le mettre en surbrillance
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleClick = (index: number) => {
    // Sécurité supplémentaire : on ne fait rien si le joueur a déjà répondu
    if (hasAnswered) return;

    setSelectedIndex(index);
    onAnswer(index);
  };

  // Calcul dynamique de la couleur du chronomètre
  let timerClass = "answer-timer";
  if (remaining <= 3) {
    timerClass += " danger";
  } else if (remaining <= 10) {
    timerClass += " warning";
  }

  return (
    <div className="answer-screen phase-container">
      {/* Chronomètre */}
      <div className={timerClass}>{remaining}</div>

      {/* Texte de la question */}
      <h2 className="answer-question">{question.text}</h2>

      {/* Grille des boutons de réponse */}
      <div className="answer-grid">
        {question.choices.map((choice, index) => {
          const isSelected = selectedIndex === index;

          return (
            <button
              key={index}
              className={`answer-btn ${isSelected ? "selected" : ""}`}
              onClick={() => handleClick(index)}
              disabled={hasAnswered} // Désactive tous les boutons dès qu'une réponse est envoyée
            >
              <span className="choice-text">{choice}</span>
            </button>
          );
        })}
      </div>

      {/* Message de confirmation */}
      {hasAnswered && (
        <div className="answered-message">
          Réponse envoyée ! En attente des autres joueurs... ⏳
        </div>
      )}
    </div>
  );
}
