import JoinScreen from '../../../widgets/JoinScreen'

interface JoinPageProps {
  onJoin: (code: string, name: string) => void
  error?: string
}

function JoinPage({ onJoin, error }: JoinPageProps) {
  return <JoinScreen onJoin={onJoin} error={error} />
}

export default JoinPage
