import type { ReactNode } from 'react'
import { cn } from '../../lib'

type TitleTag = 'h1' | 'h2' | 'h3'
type TitleSize = 'xl' | 'lg' | 'md'

export interface TitleProps {
  className?: string
  children: ReactNode
  as?: TitleTag
  size?: TitleSize
}

const sizeClassMap: Record<TitleSize, string> = {
  xl: 'text-3xl sm:text-4xl',
  lg: 'text-2xl sm:text-3xl',
  md: 'text-xl sm:text-2xl',
}

function Title({ className, children, as = 'h1', size = 'lg' }: TitleProps) {
  const Component = as

  return (
    <Component
      className={cn(
        'text-balance font-bold leading-tight tracking-tight text-text-strong',
        sizeClassMap[size],
        className
      )}
    >
      {children}
    </Component>
  )
}

export default Title
