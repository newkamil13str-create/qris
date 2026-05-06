'use client'
import { useState } from 'react'
import { Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { QrDisplay } from '@/components/qris/QrDisplay'
import { toast } from '@/components/ui/toaster'
import { formatRupiah } from '@/lib/utils'
import { useRouter } from 'next/navigation'

const presets = [50000, 100000, 200000, 500000]

interface QrisData {
  orderId: string; paymentNumber: string; amount: number; totalPayment: number; expiredAt: string
}

export default function TopupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState('')
  const [qrisData, setQrisData] = useState<QrisData | null>(null)

  const handleTopup = async () => {
    const num = parseInt(amount.replace(/\D/g, ''))
    if (!num || num < 10000) {
      toast({ title: 'Nominal tidak valid', description: 'Minimal Rp 10.000', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/topup/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: num }),
      })
      const data = await res.json()
      if (!data.success) {
        toast({ title: 'Gagal', description: data.error, variant: 'destructive' })
        return
      }
      setQrisData(data.data)
    } catch {
      toast({ title: 'Error', description: 'Terjadi kesalahan', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handlePaid = () => {
    setTimeout(() => {
      toast({ title: 'Saldo ditambahkan!', variant: 'success' })
      router.refresh()
    }, 1000)
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-white">Top Up Saldo</h1>
        <p className="text-gray-400 text-sm mt-0.5">Tambah saldo untuk transaksi dan langganan</p>
      </div>

      {!qrisData ? (
        <div className="bg-[#111] border border-[#222] rounded-xl p-6 space-y-4">
          {/* Presets */}
          <div>
            <Label className="mb-2 block">Pilih Nominal</Label>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((p) => (
                <button
                  key={p}
                  onClick={() => setAmount(p.toLocaleString('id-ID'))}
                  className={`py-2.5 rounded-lg border text-sm font-medium transition-all ${amount === p.toLocaleString('id-ID') ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400' : 'border-[#333] text-gray-300 hover:border-yellow-500/30 hover:text-white'}`}
                >
                  {formatRupiah(p)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Atau masukkan nominal lain</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rp</span>
              <Input
                className="pl-9"
                placeholder="150.000"
                value={amount}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, '')
                  setAmount(raw ? parseInt(raw).toLocaleString('id-ID') : '')
                }}
              />
            </div>
            <p className="text-xs text-gray-500">Minimal Rp 10.000</p>
          </div>

          <Button onClick={handleTopup} loading={loading} className="w-full gap-2">
            <Wallet className="w-4 h-4" />
            Lanjutkan Top Up
          </Button>
        </div>
      ) : (
        <div className="bg-[#111] border border-[#222] rounded-xl p-6">
          <h2 className="font-heading font-semibold text-white mb-4 text-center">Scan untuk Bayar</h2>
          <QrDisplay
            qrisString={qrisData.paymentNumber}
            orderId={qrisData.orderId}
            amount={qrisData.amount}
            totalPayment={qrisData.totalPayment}
            expiredAt={qrisData.expiredAt}
            pollUrl={`/api/topup/confirm`}
            onPaid={handlePaid}
          />
          <Button variant="ghost" className="w-full mt-4 text-gray-400" onClick={() => setQrisData(null)}>
            Batal
          </Button>
        </div>
      )}
    </div>
  )
}
