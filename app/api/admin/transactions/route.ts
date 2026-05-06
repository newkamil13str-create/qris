import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiResponse } from '@/lib/utils'

export async function GET() {
  try {
    const session = await auth()
    if ((session?.user as { role?: string })?.role !== 'ADMIN')
      return apiResponse(false, null, 'Forbidden', 403)

    const transactions = await prisma.transaction.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return apiResponse(true, { transactions })
  } catch (err) {
    console.error(err)
    return apiResponse(false, null, 'Failed', 500)
  }
}
