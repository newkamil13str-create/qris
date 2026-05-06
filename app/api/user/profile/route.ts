import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiResponse } from '@/lib/utils'
import { generateTelegramToken } from '@/lib/telegram'
import { randomBytes } from 'crypto'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) return apiResponse(false, null, 'Unauthorized', 401)

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true, name: true, email: true, plan: true, planExpiresAt: true,
        balance: true, apiKey: true, telegramId: true, createdAt: true, role: true,
      },
    })
    return apiResponse(true, user)
  } catch {
    return apiResponse(false, null, 'Failed', 500)
  }
}

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).optional(),
})

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) return apiResponse(false, null, 'Unauthorized', 401)

    const body = await req.json()

    // Regenerate API key
    if (body.action === 'regenerateApiKey') {
      const newKey = randomBytes(32).toString('hex')
      await prisma.user.update({ where: { id: session.user.id }, data: { apiKey: newKey } })
      return apiResponse(true, { apiKey: newKey })
    }

    // Generate Telegram link token
    if (body.action === 'generateTelegramToken') {
      const token = generateTelegramToken()
      await prisma.user.update({ where: { id: session.user.id }, data: { telegramToken: token } })
      return apiResponse(true, { token })
    }

    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) return apiResponse(false, null, parsed.error.errors[0].message, 400)

    const { name, currentPassword, newPassword } = parsed.data
    const updateData: Record<string, string> = {}

    if (name) updateData.name = name

    if (currentPassword && newPassword) {
      const user = await prisma.user.findUnique({ where: { id: session.user.id } })
      if (!user) return apiResponse(false, null, 'Not found', 404)
      const valid = await bcrypt.compare(currentPassword, user.password)
      if (!valid) return apiResponse(false, null, 'Password saat ini salah', 400)
      updateData.password = await bcrypt.hash(newPassword, 12)
    }

    await prisma.user.update({ where: { id: session.user.id }, data: updateData })
    return apiResponse(true, { ok: true })
  } catch (err) {
    console.error(err)
    return apiResponse(false, null, 'Failed', 500)
  }
}
