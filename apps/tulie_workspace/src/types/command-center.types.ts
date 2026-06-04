// ============================================
// Personal Command Center — TypeScript Types
// ============================================

// Enums
export type LifeRoleType = 'fpt_is' | 'tulie' | 'personal'
export type EnergyLevel = 'high' | 'medium' | 'low' | 'exhausted'
export type TimeBlockType = 'deep_work' | 'meeting' | 'admin' | 'learning' | 'exercise' | 'family' | 'rest'
export type FptCategory = 'nghi_dinh' | 'nghi_quyet' | 'san_pham' | 'quy_trinh' | 'skill'

// Life Role
export interface LifeRole {
  id: string
  user_id: string
  role: LifeRoleType
  display_name: string
  color: string
  icon: string
  daily_time_budget_minutes: number
  priority_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// Daily Plan
export interface DailyPlan {
  id: string
  user_id: string
  plan_date: string
  morning_energy: EnergyLevel
  sleep_hours: number | null
  sleep_quality: number | null
  exercise_done: boolean
  exercise_minutes: number
  exercise_type: string | null
  mood_score: number | null
  notes: string | null
  total_tasks_planned: number
  total_tasks_completed: number
  completion_rate: number
  created_at: string
  updated_at: string
}

// Time Block
export interface TimeBlock {
  id: string
  user_id: string
  daily_plan_id: string | null
  block_type: TimeBlockType
  life_role_id: string | null
  start_time: string
  end_time: string
  title: string | null
  task_id: string | null
  is_completed: boolean
  actual_start: string | null
  actual_end: string | null
  notes: string | null
  created_at: string
  // Joined
  life_role?: LifeRole
}

// Habit
export interface Habit {
  id: string
  user_id: string
  name: string
  description: string | null
  life_role_id: string | null
  frequency: string
  target_minutes: number | null
  target_count: number | null
  icon: string
  color: string
  streak_current: number
  streak_best: number
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
  // Joined
  life_role?: LifeRole
  today_log?: HabitLog | null
}

// Habit Log
export interface HabitLog {
  id: string
  habit_id: string
  log_date: string
  completed: boolean
  value: number | null
  notes: string | null
  created_at: string
}

// Telegram Config
export interface TelegramConfig {
  id: string
  user_id: string
  telegram_chat_id: number | null
  telegram_username: string | null
  bot_token: string | null
  morning_notification_time: string
  afternoon_notification_time: string
  evening_notification_time: string
  dnd_start: string
  dnd_end: string
  ai_enabled: boolean
  ai_model: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// Telegram Message
export interface TelegramMessage {
  id: string
  user_id: string
  direction: 'incoming' | 'outgoing'
  message_text: string
  message_type: string
  notification_schedule: 'morning' | 'afternoon' | 'evening' | null
  telegram_message_id: number | null
  created_at: string
}

// Business KPI
export interface BusinessKpi {
  id: string
  user_id: string
  kpi_month: string
  photo_id_orders: number
  photo_id_revenue: number
  design_print_orders: number
  design_print_revenue: number
  website_orders: number
  website_revenue: number
  n8n_workflow_orders: number
  n8n_workflow_revenue: number
  contractor_costs: number
  operating_costs: number
  notes: string | null
  created_at: string
  updated_at: string
  // Computed
  total_revenue?: number
  total_orders?: number
  net_profit?: number
}

// FPT Learning Goal
export interface FptLearningGoal {
  id: string
  user_id: string
  category: FptCategory
  title: string
  description: string | null
  source_document: string | null
  progress_percent: number
  target_date: string | null
  completed_at: string | null
  notes: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

// ========== Utility Types ==========

// Role config for UI
export interface LifeRoleConfig {
  role: LifeRoleType
  display_name: string
  color: string
  bgColor: string
  icon: string
  schedule: {
    start: string
    end: string
  }
}

// Today's summary
export interface TodaySummary {
  plan: DailyPlan | null
  tasksByRole: Record<LifeRoleType, number>
  completedByRole: Record<LifeRoleType, number>
  totalTasks: number
  totalCompleted: number
  overdueTasks: number
  workloadPercent: number
  alerts: SmartAlert[]
}

// Smart Alert
export interface SmartAlert {
  id: string
  type: 'overdue' | 'sleep_warning' | 'streak' | 'kpi' | 'burnout' | 'wellness' | 'fpt'
  severity: 'critical' | 'warning' | 'info' | 'success'
  title: string
  message: string
  icon: string
  action?: {
    label: string
    href: string
  }
}

// FPT Category labels
export const FPT_CATEGORY_LABELS: Record<FptCategory, { vi: string; en: string }> = {
  nghi_dinh: { vi: 'Nghị định', en: 'Decree' },
  nghi_quyet: { vi: 'Nghị quyết', en: 'Resolution' },
  san_pham: { vi: 'Sản phẩm', en: 'Product' },
  quy_trinh: { vi: 'Quy trình', en: 'Process' },
  skill: { vi: 'Kỹ năng', en: 'Skill' },
}

// Default role configs
export const DEFAULT_LIFE_ROLES: LifeRoleConfig[] = [
  {
    role: 'fpt_is',
    display_name: 'FPT IS',
    color: '#E53935',
    bgColor: '#FFF5F5',
    icon: '🏢',
    schedule: { start: '08:30', end: '17:30' },
  },
  {
    role: 'tulie',
    display_name: 'Tulie',
    color: '#1E88E5',
    bgColor: '#F0F7FF',
    icon: '🚀',
    schedule: { start: '18:00', end: '21:00' },
  },
  {
    role: 'personal',
    display_name: 'Cá nhân',
    color: '#43A047',
    bgColor: '#F0FFF0',
    icon: '🏠',
    schedule: { start: '06:00', end: '22:00' },
  },
]
