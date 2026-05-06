import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiResponse } from '@/lib/utils'

export async function GET() {
  try {
    const session = await auth()
    if ((session?.user as { role?: string })?.role !== 'ADMIN')
      return apiResponse(false, null, 'Forbidden', 403)

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [totalUsers, totalTransactions, pendingWithdrawals, revenueToday, revenueTotal, planBreakdown, dailyRevenue] =
      await Promise.all([
        prisma.user.count(),
        prisma.transaction.count({ where: { status: 'PAID' } }),
        prisma.withdrawal.count({ where: { status: 'PENDING' } }),
        prisma.transaction.aggregate({
          where: { status: 'PAID', paidAt: { gte: todayStart } },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: { status: 'PAID' },
          _sum: { amount: true },
        }),
        prisma.user.groupBy({ by: ['plan'], _count: true }),
        prisma.transaction.groupBy({
          by: ['paidAt'],
          where: { status: 'PAID', paidAt: { gte: thirtyDaysAgo } },
          _sum: { amount: true },
          orderBy: { paidAt: 'asc' },
        }),
      ])

    return apiResponse(true, {
      totalUsers,
      totalTransactions,
      pendingWithdrawals,
      revenueToday: revenueToday._sum.amount ?? 0,
      revenueTotal: revenueTotal._sum.amount ?? 0,
      planBreakdown,
      dailyRevenue,
    })
  } catch (err) {
    console.error(err)
    return apiResponse(false, null, 'Failed', 500)
  }
}
