import { prisma } from '@/lib/prisma'
import { apiResponse } from '@/lib/utils'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'
import { z } from 'zod'
import { notifyAdmin } from '@/lib/telegram'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return apiResponse(false, null, parsed.error.errors[0].message, 400)
    }
    const { name, email, password } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return apiResponse(false, null, 'Email already registered', 409)

    const passwordHash = await bcrypt.hash(password, 12)
    const apiKey = randomBytes(32).toString('hex')

    const user = await prisma.user.create({
      data: { name, email, password: passwordHash, apiKey },
      select: { id: true, name: true, email: true, plan: true },
    })

    // Notify admin
    await notifyAdmin(`🆕 New user registered!\nName: ${name}\nEmail: ${email}`).catch(() => {})

    return apiResponse(true, user)
  } catch (err) {
    console.error(err)
    return apiResponse(false, null, 'Registration failed', 500)
  }
}
