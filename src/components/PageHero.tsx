import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Container } from './Container'
import { TONE_STYLES } from '../data/menu'

type Crumb = { to?: string; label: string }

type Props = {
  eyebrow?: string
  title: string
  subtitle?: string
  tone?: keyof typeof TONE_STYLES
  breadcrumbs?: Crumb[]
}

export function PageHero({
  eyebrow,
  title,
  subtitle,
  tone = 'gray',
  breadcrumbs,
}: Props) {
  const t = TONE_STYLES[tone]
  return (
    <section
      className={`relative overflow-hidden ${t.bg} border-b ${t.border}`}
    >
      {/* Decorative blobs for soft texture */}
      <div className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full bg-white/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 -bottom-24 h-72 w-72 rounded-full bg-white/30 blur-3xl" />
      <Container>
        <div className="relative py-14 sm:py-20">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav
              aria-label="Breadcrumb"
              className={`mb-4 flex flex-wrap items-center gap-1 text-xs font-medium ${t.textSubtle}`}
            >
              {breadcrumbs.map((c, i) => {
                const isLast = i === breadcrumbs.length - 1
                return (
                  <span
                    key={`${c.label}-${i}`}
                    className="inline-flex items-center gap-1"
                  >
                    {c.to && !isLast ? (
                      <Link to={c.to} className="hover:underline">
                        {c.label}
                      </Link>
                    ) : (
                      <span className={isLast ? `${t.text}` : ''}>
                        {c.label}
                      </span>
                    )}
                    {!isLast && <ChevronRight className="h-3.5 w-3.5" />}
                  </span>
                )
              })}
            </nav>
          )}
          {eyebrow && (
            <p
              className={`text-xs font-semibold uppercase tracking-[0.18em] ${t.textSubtle}`}
            >
              {eyebrow}
            </p>
          )}
          <h1
            className={`mt-2 max-w-3xl font-display text-3xl font-bold sm:text-4xl lg:text-5xl ${t.text}`}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className={`mt-4 max-w-2xl text-base leading-relaxed sm:text-lg ${t.textSubtle}`}
            >
              {subtitle}
            </p>
          )}
        </div>
      </Container>
    </section>
  )
}
