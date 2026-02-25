import { useState } from 'react'
import { Alert, Button, Card, CodeInput, ScreenContainer, TextInput, Title } from '../shared/ui'

interface JoinScreenProps {
  onJoin: (code: string, name: string) => void
  error?: string
}

function JoinScreen({ onJoin, error }: JoinScreenProps) {
  const [quizCode, setQuizCode] = useState('')
  const [playerPseudo, setPlayerPseudo] = useState('')

  const isInvalid = quizCode.trim().length === 0 || playerPseudo.trim().length === 0

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    if (isInvalid) return

    onJoin(quizCode.trim().toUpperCase(), playerPseudo.trim())
  }

  return (
    <ScreenContainer size="sm">
      <form className="mx-auto w-full max-w-md" onSubmit={handleSubmit} aria-label="Formulaire de connexion au quiz">
        <Card className="space-y-6">
          <header className="space-y-2 text-center">
            <Title size="xl">Rejoindre un Quiz</Title>
            <p className="text-sm text-text-muted">Entre le code fourni par le host et ton pseudo.</p>
          </header>

          {error ? <Alert variant="error">{error}</Alert> : null}

          <CodeInput value={quizCode} onChange={setQuizCode} autoFocus hint="6 caracteres alphanumeriques" />

          <TextInput
            label="Pseudo"
            placeholder="Ton pseudo"
            maxLength={20}
            value={playerPseudo}
            onChange={(event) => setPlayerPseudo(event.target.value)}
            hint="Visible par les autres joueurs"
          />

          <Button type="submit" size="lg" fullWidth disabled={isInvalid}>
            Rejoindre
          </Button>
        </Card>
      </form>
    </ScreenContainer>
  )
}

export default JoinScreen
