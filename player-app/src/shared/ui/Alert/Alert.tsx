import type { ReactNode } from 'react'
import { cn } from '../../lib'

type AlertVariant = 'error' | 'warning' | 'info' | 'success'

export interface AlertProps {
  className?: string
  title?: string
  children: ReactNode
  variant?: AlertVariant
}

const variantClassMap: Record<AlertVariant, string> = {
  error: 'border-danger-bg bg-danger-bg/60 text-danger-soft',
  warning: 'border-warning-bg bg-warning-bg/60 text-warning',
  info: 'border-border bg-surface-2 text-slate-300',
  success: 'border-success-bg bg-success-bg/60 text-success',
}

function Alert({ className, title, children, variant = 'error' }: AlertProps) {
  const isCritical = variant === 'error' || variant === 'warning'

  return (
    <div
      role="alert"
      aria-live={isCritical ? 'assertive' : 'polite'}
      className={cn(
        'w-full rounded-xl border px-4 py-3 text-sm',
        variantClassMap[variant],
        className
      )}
    >
      {title ? <p className="mb-1 text-sm font-semibold">{title}</p> : null}
      <div>{children}</div>
    </div>
  )
}

export default Alert
