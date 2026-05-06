import { setupBotCommands } from '@/lib/telegram'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const bot = setupBotCommands()
    await bot.handleUpdate(body)
    return new Response('OK', { status: 200 })
  } catch (err) {
    console.error('Telegram webhook error:', err)
    return new Response('Error', { status: 500 })
  }
}
