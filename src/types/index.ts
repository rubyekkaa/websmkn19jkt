export type Category = {
  id: string
  name: string
  slug: string
  created_at?: string
}

export type Tag = {
  id: string
  name: string
  slug: string
}

export type PostStatus = 'draft' | 'published'

export type Post = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  cover_url: string | null
  category_id: string | null
  author_id: string | null
  status: PostStatus
  published_at: string | null
  created_at: string
  updated_at: string
  category?: Category | null
  tags?: Tag[]
}

export type Jurusan = {
  id?: string
  slug: string
  name: string
  short_name: string | null
  description: string | null
  image_url: string | null
  competencies: string[]
  career_paths?: string[]
  duration?: string | null
  sort_order?: number
  created_at?: string
  updated_at?: string
}

export type EkskulCategory = 'Olahraga' | 'Seni' | 'Akademik' | 'Keagamaan' | string

export type Ekskul = {
  id?: string
  slug: string
  name: string
  description: string | null
  image_url: string | null
  schedule?: string | null
  pembina?: string | null
  category?: EkskulCategory | null
  sort_order?: number
  created_at?: string
  updated_at?: string
}

export type Guru = {
  name: string
  jabatan: string
  kategori: string
  grup: 'Guru' | 'Tata Usaha'
  foto?: string
}

export type UserRole = 'admin' | 'editor'

export type Profile = {
  id: string
  email: string | null
  role: UserRole
  full_name: string | null
  created_at: string
  updated_at: string
}

export type TeacherGrup = 'Guru' | 'Tata Usaha'

export type Teacher = {
  id: string
  name: string
  jabatan: string
  kategori: string
  grup: TeacherGrup
  foto_url: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export type GalleryCategory = 'humas-dudi' | 'kesiswaan' | 'sarpras' | string

export type GalleryCollection = {
  id: string
  slug: string
  name: string
  category: GalleryCategory | null
  description: string | null
  cover_url: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export type GalleryPhoto = {
  id: string
  collection_id: string
  image_url: string
  caption: string | null
  taken_at: string | null
  sort_order: number
  created_at: string
}

export type MoUStatus = 'aktif' | 'berakhir'

export type MoUPartner = {
  id: string
  partner_name: string
  partner_logo_url: string | null
  description: string | null
  signed_at: string
  expires_at: string | null
  document_url: string | null
  status: MoUStatus | null
  sort_order: number
  created_at: string
  updated_at: string
}

export type AgendaCategory = 'Ujian' | 'Akademik' | 'Libur' | 'Kegiatan' | string

export type AgendaEvent = {
  id: string
  title: string
  start_at: string
  end_at: string | null
  location: string | null
  category: AgendaCategory | null
  description: string | null
  created_at: string
  updated_at: string
}
