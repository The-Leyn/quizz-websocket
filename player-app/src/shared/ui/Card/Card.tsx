import type { ReactNode } from 'react'
import { cn } from '../../lib'

export interface CardProps {
  className?: string
  children: ReactNode
}

function Card({ className, children }: CardProps) {
  return (
    <div
      className={cn(
        'w-full rounded-3xl border border-border/85 bg-surface/95 p-4 shadow-[0_12px_36px_rgba(0,0,0,0.3)] backdrop-blur-sm sm:p-6',
        className
      )}
    >
      {children}
    </div>
  )
}

export default Card
