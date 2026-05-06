import Link from 'next/link'
import { QrCode, Zap, Shield, BarChart3, Bot, Globe, ArrowRight, Check } from 'lucide-react'

const features = [
  { icon: QrCode, title: 'Dynamic QRIS', desc: 'Konversi QRIS statis ke dinamis dalam hitungan detik dengan QR code otomatis.' },
  { icon: Zap, title: 'Real-time Status', desc: 'Cek status pembayaran otomatis setiap 10 detik tanpa perlu refresh manual.' },
  { icon: Shield, title: 'Aman & Terpercaya', desc: 'Ditenagai oleh Pakasir Payment Gateway yang terpercaya di Indonesia.' },
  { icon: BarChart3, title: 'Analytics Lengkap', desc: 'Pantau transaksi, revenue, dan penggunaan API dari satu dashboard.' },
  { icon: Bot, title: 'Telegram Bot', desc: 'Notifikasi pembayaran real-time langsung ke Telegram kamu.' },
  { icon: Globe, title: 'REST API', desc: 'Integrasikan QRIS dinamis ke aplikasimu dengan API key dan dokumentasi lengkap.' },
]

const plans = [
  { name: 'Free', price: 0, qris: 10, api: 100, features: ['10 QRIS/hari', '100 API calls/bulan', 'Basic QRIS generator'] },
  { name: 'Basic', price: 29000, qris: 100, api: 1000, features: ['100 QRIS/hari', '1.000 API calls/bulan', 'Tanpa watermark', 'Webhook support'], popular: false },
  { name: 'Premium', price: 79000, qris: 1000, api: 10000, features: ['1.000 QRIS/hari', '10.000 API calls/bulan', 'Priority support', 'Analytics dashboard'], popular: true },
  { name: 'Max', price: 199000, qris: -1, api: -1, features: ['Unlimited QRIS', 'Unlimited API calls', 'White-label', 'Telegram Bot', 'Dedicated support'] },
]

const faqs = [
  { q: 'Apa itu Dynamic QRIS?', a: 'Dynamic QRIS adalah QRIS yang dibuat untuk setiap transaksi dengan nominal yang sudah ditentukan, sehingga pembeli tidak perlu input manual.' },
  { q: 'Berapa lama QR Code aktif?', a: 'QR Code aktif selama 15 menit sejak dibuat. Setelah itu akan expired dan perlu membuat QR baru.' },
  { q: 'Apakah bisa integrasi dengan website saya?', a: 'Ya! Tersedia REST API dengan dokumentasi lengkap. Cukup gunakan API key dari dashboard.' },
  { q: 'Bagaimana cara withdraw saldo?', a: 'Masuk ke menu Withdraw di dashboard, isi nominal dan data bank, lalu submit. Admin akan memproses dalam 1x24 jam.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-[#1a1a1a] bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
              <QrCode className="w-4 h-4 text-black" />
            </div>
            <span className="font-heading font-bold text-xl">KAMIL<span className="text-yellow-400">.</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Fitur</a>
            <a href="#pricing" className="hover:text-white transition-colors">Harga</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">Masuk</Link>
            <Link href="/register" className="px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-sm font-semibold hover:from-yellow-300 hover:to-yellow-500 transition-all">
              Mulai Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-24 lg:py-32">
        {/* Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-yellow-500/20 bg-yellow-500/5 text-yellow-400 text-xs font-medium mb-6">
            <Zap className="w-3 h-3" />
            Powered by Pakasir Payment Gateway
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Dynamic QRIS<br />
            <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">Platform Terbaik</span><br />
            untuk Bisnis Kamu
          </h1>
          <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            Konversi QRIS statis ke dinamis dalam hitungan detik. Lengkap dengan real-time status, 
            Telegram notifikasi, REST API, dan analytics dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold text-base hover:from-yellow-300 hover:to-yellow-500 transition-all shadow-lg shadow-yellow-500/20">
              Coba Gratis Sekarang
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="#pricing" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg border border-[#333] text-white hover:border-yellow-500/40 hover:bg-[#111] transition-all">
              Lihat Harga
            </Link>
          </div>
          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {[['Rp 0', 'Mulai dari'], ['< 1 detik', 'Generate QR'], ['99.9%', 'Uptime']].map(([val, label]) => (
              <div key={label} className="bg-[#111] border border-[#222] rounded-xl p-4">
                <div className="text-xl font-bold text-yellow-400 font-heading">{val}</div>
                <div className="text-xs text-gray-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 border-t border-[#1a1a1a]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold mb-3">Semua yang Kamu Butuhkan</h2>
            <p className="text-gray-400">Platform QRIS dinamis paling lengkap untuk bisnis modern.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div key={f.title} className="bg-[#111] border border-[#1a1a1a] rounded-xl p-6 hover:border-yellow-500/20 transition-all duration-200 group">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center mb-4 group-hover:bg-yellow-500/20 transition-all">
                  <f.icon className="w-5 h-5 text-yellow-400" />
                </div>
                <h3 className="font-heading font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 border-t border-[#1a1a1a]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold mb-3">Harga Transparan</h2>
            <p className="text-gray-400">Mulai gratis, upgrade kapan saja. Tanpa biaya tersembunyi.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan) => (
              <div key={plan.name} className={`relative bg-[#111] border rounded-xl p-6 flex flex-col ${plan.popular ? 'border-yellow-500/50 shadow-lg shadow-yellow-500/10' : 'border-[#222]'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-xs font-bold rounded-full">
                    POPULER
                  </div>
                )}
                <div className="mb-4">
                  <div className="text-gray-400 text-sm font-medium mb-1">{plan.name}</div>
                  <div className="font-heading text-3xl font-bold text-white">
                    {plan.price === 0 ? 'Gratis' : `Rp ${plan.price.toLocaleString('id-ID')}`}
                  </div>
                  {plan.price > 0 && <div className="text-gray-500 text-xs">/bulan</div>}
                </div>
                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                      <Check className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.price === 0 ? '/register' : '/dashboard/subscribe'}
                  className={`w-full text-center py-2.5 rounded-lg text-sm font-semibold transition-all ${plan.popular ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:from-yellow-300 hover:to-yellow-500' : 'border border-[#333] text-white hover:border-yellow-500/40 hover:bg-[#1a1a1a]'}`}
                >
                  {plan.price === 0 ? 'Daftar Gratis' : 'Pilih Plan'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 border-t border-[#1a1a1a]">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold mb-3">Pertanyaan Umum</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="bg-[#111] border border-[#1a1a1a] rounded-xl p-5">
                <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-[#1a1a1a]">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl font-bold mb-4">Siap Mulai?</h2>
          <p className="text-gray-400 mb-8">Daftar sekarang dan mulai generate Dynamic QRIS dalam hitungan detik.</p>
          <Link href="/register" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold text-base hover:from-yellow-300 hover:to-yellow-500 transition-all shadow-lg shadow-yellow-500/20">
            Mulai Gratis
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-yellow-400" />
            <span>KAMIL SHOP — Dynamic QRIS Platform</span>
          </div>
          <div>© 2025 kamilshop.my.id. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
