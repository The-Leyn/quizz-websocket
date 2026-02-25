import type { ConnectionStatus } from '../../types'
import { cn } from '../../lib'

export interface ConnectionBadgeProps {
  className?: string
  status: ConnectionStatus
  labels?: Partial<Record<ConnectionStatus, string>>
}

const statusClassMap: Record<ConnectionStatus, string> = {
  connected: 'bg-success-bg text-success',
  connecting: 'animate-pulse bg-warning-bg text-warning',
  disconnected: 'bg-danger-bg text-danger',
}

const defaultLabels: Record<ConnectionStatus, string> = {
  connected: 'Connecte',
  connecting: 'Connexion...',
  disconnected: 'Deconnecte',
}

function ConnectionBadge({ className, status, labels }: ConnectionBadgeProps) {
  const mergedLabels = { ...defaultLabels, ...labels }

  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide',
        statusClassMap[status],
        className
      )}
    >
      {mergedLabels[status]}
    </span>
  )
}

export default ConnectionBadge
