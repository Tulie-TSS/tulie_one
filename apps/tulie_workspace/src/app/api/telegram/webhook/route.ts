import { NextRequest, NextResponse } from 'next/server'
import { TelegramService } from '@/lib/services/telegram-service'
import { createClient } from '@supabase/supabase-js'

// Supabase admin client for server-side operations
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const message = body.message || body.callback_query?.message

    if (!message?.text && !body.callback_query?.data) {
      return NextResponse.json({ ok: true })
    }

    const chatId = message?.chat?.id
    const text = message?.text || ''
    const username = message?.from?.username || ''

    if (!chatId) return NextResponse.json({ ok: true })

    const tg = new TelegramService(BOT_TOKEN)
    const supabase = getAdminClient()

    // Pre-fetch telegram config to see if user is linked
    const { data: configData } = await supabase
      .from('telegram_config')
      .select('*')
      .eq('telegram_chat_id', chatId)
    const config = configData && configData.length > 0 ? configData[0] : null

    // Parse command
    const { command, args } = tg.parseCommand(text)

    switch (command) {
      case 'start': {
        // Link Telegram to user account
        // For now, auto-create or update config
        if (!config) {
          // Try to find user by checking if any config exists without chat_id
          const { data: configs } = await supabase
            .from('telegram_config')
            .select('*')
            .is('telegram_chat_id', null)
            .limit(1)

          if (configs && configs.length > 0) {
            await supabase
              .from('telegram_config')
              .update({ telegram_chat_id: chatId, telegram_username: username })
              .eq('id', configs[0]!.id)
          }
        }

        await tg.sendMessage(chatId, `🚀 <b>Chào mừng đến Tulie Workspace Bot!</b>\n\nBot đã được kết nối. Bạn sẽ nhận thông báo:\n• 🌅 07:00 — Bản tin sáng\n• 🌞 13:00 — Update chiều\n• 🌙 21:30 — Tổng kết ngày\n\nGõ /help để xem danh sách lệnh.`)
        break
      }

      case 'help': {
        await tg.sendMessage(chatId, tg.buildHelpMessage())
        break
      }

      case 'today': {
        if (!config) {
          await tg.sendMessage(chatId, '❌ Chưa liên kết tài khoản. Vào Settings trên web để thiết lập.')
          break
        }

        // Get today's tasks
        const { data: tasks } = await supabase
          .from('tasks')
          .select(`
            id, title, status, priority, life_role_id,
            life_role:life_roles(display_name, icon)
          `)
          .eq('assigned_to', config.user_id)
          .in('status', ['doing', 'ready', 'in_review'])
          .order('priority', { ascending: false })

        if (!tasks || tasks.length === 0) {
          await tg.sendMessage(chatId, '✅ Không có task nào đang active. Nghỉ ngơi thôi! 🎉')
          break
        }

        let msg = `📋 <b>Tasks hôm nay (${tasks.length}):</b>\n\n`
        tasks.forEach((t: any, i: number) => {
          const status = t.status === 'doing' ? '🔵' : t.status === 'ready' ? '⚪' : '🟡'
          const role = t.life_role ? `[${t.life_role.icon}${t.life_role.display_name}]` : ''
          msg += `${status} ${i + 1}. ${role} ${t.title}\n`
        })
        msg += `\n💡 Gõ <code>/done [số]</code> để hoàn thành (VD: /done 1)\nHoặc <code>/done [tên task]</code>`

        await tg.sendMessage(chatId, msg)
        break
      }

      case 'done': {
        if (!config) {
          await tg.sendMessage(chatId, '❌ Chưa liên kết tài khoản.')
          break
        }

        if (!args) {
          await tg.sendMessage(chatId, '❌ Nhập số thứ tự hoặc tên task cần hoàn thành. VD: /done 1 hoặc /done Học nghị định')
          break
        }

        // Get active tasks
        const { data: tasks } = await supabase
          .from('tasks')
          .select(`
            id, title, status, priority
          `)
          .eq('assigned_to', config.user_id)
          .in('status', ['doing', 'ready', 'in_review'])
          .order('priority', { ascending: false })

        if (!tasks || tasks.length === 0) {
          await tg.sendMessage(chatId, '❌ Bạn không có task nào đang active.')
          break
        }

        let targetTask: any = null
        const taskIndex = parseInt(args) - 1

        if (!isNaN(taskIndex) && taskIndex >= 0 && taskIndex < tasks.length) {
          targetTask = tasks[taskIndex]
        } else {
          // Search by name
          targetTask = tasks.find(t => t.title.toLowerCase().includes(args.toLowerCase()))
        }

        if (!targetTask) {
          await tg.sendMessage(chatId, `❌ Không tìm thấy task nào khớp với "${args}".`)
          break
        }

        // Update task to done
        const now = new Date().toISOString()
        await supabase
          .from('tasks')
          .update({
            status: 'done',
            actual_end: now,
            updated_at: now
          })
          .eq('id', targetTask.id)

        await tg.sendMessage(chatId, `✅ Đã hoàn thành: <b>${targetTask.title}</b>! Lập kế hoạch tốt, hành động tốt! 🎉`)
        break
      }

      case 'add': {
        if (!config) {
          await tg.sendMessage(chatId, '❌ Chưa liên kết tài khoản.')
          break
        }

        const spaceIndex = args.indexOf(' ')
        if (spaceIndex === -1) {
          await tg.sendMessage(chatId, '❌ Cú pháp đúng: <code>/add [fpt|tulie|personal] [tên công việc]</code>\nVí dụ: <code>/add fpt Đọc tài liệu quy trình</code>')
          break
        }

        const roleTag = args.substring(0, spaceIndex).toLowerCase()
        const taskTitle = args.substring(spaceIndex + 1).trim()

        if (!taskTitle) {
          await tg.sendMessage(chatId, '❌ Vui lòng nhập tên công việc.')
          break
        }

        // Map tag to role enum
        let roleEnum: 'fpt_is' | 'tulie' | 'personal' = 'personal'
        if (roleTag === 'fpt' || roleTag === 'fpt_is') roleEnum = 'fpt_is'
        else if (roleTag === 'tulie') roleEnum = 'tulie'

        // Get user's life role
        const { data: role } = await supabase
          .from('life_roles')
          .select('id, display_name, icon')
          .eq('user_id', config.user_id)
          .eq('role', roleEnum)
          .single()

        if (!role) {
          await tg.sendMessage(chatId, '❌ Không tìm thấy vai trò phù hợp trong cơ sở dữ liệu.')
          break
        }

        const now = new Date().toISOString()
        await supabase
          .from('tasks')
          .insert({
            title: taskTitle,
            assigned_to: config.user_id,
            created_by: config.user_id,
            status: 'ready',
            priority: 5,
            life_role_id: role.id,
            created_at: now,
            updated_at: now
          })

        await tg.sendMessage(chatId, `➕ Đã thêm [${role.icon} ${role.display_name}]: <b>${taskTitle}</b> vào danh sách chờ xử lý!`)
        break
      }

      case 'kpi': {
        if (!config) {
          await tg.sendMessage(chatId, '❌ Chưa liên kết tài khoản.')
          break
        }

        const today = new Date()
        const currentMonth = today.toISOString().substring(0, 7) + '-01'
        const monthLabel = today.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })

        const { data: kpi } = await supabase
          .from('business_kpis')
          .select('*')
          .eq('user_id', config.user_id)
          .eq('kpi_month', currentMonth)
          .single()

        if (!kpi) {
          await tg.sendMessage(chatId, `📊 Chưa có dữ liệu KPI của Tulie cho ${monthLabel}. Hãy cập nhật trên Web App!`)
          break
        }

        const formatVND = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)

        const totalRevenue = Number(kpi.photo_id_revenue || 0) + 
                             Number(kpi.design_print_revenue || 0) + 
                             Number(kpi.website_revenue || 0) + 
                             Number(kpi.n8n_workflow_revenue || 0)

        const netProfit = totalRevenue - Number(kpi.contractor_costs || 0) - Number(kpi.operating_costs || 0)

        let msg = `📊 <b>KPI Doanh thu Tulie — ${monthLabel}</b>\n\n`
        msg += `📸 <b>Ảnh thẻ:</b> ${kpi.photo_id_orders} đơn — <code>${formatVND(kpi.photo_id_revenue)}</code>\n`
        msg += `🎨 <b>Thiết kế/In ấn:</b> ${kpi.design_print_orders} đơn — <code>${formatVND(kpi.design_print_revenue)}</code>\n`
        msg += `🌐 <b>Website/Landing:</b> ${kpi.website_orders} đơn — <code>${formatVND(kpi.website_revenue)}</code>\n`
        msg += `⚙️ <b>n8n Workflow:</b> ${kpi.n8n_workflow_orders} đơn — <code>${formatVND(kpi.n8n_workflow_revenue)}</code>\n`
        msg += `───────────────────\n`
        msg += `💰 <b>Tổng Doanh thu:</b> <code>${formatVND(totalRevenue)}</code>\n`
        msg += `🧑‍💻 <b>Chi phí thuê khoán:</b> <code>${formatVND(kpi.contractor_costs)}</code>\n`
        msg += `🏢 <b>Chi phí vận hành:</b> <code>${formatVND(kpi.operating_costs)}</code>\n`
        msg += `💸 <b>Lợi nhuận ròng:</b> <b>${formatVND(netProfit)}</b>\n\n`
        msg += `💼 <i>Mô hình thuê khoán tự vận hành đang hoạt động ổn định!</i>`

        await tg.sendMessage(chatId, msg)
        break
      }

      case 'fpt': {
        if (!config) {
          await tg.sendMessage(chatId, '❌ Chưa liên kết tài khoản.')
          break
        }

        const { data: goals } = await supabase
          .from('fpt_learning_goals')
          .select('*')
          .eq('user_id', config.user_id)
          .order('category')

        if (!goals || goals.length === 0) {
          await tg.sendMessage(chatId, '🏢 <b>FPT IS learning:</b> Chưa có mục tiêu học tập nào được thiết lập.')
          break
        }

        const categoriesMap: Record<string, string> = {
          nghi_dinh: '📜 Nghị định',
          nghi_quyet: '📄 Nghị quyết',
          san_pham: '📦 Sản phẩm',
          quy_trinh: '⚙️ Quy trình',
          skill: '🧠 Kỹ năng'
        }

        // Group by category
        const groups: Record<string, typeof goals> = {}
        goals.forEach(g => {
          if (!groups[g.category]) groups[g.category] = []
          groups[g.category]!.push(g)
        })

        let msg = `🏢 <b>Tiến độ học tập tại FPT IS:</b>\n\n`
        Object.entries(groups).forEach(([category, catGoals]) => {
          const avgProgress = Math.round(catGoals.reduce((acc, curr) => acc + curr.progress_percent, 0) / catGoals.length)
          const barLength = Math.round(avgProgress / 10)
          const bar = '🟢'.repeat(barLength) + '⚪'.repeat(10 - barLength)
          
          msg += `<b>${categoriesMap[category] || category}</b>: ${avgProgress}%\n`
          msg += `[${bar}]\n`
          
          const active = catGoals.filter(g => g.progress_percent < 100).slice(0, 2)
          active.forEach(g => {
            msg += `• <i>${g.title} (${g.progress_percent}%)</i>\n`
          })
          msg += '\n'
        })

        msg += `🎯 <i>Hoàn thành báo cáo thu hoạch để hướng tới vị trí Solution Consultant chính thức!</i>`
        await tg.sendMessage(chatId, msg)
        break
      }

      case 'week': {
        if (!config) {
          await tg.sendMessage(chatId, '❌ Chưa liên kết tài khoản.')
          break
        }

        // Get tasks completed in the last 7 days
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        const dateStr = sevenDaysAgo.toISOString().split('T')[0]

        const { data: completedTasks } = await supabase
          .from('tasks')
          .select('title, life_role:life_roles(display_name, icon)')
          .eq('assigned_to', config.user_id)
          .eq('status', 'done')
          .gte('actual_end', dateStr)

        // Get wellness averages
        const { data: plans } = await supabase
          .from('daily_plans')
          .select('sleep_hours, exercise_done, mood_score')
          .eq('user_id', config.user_id)
          .gte('plan_date', dateStr)

        const totalCompleted = completedTasks?.length || 0
        const plansList = plans || []
        const sleepPlans = plansList.filter(p => p.sleep_hours !== null)
        const avgSleep = sleepPlans.length > 0 ? (sleepPlans.reduce((acc, curr) => acc + Number(curr.sleep_hours), 0) / sleepPlans.length).toFixed(1) : 'N/A'
        const workouts = plansList.filter(p => p.exercise_done).length
        const moodPlans = plansList.filter(p => p.mood_score !== null)
        const avgMood = moodPlans.length > 0 ? (moodPlans.reduce((acc, curr) => acc + Number(curr.mood_score), 0) / moodPlans.length).toFixed(1) : 'N/A'

        let msg = `📅 <b>Tổng kết hiệu suất tuần (7 ngày qua):</b>\n\n`
        msg += `✅ <b>Công việc hoàn thành:</b> ${totalCompleted} tasks\n`
        if (completedTasks && completedTasks.length > 0) {
          completedTasks.slice(0, 3).forEach(t => {
            const role = t.life_role ? `[${(t.life_role as any).icon}${(t.life_role as any).display_name}] ` : ''
            msg += `• <i>${role}${t.title}</i>\n`
          })
        }
        
        msg += `\n🧘 <b>Wellness & Habits:</b>\n`
        msg += `😴 <b>Ngủ trung bình:</b> ${avgSleep}h / đêm\n`
        msg += `🏋️ <b>Tập luyện:</b> ${workouts} buổi tập\n`
        msg += `😊 <b>Tâm trạng trung bình:</b> ${avgMood}/10\n\n`
        msg += `🔥 <i>Duy trì nhịp sống cân bằng, bám sát các mục tiêu cá nhân!</i>`

        await tg.sendMessage(chatId, msg)
        break
      }

      case 'sleep': {
        const hours = parseFloat(args)
        if (isNaN(hours) || hours <= 0 || hours > 24) {
          await tg.sendMessage(chatId, '❌ Nhập số giờ ngủ. VD: /sleep 7.5')
          break
        }

        if (!config) {
          await tg.sendMessage(chatId, '❌ Chưa liên kết tài khoản.')
          break
        }

        const today = new Date().toISOString().split('T')[0]
        const quality = hours >= 7 ? 4 : hours >= 5 ? 3 : 2

        await supabase
          .from('daily_plans')
          .upsert(
            { user_id: config.user_id, plan_date: today, sleep_hours: hours, sleep_quality: quality },
            { onConflict: 'user_id,plan_date' }
          )

        const emoji = hours >= 7 ? '✅' : hours >= 5 ? '⚠️' : '🚨'
        await tg.sendMessage(chatId, `😴 Đã ghi: ${hours}h ${emoji}\n${hours < 6 ? '→ Thiếu ngủ! Hãy giảm workload hôm nay.' : 'Tốt!'}`)
        break
      }

      case 'exercise': {
        const parts = args.split(' ')
        const type = parts[0] || 'workout'
        const minutes = parseInt(parts[1] || '30')

        if (!config) {
          await tg.sendMessage(chatId, '❌ Chưa liên kết tài khoản.')
          break
        }

        const today = new Date().toISOString().split('T')[0]
        await supabase
          .from('daily_plans')
          .upsert(
            { user_id: config.user_id, plan_date: today, exercise_done: true, exercise_type: type, exercise_minutes: minutes },
            { onConflict: 'user_id,plan_date' }
          )

        await tg.sendMessage(chatId, `🏋️ Đã ghi: ${type} ${minutes} phút ✅\nGiữ vững nhịp tập nhé! 💪`)
        break
      }

      case 'mood': {
        const score = parseInt(args)
        if (isNaN(score) || score < 1 || score > 10) {
          await tg.sendMessage(chatId, '❌ Nhập điểm từ 1-10. VD: /mood 7')
          break
        }

        if (!config) {
          await tg.sendMessage(chatId, '❌ Chưa liên kết tài khoản.')
          break
        }

        const today = new Date().toISOString().split('T')[0]
        await supabase
          .from('daily_plans')
          .upsert(
            { user_id: config.user_id, plan_date: today, mood_score: score },
            { onConflict: 'user_id,plan_date' }
          )

        const emojis = ['😫', '😞', '😐', '🙂', '😊', '😄', '🤩', '💪', '🔥', '⭐']
        await tg.sendMessage(chatId, `${emojis[score - 1]} Tâm trạng: ${score}/10 — Đã ghi!`)
        break
      }

      case 'ai': {
        if (!args) {
          await tg.sendMessage(chatId, '❓ Bạn cần đặt câu hỏi cho AI. VD: /ai Tôi nên phân chia thời gian hôm nay thế nào?')
          break
        }
        await handleAIChat(chatId, text, config?.user_id || null)
        break
      }

      default: {
        if (text && !text.startsWith('/')) {
          if (config) {
            await supabase.from('telegram_messages').insert({
              user_id: config.user_id,
              direction: 'incoming',
              message_text: text,
              message_type: 'text',
            })

            // Respond with AI
            await handleAIChat(chatId, text, config.user_id)
          } else {
            await tg.sendMessage(chatId, `Gõ /help để xem danh sách lệnh. 📖`)
          }
        }
      }
    }

    // Log command messages
    if (config && command && command !== 'ai') {
      await supabase.from('telegram_messages').insert({
        user_id: config.user_id,
        direction: 'incoming',
        message_text: text,
        message_type: 'command',
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Telegram webhook error:', error)
    return NextResponse.json({ ok: true }) // Always return 200 to Telegram
  }
}

// Helper function to call Gemini API and reply
async function handleAIChat(chatId: number, userPrompt: string, userId: string | null) {
  const tg = new TelegramService(BOT_TOKEN)
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
  
  if (!apiKey) {
    await tg.sendMessage(chatId, '🤖 <i>Hệ thống AI hiện chưa được cấu hình khóa API (GEMINI_API_KEY). Vui lòng cấu hình trên máy chủ.</i>')
    return
  }

  // Show typing status
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendChatAction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, action: 'typing' })
  }).catch(() => {})

  try {
    let contextPrompt = `Bạn là Trợ lý Workspace AI thông minh của anh Tùng Nguyễn.
Anh Tùng có các vai trò chính:
1. Intern tại FPT IS: đang học các nghị định, nghị quyết, sản phẩm và quy trình để chuẩn bị lên vị trí Solution Consultant / Pre-sales chính thức.
2. CEO của Tulie Business: mô hình thuê khoán, không tuyển fulltime, chủ yếu thiết kế in ấn, làm ảnh thẻ, website/landing page, và cài đặt n8n workflow tự động hóa cho khách hàng.
3. Cuộc sống cá nhân: học ngoại ngữ (tiếng Anh), tập thể dục thể thao nâng cao sức khỏe, viết nhật ký, chơi và học với con nhỏ.

Hãy trả lời thật ngắn gọn, cụ thể, thực tế, truyền cảm hứng. Luôn phản hồi bằng tiếng Việt thân mật, lịch sự.
Dưới đây là tin nhắn của anh ấy:
"${userPrompt}"`

    // Fetch user context if available (today's workload, sleep, habits)
    if (userId) {
      const supabase = getAdminClient()
      const today = new Date().toISOString().split('T')[0]

      const { data: tasks } = await supabase
        .from('tasks')
        .select('title, status, life_role:life_roles(display_name)')
        .eq('assigned_to', userId)
        .in('status', ['doing', 'ready'])
        .limit(5)

      const { data: plan } = await supabase
        .from('daily_plans')
        .select('sleep_hours, exercise_done')
        .eq('user_id', userId)
        .eq('plan_date', today)
        .single()

      if (tasks && tasks.length > 0) {
        contextPrompt += `\n\nBối cảnh hôm nay:\n- Công việc chưa hoàn thành: ${tasks.map((t: any) => `[${t.life_role?.display_name}] ${t.title}`).join(', ')}`
      }
      if (plan) {
        contextPrompt += `\n- Giấc ngủ tối qua: ${plan.sleep_hours ? `${plan.sleep_hours}h` : 'chưa log'}, Tập luyện: ${plan.exercise_done ? 'Đã tập' : 'Chưa tập'}`
      }
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: contextPrompt }] }],
        generationConfig: { maxOutputTokens: 800, temperature: 0.7 }
      })
    })

    const data = await response.json()
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || '🤖 <i>Tôi đang gặp chút vấn đề khi xử lý câu hỏi này. Bạn hãy thử lại sau nhé!</i>'
    
    await tg.sendMessage(chatId, replyText)

    if (userId) {
      const supabase = getAdminClient()
      await supabase.from('telegram_messages').insert({
        user_id: userId,
        direction: 'outgoing',
        message_text: replyText,
        message_type: 'ai_response',
      })
    }
  } catch (err) {
    console.error('Gemini call failed:', err)
    await tg.sendMessage(chatId, '🤖 <i>Không thể kết nối với trí tuệ nhân tạo lúc này.</i>')
  }
}

// Verify webhook is active
export async function GET() {
  return NextResponse.json({ status: 'Telegram webhook active', timestamp: new Date().toISOString() })
}
