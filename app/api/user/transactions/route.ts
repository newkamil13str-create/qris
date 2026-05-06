import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiResponse } from '@/lib/utils'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) return apiResponse(false, null, 'Unauthorized', 401)

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = 10

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.transaction.count({ where: { userId: session.user.id } }),
    ])

    return apiResponse(true, { transactions, total, page, pages: Math.ceil(total / limit) })
  } catch {
    return apiResponse(false, null, 'Failed', 500)
  }
}
