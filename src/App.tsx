import {
  createBrowserRouter,
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
import { AdminLogin } from './pages/admin/Login'
import { AdminDashboard } from './pages/admin/Dashboard'
import { AdminBeritaList } from './pages/admin/BeritaList'
import { AdminBeritaForm } from './pages/admin/BeritaForm'
import { AdminKategori } from './pages/admin/Kategori'
import { AdminTag } from './pages/admin/Tag'
import { AdminGuru } from './pages/admin/Guru'
import { AdminGuruForm } from './pages/admin/GuruForm'
import { AdminUsers } from './pages/admin/Users'

const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/profil', element: <Profil /> },
      { path: '/jurusan', element: <Jurusan /> },
      { path: '/jurusan/:slug', element: <Jurusan /> },
      { path: '/ekstrakurikuler', element: <Ekstrakurikuler /> },
      { path: '/berita', element: <Berita /> },
      { path: '/berita/:slug', element: <BeritaDetail /> },
      { path: '/kontak', element: <Kontak /> },
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
    ],
  },
]

const router = createBrowserRouter(routes)

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}
