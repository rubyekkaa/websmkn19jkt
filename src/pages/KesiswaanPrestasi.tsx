import { GalleryPage } from '../components/GalleryPage'

export function KesiswaanPrestasi() {
  return (
    <GalleryPage
      slug="prestasi"
      title="Prestasi Siswa"
      subtitle="Galeri prestasi siswa SMKN 19 Jakarta — kejuaraan akademik, lomba bidang keahlian, ekstrakurikuler, dan capaian membanggakan lainnya."
      tone="teal"
      breadcrumbs={[
        { to: '/', label: 'Home' },
        { to: '/kesiswaan', label: 'Kesiswaan' },
        { label: 'Prestasi' },
      ]}
    />
  )
}
