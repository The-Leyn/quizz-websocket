import type { InputHTMLAttributes } from 'react'
import { useId } from 'react'
import { cn } from '../../lib'

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string
  label?: string
  hint?: string
  error?: string
  containerClassName?: string
  inputClassName?: string
}

function TextInput({
  className,
  label,
  hint,
  error,
  id,
  containerClassName,
  inputClassName,
  ...props
}: TextInputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const hintId = hint ? `${inputId}-hint` : undefined
  const errorId = error ? `${inputId}-error` : undefined

  return (
    <div className={cn('w-full space-y-2 text-left', className, containerClassName)}>
      {label ? (
        <label
          htmlFor={inputId}
          className="block text-sm font-semibold uppercase tracking-wide text-text-muted"
        >
          {label}
        </label>
      ) : null}

      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : hintId}
        className={cn(
          'w-full rounded-xl border-2 border-border bg-surface-2 px-4 py-3 text-center text-base text-text sm:text-lg',
          'placeholder:text-input-placeholder focus-visible:outline-none focus-visible:border-brand focus-visible:ring-4 focus-visible:ring-brand/20',
          error && 'border-danger focus-visible:border-danger focus-visible:ring-danger/20',
          inputClassName
        )}
        {...props}
      />

      {error ? (
        <p id={errorId} className="text-sm font-medium text-danger-soft" role="alert">
          {error}
        </p>
      ) : null}
      {!error && hint ? (
        <p id={hintId} className="text-sm text-text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export default TextInput
