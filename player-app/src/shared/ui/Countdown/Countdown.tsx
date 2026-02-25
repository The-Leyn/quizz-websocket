import { cn } from '../../lib'

export interface CountdownProps {
  className?: string
  remaining: number
  warningAt?: number
  dangerAt?: number
  suffix?: string
  label?: string
}

function Countdown({
  className,
  remaining,
  warningAt = 10,
  dangerAt = 3,
  suffix = 's',
  label = 'Temps restant',
}: CountdownProps) {
  const isDanger = remaining <= dangerAt
  const isWarning = !isDanger && remaining <= warningAt

  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">{label}</p>
      <p
        role="timer"
        aria-live="polite"
        aria-atomic="true"
        className={cn(
          'text-5xl font-bold text-text-strong transition-colors duration-300',
          isWarning && 'text-warning',
          isDanger && 'animate-pulse text-danger',
          className
        )}
      >
        {remaining}
        {suffix}
      </p>
    </div>
  )
}

export default Countdown
