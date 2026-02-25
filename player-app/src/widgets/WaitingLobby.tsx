import { Card, PlayerList, ScreenContainer, Title } from '../shared/ui'

interface WaitingLobbyProps {
  players: string[]
}

function WaitingLobby({ players }: WaitingLobbyProps) {
  return (
    <ScreenContainer size="lg">
      <Card className="space-y-6 text-center sm:space-y-7">
        <header className="space-y-3">
          <Title size="lg">Salle d'attente</Title>
          <p className="animate-pulse text-lg text-text-muted">En attente du host...</p>
        </header>

        <p className="text-base font-semibold text-text-muted" aria-live="polite">
          {players.length} joueur{players.length > 1 ? 's' : ''} connecte{players.length > 1 ? 's' : ''}
        </p>

        <PlayerList players={players} className="justify-center" />
      </Card>
    </ScreenContainer>
  )
}

export default WaitingLobby
