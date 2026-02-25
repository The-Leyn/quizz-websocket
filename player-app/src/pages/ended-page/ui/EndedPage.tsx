import { Button, ScreenContainer, Title } from '../../../shared/ui'

interface EndedPageProps {
  onRestart: () => void
}

function EndedPage({ onRestart }: EndedPageProps) {
  return (
    <ScreenContainer size="sm">
      <div className="space-y-5 rounded-2xl border border-border bg-surface p-6 text-center">
        <Title>Quiz termine !</Title>
        <p className="text-base text-text-muted">Merci d'avoir participe !</p>
        <Button fullWidth onClick={onRestart}>
          Rejoindre un autre quiz
        </Button>
      </div>
    </ScreenContainer>
  )
}

export default EndedPage
