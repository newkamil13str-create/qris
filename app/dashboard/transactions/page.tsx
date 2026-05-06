'use client'
import { useEffect, useState } from 'react'
import { CheckCircle, Clock, XCircle } from 'lucide-react'
import { formatRupiah } from '@/lib/utils'

interface Tx {
  id: string; orderId: string; amount: number; status: string; type: string
  createdAt: string; paidAt: string | null
}

const statusIcon: Record<string, React.ReactNode> = {
  PAID: <CheckCircle className="w-4 h-4 text-green-400" />,
  PENDING: <Clock className="w-4 h-4 text-yellow-400" />,
  EXPIRED: <XCircle className="w-4 h-4 text-red-400" />,
  FAILED: <XCircle className="w-4 h-4 text-red-400" />,
}

export default function TransactionsPage() {
  const [txs, setTxs] = useState<Tx[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/user/transactions?page=${page}`).then((r) => r.json()).then((d) => {
      if (d.success) { setTxs(d.data.transactions); setPages(d.data.pages) }
    }).finally(() => setLoading(false))
  }, [page])

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-white">Riwayat Transaksi</h1>
        <p className="text-gray-400 text-sm mt-0.5">Semua transaksi kamu</p>
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
            {/* Header */}
            <div className="grid grid-cols-5 gap-4 px-4 py-2.5 bg-[#0d0d0d] text-xs text-gray-500 font-medium uppercase tracking-wider border-b border-[#1a1a1a]">
              <div className="col-span-2">Order ID</div>
              <div>Tipe</div>
              <div>Nominal</div>
              <div>Status</div>
            </div>
            <div className="divide-y divide-[#1a1a1a]">
              {txs.map((tx) => (
                <div key={tx.id} className="grid grid-cols-5 gap-4 px-4 py-3 items-center hover:bg-[#0d0d0d] transition-colors">
                  <div className="col-span-2">
                    <div className="text-xs font-mono text-white truncate">{tx.orderId}</div>
                    <div className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleDateString('id-ID')}</div>
                  </div>
                  <div className="text-xs text-gray-300">
                    {tx.type === 'TOPUP' ? '💰 Top Up' : tx.type === 'SUBSCRIPTION' ? '📦 Subscribe' : '🔲 QRIS'}
                  </div>
                  <div className="text-sm font-semibold text-white">{formatRupiah(tx.amount)}</div>
                  <div className="flex items-center gap-1.5">
                    {statusIcon[tx.status]}
                    <span className={`text-xs ${tx.status === 'PAID' ? 'text-green-400' : tx.status === 'PENDING' ? 'text-yellow-400' : 'text-red-400'}`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 rounded-lg border border-[#333] text-sm text-gray-300 disabled:opacity-40 hover:bg-[#1a1a1a]">
            ← Prev
          </button>
          <span className="px-3 py-1.5 text-sm text-gray-400">{page} / {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 rounded-lg border border-[#333] text-sm text-gray-300 disabled:opacity-40 hover:bg-[#1a1a1a]">
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
