'use client'
import { useEffect, useState, useCallback } from 'react'
import { Search, Shield, Ban, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/toaster'
import { planColor, planLabel, formatRupiah } from '@/lib/utils'

interface User {
  id: string; name: string; email: string; plan: string; role: string
  balance: number; banned: boolean; createdAt: string; planExpiresAt: string | null
}

const PLANS = ['FREE', 'BASIC', 'PREMIUM', 'MAX']

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchUsers = useCallback(() => {
    setLoading(true)
    fetch(`/api/admin/users?q=${search}&page=${page}`).then(r => r.json()).then(d => {
      if (d.success) { setUsers(d.data.users); setTotal(d.data.total) }
    }).finally(() => setLoading(false))
  }, [search, page])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const action = async (userId: string, act: string, plan?: string) => {
    setActionLoading(userId + act)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: act, plan }),
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Berhasil', variant: 'success' })
        fetchUsers()
      } else toast({ title: data.error, variant: 'destructive' })
    } finally { setActionLoading(null) }
  }

  return (
    <div className="space-y-5 max-w-5xl">
      <div>
        <h1 className="font-heading text-2xl font-bold text-white">Manajemen Users</h1>
        <p className="text-gray-400 text-sm mt-0.5">Total {total} pengguna terdaftar</p>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <Input
          className="pl-9"
          placeholder="Cari nama atau email..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
        />
      </div>

      <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-yellow-400 border-t-transparent" />
          </div>
        ) : (
          <>
            <div className="hidden md:grid grid-cols-6 gap-3 px-4 py-2.5 bg-[#0d0d0d] text-xs text-gray-500 font-medium uppercase tracking-wider border-b border-[#1a1a1a]">
              <div className="col-span-2">User</div>
              <div>Plan</div>
              <div>Saldo</div>
              <div>Status</div>
              <div>Aksi</div>
            </div>
            <div className="divide-y divide-[#1a1a1a]">
              {users.map(u => (
                <div key={u.id} className="grid grid-cols-1 md:grid-cols-6 gap-3 px-4 py-3.5 hover:bg-[#0d0d0d] transition-colors">
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-black text-xs font-bold flex-shrink-0">
                        {u.name[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-white truncate flex items-center gap-1.5">
                          {u.name}
                          {u.role === 'ADMIN' && <Shield className="w-3 h-3 text-yellow-400 flex-shrink-0" />}
                        </div>
                        <div className="text-xs text-gray-500 truncate">{u.email}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <select
                      className="text-xs bg-[#1a1a1a] border border-[#333] rounded-lg px-2 py-1 text-white focus:outline-none focus:border-yellow-500/50"
                      value={u.plan}
                      onChange={e => action(u.id, 'setPlan', e.target.value)}
                      disabled={!!actionLoading}
                    >
                      {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>

                  <div className="flex items-center text-sm text-gray-300">
                    {formatRupiah(u.balance)}
                  </div>

                  <div className="flex items-center">
                    {u.banned ? (
                      <span className="text-xs text-red-400 flex items-center gap-1">
                        <Ban className="w-3 h-3" /> Banned
                      </span>
                    ) : (
                      <span className="text-xs text-green-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Aktif
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {u.banned ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => action(u.id, 'unban')}
                        loading={actionLoading === u.id + 'unban'}
                        className="text-xs h-7"
                      >
                        Unban
                      </Button>
                    ) : u.role !== 'ADMIN' ? (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => action(u.id, 'ban')}
                        loading={actionLoading === u.id + 'ban'}
                        className="text-xs h-7"
                      >
                        Ban
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {total > 20 && (
        <div className="flex justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 rounded-lg border border-[#333] text-sm text-gray-300 disabled:opacity-40 hover:bg-[#1a1a1a]">← Prev</button>
          <span className="px-3 py-1.5 text-sm text-gray-400">{page} / {Math.ceil(total / 20)}</span>
          <button disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 rounded-lg border border-[#333] text-sm text-gray-300 disabled:opacity-40 hover:bg-[#1a1a1a]">Next →</button>
        </div>
      )}
    </div>
  )
}
