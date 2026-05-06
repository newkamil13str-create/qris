'use client'
import { useEffect, useState } from 'react'
import { CheckCircle, Clock, XCircle } from 'lucide-react'
import { formatRupiah } from '@/lib/utils'

interface Tx {
  id: string; orderId: string; amount: number; status: string; type: string
  createdAt: string; paidAt: string | null
  user: { name: string; email: string }
}

export default function AdminTransactionsPage() {
  const [txs, setTxs] = useState<Tx[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(() => {
      // Using a dedicated fetch for all transactions
      fetch('/api/admin/transactions').then(r => r.json()).then(d => {
        if (d.success) setTxs(d.data.transactions)
      }).finally(() => setLoading(false))
    })
  }, [])

  const statusIcon: Record<string, React.ReactNode> = {
    PAID: <CheckCircle className="w-4 h-4 text-green-400" />,
    PENDING: <Clock className="w-4 h-4 text-yellow-400" />,
    EXPIRED: <XCircle className="w-4 h-4 text-red-400" />,
    FAILED: <XCircle className="w-4 h-4 text-red-400" />,
  }

  return (
    <div className="space-y-5 max-w-5xl">
      <div>
        <h1 className="font-heading text-2xl font-bold text-white">Semua Transaksi</h1>
        <p className="text-gray-400 text-sm mt-0.5">Riwayat seluruh transaksi platform</p>
      </div>

      <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-yellow-400 border-t-transparent" />
          </div>
        ) : txs.length === 0 ? (
          <div className="py-12 text-center text-gray-500">Belum ada transaksi</div>
        ) : (
          <>
            <div className="hidden md:grid grid-cols-6 gap-3 px-4 py-2.5 bg-[#0d0d0d] text-xs text-gray-500 font-medium uppercase tracking-wider border-b border-[#1a1a1a]">
              <div className="col-span-2">Order</div>
              <div>User</div>
              <div>Tipe</div>
              <div>Nominal</div>
              <div>Status</div>
            </div>
            <div className="divide-y divide-[#1a1a1a]">
              {txs.map(tx => (
                <div key={tx.id} className="grid grid-cols-1 md:grid-cols-6 gap-3 px-4 py-3 hover:bg-[#0d0d0d]">
                  <div className="md:col-span-2">
                    <div className="text-xs font-mono text-white truncate">{tx.orderId}</div>
                    <div className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleDateString('id-ID')}</div>
                  </div>
                  <div className="text-xs text-gray-300 truncate">{tx.user?.name ?? '-'}</div>
                  <div className="text-xs text-gray-300">{tx.type}</div>
                  <div className="text-sm font-semibold text-white">{formatRupiah(tx.amount)}</div>
                  <div className="flex items-center gap-1.5">
                    {statusIcon[tx.status]}
                    <span className={`text-xs ${tx.status === 'PAID' ? 'text-green-400' : tx.status === 'PENDING' ? 'text-yellow-400' : 'text-red-400'}`}>{tx.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
