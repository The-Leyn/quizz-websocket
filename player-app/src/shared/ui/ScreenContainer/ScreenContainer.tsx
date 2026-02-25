import type { ReactNode } from 'react'
import { cn } from '../../lib'

type ScreenSize = 'sm' | 'md' | 'lg'

export interface ScreenContainerProps {
  className?: string
  children: ReactNode
  size?: ScreenSize
  centered?: boolean
}

const sizeClassMap: Record<ScreenSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
}

function ScreenContainer({
  className,
  children,
  size = 'md',
  centered = true,
}: ScreenContainerProps) {
  return (
    <section
      className={cn(
        'w-full px-3 sm:px-4',
        sizeClassMap[size],
        centered && 'mx-auto text-center',
        className
      )}
    >
      {children}
    </section>
  )
}

export default ScreenContainer
