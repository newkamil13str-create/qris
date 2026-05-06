'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { QrCode, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/toaster'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password.length < 8) {
      toast({ title: 'Password terlalu pendek', description: 'Minimal 8 karakter', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!data.success) {
        toast({ title: 'Registrasi Gagal', description: data.error, variant: 'destructive' })
      } else {
        toast({ title: 'Akun Dibuat!', description: 'Silakan masuk dengan email kamu.', variant: 'success' })
        router.push('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
              <QrCode className="w-5 h-5 text-black" />
            </div>
            <span className="font-heading font-bold text-2xl">KAMIL<span className="text-yellow-400">.</span></span>
          </Link>
          <h1 className="font-heading text-2xl font-bold text-white">Buat Akun</h1>
          <p className="text-gray-400 text-sm mt-1">Mulai gratis, tanpa kartu kredit</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#111] border border-[#1a1a1a] rounded-2xl p-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              minLength={2}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="nama@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPass ? 'text' : 'password'}
                placeholder="Min. 8 karakter"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={8}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" loading={loading}>
            Buat Akun Gratis
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Dengan mendaftar, kamu setuju dengan{' '}
            <span className="text-gray-400">Syarat & Ketentuan</span> kami.
          </p>
        </form>

        <p className="text-center text-sm text-gray-400 mt-4">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-yellow-400 hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  )
}
