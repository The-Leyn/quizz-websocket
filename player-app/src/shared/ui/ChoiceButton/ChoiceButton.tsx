import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib'

export interface ChoiceButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
  index: number
  selected?: boolean
}

const choiceColorClassMap: Record<number, string> = {
  0: 'bg-choice-red hover:brightness-110',
  1: 'bg-choice-blue hover:brightness-110',
  2: 'bg-choice-yellow hover:brightness-110',
  3: 'bg-choice-green hover:brightness-110',
}

function ChoiceButton({
  className,
  index,
  selected = false,
  disabled,
  children,
  type = 'button',
  ...props
}: ChoiceButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        'min-h-18 w-full rounded-2xl px-4 py-4 text-center text-base font-semibold text-white transition-all duration-150 sm:min-h-20 sm:text-lg',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-app',
        'active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:brightness-100',
        choiceColorClassMap[index] ?? 'bg-slate-600',
        selected && 'ring-4 ring-white/90 shadow-[0_0_20px_rgba(255,255,255,0.3)]',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export default ChoiceButton
