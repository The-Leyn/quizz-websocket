import type { ChangeEvent } from 'react'
import { UI_LIMITS } from '../../config'
import { cn } from '../../lib'
import TextInput, { type TextInputProps } from '../TextInput'

export interface CodeInputProps
  extends Omit<TextInputProps, 'type' | 'maxLength' | 'value' | 'onChange' | 'inputClassName'> {
  className?: string
  value: string
  onChange?: (value: string) => void
  onRawChange?: (event: ChangeEvent<HTMLInputElement>) => void
}

function CodeInput({
  className,
  value,
  onChange,
  onRawChange,
  placeholder = 'ABC123',
  label = 'Code du quiz',
  autoComplete = 'off',
  ...props
}: CodeInputProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, UI_LIMITS.quizCodeLength)

    onChange?.(nextValue)
    onRawChange?.(event)
  }

  return (
    <TextInput
      className={className}
      label={label}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      autoComplete={autoComplete}
      inputMode="text"
      spellCheck={false}
      inputClassName={cn(
        'font-mono text-2xl tracking-[0.3em] uppercase sm:text-3xl',
        value.length > 0 && 'text-text-strong'
      )}
      {...props}
    />
  )
}

export default CodeInput
