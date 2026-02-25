import type { ReactNode } from 'react'
import { cn } from '../../lib'
import ChoiceButton from '../ChoiceButton'

interface ChoiceOption {
  label: string
}

export interface ChoiceGridProps {
  className?: string
  children?: ReactNode
  options?: ChoiceOption[]
  selectedIndex?: number
  disabled?: boolean
  onSelect?: (index: number) => void
  ariaLabel?: string
}

function ChoiceGrid({
  className,
  children,
  options,
  selectedIndex,
  disabled = false,
  onSelect,
  ariaLabel = 'Choix de reponse',
}: ChoiceGridProps) {
  return (
    <div className={cn('grid grid-cols-1 gap-3 sm:grid-cols-2', className)} role="group" aria-label={ariaLabel}>
      {children
        ? children
        : options?.map((choice, index) => (
            <ChoiceButton
              key={`${choice.label}-${index}`}
              index={index}
              selected={selectedIndex === index}
              disabled={disabled}
              onClick={() => onSelect?.(index)}
            >
              {choice.label}
            </ChoiceButton>
          ))}
    </div>
  )
}

export default ChoiceGrid
