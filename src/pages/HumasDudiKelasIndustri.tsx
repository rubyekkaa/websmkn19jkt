import { GalleryPage } from '../components/GalleryPage'

export function HumasDudiKelasIndustri() {
  return (
    <GalleryPage
      slug="kelas-industri"
      title="Kelas Industri"
      subtitle="Galeri kegiatan kelas bersama praktisi & ahli dari dunia industri di SMKN 19 Jakarta — guru tamu, workshop, dan pelatihan langsung."
      tone="amber"
      breadcrumbs={[
        { to: '/', label: 'Home' },
        { to: '/humas-dudi', label: 'Humas/DUDI' },
        { label: 'Kelas Industri' },
      ]}
    />
  )
}
