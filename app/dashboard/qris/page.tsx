'use client'
import { useState } from 'react'
import { QrCode, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { QrDisplay } from '@/components/qris/QrDisplay'
import { toast } from '@/components/ui/toaster'

type Step = 1 | 2 | 3

interface QrisData {
  orderId: string; paymentNumber: string; amount: number
  totalPayment: number; expiredAt: string
}

export default function QrisPage() {
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState('')
  const [staticQris, setStaticQris] = useState('')
  const [qrisData, setQrisData] = useState<QrisData | null>(null)

  const handleGenerate = async () => {
    const num = parseInt(amount.replace(/\D/g, ''))
    if (!num || num < 1000) {
      toast({ title: 'Nominal tidak valid', description: 'Minimal Rp 1.000', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/qris/dynamic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: num, staticQris: staticQris || undefined }),
      })
      const data = await res.json()
      if (!data.success) {
        toast({ title: 'Gagal', description: data.error, variant: 'destructive' })
        return
      }
      setQrisData(data.data)
      setStep(2)
    } catch {
      toast({ title: 'Error', description: 'Terjadi kesalahan', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-white">QRIS Dinamis</h1>
        <p className="text-gray-400 text-sm mt-0.5">Generate Dynamic QRIS untuk terima pembayaran</p>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2">
        {(['Input', 'QR Code', 'Selesai'] as const).map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-yellow-500 text-black' : 'bg-[#222] text-gray-500'}`}>
              {step > i + 1 ? '✓' : i + 1}
            </div>
            <span className={`text-xs ${step === i + 1 ? 'text-white font-medium' : 'text-gray-500'}`}>{label}</span>
            {i < 2 && <ArrowRight className="w-3 h-3 text-gray-600" />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="bg-[#111] border border-[#222] rounded-xl p-6 space-y-4">
          <div className="space-y-1.5">
            <Label>Nominal Pembayaran</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rp</span>
              <Input
                className="pl-9"
                placeholder="50.000"
                value={amount}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, '')
                  setAmount(raw ? parseInt(raw).toLocaleString('id-ID') : '')
                }}
              />
            </div>
            <p className="text-xs text-gray-500">Minimal Rp 1.000</p>
          </div>

          <div className="space-y-1.5">
            <Label>QRIS Statis (Opsional)</Label>
            <Textarea
              placeholder="Tempel QRIS statis di sini..."
              value={staticQris}
              onChange={(e) => setStaticQris(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-gray-500">Kosongkan untuk menggunakan QRIS default</p>
          </div>

          <Button onClick={handleGenerate} loading={loading} className="w-full gap-2">
            <QrCode className="w-4 h-4" />
            Generate QR Code
          </Button>
        </div>
      )}

      {step === 2 && qrisData && (
        <div className="bg-[#111] border border-[#222] rounded-xl p-6">
          <QrDisplay
            qrisString={qrisData.paymentNumber}
            orderId={qrisData.orderId}
            amount={qrisData.amount}
            totalPayment={qrisData.totalPayment}
            expiredAt={qrisData.expiredAt}
            pollUrl={`/api/qris/status/${qrisData.orderId}`}
            onPaid={() => setStep(3)}
          />
          <Button
            variant="ghost"
            className="w-full mt-4 text-gray-400"
            onClick={() => { setStep(1); setQrisData(null); setAmount(''); setStaticQris('') }}
          >
            Buat QRIS Baru
          </Button>
        </div>
      )}

      {step === 3 && (
        <div className="bg-[#111] border border-green-500/20 rounded-xl p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="font-heading text-xl font-bold text-white">Pembayaran Berhasil!</h2>
          <p className="text-gray-400 text-sm">Transaksi telah dikonfirmasi</p>
          <Button onClick={() => { setStep(1); setQrisData(null); setAmount(''); setStaticQris('') }}>
            Buat QRIS Baru
          </Button>
        </div>
      )}
    </div>
  )
}
