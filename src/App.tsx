import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
  type RouteObject,
} from 'react-router-dom'
import { Layout } from './components/Layout'
import { AdminLayout } from './components/AdminLayout'
import { ProtectedRoute, RoleGuard } from './components/ProtectedRoute'
import { AuthProvider } from './lib/auth'
import { Home } from './pages/Home'
import { Profil } from './pages/Profil'
import { Jurusan } from './pages/Jurusan'
import { Ekstrakurikuler } from './pages/Ekstrakurikuler'
import { Berita } from './pages/Berita'
import { BeritaDetail } from './pages/BeritaDetail'
import { Kontak } from './pages/Kontak'
import { NotFound } from './pages/NotFound'
import { Kurikulum } from './pages/Kurikulum'
import { KurikulumAgenda } from './pages/KurikulumAgenda'
import { HumasDudi } from './pages/HumasDudi'
import { HumasDudiMoU } from './pages/HumasDudiMoU'
import { HumasDudiKunjungan } from './pages/HumasDudiKunjungan'
import { HumasDudiKelasIndustri } from './pages/HumasDudiKelasIndustri'
import { Kesiswaan } from './pages/Kesiswaan'
import { KesiswaanKegiatanRutin } from './pages/KesiswaanKegiatanRutin'
import { Sarpras } from './pages/Sarpras'
import { SarprasGallery } from './pages/SarprasGallery'
import { AdminLogin } from './pages/admin/Login'
import { AdminDashboard } from './pages/admin/Dashboard'
import { AdminBeritaList } from './pages/admin/BeritaList'
import { AdminBeritaForm } from './pages/admin/BeritaForm'
import { AdminKategori } from './pages/admin/Kategori'
import { AdminTag } from './pages/admin/Tag'
import { AdminGuru } from './pages/admin/Guru'
import { AdminGuruForm } from './pages/admin/GuruForm'
import { AdminUsers } from './pages/admin/Users'
import { AdminGalleries } from './pages/admin/Galleries'
import { AdminGalleryDetail } from './pages/admin/GalleryDetail'
import { AdminMoU } from './pages/admin/MoU'
import { AdminMoUForm } from './pages/admin/MoUForm'
import { AdminAgenda } from './pages/admin/Agenda'
import { AdminAgendaForm } from './pages/admin/AgendaForm'

const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/profil', element: <Profil /> },

      // Kurikulum
      { path: '/kurikulum', element: <Kurikulum /> },
      { path: '/kurikulum/jurusan', element: <Jurusan /> },
      { path: '/kurikulum/jurusan/:slug', element: <Jurusan /> },
      { path: '/kurikulum/agenda', element: <KurikulumAgenda /> },

      // Humas/DUDI
      { path: '/humas-dudi', element: <HumasDudi /> },
      { path: '/humas-dudi/mou', element: <HumasDudiMoU /> },
      { path: '/humas-dudi/kunjungan-industri', element: <HumasDudiKunjungan /> },
      { path: '/humas-dudi/kelas-industri', element: <HumasDudiKelasIndustri /> },

      // Kesiswaan
      { path: '/kesiswaan', element: <Kesiswaan /> },
      { path: '/kesiswaan/ekstrakurikuler', element: <Ekstrakurikuler /> },
      { path: '/kesiswaan/kegiatan-rutin', element: <KesiswaanKegiatanRutin /> },

      // Sarpras
      { path: '/sarpras', element: <Sarpras /> },
      { path: '/sarpras/:sub', element: <SarprasGallery /> },

      // Berita & Kontak
      { path: '/berita', element: <Berita /> },
      { path: '/berita/:slug', element: <BeritaDetail /> },
      { path: '/kontak', element: <Kontak /> },

      // Legacy redirects (keep old links working)
      {
        path: '/jurusan',
        element: <Navigate to="/kurikulum/jurusan" replace />,
      },
      {
        path: '/jurusan/:slug',
        element: <LegacyJurusanRedirect />,
      },
      {
        path: '/ekstrakurikuler',
        element: <Navigate to="/kesiswaan/ekstrakurikuler" replace />,
      },

      { path: '*', element: <NotFound /> },
    ],
  },
  { path: '/admin/login', element: <AdminLogin /> },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'berita', element: <AdminBeritaList /> },
      { path: 'berita/baru', element: <AdminBeritaForm /> },
      { path: 'berita/:id/edit', element: <AdminBeritaForm /> },
      { path: 'kategori', element: <AdminKategori /> },
      { path: 'tag', element: <AdminTag /> },
      {
        path: 'guru',
        element: (
          <RoleGuard roles={['admin']}>
            <AdminGuru />
          </RoleGuard>
        ),
      },
      {
        path: 'guru/baru',
        element: (
          <RoleGuard roles={['admin']}>
            <AdminGuruForm />
          </RoleGuard>
        ),
      },
      {
        path: 'guru/:id/edit',
        element: (
          <RoleGuard roles={['admin']}>
            <AdminGuruForm />
          </RoleGuard>
        ),
      },
      {
        path: 'users',
        element: (
          <RoleGuard roles={['admin']}>
            <AdminUsers />
          </RoleGuard>
        ),
      },
      { path: 'galleries', element: <AdminGalleries /> },
      { path: 'galleries/:slug', element: <AdminGalleryDetail /> },
      { path: 'mou', element: <AdminMoU /> },
      { path: 'mou/new', element: <AdminMoUForm /> },
      { path: 'mou/:id/edit', element: <AdminMoUForm /> },
      { path: 'agenda', element: <AdminAgenda /> },
      { path: 'agenda/new', element: <AdminAgendaForm /> },
      { path: 'agenda/:id/edit', element: <AdminAgendaForm /> },
    ],
  },
]

function LegacyJurusanRedirect() {
  const slug = window.location.pathname.split('/').pop()
  return <Navigate to={`/kurikulum/jurusan/${slug ?? ''}`} replace />
}

const router = createBrowserRouter(routes)

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}
