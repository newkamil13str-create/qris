'use client'
import { useState, useEffect } from 'react'
import { ArrowUpFromLine, CheckCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/toaster'
import { formatRupiah } from '@/lib/utils'

export default function WithdrawPage() {
  const [loading, setLoading] = useState(false)
  const [balance, setBalance] = useState(0)
  const [form, setForm] = useState({ amount: '', bankName: '', bankAccount: '', bankHolder: '' })
  const [done, setDone] = useState(false)

  useEffect(() => {
    fetch('/api/user/profile').then((r) => r.json()).then((d) => {
      if (d.success) setBalance(d.data.balance)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const num = parseInt(form.amount.replace(/\D/g, ''))
    if (!num || num < 20000) {
      toast({ title: 'Minimal Rp 20.000', variant: 'destructive' })
      return
    }
    if (num > balance) {
      toast({ title: 'Saldo tidak mencukupi', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/withdraw/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: num, bankName: form.bankName, bankAccount: form.bankAccount, bankHolder: form.bankHolder }),
      })
      const data = await res.json()
      if (!data.success) {
        toast({ title: 'Gagal', description: data.error, variant: 'destructive' })
      } else {
        setDone(true)
        setBalance((b) => b - num)
      }
    } catch {
      toast({ title: 'Error', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  if (done) return (
    <div className="max-w-lg">
      <div className="bg-[#111] border border-green-500/20 rounded-xl p-8 text-center space-y-4">
        <CheckCircle className="w-12 h-12 text-green-400 mx-auto" />
        <h2 className="font-heading text-xl font-bold text-white">Permintaan Dikirim!</h2>
        <p className="text-gray-400 text-sm">Admin akan memproses dalam 1×24 jam. Kamu akan mendapat notifikasi.</p>
        <Button onClick={() => { setDone(false); setForm({ amount: '', bankName: '', bankAccount: '', bankHolder: '' }) }}>
          Buat Permintaan Lain
        </Button>
      </div>
    </div>
  )

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-white">Withdraw</h1>
        <p className="text-gray-400 text-sm mt-0.5">Tarik saldo ke rekening bank kamu</p>
      </div>

      <div className="bg-[#111] border border-[#222] rounded-xl p-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-400 mb-0.5">Saldo Tersedia</div>
          <div className="font-heading font-bold text-yellow-400 text-xl">{formatRupiah(balance)}</div>
        </div>
        <Clock className="w-8 h-8 text-gray-600" />
      </div>

      <form onSubmit={handleSubmit} className="bg-[#111] border border-[#222] rounded-xl p-6 space-y-4">
        <div className="space-y-1.5">
          <Label>Nominal Withdraw</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rp</span>
            <Input
              className="pl-9"
              placeholder="50.000"
              value={form.amount}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, '')
                setForm({ ...form, amount: raw ? parseInt(raw).toLocaleString('id-ID') : '' })
              }}
              required
            />
          </div>
          <p className="text-xs text-gray-500">Minimal Rp 20.000</p>
        </div>

        <div className="space-y-1.5">
          <Label>Nama Bank</Label>
          <Input
            placeholder="BCA / BNI / BRI / Mandiri / dll"
            value={form.bankName}
            onChange={(e) => setForm({ ...form, bankName: e.target.value })}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label>Nomor Rekening</Label>
          <Input
            placeholder="1234567890"
            value={form.bankAccount}
            onChange={(e) => setForm({ ...form, bankAccount: e.target.value })}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label>Nama Pemilik Rekening</Label>
          <Input
            placeholder="Sesuai buku tabungan"
            value={form.bankHolder}
            onChange={(e) => setForm({ ...form, bankHolder: e.target.value })}
            required
          />
        </div>

        <Button type="submit" loading={loading} className="w-full gap-2">
          <ArrowUpFromLine className="w-4 h-4" />
          Kirim Permintaan Withdraw
        </Button>
      </form>
    </div>
  )
}
