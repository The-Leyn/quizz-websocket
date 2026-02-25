import FeedbackScreen from '../../../widgets/FeedbackScreen'

interface FeedbackPageProps {
  correct: boolean
  score: number
}

function FeedbackPage({ correct, score }: FeedbackPageProps) {
  return <FeedbackScreen correct={correct} score={score} />
}

export default FeedbackPage
