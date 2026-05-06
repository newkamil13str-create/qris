'use client'
import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from '@/components/ui/toaster'
import { formatRupiah } from '@/lib/utils'

interface Withdrawal {
  id: string; amount: number; bankName: string; bankAccount: string; bankHolder: string
  status: string; note: string | null; createdAt: string
  user: { name: string; email: string }
}

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('PENDING')
  const [selected, setSelected] = useState<Withdrawal | null>(null)
  const [note, setNote] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const fetchWithdrawals = () => {
    setLoading(true)
    fetch(`/api/admin/withdrawals?status=${filter}`).then(r => r.json()).then(d => {
      if (d.success) setWithdrawals(d.data.withdrawals)
    }).finally(() => setLoading(false))
  }

  useEffect(fetchWithdrawals, [filter])

  const process = async (action: 'approve' | 'reject') => {
    if (!selected) return
    setActionLoading(true)
    try {
      const res = await fetch('/api/admin/withdrawals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ withdrawalId: selected.id, action, note: note || undefined }),
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: action === 'approve' ? '✅ Disetujui' : '❌ Ditolak', variant: 'success' })
        setSelected(null)
        setNote('')
        fetchWithdrawals()
      } else toast({ title: data.error, variant: 'destructive' })
    } finally { setActionLoading(false) }
  }

  const statusColor: Record<string, string> = {
    PENDING: 'text-yellow-400', APPROVED: 'text-green-400', REJECTED: 'text-red-400',
  }
  const StatusIcon = ({ s }: { s: string }) =>
    s === 'APPROVED' ? <CheckCircle className="w-4 h-4 text-green-400" /> :
    s === 'REJECTED' ? <XCircle className="w-4 h-4 text-red-400" /> :
    <Clock className="w-4 h-4 text-yellow-400" />

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="font-heading text-2xl font-bold text-white">Manajemen Withdrawal</h1>
        <p className="text-gray-400 text-sm mt-0.5">Proses permintaan penarikan dana</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {['PENDING', 'APPROVED', 'REJECTED'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30' : 'text-gray-400 hover:text-white border border-transparent'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-yellow-400 border-t-transparent" />
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm">Tidak ada data</div>
        ) : (
          <div className="divide-y divide-[#1a1a1a]">
            {withdrawals.map(w => (
              <div key={w.id} className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-4 hover:bg-[#0d0d0d] transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusIcon s={w.status} />
                    <span className="font-semibold text-white">{formatRupiah(w.amount)}</span>
                    <span className={`text-xs ${statusColor[w.status]}`}>{w.status}</span>
                  </div>
                  <div className="text-sm text-gray-300">{w.user.name} <span className="text-gray-500">({w.user.email})</span></div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {w.bankName} • {w.bankAccount} • {w.bankHolder}
                  </div>
                  <div className="text-xs text-gray-600">{new Date(w.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                  {w.note && <div className="text-xs text-gray-400 mt-1 italic">Catatan: {w.note}</div>}
                </div>

                {w.status === 'PENDING' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { setSelected(w); setNote('') }}
                    className="flex-shrink-0"
                  >
                    Proses
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Process modal */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Proses Withdrawal</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg p-4 space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">User</span><span className="text-white">{selected.user.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Nominal</span><span className="text-yellow-400 font-semibold">{formatRupiah(selected.amount)}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Bank</span><span className="text-white">{selected.bankName}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">No. Rekening</span><span className="text-white">{selected.bankAccount}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Atas Nama</span><span className="text-white">{selected.bankHolder}</span></div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-gray-400">Catatan (opsional)</label>
                <Textarea
                  placeholder="Catatan untuk user..."
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-500 text-white"
                  onClick={() => process('approve')}
                  loading={actionLoading}
                >
                  <CheckCircle className="w-4 h-4" />
                  Setujui
                </Button>
                <Button
                  className="flex-1"
                  variant="destructive"
                  onClick={() => process('reject')}
                  loading={actionLoading}
                >
                  <XCircle className="w-4 h-4" />
                  Tolak
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
