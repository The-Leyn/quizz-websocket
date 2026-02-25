import { cn, formatScore } from '../../lib'

export interface LeaderboardRowProps {
  className?: string
  rank: number
  name: string
  score: number
  isCurrentPlayer?: boolean
}

function LeaderboardRow({
  className,
  rank,
  name,
  score,
  isCurrentPlayer = false,
}: LeaderboardRowProps) {
  return (
    <li
      aria-current={isCurrentPlayer ? 'true' : undefined}
      className={cn(
        'flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left sm:px-5',
        'bg-surface-2 text-text',
        rank === 1 && 'bg-gradient-to-r from-brand to-brand-800',
        rank === 2 && 'bg-gradient-to-r from-brand-600 to-brand-900',
        rank === 3 && 'bg-gradient-to-r from-brand-700 to-brand-950',
        isCurrentPlayer && 'ring-2 ring-accent shadow-[0_0_15px_rgba(124,58,237,0.35)]',
        className
      )}
    >
      <span className="w-7 text-center text-2xl font-black leading-none text-accent-soft">{rank}</span>
      <span className="flex-1 truncate text-lg font-semibold leading-none">{name}</span>
      <span className="text-lg font-bold leading-none text-accent">{formatScore(score)}</span>
    </li>
  )
}

export default LeaderboardRow
