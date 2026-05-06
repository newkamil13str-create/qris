import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { SessionProvider } from '@/components/SessionProvider'

export const metadata: Metadata = {
  title: 'KAMIL SHOP — Dynamic QRIS Payment Platform',
  description: 'Premium Dynamic QRIS conversion, subscription plans, and payment management.',
  keywords: ['QRIS', 'payment', 'dynamic QRIS', 'Indonesia'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="dark">
      <body className="bg-[#0a0a0a] text-white min-h-screen">
        <SessionProvider>
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  )
}
