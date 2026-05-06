import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiResponse } from '@/lib/utils'
import { notifyAdmin, sendTelegramMessage } from '@/lib/telegram'
import { z } from 'zod'

const schema = z.object({
  amount: z.number().min(20000),
  bankName: z.string().min(2),
  bankAccount: z.string().min(5),
  bankHolder: z.string().min(2),
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) return apiResponse(false, null, 'Unauthorized', 401)

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return apiResponse(false, null, parsed.error.errors[0].message, 400)

    const { amount, bankName, bankAccount, bankHolder } = parsed.data
    const userId = session.user.id

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return apiResponse(false, null, 'User not found', 404)
    if (user.balance < amount) return apiResponse(false, null, 'Saldo tidak mencukupi', 400)

    const [withdrawal] = await prisma.$transaction([
      prisma.withdrawal.create({
        data: { userId, amount, bankName, bankAccount, bankHolder, status: 'PENDING' },
      }),
      prisma.user.update({ where: { id: userId }, data: { balance: { decrement: amount } } }),
    ])

    await notifyAdmin(
      `💸 Withdrawal Request!\nUser: ${user.name} (${user.email})\nJumlah: Rp ${amount.toLocaleString('id-ID')}\nBank: ${bankName} - ${bankAccount} (${bankHolder})`
    ).catch(() => {})

    if (user.telegramId) {
      await sendTelegramMessage(
        user.telegramId,
        `📤 Permintaan withdraw Rp ${amount.toLocaleString('id-ID')} sedang diproses.`
      ).catch(() => {})
    }

    return apiResponse(true, { id: withdrawal.id })
  } catch (err) {
    console.error(err)
    return apiResponse(false, null, 'Gagal membuat withdrawal', 500)
  }
}
