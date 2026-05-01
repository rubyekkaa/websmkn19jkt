# SMKN 19 Jakarta — Website Rebuild

Rebuild website resmi SMKN 19 Jakarta menggunakan **React + Vite + TypeScript + Tailwind CSS**, dengan **Supabase** sebagai backend (Auth + Database + Storage) untuk fitur CMS berita.

> Output build berupa file statis (`dist/`) yang bisa langsung diupload ke hosting biasa (cPanel/Apache) — tidak butuh Node.js di server.

---

## Fitur

### Halaman publik
- **Home** — hero slider, berita terbaru, sorot jurusan, sorot ekskul, CTA kontak.
- **Profil** — Sambutan Kepala Sekolah, Visi/Misi, Sekilas, Daftar Guru dengan filter & pencarian.
- **Jurusan** — 4 program keahlian + halaman detail per jurusan (slug).
- **Ekstrakurikuler** — daftar kegiatan pengembangan diri.
- **Berita** — daftar dengan filter Kategori & Tag + pencarian.
- **Detail Berita** — dengan rich text content, kategori, tag, tanggal.
- **Kontak** — form yang menyimpan ke Supabase, info kontak, peta.

### Admin CMS (di `/admin`)
- Login dengan email + password (Supabase Auth).
- Dashboard ringkasan jumlah berita, kategori, tag.
- CRUD Berita dengan rich text editor (TipTap), upload cover ke Supabase Storage.
- Kelola kategori dan tag.

---

## Setup development

### 1. Clone & install

```bash
git clone https://github.com/<owner>/smkn19jkt-rebuild.git
cd smkn19jkt-rebuild
npm install
```

### 2. Setup Supabase

1. Buat proyek gratis di https://supabase.com.
2. Di dashboard proyek → **SQL Editor** → New query → copy isi file [`supabase/schema.sql`](./supabase/schema.sql) → **Run**.
3. Di **Storage** → **New bucket** → nama: `post-images` → centang **Public bucket** → **Save**.
4. Di **Authentication** → **Users** → **Add user** → buat user admin (email + password).
5. Di **Settings** → **API** → catat `Project URL` dan `anon public` key.

### 3. Environment variables

Salin `.env.example` menjadi `.env.local` lalu isi:

```env
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-public-key>
```

### 4. Jalankan dev server

```bash
npm run dev
```

Buka http://localhost:5173.

---

## Build untuk production (upload ke hosting)

```bash
npm run build
```

Folder `dist/` akan berisi semua file statis (`index.html`, JS, CSS, gambar, `.htaccess`) yang siap diupload ke `public_html` di cPanel.

> **Catatan**: file `.htaccess` (di `public/.htaccess`) otomatis disertakan di build dan menangani SPA fallback supaya URL seperti `/profil`, `/berita/<slug>`, `/admin/*` tetap dilayani oleh `index.html`.

---

## Struktur folder

```
src/
├── App.tsx               # Routing utama
├── main.tsx              # Entry point
├── index.css             # Tailwind + global styles
├── components/           # Komponen reusable
│   ├── Layout.tsx
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── AdminLayout.tsx
│   ├── ProtectedRoute.tsx
│   ├── RichTextEditor.tsx
│   ├── Container.tsx
│   └── SectionHeader.tsx
├── pages/                # Halaman publik
│   ├── Home.tsx
│   ├── Profil.tsx
│   ├── Jurusan.tsx
│   ├── Ekstrakurikuler.tsx
│   ├── Berita.tsx
│   ├── BeritaDetail.tsx
│   ├── Kontak.tsx
│   ├── NotFound.tsx
│   └── admin/            # Halaman admin (CMS)
│       ├── Login.tsx
│       ├── Dashboard.tsx
│       ├── BeritaList.tsx
│       ├── BeritaForm.tsx
│       ├── Kategori.tsx
│       └── Tag.tsx
├── lib/
│   ├── supabase.ts       # Supabase client
│   └── auth.tsx          # Auth context
├── data/                 # Data statis (jurusan, ekskul, guru)
└── types/                # TypeScript types

public/
├── .htaccess             # SPA fallback Apache (cPanel)
├── _redirects            # SPA fallback Netlify (kalau dipakai)
└── favicon.svg

supabase/
└── schema.sql            # Skema database & RLS
```

---

## Skrip yang tersedia

```bash
npm run dev      # Vite dev server
npm run build    # Build production ke dist/
npm run preview  # Preview hasil build secara lokal
npm run lint     # ESLint
```
