import type { QuizQuestion } from '@shared/index'
import AnswerScreen from '../../../widgets/AnswerScreen'

interface QuestionPageProps {
  question: Omit<QuizQuestion, 'correctIndex'>
  remaining: number
  onAnswer: (choiceIndex: number) => void
  hasAnswered: boolean
}

function QuestionPage({ question, remaining, onAnswer, hasAnswered }: QuestionPageProps) {
  return (
    <AnswerScreen
      question={question}
      remaining={remaining}
      onAnswer={onAnswer}
      hasAnswered={hasAnswered}
    />
  )
}

export default QuestionPage
