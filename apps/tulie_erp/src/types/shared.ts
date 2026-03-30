export type Brand = 'agency' | 'studio' | 'academy'

export type UserRole =
  | 'ceo' | 'creative_director' | 'account_manager' | 'account_executive'
  | 'project_manager' | 'designer' | 'copywriter' | 'social_media'
  | 'media_buyer' | 'photographer' | 'video_editor' | 'accountant'
  | 'hr_admin' | 'intern' | 'admin' | 'leader' | 'staff' | 'partner'

export type UserDepartment = 'management' | 'creative' | 'sales' | 'marketing' | 'studio' | 'finance' | 'admin' | 'operations'

export interface User {
  id: string
  email: string
  full_name: string
  phone?: string
  avatar_url?: string
  role: UserRole
  department?: UserDepartment
  team_id?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Team {
  id: string
  name: string
  leader_id: string
  created_at: string
}

export type NotificationType =
  | 'new_customer' | 'quotation_sent' | 'quotation_accepted' | 'quotation_viewed'
  | 'quotation_rejected' | 'invoice_overdue' | 'contract_signed' | 'payment_received'
  | 'deal_won' | 'deal_lost' | 'task_assigned' | 'task_overdue' | 'task_completed'
  | 'low_margin' | 'cash_flow_alert' | 'workspace' | 'system'

export type NotificationSeverity = 'info' | 'success' | 'warning' | 'error'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  link?: string
  read: boolean
  severity?: NotificationSeverity
  metadata?: Record<string, any>
  source?: 'crm' | 'workspace'
  created_at: string
}

export interface AlertItem {
  id: string
  type: 'inactive_customer' | 'overdue_invoice' | 'contract_expiry' | 'low_margin'
  title: string
  message: string
  severity: 'warning' | 'danger' | 'info'
  link: string
}

export interface Alert {
  id: string
  type: 'warning' | 'danger' | 'info'
  title: string
  message: string
  link?: string
  created_at: string
}

export interface PaginationParams {
  page: number
  limit: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  total_pages: number
}

export interface TelegramConfig {
  bot_token: string
  chat_id: string
  is_enabled: boolean
  notify_new_retail_order?: boolean
  notify_retail_payment?: boolean
  notify_quotation_viewed?: boolean
  notify_quotation_accepted?: boolean
  notify_new_quotation?: boolean
  notify_new_invoice?: boolean
  notify_b2b_payment?: boolean
  notify_unmatched_payment?: boolean
  [key: string]: any
}

export interface SystemSettings {
  telegram_config: TelegramConfig
  [key: string]: any
}

export interface ActivityLog {
  id: string
  user_id: string
  user?: User
  entity_type: 'customer' | 'quotation' | 'contract' | 'invoice' | 'product' | 'expense'
  entity_id: string
  action: 'create' | 'update' | 'delete' | 'status_change' | 'view' | 'login' | 'export' | 'bulk_delete'
  details?: Record<string, any>
  metadata?: Record<string, unknown>
  created_at: string
}
