'use client'
import { signOut } from 'next-auth/react'
import { Menu, LogOut, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatRupiah } from '@/lib/utils'

interface TopBarProps {
  user: { name?: string | null; email?: string | null; plan?: string; balance?: number }
  onMenuClick: () => void
}

const planVariant: Record<string, 'free' | 'basic' | 'premium' | 'max'> = {
  FREE: 'free', BASIC: 'basic', PREMIUM: 'premium', MAX: 'max',
}

export function TopBar({ user, onMenuClick }: TopBarProps) {
  const plan = user.plan ?? 'FREE'
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6 h-14 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-[#1a1a1a]">
      <button onClick={onMenuClick} className="lg:hidden text-gray-400 hover:text-white transition-colors">
        <Menu className="w-5 h-5" />
      </button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-3">
        {/* Balance */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1a] rounded-lg border border-[#222]">
          <span className="text-xs text-gray-400">Saldo</span>
          <span className="text-sm font-semibold text-white">{formatRupiah(user.balance ?? 0)}</span>
        </div>

        {/* Plan badge */}
        <Badge variant={planVariant[plan] ?? 'free'}>
          {plan}
        </Badge>

        {/* User */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-black text-sm font-bold">
            {user.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <span className="hidden md:block text-sm text-gray-300 max-w-[120px] truncate">
            {user.name}
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => signOut({ callbackUrl: '/' })}
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  )
}
