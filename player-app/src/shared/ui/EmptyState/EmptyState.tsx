export interface EmptyStateProps {
  className?: string
}
function EmptyState({ className }: EmptyStateProps) {
  return <div className={className} />
}
export default EmptyState
