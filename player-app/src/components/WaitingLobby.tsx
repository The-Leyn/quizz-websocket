// ============================================================
// WaitingLobby - Ecran d'attente pour les joueurs
// ============================================================

interface WaitingLobbyProps {
  /** Liste des noms de joueurs connectes */
  players: string[];
}

export default function WaitingLobby({ players }: WaitingLobbyProps) {
  return (
    <div className="phase-container waiting-container">
      <h2 className="waiting-message">
        Vous êtes dans la partie ! <br />
        <small>En attente du lancement par le présentateur...</small>
      </h2>

      <div className="player-count">
        {players.length} joueur(s) dans le salon
      </div>

      <div className="player-list">
        {players.map((playerName, index) => (
          <span key={index} className="player-chip">
            {playerName}
          </span>
        ))}
      </div>
    </div>
  );
}
