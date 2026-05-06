import { Telegraf } from 'telegraf'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

let bot: Telegraf | null = null

export function getBot(): Telegraf {
  if (!bot && process.env.TELEGRAM_BOT_TOKEN) {
    bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)
  }
  if (!bot) throw new Error('No TELEGRAM_BOT_TOKEN set')
  return bot
}

export async function sendTelegramMessage(telegramId: string, message: string) {
  try {
    const b = getBot()
    await b.telegram.sendMessage(telegramId, message, { parse_mode: 'HTML' })
  } catch (err) {
    console.error('Telegram send error:', err)
  }
}

export async function notifyAdmin(message: string) {
  const adminId = process.env.ADMIN_TELEGRAM_ID
  if (adminId) await sendTelegramMessage(adminId, message)
}

export function generateTelegramToken(): string {
  return randomBytes(16).toString('hex')
}

export function setupBotCommands() {
  const b = getBot()

  b.start(async (ctx) => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    await ctx.reply(
      `👋 Welcome to <b>KAMIL SHOP Bot</b>!\n\nLink your account:\n1. Login to ${appUrl}/dashboard/profile\n2. Copy your link token\n3. Use /link {token}\n\nCommands:\n/balance — Check balance\n/plan — Check plan\n/status {orderId} — Transaction status`,
      { parse_mode: 'HTML' }
    )
  })

  b.command('balance', async (ctx) => {
    const telegramId = String(ctx.from.id)
    const user = await prisma.user.findFirst({ where: { telegramId } })
    if (!user) {
      return ctx.reply('❌ Account not linked. Use /link {token} to link your account.')
    }
    await ctx.reply(`💰 Your balance: <b>Rp ${user.balance.toLocaleString('id-ID')}</b>`, {
      parse_mode: 'HTML',
    })
  })

  b.command('plan', async (ctx) => {
    const telegramId = String(ctx.from.id)
    const user = await prisma.user.findFirst({ where: { telegramId } })
    if (!user) return ctx.reply('❌ Account not linked. Use /link {token} to link your account.')
    const expiry = user.planExpiresAt
      ? user.planExpiresAt.toLocaleDateString('id-ID')
      : 'Never expires'
    await ctx.reply(
      `📦 Plan: <b>${user.plan}</b>\n📅 Expires: ${expiry}`,
      { parse_mode: 'HTML' }
    )
  })

  b.command('link', async (ctx) => {
    const token = ctx.message.text.split(' ')[1]
    if (!token) return ctx.reply('Usage: /link {token}')
    const user = await prisma.user.findFirst({ where: { telegramToken: token } })
    if (!user) return ctx.reply('❌ Invalid or expired token.')
    await prisma.user.update({
      where: { id: user.id },
      data: { telegramId: String(ctx.from.id), telegramToken: null },
    })
    await ctx.reply(`✅ Account linked! Hi <b>${user.name}</b>`, { parse_mode: 'HTML' })
  })

  b.command('status', async (ctx) => {
    const orderId = ctx.message.text.split(' ')[1]
    if (!orderId) return ctx.reply('Usage: /status {orderId}')
    const tx = await prisma.transaction.findUnique({ where: { orderId } })
    if (!tx) return ctx.reply('❌ Transaction not found.')
    await ctx.reply(
      `📝 Order: <code>${tx.orderId}</code>\n💰 Amount: Rp ${tx.amount.toLocaleString('id-ID')}\n📊 Status: <b>${tx.status}</b>`,
      { parse_mode: 'HTML' }
    )
  })

  return b
}
