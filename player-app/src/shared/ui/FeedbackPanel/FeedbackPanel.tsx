import { formatScore } from '../../lib'
import { cn } from '../../lib'

export interface FeedbackPanelProps {
  className?: string
  correct: boolean
  score: number
  correctText?: string
  incorrectText?: string
}

function FeedbackPanel({
  className,
  correct,
  score,
  correctText = 'Bonne reponse !',
  incorrectText = 'Mauvaise reponse',
}: FeedbackPanelProps) {
  return (
    <section
      className={cn(
        'space-y-3 text-center',
        correct ? 'text-success' : 'text-danger',
        className
      )}
      aria-live="polite"
    >
      <div
        className={cn(
          'mx-auto flex h-20 w-20 items-center justify-center rounded-full border-4 text-5xl font-black sm:h-24 sm:w-24',
          correct ? 'border-success/40 bg-success-bg/30' : 'border-danger/40 bg-danger-bg/30'
        )}
        aria-hidden
      >
        {correct ? '✓' : '✕'}
      </div>
      <p className="text-3xl font-bold">{correct ? correctText : incorrectText}</p>
      <p className="text-xl font-semibold text-accent">Score : {formatScore(score)} pts</p>
    </section>
  )
}

export default FeedbackPanel
