// ============================================================
// Leaderboard - Classement des joueurs
// ============================================================

interface LeaderboardProps {
  /** Classement trie par score decroissant */
  rankings: { name: string; score: number }[];
}

export default function Leaderboard({ rankings }: LeaderboardProps) {
  return (
    <div className="phase-container">
      <h1 className="leaderboard-title">Classement Final 🏆</h1>

      <div className="leaderboard">
        {rankings.length > 0 ? (
          rankings.map((player, index) => (
            <div key={index} className="leaderboard-item">
              {/* Le rang correspond à l'index du tableau + 1 */}
              <div className="leaderboard-rank">
                {index === 0
                  ? "🥇"
                  : index === 1
                    ? "🥈"
                    : index === 2
                      ? "🥉"
                      : `#${index + 1}`}
              </div>

              <div className="leaderboard-name">{player.name}</div>

              <div className="leaderboard-score">{player.score} pts</div>
            </div>
          ))
        ) : (
          <p style={{ textAlign: "center" }}>
            Aucun joueur n'a participé au quiz.
          </p>
        )}
      </div>
    </div>
  );
}
