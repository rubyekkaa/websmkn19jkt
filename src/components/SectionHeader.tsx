type Props = {
  eyebrow?: string
  title: string
  subtitle?: string
  align?: 'left' | 'center'
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = 'center',
}: Props) {
  return (
    <div
      className={`max-w-2xl ${align === 'center' ? 'mx-auto text-center' : ''}`}
    >
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-2 font-display text-3xl font-bold text-gray-900 sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-base text-gray-600">{subtitle}</p>
      )}
    </div>
  )
}
