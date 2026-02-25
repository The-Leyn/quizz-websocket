import { Card, LeaderboardList, ScreenContainer } from '../shared/ui'

interface ScoreScreenProps {
  rankings: { name: string; score: number }[]
  playerName: string
}

function ScoreScreen({ rankings, playerName }: ScoreScreenProps) {
  return (
    <ScreenContainer size="md">
      <Card className="px-3 py-5 sm:px-4 sm:py-6">
        <LeaderboardList rankings={rankings} currentPlayerName={playerName} />
      </Card>
    </ScreenContainer>
  )
}

export default ScoreScreen
