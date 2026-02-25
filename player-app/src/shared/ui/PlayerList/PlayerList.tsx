import { cn } from '../../lib'

export interface PlayerListProps {
  className?: string
  players: string[]
  emptyMessage?: string
  itemClassName?: string
  ariaLabel?: string
}

function PlayerList({
  className,
  players,
  emptyMessage = 'Aucun joueur pour le moment.',
  itemClassName,
  ariaLabel = 'Liste des joueurs',
}: PlayerListProps) {
  if (players.length === 0) {
    return <p className={cn('text-sm text-text-muted', className)}>{emptyMessage}</p>
  }

  return (
    <ul
      className={cn('mt-5 flex flex-wrap justify-center gap-2.5 sm:gap-3', className)}
      aria-label={ariaLabel}
    >
      {players.map((player, index) => (
        <li
          key={`${player}-${index}`}
          className={cn(
            'inline-flex min-h-9 items-center rounded-full border border-border/70 bg-border px-4 py-1.5 text-sm font-semibold leading-none text-accent-soft',
            itemClassName
          )}
        >
          {player}
        </li>
      ))}
    </ul>
  )
}

export default PlayerList
