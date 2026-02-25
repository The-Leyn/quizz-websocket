import ScoreScreen from '../../../widgets/ScoreScreen'

interface LeaderboardPageProps {
  rankings: { name: string; score: number }[]
  playerName: string
}

function LeaderboardPage({ rankings, playerName }: LeaderboardPageProps) {
  return <ScoreScreen rankings={rankings} playerName={playerName} />
}

export default LeaderboardPage
