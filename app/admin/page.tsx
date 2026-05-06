'use client'
import { useEffect, useState } from 'react'
import { Users, TrendingUp, ArrowUpFromLine, CreditCard } from 'lucide-react'
import { formatRupiah } from '@/lib/utils'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Stats {
  totalUsers: number; totalTransactions: number; pendingWithdrawals: number
  revenueToday: number; revenueTotal: number
  planBreakdown: { plan: string; _count: number }[]
  dailyRevenue: { paidAt: string | null; _sum: { amount: number | null } }[]
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(d => {
      if (d.success) setStats(d.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-yellow-400 border-t-transparent" />
    </div>
  )

  const chartData = stats?.dailyRevenue.map(d => ({
    date: d.paidAt ? new Date(d.paidAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-',
    revenue: d._sum.amount ?? 0,
  })) ?? []

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers.toLocaleString() ?? '0', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Revenue Hari Ini', value: formatRupiah(stats?.revenueToday ?? 0), icon: TrendingUp, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: 'Pending Withdrawal', value: stats?.pendingWithdrawals.toString() ?? '0', icon: ArrowUpFromLine, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Total Transaksi', value: stats?.totalTransactions.toLocaleString() ?? '0', icon: CreditCard, color: 'text-green-400', bg: 'bg-green-500/10' },
  ]

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="font-heading text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-gray-400 text-sm mt-0.5">Overview platform KAMIL SHOP</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map(s => (
          <div key={s.label} className="bg-[#111] border border-[#222] rounded-xl p-4">
            <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div className="font-heading font-bold text-white text-xl leading-tight">{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="bg-[#111] border border-[#222] rounded-xl p-6">
        <h2 className="font-heading font-semibold text-white mb-4">Revenue 30 Hari Terakhir</h2>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
              <XAxis dataKey="date" stroke="#555" tick={{ fontSize: 11 }} />
              <YAxis stroke="#555" tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
              <Tooltip
                contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#fff' }}
                formatter={(v: number) => [formatRupiah(v), 'Revenue']}
              />
              <Line type="monotone" dataKey="revenue" stroke="#f5c518" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center text-gray-500 text-sm">Belum ada data revenue</div>
        )}
      </div>

      {/* Plan breakdown */}
      <div className="bg-[#111] border border-[#222] rounded-xl p-6">
        <h2 className="font-heading font-semibold text-white mb-4">Distribusi Plan</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['FREE', 'BASIC', 'PREMIUM', 'MAX'].map(plan => {
            const count = stats?.planBreakdown.find(p => p.plan === plan)?._count ?? 0
            const colors: Record<string, string> = { FREE: 'text-gray-400', BASIC: 'text-blue-400', PREMIUM: 'text-purple-400', MAX: 'text-yellow-400' }
            return (
              <div key={plan} className="bg-[#0d0d0d] rounded-lg p-4 border border-[#1a1a1a] text-center">
                <div className={`font-heading text-2xl font-bold ${colors[plan]}`}>{count}</div>
                <div className="text-xs text-gray-500 mt-1">{plan}</div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-[#111] border border-[#222] rounded-xl p-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-400 mb-0.5">Total Revenue</div>
          <div className="font-heading font-bold text-yellow-400 text-2xl">{formatRupiah(stats?.revenueTotal ?? 0)}</div>
        </div>
        <TrendingUp className="w-10 h-10 text-yellow-400/20" />
      </div>
    </div>
  )
}
