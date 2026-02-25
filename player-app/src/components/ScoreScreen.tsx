// ============================================================
// ScoreScreen - Classement avec position du joueur
// ============================================================

interface ScoreScreenProps {
  /** Classement trie par score decroissant */
  rankings: { name: string; score: number }[];
  /** Nom du joueur actuel (pour le mettre en surbrillance) */
  playerName: string;
}

export default function ScoreScreen({
  rankings,
  playerName,
}: ScoreScreenProps) {
  return (
    <div className="phase-container score-screen">
      <h1 className="leaderboard-title">Classement Final</h1>

      <div className="leaderboard">
        {rankings.map((player, index) => {
          // On vérifie si c'est la ligne du joueur actuel
          const isMe = player.name === playerName;

          return (
            <div
              key={index}
              className={`leaderboard-item ${isMe ? "is-me" : ""}`}
            >
              {/* Affichage du rang (avec les médailles pour le podium) */}
              <div className="leaderboard-rank">
                {index === 0
                  ? "🥇"
                  : index === 1
                    ? "🥈"
                    : index === 2
                      ? "🥉"
                      : `#${index + 1}`}
              </div>

              <div className="leaderboard-name">
                {player.name} {isMe && "(Toi)"}
              </div>

              <div className="leaderboard-score">{player.score} pts</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
