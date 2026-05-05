import { useParams, Navigate } from 'react-router-dom'
import { GalleryPage } from '../components/GalleryPage'
import { SARPRAS_ITEMS } from './Sarpras'

/**
 * Single component handles all sarpras subpages via :sub URL param.
 * Subs: lab, kelas, studio, tefa-perfilman, tefa-perkantoran,
 *       tefa-bisnis-retail, tefa-akuntansi.
 */
export function SarprasGallery() {
  const { sub } = useParams<{ sub: string }>()
  const item = SARPRAS_ITEMS.find((s) => s.slug === sub)

  if (!item) {
    return <Navigate to="/sarpras" replace />
  }

  return (
    <GalleryPage
      slug={`sarpras-${item.slug}`}
      title={item.title}
      subtitle={item.desc}
      tone="sky"
      breadcrumbs={[
        { to: '/', label: 'Home' },
        { to: '/sarpras', label: 'Sarpras' },
        { label: item.title },
      ]}
    />
  )
}
