import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiResponse } from '@/lib/utils'
import { Plan } from '@prisma/client'
import { z } from 'zod'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if ((session?.user as { role?: string })?.role !== 'ADMIN')
      return apiResponse(false, null, 'Forbidden', 403)

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('q') ?? ''
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = 20

    const users = await prisma.user.findMany({
      where: search
        ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }] }
        : undefined,
      select: { id: true, name: true, email: true, plan: true, role: true, balance: true, banned: true, createdAt: true, planExpiresAt: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    })

    const total = await prisma.user.count()
    return apiResponse(true, { users, total, page })
  } catch (err) {
    console.error(err)
    return apiResponse(false, null, 'Failed', 500)
  }
}

const patchSchema = z.object({
  userId: z.string(),
  action: z.enum(['ban', 'unban', 'setPlan']),
  plan: z.nativeEnum(Plan).optional(),
})

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if ((session?.user as { role?: string })?.role !== 'ADMIN')
      return apiResponse(false, null, 'Forbidden', 403)

    const body = await req.json()
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) return apiResponse(false, null, parsed.error.errors[0].message, 400)

    const { userId, action, plan } = parsed.data

    if (action === 'ban') {
      await prisma.user.update({ where: { id: userId }, data: { banned: true } })
    } else if (action === 'unban') {
      await prisma.user.update({ where: { id: userId }, data: { banned: false } })
    } else if (action === 'setPlan' && plan) {
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 30)
      await prisma.user.update({
        where: { id: userId },
        data: { plan, planExpiresAt: plan === 'FREE' ? null : expiresAt },
      })
    }

    return apiResponse(true, { ok: true })
  } catch (err) {
    console.error(err)
    return apiResponse(false, null, 'Failed', 500)
  }
}
