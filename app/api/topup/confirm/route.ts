import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiResponse } from '@/lib/utils'
import { sendTelegramMessage } from '@/lib/telegram'
import { sendEmail } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) return apiResponse(false, null, 'Unauthorized', 401)

    const { orderId } = await req.json()
    if (!orderId) return apiResponse(false, null, 'Missing orderId', 400)

    const tx = await prisma.transaction.findUnique({
      where: { orderId, userId: session.user.id, type: 'TOPUP' },
      include: { user: true },
    })
    if (!tx) return apiResponse(false, null, 'Transaction not found', 404)
    if (tx.status === 'PAID') return apiResponse(true, { status: 'PAID' })

    // Poll Pakasir
    const statusRes = await fetch(
      `${process.env.PAKASIR_BASE_URL}/transaction/${orderId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.PAKASIR_API_KEY}`,
        },
      }
    )

    let paid = false
    if (statusRes.ok) {
      const data = await statusRes.json()
      paid = data?.status === 'PAID' || data?.payment?.status === 'PAID'
    }

    if (paid) {
      await prisma.$transaction([
        prisma.transaction.update({ where: { orderId }, data: { status: 'PAID', paidAt: new Date() } }),
        prisma.user.update({ where: { id: session.user.id }, data: { balance: { increment: tx.amount } } }),
      ])

      if (tx.user.telegramId) {
        await sendTelegramMessage(
          tx.user.telegramId,
          `💰 Top Up Berhasil!\nJumlah: Rp ${tx.amount.toLocaleString('id-ID')}\nOrder: ${orderId}`
        ).catch(() => {})
      }

      await sendEmail({
        to: tx.user.email,
        subject: 'Top Up Berhasil — KAMIL SHOP',
        html: `<p>Hi ${tx.user.name}, top up Rp ${tx.amount.toLocaleString('id-ID')} berhasil!</p>`,
      }).catch(() => {})
    }

    return apiResponse(true, { status: paid ? 'PAID' : tx.status })
  } catch (err) {
    console.error(err)
    return apiResponse(false, null, 'Confirmation failed', 500)
  }
}
