import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiResponse } from '@/lib/utils'
import { sendTelegramMessage } from '@/lib/telegram'
import { sendEmail, withdrawalEmail } from '@/lib/email'
import { z } from 'zod'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if ((session?.user as { role?: string })?.role !== 'ADMIN')
      return apiResponse(false, null, 'Forbidden', 403)

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') ?? undefined

    const withdrawals = await prisma.withdrawal.findMany({
      where: status ? { status: status as 'PENDING' | 'APPROVED' | 'REJECTED' } : undefined,
      include: { user: { select: { name: true, email: true, telegramId: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return apiResponse(true, { withdrawals })
  } catch (err) {
    console.error(err)
    return apiResponse(false, null, 'Failed', 500)
  }
}

const patchSchema = z.object({
  withdrawalId: z.string(),
  action: z.enum(['approve', 'reject']),
  note: z.string().optional(),
})

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if ((session?.user as { role?: string })?.role !== 'ADMIN')
      return apiResponse(false, null, 'Forbidden', 403)

    const body = await req.json()
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) return apiResponse(false, null, parsed.error.errors[0].message, 400)

    const { withdrawalId, action, note } = parsed.data

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: { user: true },
    })
    if (!withdrawal) return apiResponse(false, null, 'Not found', 404)
    if (withdrawal.status !== 'PENDING') return apiResponse(false, null, 'Already processed', 400)

    if (action === 'approve') {
      await prisma.withdrawal.update({
        where: { id: withdrawalId },
        data: { status: 'APPROVED', processedAt: new Date(), note: note ?? null },
      })
    } else {
      await prisma.$transaction([
        prisma.withdrawal.update({
          where: { id: withdrawalId },
          data: { status: 'REJECTED', processedAt: new Date(), note: note ?? null },
        }),
        prisma.user.update({
          where: { id: withdrawal.userId },
          data: { balance: { increment: withdrawal.amount } },
        }),
      ])
    }

    const status = action === 'approve' ? 'APPROVED' : 'REJECTED'

    if (withdrawal.user.telegramId) {
      const icon = status === 'APPROVED' ? '✅' : '❌'
      await sendTelegramMessage(
        withdrawal.user.telegramId,
        `${icon} Withdrawal Rp ${withdrawal.amount.toLocaleString('id-ID')} ${status === 'APPROVED' ? 'disetujui' : 'ditolak'}${note ? `\nCatatan: ${note}` : ''}`
      ).catch(() => {})
    }

    await sendEmail({
      to: withdrawal.user.email,
      subject: `Withdrawal ${status} — KAMIL SHOP`,
      html: withdrawalEmail(withdrawal.user.name, status, withdrawal.amount, note),
    }).catch(() => {})

    return apiResponse(true, { ok: true })
  } catch (err) {
    console.error(err)
    return apiResponse(false, null, 'Failed', 500)
  }
}
