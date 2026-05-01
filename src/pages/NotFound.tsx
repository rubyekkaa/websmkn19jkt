import { Link } from 'react-router-dom'
import { Container } from '../components/Container'

export function NotFound() {
  return (
    <Container>
      <div className="grid place-items-center py-32 text-center">
        <p className="font-display text-7xl font-bold text-brand-600">404</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-gray-900">
          Halaman tidak ditemukan
        </h1>
        <p className="mt-2 text-gray-600">
          Maaf, halaman yang Anda cari tidak tersedia.
        </p>
        <Link
          to="/"
          className="mt-6 rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Kembali ke Home
        </Link>
      </div>
    </Container>
  )
}
