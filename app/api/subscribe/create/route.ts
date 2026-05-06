import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createQrisTransaction } from '@/lib/pakasir'
import { apiResponse, generateOrderId, PLAN_PRICES } from '@/lib/utils'
import { Plan } from '@prisma/client'
import { z } from 'zod'

const schema = z.object({
  plan: z.enum(['BASIC', 'PREMIUM', 'MAX']),
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) return apiResponse(false, null, 'Unauthorized', 401)

    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return apiResponse(false, null, parsed.error.errors[0].message, 400)

    const { plan } = parsed.data
    const amount = PLAN_PRICES[plan]
    if (!amount) return apiResponse(false, null, 'Invalid plan', 400)

    const userId = session.user.id
    const orderId = generateOrderId(userId)

    const payment = await createQrisTransaction({ orderId, amount })

    await prisma.transaction.create({
      data: {
        userId,
        orderId,
        amount: payment.amount,
        fee: payment.fee,
        totalPayment: payment.total_payment,
        paymentNumber: payment.payment_number,
        expiredAt: new Date(payment.expired_at),
        type: 'SUBSCRIPTION',
        planTarget: plan as Plan,
        status: 'PENDING',
      },
    })

    return apiResponse(true, {
      orderId,
      paymentNumber: payment.payment_number,
      amount: payment.amount,
      fee: payment.fee,
      totalPayment: payment.total_payment,
      expiredAt: payment.expired_at,
      plan,
    })
  } catch (err) {
    console.error(err)
    return apiResponse(false, null, 'Failed to create subscription', 500)
  }
}
