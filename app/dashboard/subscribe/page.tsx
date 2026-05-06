'use client'
import { useState } from 'react'
import { Check, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { QrDisplay } from '@/components/qris/QrDisplay'
import { toast } from '@/components/ui/toaster'
import { formatRupiah } from '@/lib/utils'

const plans = [
  { id: 'BASIC', name: 'Basic', price: 29000, features: ['100 QRIS/hari', '1.000 API calls/bulan', 'Tanpa watermark', 'Webhook support'] },
  { id: 'PREMIUM', name: 'Premium', price: 79000, features: ['1.000 QRIS/hari', '10.000 API calls/bulan', 'Priority support', 'Analytics dashboard'], popular: true },
  { id: 'MAX', name: 'Max', price: 199000, features: ['Unlimited QRIS', 'Unlimited API calls', 'White-label', 'Telegram bot', 'Dedicated support'] },
]

interface QrisData {
  orderId: string; paymentNumber: string; amount: number; totalPayment: number; expiredAt: string
}

export default function SubscribePage() {
  const [selected, setSelected] = useState<string>('PREMIUM')
  const [loading, setLoading] = useState(false)
  const [qrisData, setQrisData] = useState<QrisData | null>(null)

  const handleSubscribe = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/subscribe/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selected }),
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

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-white">Upgrade Plan</h1>
        <p className="text-gray-400 text-sm mt-0.5">Pilih plan terbaik untuk kebutuhanmu</p>
      </div>

      {!qrisData ? (
        <>
          <div className="grid gap-3">
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelected(plan.id)}
                className={`w-full text-left bg-[#111] border rounded-xl p-5 transition-all relative ${selected === plan.id ? 'border-yellow-500/50 shadow-lg shadow-yellow-500/5' : 'border-[#222] hover:border-[#333]'}`}
              >
                {plan.popular && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 bg-yellow-500 text-black text-xs font-bold rounded-full">POPULER</span>
                )}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-heading font-bold text-white text-lg">{plan.name}</div>
                    <div className="text-yellow-400 font-semibold">{formatRupiah(plan.price)}<span className="text-gray-400 text-sm font-normal">/bulan</span></div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 ${selected === plan.id ? 'border-yellow-400 bg-yellow-400' : 'border-[#333]'}`}>
                    {selected === plan.id && <Check className="w-3 h-3 text-black" />}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Check className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </button>
            ))}
          </div>

          <Button onClick={handleSubscribe} loading={loading} className="w-full gap-2" size="lg">
            <CreditCard className="w-4 h-4" />
            Bayar {formatRupiah(plans.find((p) => p.id === selected)?.price ?? 0)}
          </Button>
        </>
      ) : (
        <div className="bg-[#111] border border-[#222] rounded-xl p-6">
          <h2 className="font-heading font-semibold text-white mb-4 text-center">
            Bayar untuk Aktifkan Plan {plans.find((p) => p.id === selected)?.name}
          </h2>
          <QrDisplay
            qrisString={qrisData.paymentNumber}
            orderId={qrisData.orderId}
            amount={qrisData.amount}
            totalPayment={qrisData.totalPayment}
            expiredAt={qrisData.expiredAt}
            onPaid={() => toast({ title: 'Plan diaktifkan!', description: 'Selamat menggunakan fitur premium.', variant: 'success' })}
          />
          <Button variant="ghost" className="w-full mt-4 text-gray-400" onClick={() => setQrisData(null)}>
            Batal
          </Button>
        </div>
      )}
    </div>
  )
}
