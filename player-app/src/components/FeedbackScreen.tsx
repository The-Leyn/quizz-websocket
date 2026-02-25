// ============================================================
// FeedbackScreen - Retour correct/incorrect
// ============================================================

interface FeedbackScreenProps {
  /** Si true, le joueur a repondu correctement */
  correct: boolean;
  /** Score total actuel du joueur */
  score: number;
}

export default function FeedbackScreen({
  correct,
  score,
}: FeedbackScreenProps) {
  // On determine dynamiquement la classe a appliquer
  const statusClass = correct ? "correct" : "incorrect";

  return (
    <div className="phase-container feedback-container">
      <div className={`feedback ${statusClass}`}>
        {/* L'icône est gérée par le CSS via ::after ou un background-image */}
        <div className="feedback-icon"></div>

        <h2 className="feedback-text">
          {correct ? "Bonne réponse ! 🎉" : "Mauvaise réponse... 😢"}
        </h2>

        <div className="feedback-score">Score total : {score} pts</div>
      </div>
    </div>
  );
}
