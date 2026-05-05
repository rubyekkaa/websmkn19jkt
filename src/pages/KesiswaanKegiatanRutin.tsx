import { GalleryPage } from '../components/GalleryPage'

export function KesiswaanKegiatanRutin() {
  return (
    <GalleryPage
      slug="kegiatan-rutin"
      title="Kegiatan Rutin Sekolah"
      subtitle="Galeri foto dari kegiatan rutin SMKN 19 Jakarta — upacara, peringatan hari besar, classmeeting, dan acara sekolah lainnya."
      tone="teal"
      breadcrumbs={[
        { to: '/', label: 'Home' },
        { to: '/kesiswaan', label: 'Kesiswaan' },
        { label: 'Kegiatan Rutin' },
      ]}
    />
  )
}
