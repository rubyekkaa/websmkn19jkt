import { GalleryPage } from '../components/GalleryPage'

export function HumasDudiKunjungan() {
  return (
    <GalleryPage
      slug="kunjungan-industri"
      title="Kunjungan Industri"
      subtitle="Galeri kegiatan kunjungan siswa SMKN 19 Jakarta ke berbagai perusahaan mitra industri — belajar langsung dari praktisi di lapangan."
      tone="amber"
      breadcrumbs={[
        { to: '/', label: 'Home' },
        { to: '/humas-dudi', label: 'Humas/DUDI' },
        { label: 'Kunjungan Industri' },
      ]}
    />
  )
}
