// ============================================================
// Lobby - Salle d'attente avant le quiz
// ============================================================

interface LobbyProps {
  /** Code du quiz a afficher pour que les joueurs rejoignent */
  quizCode: string;
  /** Liste des noms de joueurs connectes */
  players: string[];
  /** Callback quand le host clique sur "Demarrer" */
  onStart: () => void;
}

export default function Lobby({ quizCode, players, onStart }: LobbyProps) {
  return (
    <div className="phase-container">
      {/* Code du quiz affiché en grand */}
      <div className="quiz-code-label">Code du quiz pour rejoindre :</div>
      <div className="quiz-code">{quizCode}</div>

      {/* Compteur de joueurs */}
      <div className="player-count">Joueurs connectés : {players.length}</div>

      {/* Liste dynamique des joueurs */}
      <div className="player-list">
        {players.length > 0 ? (
          players.map((playerName, index) => (
            // On utilise l'index comme clé ici car on a juste un tableau de strings
            <span key={index} className="player-chip">
              {playerName}
            </span>
          ))
        ) : (
          <p>En attente de joueurs...</p>
        )}
      </div>

      {/* Bouton pour lancer la partie */}
      <button
        className="btn-start btn-primary"
        onClick={onStart}
        disabled={players.length === 0}
      >
        Démarrer le quiz
      </button>
    </div>
  );
}
