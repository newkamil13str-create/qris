'use client'
import { useEffect, useState } from 'react'
import { User, Lock, Bot, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/toaster'

interface Profile {
  name: string; email: string; plan: string; balance: number
  telegramId: string | null; createdAt: string; apiKey: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(false)
  const [tgLoading, setTgLoading] = useState(false)
  const [tgToken, setTgToken] = useState('')
  const [nameForm, setNameForm] = useState({ name: '' })
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '' })

  useEffect(() => {
    fetch('/api/user/profile').then(r => r.json()).then(d => {
      if (d.success) { setProfile(d.data); setNameForm({ name: d.data.name }) }
    })
  }, [])

  const updateName = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameForm.name }),
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Nama diperbarui!', variant: 'success' })
        setProfile(p => p ? { ...p, name: nameForm.name } : p)
      } else toast({ title: data.error, variant: 'destructive' })
    } finally { setLoading(false) }
  }

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passForm.newPassword.length < 8) {
      toast({ title: 'Password minimal 8 karakter', variant: 'destructive' }); return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passForm),
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Password diperbarui!', variant: 'success' })
        setPassForm({ currentPassword: '', newPassword: '' })
      } else toast({ title: data.error, variant: 'destructive' })
    } finally { setLoading(false) }
  }

  const generateTgToken = async () => {
    setTgLoading(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generateTelegramToken' }),
      })
      const data = await res.json()
      if (data.success) setTgToken(data.data.token)
    } finally { setTgLoading(false) }
  }

  if (!profile) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-yellow-400 border-t-transparent" />
    </div>
  )

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-white">Profil</h1>
        <p className="text-gray-400 text-sm mt-0.5">Kelola informasi akun kamu</p>
      </div>

      {/* Info card */}
      <div className="bg-[#111] border border-[#222] rounded-xl p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-black text-2xl font-bold flex-shrink-0">
          {profile.name[0]?.toUpperCase()}
        </div>
        <div>
          <div className="font-semibold text-white">{profile.name}</div>
          <div className="text-sm text-gray-400">{profile.email}</div>
          <div className="text-xs text-gray-600 mt-0.5">
            Bergabung {new Date(profile.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Update name */}
      <form onSubmit={updateName} className="bg-[#111] border border-[#222] rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <User className="w-4 h-4 text-yellow-400" />
          <span className="font-semibold text-white">Ubah Nama</span>
        </div>
        <div className="space-y-1.5">
          <Label>Nama Lengkap</Label>
          <Input value={nameForm.name} onChange={e => setNameForm({ name: e.target.value })} required minLength={2} />
        </div>
        <Button type="submit" loading={loading} size="sm">Simpan Nama</Button>
      </form>

      {/* Update password */}
      <form onSubmit={updatePassword} className="bg-[#111] border border-[#222] rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Lock className="w-4 h-4 text-yellow-400" />
          <span className="font-semibold text-white">Ubah Password</span>
        </div>
        <div className="space-y-1.5">
          <Label>Password Saat Ini</Label>
          <Input type="password" value={passForm.currentPassword} onChange={e => setPassForm(p => ({ ...p, currentPassword: e.target.value }))} required />
        </div>
        <div className="space-y-1.5">
          <Label>Password Baru</Label>
          <Input type="password" placeholder="Min. 8 karakter" value={passForm.newPassword} onChange={e => setPassForm(p => ({ ...p, newPassword: e.target.value }))} required minLength={8} />
        </div>
        <Button type="submit" loading={loading} size="sm">Ubah Password</Button>
      </form>

      {/* Telegram */}
      <div className="bg-[#111] border border-[#222] rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Bot className="w-4 h-4 text-yellow-400" />
          <span className="font-semibold text-white">Hubungkan Telegram</span>
        </div>

        {profile.telegramId ? (
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <CheckCircle className="w-4 h-4" />
            Telegram sudah terhubung (ID: {profile.telegramId})
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-400">
              Hubungkan akun Telegram untuk menerima notifikasi pembayaran secara real-time.
            </p>
            <Button variant="outline" onClick={generateTgToken} loading={tgLoading} size="sm">
              Generate Token
            </Button>
            {tgToken && (
              <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg p-4 space-y-2">
                <div className="text-xs text-gray-400">1. Buka @KamilShopBot di Telegram</div>
                <div className="text-xs text-gray-400">2. Kirim perintah:</div>
                <div className="font-mono text-sm text-yellow-400 bg-[#111] px-3 py-2 rounded-lg">
                  /link {tgToken}
                </div>
                <div className="text-xs text-gray-500">Token berlaku selama 10 menit</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
