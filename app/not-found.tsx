import Link from 'next/link'
import { QrCode } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center mx-auto mb-6">
          <QrCode className="w-8 h-8 text-black" />
        </div>
        <h1 className="font-heading text-6xl font-bold text-white mb-2">404</h1>
        <p className="text-gray-400 mb-8">Halaman tidak ditemukan</p>
        <Link href="/" className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold hover:from-yellow-300 hover:to-yellow-500 transition-all">
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  )
}
