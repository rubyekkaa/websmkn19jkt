import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

export function InstagramIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.7" fill="currentColor" />
    </svg>
  )
}

export function TwitterIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.244 2H21l-6.52 7.45L22 22h-6.873l-4.79-6.255L4.8 22H2.043l6.96-7.953L2 2h7.043l4.32 5.71L18.244 2Zm-1.207 18.4h1.78L7.046 3.5H5.13L17.037 20.4Z" />
    </svg>
  )
}

export function TikTokIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.92a8.16 8.16 0 0 0 4.77 1.52V7a4.84 4.84 0 0 1-1.84-.31z" />
    </svg>
  )
}

export function YoutubeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M23.498 6.186a2.998 2.998 0 0 0-2.111-2.119C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.387.567A2.998 2.998 0 0 0 .502 6.186 31.43 31.43 0 0 0 0 12a31.43 31.43 0 0 0 .502 5.814 2.998 2.998 0 0 0 2.111 2.119C4.495 20.5 12 20.5 12 20.5s7.505 0 9.387-.567a2.998 2.998 0 0 0 2.111-2.119A31.43 31.43 0 0 0 24 12a31.43 31.43 0 0 0-.502-5.814zM9.75 15.568V8.432L15.818 12 9.75 15.568z" />
    </svg>
  )
}
