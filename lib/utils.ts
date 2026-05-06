import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function generateOrderId(userId: string): string {
  const timestamp = Date.now()
  const shortId = userId.slice(0, 6).toUpperCase()
  return `INV-${timestamp}-${shortId}`
}

export function planLabel(plan: string): string {
  const labels: Record<string, string> = {
    FREE: 'Free',
    BASIC: 'Basic',
    PREMIUM: 'Premium',
    MAX: 'Max',
  }
  return labels[plan] ?? plan
}

export function planColor(plan: string): string {
  const colors: Record<string, string> = {
    FREE: 'bg-gray-600 text-gray-100',
    BASIC: 'bg-blue-600 text-blue-100',
    PREMIUM: 'bg-purple-600 text-purple-100',
    MAX: 'bg-yellow-500 text-black',
  }
  return colors[plan] ?? 'bg-gray-600 text-gray-100'
}

export const PLAN_PRICES: Record<string, number> = {
  FREE: 0,
  BASIC: 29000,
  PREMIUM: 79000,
  MAX: 199000,
}

export const PLAN_LIMITS: Record<string, { qrisPerDay: number; apiPerMonth: number }> = {
  FREE: { qrisPerDay: 10, apiPerMonth: 100 },
  BASIC: { qrisPerDay: 100, apiPerMonth: 1000 },
  PREMIUM: { qrisPerDay: 1000, apiPerMonth: 10000 },
  MAX: { qrisPerDay: Infinity, apiPerMonth: Infinity },
}

export function apiResponse<T>(
  success: boolean,
  data?: T,
  error?: string,
  status = 200
) {
  return Response.json({ success, data, error }, { status })
}
