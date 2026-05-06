import { prisma } from '@/lib/prisma'
import { createQrisTransaction } from '@/lib/pakasir'
import { apiResponse, generateOrderId, PLAN_LIMITS } from '@/lib/utils'
import QRCode from 'qrcode'
import { z } from 'zod'

const schema = z.object({
  amount: z.number().min(1000).max(50000000),
  static_qris: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const apiKey = req.headers.get('X-API-Key') ?? req.headers.get('x-api-key')
    if (!apiKey) return apiResponse(false, null, 'API key required', 401)

    const user = await prisma.user.findUnique({ where: { apiKey } })
    if (!user) return apiResponse(false, null, 'Invalid API key', 401)
    if (user.banned) return apiResponse(false, null, 'Account suspended', 403)

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return apiResponse(false, null, parsed.error.errors[0].message, 400)

    const { amount, static_qris } = parsed.data

    // Rate limit check (today's usage)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayCount = await prisma.qrisRequest.count({
      where: { userId: user.id, createdAt: { gte: today } },
    })
    const limits = PLAN_LIMITS[user.plan]
    if (todayCount >= limits.qrisPerDay) {
      return apiResponse(false, null, `Daily QRIS limit reached (${limits.qrisPerDay}/day on ${user.plan} plan)`, 429)
    }

    const orderId = generateOrderId(user.id)
    const payment = await createQrisTransaction({ orderId, amount })

    const qrImageUrl = await QRCode.toDataURL(payment.payment_number)

    await prisma.qrisRequest.create({
      data: {
        userId: user.id,
        staticQris: static_qris ?? '',
        amount,
        dynamicQris: payment.payment_number,
        orderId,
      },
    })

    return apiResponse(true, {
      order_id: orderId,
      qris_string: payment.payment_number,
      qr_image: qrImageUrl,
      amount: payment.amount,
      fee: payment.fee,
      total_payment: payment.total_payment,
      expired_at: payment.expired_at,
    })
  } catch (err) {
    console.error(err)
    return apiResponse(false, null, 'Internal error', 500)
  }
}
