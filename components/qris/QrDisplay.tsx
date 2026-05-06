'use client'
import { useEffect, useState, useRef } from 'react'
import QRCode from 'qrcode'
import { Copy, CheckCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toaster'
import { formatRupiah } from '@/lib/utils'

interface QrDisplayProps {
  qrisString: string
  orderId: string
  amount: number
  totalPayment: number
  expiredAt: string
  onPaid?: () => void
  pollUrl?: string
}

export function QrDisplay({ qrisString, orderId, amount, totalPayment, expiredAt, onPaid, pollUrl }: QrDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [status, setStatus] = useState<'PENDING' | 'PAID' | 'EXPIRED'>('PENDING')
  const [timeLeft, setTimeLeft] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    QRCode.toDataURL(qrisString, { width: 280, margin: 2, color: { dark: '#000000', light: '#ffffff' } })
      .then(setQrDataUrl)
      .catch(console.error)
  }, [qrisString])

  // Countdown
  useEffect(() => {
    const expiry = new Date(expiredAt).getTime()
    const tick = () => {
      const now = Date.now()
      const diff = Math.max(0, Math.floor((expiry - now) / 1000))
      setTimeLeft(diff)
      if (diff === 0 && status === 'PENDING') setStatus('EXPIRED')
    }
    tick()
    intervalRef.current = setInterval(tick, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [expiredAt, status])

  // Poll for payment
  useEffect(() => {
    if (!pollUrl || status !== 'PENDING') return
    const url = pollUrl ?? `/api/qris/status/${orderId}`
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(url)
        const data = await res.json()
        if (data?.data?.status === 'PAID') {
          setStatus('PAID')
          clearInterval(pollRef.current!)
          onPaid?.()
          toast({ title: '✅ Pembayaran Berhasil!', description: `Order ${orderId} telah dibayar.`, variant: 'success' })
        }
      } catch {}
    }, 10000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [orderId, pollUrl, status, onPaid])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const progress = timeLeft > 0 ? (timeLeft / 900) * 100 : 0 // assume 15min

  const copyQris = async () => {
    await navigator.clipboard.writeText(qrisString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({ title: 'QRIS disalin!', variant: 'success' })
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Status */}
      <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium border ${
        status === 'PAID' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
        status === 'EXPIRED' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
        'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
      }`}>
        {status === 'PENDING' && <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />}
        {status === 'PAID' && <CheckCircle className="w-4 h-4" />}
        {status === 'PAID' ? 'Pembayaran Berhasil' : status === 'EXPIRED' ? 'Expired' : 'Menunggu Pembayaran'}
      </div>

      {/* QR Code */}
      {qrDataUrl && status !== 'PAID' ? (
        <div className="relative">
          <div className={`p-3 rounded-xl bg-white shadow-lg shadow-black/50 ${status === 'EXPIRED' ? 'opacity-40' : ''}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt="QR Code" width={256} height={256} className="rounded-lg" />
          </div>
          {status === 'PENDING' && (
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-[#111] border border-[#333] px-3 py-1 rounded-full">
              <RefreshCw className="w-3 h-3 text-gray-400 animate-spin" />
              <span className="text-xs text-gray-400">Auto-refresh 10s</span>
            </div>
          )}
        </div>
      ) : status === 'PAID' ? (
        <div className="w-64 h-64 rounded-xl bg-green-500/10 border-2 border-green-500/30 flex flex-col items-center justify-center gap-3">
          <CheckCircle className="w-16 h-16 text-green-400" />
          <span className="text-green-400 font-semibold">Lunas!</span>
        </div>
      ) : null}

      {/* Amount info */}
      <div className="w-full grid grid-cols-2 gap-3 text-sm">
        <div className="bg-[#1a1a1a] rounded-lg p-3 border border-[#222]">
          <div className="text-gray-400 text-xs mb-1">Nominal</div>
          <div className="font-semibold text-white">{formatRupiah(amount)}</div>
        </div>
        <div className="bg-[#1a1a1a] rounded-lg p-3 border border-[#222]">
          <div className="text-gray-400 text-xs mb-1">Total Bayar</div>
          <div className="font-semibold text-yellow-400">{formatRupiah(totalPayment)}</div>
        </div>
      </div>

      {/* Timer */}
      {status === 'PENDING' && (
        <div className="w-full bg-[#1a1a1a] rounded-lg p-3 border border-[#222] text-center">
          <div className="text-xs text-gray-400 mb-1">Kadaluarsa dalam</div>
          <div className="font-mono text-xl font-bold text-white">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <div className="mt-2 h-1 bg-[#222] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        </div>
      )}

      {/* Copy */}
      {status === 'PENDING' && (
        <Button variant="outline" onClick={copyQris} className="w-full gap-2">
          {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Disalin!' : 'Salin QRIS String'}
        </Button>
      )}
    </div>
  )
}
