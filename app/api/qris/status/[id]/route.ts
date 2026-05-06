import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiResponse } from '@/lib/utils'
import { sendTelegramMessage } from '@/lib/telegram'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) return apiResponse(false, null, 'Unauthorized', 401)

    const qris = await prisma.qrisRequest.findUnique({
      where: { orderId: params.id },
      include: { user: { select: { telegramId: true } } },
    })
    if (!qris) return apiResponse(false, null, 'Not found', 404)

    // Check payment via Pakasir
    const statusRes = await fetch(
      `${process.env.PAKASIR_BASE_URL}/transaction/${params.id}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.PAKASIR_API_KEY}`,
        },
      }
    )

    if (statusRes.ok) {
      const data = await statusRes.json()
      const paid = data?.status === 'PAID' || data?.payment?.status === 'PAID'
      if (paid && qris.status === 'PENDING') {
        await prisma.qrisRequest.update({
          where: { orderId: params.id },
          data: { status: 'PAID' },
        })
        if (qris.user.telegramId) {
          await sendTelegramMessage(
            qris.user.telegramId,
            `✅ QRIS Payment received!\nOrder: ${params.id}\nAmount: Rp ${qris.amount.toLocaleString('id-ID')}`
          ).catch(() => {})
        }
        return apiResponse(true, { status: 'PAID' })
      }
    }

    return apiResponse(true, { status: qris.status })
  } catch (err) {
    console.error(err)
    return apiResponse(false, null, 'Status check failed', 500)
  }
}
