import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
type ButtonSize = 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const variantClassMap: Record<ButtonVariant, string> = {
  primary:
    'bg-brand text-white hover:bg-brand-600 focus-visible:ring-brand disabled:bg-brand-800 disabled:text-white/80',
  secondary:
    'border border-brand-800 bg-transparent text-accent hover:bg-surface-2 focus-visible:ring-brand disabled:border-border disabled:text-slate-500',
  danger:
    'bg-danger text-white hover:bg-red-600 focus-visible:ring-danger disabled:bg-danger-bg disabled:text-white/80',
  ghost:
    'bg-transparent text-text hover:bg-surface-2 focus-visible:ring-brand disabled:text-slate-500',
}

const sizeClassMap: Record<ButtonSize, string> = {
  md: 'min-h-11 px-4 py-2.5 text-base',
  lg: 'min-h-12 px-6 py-3 text-lg',
}

function Button({
  className,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-app',
        'disabled:cursor-not-allowed disabled:opacity-60',
        variantClassMap[variant],
        sizeClassMap[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {leftIcon ? <span aria-hidden>{leftIcon}</span> : null}
      <span>{children}</span>
      {rightIcon ? <span aria-hidden>{rightIcon}</span> : null}
    </button>
  )
}

export default Button
