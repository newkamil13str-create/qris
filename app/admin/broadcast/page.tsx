'use client'
import { useState } from 'react'
import { Send, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/toaster'

export default function BroadcastPage() {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ sent: number; total: number } | null>(null)

  const handleSend = async () => {
    if (message.trim().length < 5) {
      toast({ title: 'Pesan terlalu pendek', variant: 'destructive' }); return
    }
    if (!confirm(`Kirim broadcast ke semua user Telegram?`)) return
    setLoading(true)
    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })
      const data = await res.json()
      if (data.success) {
        setResult(data.data)
        setMessage('')
        toast({ title: `Broadcast terkirim ke ${data.data.sent} user!`, variant: 'success' })
      } else {
        toast({ title: data.error, variant: 'destructive' })
      }
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-white">Broadcast Telegram</h1>
        <p className="text-gray-400 text-sm mt-0.5">Kirim pesan massal ke semua user yang sudah link Telegram</p>
      </div>

      <div className="bg-[#111] border border-[#222] rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[#1a1a1a]">
          <Bot className="w-5 h-5 text-yellow-400" />
          <span className="font-semibold text-white">Pesan Broadcast</span>
        </div>

        <div className="space-y-1.5">
          <Label>Isi Pesan</Label>
          <Textarea
            placeholder="Halo semua! Kami ingin mengumumkan..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={6}
          />
          <p className="text-xs text-gray-500">{message.length} karakter · Mendukung HTML Telegram (bold, italic, code)</p>
        </div>

        {/* Preview */}
        {message && (
          <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg p-4">
            <div className="text-xs text-gray-500 mb-2">Preview pesan:</div>
            <div className="text-sm text-gray-200 whitespace-pre-wrap">
              📢 <strong>Broadcast dari KAMIL SHOP</strong>{'\n\n'}{message}
            </div>
          </div>
        )}

        <Button onClick={handleSend} loading={loading} className="w-full gap-2">
          <Send className="w-4 h-4" />
          Kirim Broadcast
        </Button>
      </div>

      {result && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-sm text-green-400">
          ✅ Broadcast berhasil dikirim ke <strong>{result.sent}</strong> dari <strong>{result.total}</strong> user Telegram.
        </div>
      )}

      <div className="bg-[#111] border border-[#222] rounded-xl p-4 space-y-2 text-sm">
        <div className="font-semibold text-white text-sm mb-2">Tips HTML Telegram:</div>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
          <code className="bg-[#0d0d0d] px-2 py-1 rounded">&lt;b&gt;bold&lt;/b&gt;</code>
          <code className="bg-[#0d0d0d] px-2 py-1 rounded">&lt;i&gt;italic&lt;/i&gt;</code>
          <code className="bg-[#0d0d0d] px-2 py-1 rounded">&lt;code&gt;code&lt;/code&gt;</code>
          <code className="bg-[#0d0d0d] px-2 py-1 rounded">&lt;u&gt;underline&lt;/u&gt;</code>
        </div>
      </div>
    </div>
  )
}
