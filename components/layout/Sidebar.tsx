'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, QrCode, Wallet, CreditCard, ArrowUpFromLine,
  History, Key, User, Settings, Shield, Users, BarChart3, X
} from 'lucide-react'

const userNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/qris', label: 'QRIS Dinamis', icon: QrCode },
  { href: '/dashboard/topup', label: 'Top Up', icon: Wallet },
  { href: '/dashboard/subscribe', label: 'Langganan', icon: CreditCard },
  { href: '/dashboard/withdraw', label: 'Withdraw', icon: ArrowUpFromLine },
  { href: '/dashboard/transactions', label: 'Transaksi', icon: History },
  { href: '/dashboard/api', label: 'API Key', icon: Key },
  { href: '/dashboard/profile', label: 'Profil', icon: User },
]

const adminNav = [
  { href: '/admin', label: 'Overview', icon: BarChart3 },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/transactions', label: 'Transaksi', icon: History },
  { href: '/admin/withdrawals', label: 'Withdrawal', icon: ArrowUpFromLine },
  { href: '/admin/broadcast', label: 'Broadcast', icon: Settings },
]

interface SidebarProps {
  isAdmin?: boolean
  open: boolean
  onClose: () => void
}

export function Sidebar({ isAdmin, open, onClose }: SidebarProps) {
  const pathname = usePathname()
  const nav = isAdmin ? adminNav : userNav

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-[#0d0d0d] border-r border-[#1a1a1a] flex flex-col transition-transform duration-300',
          'lg:translate-x-0 lg:static lg:z-auto',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-5 border-b border-[#1a1a1a]">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
              <QrCode className="w-4 h-4 text-black" />
            </div>
            <span className="font-heading font-bold text-white text-lg">
              KAMIL<span className="text-yellow-400">.</span>
            </span>
          </Link>
          <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isAdmin && (
          <div className="px-4 py-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <Shield className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-xs text-yellow-400 font-medium">Admin Panel</span>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-dark">
          {nav.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200',
                  active
                    ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
                )}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-[#1a1a1a]">
          <Link
            href="/dashboard"
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            kamilshop.my.id
          </Link>
        </div>
      </aside>
    </>
  )
}
