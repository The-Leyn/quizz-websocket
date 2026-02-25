import { cn } from '../../lib'
import Title from '../Title'
import LeaderboardRow from '../LeaderboardRow'
import { Crown } from 'lucide-react';

interface RankingItem {
  name: string
  score: number
}

export interface LeaderboardListProps {
  className?: string
  rankings: RankingItem[]
  currentPlayerName?: string
  title?: string
  emptyMessage?: string
}

function LeaderboardList({
  className,
  rankings,
  currentPlayerName,
  title = 'Classement',
  emptyMessage = 'Le classement apparaitra a la fin de la manche.',
}: LeaderboardListProps) {
  return (
    <section className={cn('w-full space-y-6', className)}>
      <Title as="h2" size="md" className="text-center sm:text-3xl">
        {title}
      </Title>

      {rankings.length === 0 ? (
        <p className="text-center text-sm text-text-muted">{emptyMessage}</p>
      ) : (
        <ol className="m-0 list-none space-y-2.5 p-0" aria-label="Classement des joueurs">
          {rankings.map((player, index) => (
            <LeaderboardRow
              key={`${player.name}-${index}`}
              rank={index + 1}
              name={player.name}
              score={player.score}
              isCurrentPlayer={player.name === currentPlayerName}
            />
          ))}
        </ol>
      )}
    </section>
  )
}

export default LeaderboardList
