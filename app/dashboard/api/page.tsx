'use client'
import { useEffect, useState } from 'react'
import { Key, Copy, RefreshCw, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toaster'

export default function ApiPage() {
  const [apiKey, setApiKey] = useState('')
  const [plan, setPlan] = useState('FREE')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/user/profile').then((r) => r.json()).then((d) => {
      if (d.success) { setApiKey(d.data.apiKey); setPlan(d.data.plan) }
    })
  }, [])

  const regenerate = async () => {
    if (!confirm('Regenerate API key? Key lama tidak akan bisa dipakai lagi.')) return
    setLoading(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'regenerateApiKey' }),
      })
      const data = await res.json()
      if (data.success) {
        setApiKey(data.data.apiKey)
        toast({ title: 'API Key diperbarui!', variant: 'success' })
      }
    } finally {
      setLoading(false)
    }
  }

  const copy = async () => {
    await navigator.clipboard.writeText(apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({ title: 'API Key disalin!', variant: 'success' })
  }

  const endpoint = `${typeof window !== 'undefined' ? window.location.origin : 'https://kamilshop.my.id'}/api/v1/qris/dynamic`

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-white">API Key</h1>
        <p className="text-gray-400 text-sm mt-0.5">Integrasikan QRIS dinamis ke aplikasi kamu</p>
      </div>

      {/* API Key card */}
      <div className="bg-[#111] border border-[#222] rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Key className="w-4 h-4 text-yellow-400" />
          <span className="font-semibold text-white">API Key Kamu</span>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 bg-[#0d0d0d] border border-[#333] rounded-lg px-3 py-2.5 font-mono text-sm text-gray-300 truncate">
            {apiKey || 'Memuat...'}
          </div>
          <Button variant="outline" size="icon" onClick={copy}>
            {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </Button>
          <Button variant="outline" size="icon" onClick={regenerate} loading={loading}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500">⚠️ Jangan bagikan API key ke siapapun.</p>
      </div>

      {/* Docs */}
      <div className="bg-[#111] border border-[#222] rounded-xl p-6 space-y-4">
        <h2 className="font-heading font-semibold text-white">Dokumentasi API</h2>

        <div className="space-y-2">
          <div className="text-sm text-gray-400">Endpoint</div>
          <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg p-3 font-mono text-sm text-yellow-400">
            POST {endpoint}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-gray-400">Headers</div>
          <pre className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg p-3 text-sm text-gray-300 overflow-x-auto">
{`X-API-Key: ${apiKey || 'YOUR_API_KEY'}
Content-Type: application/json`}
          </pre>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-gray-400">Request Body</div>
          <pre className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg p-3 text-sm text-gray-300 overflow-x-auto">
{`{
  "amount": 50000,
  "static_qris": "..." // optional
}`}
          </pre>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-gray-400">Response</div>
          <pre className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg p-3 text-sm text-gray-300 overflow-x-auto">
{`{
  "success": true,
  "data": {
    "order_id": "INV-1234567890-ABC123",
    "qris_string": "00020101...",
    "qr_image": "data:image/png;base64,...",
    "amount": 50000,
    "fee": 500,
    "total_payment": 50500,
    "expired_at": "2025-01-01T00:00:00Z"
  }
}`}
          </pre>
        </div>

        <div className="bg-[#1a1a1a] rounded-lg p-3 border border-[#222]">
          <div className="text-xs text-gray-400 mb-1">Batas Harian (Plan {plan})</div>
          <div className="text-sm text-white font-medium">
            {plan === 'FREE' ? '10 QRIS/hari' :
             plan === 'BASIC' ? '100 QRIS/hari' :
             plan === 'PREMIUM' ? '1.000 QRIS/hari' : 'Unlimited'}
          </div>
        </div>
      </div>
    </div>
  )
}
