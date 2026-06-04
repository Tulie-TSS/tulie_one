import { NextRequest, NextResponse } from 'next/server'
import { TelegramService } from '@/lib/services/telegram-service'
import { createClient } from '@supabase/supabase-js'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const schedule = req.nextUrl.searchParams.get('schedule') as 'morning' | 'afternoon' | 'evening'
  if (!schedule || !['morning', 'afternoon', 'evening'].includes(schedule)) {
    return NextResponse.json({ error: 'Invalid schedule. Use ?schedule=morning|afternoon|evening' }, { status: 400 })
  }

  try {
    const supabase = getAdminClient()
    const tg = new TelegramService(BOT_TOKEN)

    // Get all active telegram configs
    const { data: configs } = await supabase
      .from('telegram_config')
      .select('*')
      .eq('is_active', true)
      .not('telegram_chat_id', 'is', null)

    if (!configs || configs.length === 0) {
      return NextResponse.json({ message: 'No active configs', sent: 0 })
    }

    let sentCount = 0

    for (const config of configs) {
      try {
        // Check DND hours
        const now = new Date()
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
        if (currentTime >= config.dnd_start || currentTime <= config.dnd_end) {
          continue // Skip during DND
        }

        const userId = config.user_id
        const chatId = config.telegram_chat_id
        const today = new Date().toISOString().split('T')[0]

        // Get user profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('full_name')
          .eq('id', userId)
          .single()

        // Get today's plan
        const { data: plan } = await supabase
          .from('daily_plans')
          .select('*')
          .eq('user_id', userId)
          .eq('plan_date', today)
          .single()

        // Get tasks
        const { data: tasks } = await supabase
          .from('tasks')
          .select(`
            title, status, priority, life_role_id, requested_deadline,
            life_role:life_roles(display_name, icon, role)
          `)
          .eq('assigned_to', userId)
          .in('status', ['doing', 'ready', 'in_review'])
          .order('priority', { ascending: false })

        const taskList = tasks || []
        const overdueTasks = taskList.filter((t: any) => {
          if (!t.requested_deadline) return false
          return new Date(t.requested_deadline) < now && t.status !== 'done'
        })

        // Get habits
        const { data: habits } = await supabase
          .from('habits')
          .select('name, icon, streak_current')
          .eq('user_id', userId)
          .eq('is_active', true)

        let message = ''

        switch (schedule) {
          case 'morning':
            message = tg.buildMorningBriefing({
              userName: profile?.full_name || 'bạn',
              sleepHours: plan?.sleep_hours || null,
              todayTasks: taskList.map((t: any) => ({
                title: t.title,
                role: t.life_role?.display_name || '',
                roleIcon: t.life_role?.icon || '',
                priority: t.priority,
              })),
              overdueTasks: overdueTasks.length,
              habits: (habits || []).map(h => ({
                name: h.name,
                icon: h.icon,
                streak: h.streak_current,
              })),
            })
            break

          case 'afternoon':
            // Count morning completed (tasks done today before 13:00)
            const { count: morningDone } = await supabase
              .from('tasks')
              .select('id', { count: 'exact', head: true })
              .eq('assigned_to', userId)
              .eq('status', 'done')
              .gte('actual_end', `${today}T00:00:00`)
              .lte('actual_end', `${today}T12:59:59`)

            message = tg.buildAfternoonUpdate({
              morningCompleted: morningDone || 0,
              morningTotal: Math.ceil(taskList.length / 2),
              afternoonTasks: taskList.slice(0, 5).map((t: any) => ({
                title: t.title,
                role: t.life_role?.display_name || '',
                roleIcon: t.life_role?.icon || '',
              })),
              overdueTasks: overdueTasks.length,
            })
            break

          case 'evening':
            const { count: todayDone } = await supabase
              .from('tasks')
              .select('id', { count: 'exact', head: true })
              .eq('assigned_to', userId)
              .eq('status', 'done')
              .gte('actual_end', `${today}T00:00:00`)

            message = tg.buildEveningSummary({
              todayCompleted: todayDone || 0,
              todayTotal: taskList.length + (todayDone || 0),
              streak: 0, // TODO: calculate daily streak
              sleepHours: plan?.sleep_hours || null,
              exerciseDone: plan?.exercise_done || false,
              topAchievement: null,
              tomorrowTop3: taskList.slice(0, 3).map((t: any) => ({
                title: t.title,
                role: t.life_role?.display_name || '',
              })),
            })
            break
        }

        if (message && chatId) {
          await tg.sendMessage(chatId, message)

          // Log the notification
          await supabase.from('telegram_messages').insert({
            user_id: userId,
            direction: 'outgoing',
            message_text: message,
            message_type: 'notification',
            notification_schedule: schedule,
          })

          sentCount++
        }
      } catch (err) {
        console.error(`Failed to send ${schedule} notification to user ${config.user_id}:`, err)
      }
    }

    return NextResponse.json({
      message: `${schedule} notifications sent`,
      sent: sentCount,
      total: configs.length,
    })
  } catch (error) {
    console.error('Notification error:', error)
    return NextResponse.json({ error: 'Failed to send notifications' }, { status: 500 })
  }
}
