'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { QrCode, Wallet, CreditCard, ArrowUpFromLine, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import { formatRupiah, planColor, planLabel } from '@/lib/utils'

interface UserData {
  name: string; email: string; plan: string; balance: number
  planExpiresAt: string | null; createdAt: string
}
interface TxData {
  id: string; orderId: string; amount: number; status: string
  type: string; createdAt: string
}

const quickActions = [
  { href: '/dashboard/qris', label: 'Buat QRIS', icon: QrCode, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { href: '/dashboard/topup', label: 'Top Up', icon: Wallet, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { href: '/dashboard/subscribe', label: 'Upgrade', icon: CreditCard, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { href: '/dashboard/withdraw', label: 'Withdraw', icon: ArrowUpFromLine, color: 'text-green-400', bg: 'bg-green-500/10' },
]

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [txs, setTxs] = useState<TxData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/user/profile').then((r) => r.json()),
      fetch('/api/user/transactions?limit=5').then((r) => r.json()),
    ]).then(([u, t]) => {
      if (u.success) setUser(u.data)
      if (t.success) setTxs(t.data.transactions)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-yellow-400 border-t-transparent" />
    </div>
  )

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-white">Halo, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-gray-400 text-sm mt-0.5">Selamat datang di KAMIL SHOP</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#111] border border-[#222] rounded-xl p-4">
          <div className="text-gray-400 text-xs mb-1">Saldo</div>
          <div className="font-heading font-bold text-white text-xl">{formatRupiah(user?.balance ?? 0)}</div>
        </div>
        <div className="bg-[#111] border border-[#222] rounded-xl p-4">
          <div className="text-gray-400 text-xs mb-1">Plan</div>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${planColor(user?.plan ?? 'FREE')}`}>
            {planLabel(user?.plan ?? 'FREE')}
          </span>
        </div>
        <div className="bg-[#111] border border-[#222] rounded-xl p-4 col-span-2">
          <div className="text-gray-400 text-xs mb-1">Aktif Hingga</div>
          <div className="font-semibold text-white text-sm">
            {user?.planExpiresAt
              ? new Date(user.planExpiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
              : user?.plan === 'FREE' ? 'Selamanya (Free)' : '-'}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="font-heading font-semibold text-white mb-3">Aksi Cepat</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((a) => (
            <Link key={a.href} href={a.href} className="bg-[#111] border border-[#222] rounded-xl p-4 hover:border-yellow-500/20 transition-all group flex flex-col items-center gap-3 text-center">
              <div className={`w-10 h-10 rounded-lg ${a.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <a.icon className={`w-5 h-5 ${a.color}`} />
              </div>
              <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent transactions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading font-semibold text-white">Transaksi Terbaru</h2>
          <Link href="/dashboard/transactions" className="text-sm text-yellow-400 hover:underline">Lihat semua</Link>
        </div>
        <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
          {txs.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-sm">Belum ada transaksi</div>
          ) : (
            <div className="divide-y divide-[#1a1a1a]">
              {txs.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.status === 'PAID' ? 'bg-green-500/10' : 'bg-gray-500/10'}`}>
                      {tx.status === 'PAID' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Clock className="w-4 h-4 text-gray-400" />}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{tx.type === 'TOPUP' ? 'Top Up' : tx.type === 'SUBSCRIPTION' ? 'Langganan' : 'QRIS'}</div>
                      <div className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleDateString('id-ID')}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-white">{formatRupiah(tx.amount)}</div>
                    <div className={`text-xs ${tx.status === 'PAID' ? 'text-green-400' : tx.status === 'EXPIRED' ? 'text-red-400' : 'text-yellow-400'}`}>
                      {tx.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
