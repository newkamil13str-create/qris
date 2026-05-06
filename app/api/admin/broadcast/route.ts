import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiResponse } from '@/lib/utils'
import { sendTelegramMessage } from '@/lib/telegram'
import { z } from 'zod'

const schema = z.object({ message: z.string().min(5) })

export async function POST(req: Request) {
  try {
    const session = await auth()
    if ((session?.user as { role?: string })?.role !== 'ADMIN')
      return apiResponse(false, null, 'Forbidden', 403)

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return apiResponse(false, null, parsed.error.errors[0].message, 400)

    const users = await prisma.user.findMany({
      where: { telegramId: { not: null } },
      select: { telegramId: true },
    })

    let sent = 0
    for (const user of users) {
      if (user.telegramId) {
        await sendTelegramMessage(user.telegramId, `📢 <b>Broadcast dari KAMIL SHOP</b>\n\n${parsed.data.message}`).catch(() => {})
        sent++
        await new Promise((r) => setTimeout(r, 50))
      }
    }

    return apiResponse(true, { sent, total: users.length })
  } catch (err) {
    console.error(err)
    return apiResponse(false, null, 'Broadcast failed', 500)
  }
}
