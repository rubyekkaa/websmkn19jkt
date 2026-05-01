import type { HTMLAttributes, ReactNode } from 'react'

type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  size?: 'default' | 'narrow' | 'wide'
}

export function Container({
  children,
  size = 'default',
  className = '',
  ...rest
}: ContainerProps) {
  const widths = {
    narrow: 'max-w-3xl',
    default: 'max-w-6xl',
    wide: 'max-w-7xl',
  }
  return (
    <div
      className={`mx-auto w-full px-4 sm:px-6 lg:px-8 ${widths[size]} ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
