// Central menu config. Used by Navbar, Footer, and parent landing pages.

export type MenuLeaf = {
  to: string
  label: string
  description?: string
}

export type MenuItem = {
  label: string
  to?: string
  end?: boolean
  children?: MenuLeaf[]
  /** Tone is used by parent landing page hero & home section card. */
  tone?: 'blue' | 'purple' | 'amber' | 'teal' | 'sky' | 'rose' | 'gray'
  /** Short summary shown on parent landing page. */
  summary?: string
}

export const MENU: MenuItem[] = [
  { to: '/', label: 'Home', end: true },
  {
    to: '/profil',
    label: 'Profil',
    tone: 'rose',
    summary:
      'Kenali SMKN 19 Jakarta — sambutan kepala sekolah, visi-misi, sejarah singkat, dan daftar tenaga pendidik.',
  },
  {
    label: 'Kurikulum',
    to: '/kurikulum',
    tone: 'purple',
    summary:
      'Program keahlian, struktur kurikulum, dan agenda akademik tahunan.',
    children: [
      {
        to: '/kurikulum/jurusan',
        label: 'Jurusan',
        description: '4 program keahlian unggulan',
      },
      {
        to: '/kurikulum/agenda',
        label: 'Agenda Akademik',
        description: 'Jadwal UTS, UAS, libur & kalender pendidikan',
      },
    ],
  },
  {
    label: 'Humas/DUDI',
    to: '/humas-dudi',
    tone: 'amber',
    summary:
      'Hubungan masyarakat & dunia industri — kerja sama, kunjungan, dan kelas industri bersama mitra.',
    children: [
      {
        to: '/humas-dudi/mou',
        label: 'MoU & Kerja Sama',
        description: 'Daftar perusahaan mitra industri',
      },
      {
        to: '/humas-dudi/kunjungan-industri',
        label: 'Kunjungan Industri',
        description: 'Galeri kegiatan kunjungan ke perusahaan',
      },
      {
        to: '/humas-dudi/kelas-industri',
        label: 'Kelas Industri',
        description: 'Galeri kegiatan kelas bersama industri',
      },
    ],
  },
  {
    label: 'Kesiswaan',
    to: '/kesiswaan',
    tone: 'teal',
    summary:
      'Pengembangan minat, bakat, dan karakter siswa di luar pembelajaran kelas.',
    children: [
      {
        to: '/kesiswaan/ekstrakurikuler',
        label: 'Ekstrakurikuler',
        description: '8+ ekskul minat & bakat',
      },
      {
        to: '/kesiswaan/kegiatan-rutin',
        label: 'Kegiatan Rutin',
        description: 'Galeri kegiatan rutin sekolah',
      },
      {
        to: '/kesiswaan/prestasi',
        label: 'Prestasi',
        description: 'Galeri kejuaraan & capaian siswa',
      },
    ],
  },
  {
    label: 'Sarpras',
    to: '/sarpras',
    tone: 'sky',
    summary:
      'Sarana & prasarana sekolah — laboratorium, kelas, studio, dan teaching factory tiap jurusan.',
    children: [
      {
        to: '/sarpras/lab',
        label: 'Laboratorium',
        description: 'Lab komputer & multimedia',
      },
      {
        to: '/sarpras/kelas',
        label: 'Ruang Kelas',
        description: 'Kelas ber-AC dan smart board',
      },
      {
        to: '/sarpras/studio',
        label: 'Studio',
        description: 'Studio film & broadcasting',
      },
      {
        to: '/sarpras/tefa-perfilman',
        label: 'TeFa Perfilman',
        description: 'Teaching factory Produksi Film',
      },
      {
        to: '/sarpras/tefa-perkantoran',
        label: 'TeFa Perkantoran',
        description: 'Teaching factory MPLB',
      },
      {
        to: '/sarpras/tefa-bisnis-retail',
        label: 'TeFa Bisnis Retail',
        description: 'Teaching factory Bisnis Retail',
      },
      {
        to: '/sarpras/tefa-akuntansi',
        label: 'TeFa Akuntansi',
        description: 'Teaching factory AKL',
      },
      {
        to: '/sarpras/uks',
        label: 'UKS',
        description: 'Unit Kesehatan Sekolah',
      },
    ],
  },
  { to: '/berita', label: 'Berita', tone: 'gray' },
  { to: '/kontak', label: 'Kontak', tone: 'blue' },
]

/** Tone styling — soft pastel palettes used throughout the site. */
export const TONE_STYLES: Record<
  NonNullable<MenuItem['tone']>,
  {
    bg: string
    bgSubtle: string
    border: string
    text: string
    textSubtle: string
    accent: string
    chip: string
    ring: string
  }
> = {
  blue: {
    bg: 'bg-blue-50',
    bgSubtle: 'bg-blue-50/60',
    border: 'border-blue-200',
    text: 'text-blue-900',
    textSubtle: 'text-blue-700',
    accent: 'bg-blue-600 text-white hover:bg-blue-700',
    chip: 'bg-blue-100 text-blue-700',
    ring: 'ring-blue-200',
  },
  purple: {
    bg: 'bg-purple-50',
    bgSubtle: 'bg-purple-50/60',
    border: 'border-purple-200',
    text: 'text-purple-900',
    textSubtle: 'text-purple-700',
    accent: 'bg-purple-600 text-white hover:bg-purple-700',
    chip: 'bg-purple-100 text-purple-700',
    ring: 'ring-purple-200',
  },
  amber: {
    bg: 'bg-amber-50',
    bgSubtle: 'bg-amber-50/60',
    border: 'border-amber-200',
    text: 'text-amber-900',
    textSubtle: 'text-amber-700',
    accent: 'bg-amber-600 text-white hover:bg-amber-700',
    chip: 'bg-amber-100 text-amber-800',
    ring: 'ring-amber-200',
  },
  teal: {
    bg: 'bg-teal-50',
    bgSubtle: 'bg-teal-50/60',
    border: 'border-teal-200',
    text: 'text-teal-900',
    textSubtle: 'text-teal-700',
    accent: 'bg-teal-600 text-white hover:bg-teal-700',
    chip: 'bg-teal-100 text-teal-700',
    ring: 'ring-teal-200',
  },
  sky: {
    bg: 'bg-sky-50',
    bgSubtle: 'bg-sky-50/60',
    border: 'border-sky-200',
    text: 'text-sky-900',
    textSubtle: 'text-sky-700',
    accent: 'bg-sky-600 text-white hover:bg-sky-700',
    chip: 'bg-sky-100 text-sky-700',
    ring: 'ring-sky-200',
  },
  rose: {
    bg: 'bg-rose-50',
    bgSubtle: 'bg-rose-50/60',
    border: 'border-rose-200',
    text: 'text-rose-900',
    textSubtle: 'text-rose-700',
    accent: 'bg-rose-600 text-white hover:bg-rose-700',
    chip: 'bg-rose-100 text-rose-700',
    ring: 'ring-rose-200',
  },
  gray: {
    bg: 'bg-gray-50',
    bgSubtle: 'bg-gray-50/60',
    border: 'border-gray-200',
    text: 'text-gray-900',
    textSubtle: 'text-gray-700',
    accent: 'bg-gray-900 text-white hover:bg-gray-800',
    chip: 'bg-gray-100 text-gray-700',
    ring: 'ring-gray-200',
  },
}
