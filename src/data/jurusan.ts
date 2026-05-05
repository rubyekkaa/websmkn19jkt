import type { Jurusan } from '../types'

/**
 * Fallback statis untuk halaman Jurusan. Sumber utama sekarang tabel
 * `jurusan` di Supabase — file ini dipakai (a) sebagai default sebelum
 * admin tambah data, (b) saat fetch DB error/timeout.
 *
 * Saat admin tambah/edit lewat /admin/jurusan, data DB akan menimpa
 * fallback ini di runtime.
 */
export const JURUSAN: Jurusan[] = [
  {
    slug: 'produksi-film',
    name: 'Produksi Film',
    short_name: 'Sinematografi & Film',
    description:
      'Kompetensi keahlian yang fokus pada penulisan naskah, sinematografi, penyutradaraan, editing, hingga pascaproduksi karya film & video pendek.',
    image_url:
      'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=70',
    competencies: [
      'Penulisan Naskah',
      'Sinematografi',
      'Penyutradaraan',
      'Editing & Pascaproduksi',
      'Produksi Konten Digital',
    ],
  },
  {
    slug: 'akl',
    name: 'Akuntansi Keuangan & Lembaga (AKL)',
    short_name: 'Akuntansi & Keuangan',
    description:
      'Membekali siswa dengan kompetensi akuntansi, perpajakan, audit, dan penggunaan software akuntansi modern untuk industri & UMKM.',
    image_url:
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=70',
    competencies: [
      'Dasar Akuntansi',
      'Perpajakan',
      'Komputer Akuntansi (MYOB / Accurate)',
      'Audit & Pelaporan',
      'Spreadsheet Keuangan',
    ],
  },
  {
    slug: 'mplb',
    name: 'Manajemen Perkantoran & Layanan Bisnis (MPLB)',
    short_name: 'Administrasi Modern',
    description:
      'Mengasah kompetensi administrasi modern: pengelolaan dokumen digital, layanan pelanggan, korespondensi bisnis, dan komunikasi profesional.',
    image_url:
      'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&w=1200&q=70',
    competencies: [
      'Administrasi Umum',
      'Korespondensi & Kearsipan Digital',
      'Customer Service',
      'Otomatisasi Perkantoran',
      'Komunikasi Bisnis',
    ],
  },
  {
    slug: 'bisnis-retail',
    name: 'Bisnis Retail',
    short_name: 'Retail & Kewirausahaan',
    description:
      'Membekali siswa dengan keahlian operasional toko, merchandising, pemasaran, layanan konsumen, dan dasar-dasar kewirausahaan.',
    image_url:
      'https://images.unsplash.com/photo-1581090700227-1e8e6a8a1b8e?auto=format&fit=crop&w=1200&q=70',
    competencies: [
      'Operasional Toko',
      'Merchandising & Display',
      'Pemasaran & Promosi',
      'Layanan Konsumen',
      'Kewirausahaan Digital',
    ],
  },
]
