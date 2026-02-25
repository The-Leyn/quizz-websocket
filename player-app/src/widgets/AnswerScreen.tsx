import { useEffect, useState } from 'react'
import type { QuizQuestion } from '@shared/index'
import { Card, ChoiceGrid, Countdown, ScreenContainer, Title } from '../shared/ui'

interface AnswerScreenProps {
  question: Omit<QuizQuestion, 'correctIndex'>
  remaining: number
  onAnswer: (choiceIndex: number) => void
  hasAnswered: boolean
}

function AnswerScreen({ question, remaining, onAnswer, hasAnswered }: AnswerScreenProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>(undefined)

  useEffect(() => {
    setSelectedIndex(undefined)
  }, [question.id])

  const handleClick = (index: number) => {
    if (hasAnswered) return

    setSelectedIndex(index)
    onAnswer(index)
  }

  return (
    <ScreenContainer size="lg">
      <Card className="space-y-6 text-center">
        <Countdown remaining={remaining} suffix="" />

        <Title as="h2" size="md" className="mx-auto max-w-2xl leading-snug">
          {question.text}
        </Title>

        <ChoiceGrid
          options={question.choices.map((choice) => ({ label: choice }))}
          selectedIndex={selectedIndex}
          disabled={hasAnswered}
          onSelect={handleClick}
          ariaLabel="Choisis une reponse"
          className="pt-1"
        />

        {hasAnswered ? (
          <p className="animate-pulse text-base font-medium text-text-muted sm:text-lg" aria-live="polite">
            Reponse envoyee !
          </p>
        ) : (
          <p className="text-sm text-text-muted">Selectionne une reponse avant la fin du temps.</p>
        )}
      </Card>
    </ScreenContainer>
  )
}

export default AnswerScreen
