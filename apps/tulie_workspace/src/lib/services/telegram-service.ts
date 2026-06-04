// ============================================
// Telegram Bot Service Layer
// ============================================

const TELEGRAM_API = 'https://api.telegram.org/bot'

interface TelegramSendOptions {
  parse_mode?: 'HTML' | 'MarkdownV2'
  reply_markup?: {
    inline_keyboard?: Array<Array<{ text: string; callback_data?: string; url?: string }>>
  }
}

export class TelegramService {
  private botToken: string

  constructor(botToken: string) {
    this.botToken = botToken
  }

  private async callApi(method: string, params: Record<string, any>) {
    const url = `${TELEGRAM_API}${this.botToken}/${method}`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
    const data = await res.json()
    if (!data.ok) {
      console.error(`Telegram API error [${method}]:`, data.description)
    }
    return data
  }

  async sendMessage(chatId: number, text: string, options?: TelegramSendOptions) {
    return this.callApi('sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: options?.parse_mode || 'HTML',
      reply_markup: options?.reply_markup,
    })
  }

  async setWebhook(url: string) {
    return this.callApi('setWebhook', { url })
  }

  async getMe() {
    return this.callApi('getMe', {})
  }

  // ========== Notification Builders ==========

  buildMorningBriefing(data: {
    userName: string
    sleepHours: number | null
    todayTasks: Array<{ title: string; role: string; roleIcon: string; priority: number }>
    overdueTasks: number
    habits: Array<{ name: string; icon: string; streak: number }>
  }) {
    const { userName, sleepHours, todayTasks, overdueTasks, habits } = data
    const firstName = userName.split(' ').pop() || userName

    let msg = `🌅 <b>Chào buổi sáng, ${firstName}!</b>\n`
    msg += `📅 ${new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}\n\n`

    // Sleep
    if (sleepHours) {
      const emoji = sleepHours >= 7 ? '✅' : sleepHours >= 5 ? '⚠️' : '🚨'
      msg += `😴 Giấc ngủ: ${sleepHours}h ${emoji}\n`
      if (sleepHours < 6) {
        msg += `<i>→ Thiếu ngủ! Hãy giảm bớt tasks hôm nay.</i>\n`
      }
      msg += '\n'
    }

    // Overdue alert
    if (overdueTasks > 0) {
      msg += `🚨 <b>${overdueTasks} task quá hạn</b> — cần xử lý ngay!\n\n`
    }

    // Today's tasks
    msg += `📋 <b>Tasks hôm nay (${todayTasks.length}):</b>\n`
    if (todayTasks.length === 0) {
      msg += `<i>Chưa có tasks. Hãy lên kế hoạch!</i>\n`
    } else {
      const top = todayTasks.slice(0, 5)
      top.forEach((t, i) => {
        const pri = t.priority >= 8 ? '🔴' : t.priority >= 5 ? '🟠' : '🟢'
        msg += `${i + 1}. ${pri} [${t.roleIcon}${t.role}] ${t.title}\n`
      })
      if (todayTasks.length > 5) {
        msg += `<i>... và ${todayTasks.length - 5} tasks khác</i>\n`
      }
    }

    // Habits
    if (habits.length > 0) {
      msg += `\n🎯 <b>Habits:</b>\n`
      habits.forEach(h => {
        msg += `${h.icon} ${h.name}`
        if (h.streak > 0) msg += ` 🔥${h.streak}`
        msg += '\n'
      })
    }

    msg += `\n💪 <i>Một ngày hiệu quả bắt đầu từ task đầu tiên!</i>`

    return msg
  }

  buildAfternoonUpdate(data: {
    morningCompleted: number
    morningTotal: number
    afternoonTasks: Array<{ title: string; role: string; roleIcon: string }>
    overdueTasks: number
  }) {
    const { morningCompleted, morningTotal, afternoonTasks, overdueTasks } = data

    let msg = `🌞 <b>Update buổi chiều</b>\n\n`

    // Morning recap
    const morningPercent = morningTotal > 0 ? Math.round((morningCompleted / morningTotal) * 100) : 0
    const emoji = morningPercent >= 80 ? '🔥' : morningPercent >= 50 ? '👍' : '📈'
    msg += `📊 Buổi sáng: ${morningCompleted}/${morningTotal} tasks ${emoji} (${morningPercent}%)\n\n`

    // Overdue
    if (overdueTasks > 0) {
      msg += `⚠️ <b>${overdueTasks} task quá hạn</b> — ưu tiên xử lý!\n\n`
    }

    // Afternoon tasks
    if (afternoonTasks.length > 0) {
      msg += `📋 <b>Buổi chiều:</b>\n`
      afternoonTasks.forEach((t, i) => {
        msg += `${i + 1}. [${t.roleIcon}${t.role}] ${t.title}\n`
      })
    }

    msg += `\n💡 <i>Tip: Sau 14h, focus vào tasks nhẹ hơn.</i>`

    return msg
  }

  buildEveningSummary(data: {
    todayCompleted: number
    todayTotal: number
    streak: number
    sleepHours: number | null
    exerciseDone: boolean
    topAchievement: string | null
    tomorrowTop3: Array<{ title: string; role: string }>
  }) {
    const { todayCompleted, todayTotal, streak, sleepHours, exerciseDone, topAchievement, tomorrowTop3 } = data

    let msg = `🌙 <b>Tổng kết ngày</b>\n\n`

    // Completion
    const percent = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0
    const star = percent >= 90 ? '⭐⭐⭐' : percent >= 70 ? '⭐⭐' : percent >= 50 ? '⭐' : '📈'
    msg += `✅ Hoàn thành: ${todayCompleted}/${todayTotal} tasks (${percent}%) ${star}\n`

    // Streak
    if (streak > 0) {
      msg += `🔥 Streak: ${streak} ngày liên tục!\n`
    }

    // Wellness
    msg += `\n🧘 <b>Wellness:</b>\n`
    if (sleepHours) msg += `😴 Giấc ngủ tối qua: ${sleepHours}h\n`
    msg += `🏋️ Tập luyện: ${exerciseDone ? '✅ Đã tập' : '❌ Chưa tập'}\n`

    // Top achievement
    if (topAchievement) {
      msg += `\n🏆 <b>Thành tựu:</b> ${topAchievement}\n`
    }

    // Tomorrow preview
    if (tomorrowTop3.length > 0) {
      msg += `\n📌 <b>Ngày mai:</b>\n`
      tomorrowTop3.forEach((t, i) => {
        msg += `${i + 1}. [${t.role}] ${t.title}\n`
      })
    }

    msg += `\n😴 <i>Hãy ngủ sớm trước 22h để có ngày mai tốt hơn!</i>`

    return msg
  }

  // ========== Command Handlers ==========

  parseCommand(text: string): { command: string; args: string } {
    const match = text.match(/^\/(\w+)\s*(.*)$/)
    if (!match) return { command: '', args: text }
    return { command: match[1]!, args: match[2]!.trim() }
  }

  buildHelpMessage() {
    return `📖 <b>Tulie Bot Commands:</b>

📋 <b>Tasks:</b>
/today — Xem tasks hôm nay
/done [tên task] — Hoàn thành task
/add [vai trò] [tên task] — Thêm task

🧘 <b>Wellness:</b>
/sleep [số giờ] — Log giấc ngủ
/exercise [loại] [phút] — Log tập luyện
/mood [1-10] — Log tâm trạng

📊 <b>Báo cáo:</b>
/week — Tổng kết tuần
/kpi — KPI Tulie tháng này
/fpt — Tiến độ học FPT IS

❓ /help — Xem trợ giúp`
  }
}

// Singleton instance with bot token
let serviceInstance: TelegramService | null = null

export function getTelegramService(): TelegramService {
  if (!serviceInstance) {
    const token = process.env.TELEGRAM_BOT_TOKEN
    if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not configured')
    serviceInstance = new TelegramService(token)
  }
  return serviceInstance
}
