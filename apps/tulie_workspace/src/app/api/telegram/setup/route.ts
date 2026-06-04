import { NextRequest, NextResponse } from 'next/server'
import { TelegramService } from '@/lib/services/telegram-service'
import { createClient } from '@supabase/supabase-js'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// POST: Setup webhook + initialize telegram config for user
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, userId } = body

    if (action === 'setup-webhook') {
      const tg = new TelegramService(BOT_TOKEN)
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://workspace.tulie.vn'
      const webhookUrl = `${appUrl}/api/telegram/webhook`

      const result = await tg.setWebhook(webhookUrl)
      return NextResponse.json({ success: result.ok, webhook_url: webhookUrl })
    }

    if (action === 'init-config' && userId) {
      const supabase = getAdminClient()

      // Check if config exists
      const { data: existing } = await supabase
        .from('telegram_config')
        .select('id')
        .eq('user_id', userId)
        .single()

      if (!existing) {
        await supabase.from('telegram_config').insert({
          user_id: userId,
          bot_token: BOT_TOKEN,
        })
      }

      return NextResponse.json({ success: true, message: 'Config initialized. Tell user to open Telegram and start the bot.' })
    }

    if (action === 'test-message') {
      const { chatId, message } = body
      if (!chatId) {
        return NextResponse.json({ error: 'chatId required' }, { status: 400 })
      }

      const tg = new TelegramService(BOT_TOKEN)
      const result = await tg.sendMessage(chatId, message || '🧪 Test message from Tulie Workspace!')
      return NextResponse.json({ success: result.ok })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error) {
    console.error('Telegram setup error:', error)
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 })
  }
}

// GET: Check bot status
export async function GET() {
  try {
    const tg = new TelegramService(BOT_TOKEN)
    const me = await tg.getMe()

    return NextResponse.json({
      bot: me.result,
      token_configured: !!BOT_TOKEN,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Bot not configured', token_configured: !!BOT_TOKEN }, { status: 500 })
  }
}
