import { Card, FeedbackPanel, ScreenContainer } from '../shared/ui'

interface FeedbackScreenProps {
  correct: boolean
  score: number
}

function FeedbackScreen({ correct, score }: FeedbackScreenProps) {
  return (
    <ScreenContainer size="sm">
      <Card className="py-6 sm:py-8">
        <FeedbackPanel correct={correct} score={score} />
      </Card>
    </ScreenContainer>
  )
}

export default FeedbackScreen
