import WaitingLobby from '../../../widgets/WaitingLobby'

interface LobbyPageProps {
  players: string[]
}

function LobbyPage({ players }: LobbyPageProps) {
  return <WaitingLobby players={players} />
}

export default LobbyPage
