// ============================================================
// Results - Affichage des resultats d'une question
// ============================================================

import { useState, useEffect } from "react";

interface ResultsProps {
  /** Index de la bonne reponse (0-3) */
  correctIndex: number;
  /** Distribution des reponses [nb_choix_0, nb_choix_1, nb_choix_2, nb_choix_3] */
  distribution: number[];
  /** Texte des choix de reponse */
  choices: string[];
  /** Callback quand le host clique sur "Question suivante" */
  onNext: () => void;
}

export default function Results({
  correctIndex,
  distribution,
  choices,
  onNext,
}: ResultsProps) {
  // On initialise toutes les largeurs à 0% pour préparer l'animation
  const [animatedWidths, setAnimatedWidths] = useState<number[]>(
    new Array(choices.length).fill(0),
  );

  useEffect(() => {
    // 1. Calculer le score maximum pour avoir une barre de référence à 100%
    // On utilise Math.max(..., 1) pour éviter une division par zéro si personne n'a répondu
    const maxCount = Math.max(...distribution, 1);

    // 2. Un très court délai permet au DOM de se peindre à 0% avant d'appliquer les vraies valeurs
    const timerId = setTimeout(() => {
      const newWidths = distribution.map((count) => (count / maxCount) * 100);
      setAnimatedWidths(newWidths);
    }, 50); // 50 millisecondes suffisent largement

    // Nettoyage du timer si le composant est démonté rapidement
    return () => clearTimeout(timerId);
  }, [distribution]);

  return (
    <div className="phase-container">
      <div className="results-container">
        <h1>Résultats</h1>

        <div className="results-list">
          {choices.map((choice, index) => {
            const isCorrect = index === correctIndex;
            const count = distribution[index] || 0;

            // Détermination des classes CSS
            const barStatusClass = isCorrect ? "correct" : "incorrect";

            return (
              <div key={index} className="result-bar-container">
                {/* Le libellé du choix et l'étiquette de bonne réponse */}
                <div className="result-bar-label">
                  {choice}
                  {isCorrect && (
                    <span className="correct-label"> ✓ (Bonne réponse)</span>
                  )}
                </div>

                {/* Le conteneur gris (fond) de la barre */}
                <div className="result-bar-wrapper">
                  {/* La barre colorée qui s'anime */}
                  <div
                    className={`result-bar ${barStatusClass}`}
                    style={{ width: `${animatedWidths[index]}%` }}
                  >
                    {/* Le nombre de votes affiché à l'intérieur de la barre */}
                    <span className="result-count">
                      {count > 0 ? count : ""}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action pour continuer le flux */}
        <button
          className="btn-primary"
          onClick={onNext}
          style={{ marginTop: "2rem" }}
        >
          Suivant (Question ou Classement)
        </button>
      </div>
    </div>
  );
}
