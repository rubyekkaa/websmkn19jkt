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
  slug: string
  name: string
  short: string
  description: string
  image: string
  competencies: string[]
}

export type Ekskul = {
  slug: string
  name: string
  description: string
  image: string
}

export type Guru = {
  name: string
  jabatan: string
  kategori: string
  foto?: string
}
