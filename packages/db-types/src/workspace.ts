import { User, Brand } from './shared'
import { Contract, Customer, Quotation } from './crm'

export type WorkspaceTaskStatus = 'todo' | 'in_progress' | 'in_review' | 'completed' | 'cancelled'
export type WorkspaceTaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type WorkspaceTaskCategory = 'follow_up' | 'internal' | 'client_request' | 'admin'

export interface WorkspaceTask {
  id: string
  title: string
  description?: string
  status: WorkspaceTaskStatus
  priority: WorkspaceTaskPriority
  assigned_to?: string
  assigned_user?: User
  created_by?: string
  creator?: User
  project_id?: string
  project?: Project
  due_date?: string
  start_date?: string
  completed_at?: string
  labels?: string[]
  category?: WorkspaceTaskCategory
  brand: Brand
  metadata?: Record<string, any>
  comments?: TaskComment[]
  created_at: string
  updated_at: string
}

export interface TaskComment {
  id: string
  task_id: string
  task_type: 'workspace' | 'project'
  user_id?: string
  user?: User
  content: string
  attachments?: string[]
  created_at: string
  updated_at: string
}

export interface WorkspaceDayOverview {
  today_tasks: WorkspaceTask[]
  overdue_tasks: WorkspaceTask[]
  upcoming_deadlines: WorkspaceTask[]
}

export interface WorkspaceWeekOverview {
  week_tasks: WorkspaceTask[]
  milestone_deadlines: ContractMilestone[]
}

export interface WorkspaceAlert {
  id: string
  type: 'overdue_task' | 'stale_proposal' | 'unchecked_project' | 'pending_invoice' | 'missed_milestone'
  severity: 'warning' | 'danger' | 'info'
  title: string
  message: string
  link?: string
  entity_id?: string
  created_at: string
}

export interface ContractMilestone {
  id: string
  contract_id?: string
  project_id?: string
  name: string
  description?: string
  due_date: string
  amount: number
  percentage?: number
  status: 'pending' | 'completed' | 'overdue'
  completed_at?: string
  delay_reason?: string
  type?: 'work' | 'payment' | 'delivery'
  tasks?: ProjectTask[]
}

export interface ProjectTask {
  id: string
  project_id: string
  milestone_id?: string
  work_item_id?: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'completed' | 'blocked'
  priority: 'low' | 'medium' | 'high'
  start_date?: string
  end_date?: string
  assigned_to?: string
  created_at?: string
  updated_at?: string
}

export type ProjectStatus = 'todo' | 'in_progress' | 'review' | 'completed'

export interface Project {
  id: string
  contract_id?: string
  contract?: Contract
  customer_id: string
  customer?: Customer
  title: string
  description?: string
  status: ProjectStatus
  start_date?: string
  end_date?: string
  assigned_to?: string
  assigned_user?: User
  metadata?: {
    source_link?: string
    hosting_info?: string
    domain_info?: string
    ai_folder_link?: string
    quotation_number?: string
    [key: string]: any
  }
  acceptance_reports?: AcceptanceReport[]
  milestones?: ContractMilestone[]
  quotations?: Quotation[]
  contracts?: Contract[]
  brand: Brand
  password_hash?: string
  financial_password_hash?: string
  created_at: string
  updated_at: string
}

export type WorkItemStatus = 'pending' | 'in_progress' | 'delivered' | 'accepted' | 'rejected'

export interface DeliveryLink {
  label: string
  url: string
  date?: string
}

export interface RequiredDocument {
  title: string
  status: 'pending' | 'signed' | 'not_required'
  date?: string
  template_id?: string
  generated_doc_id?: string
}

export interface ProjectWorkItem {
  id: string
  project_id: string
  title: string
  description?: string
  status: WorkItemStatus
  bundle_id?: string
  quotation_id?: string
  contract_id?: string
  quotation?: Quotation
  contract?: Contract
  delivery_links: DeliveryLink[]
  required_documents: RequiredDocument[]
  accepted_at?: string
  accepted_by?: string
  rejection_reason?: string
  sort_order: number
  total_amount: number
  metadata?: Record<string, any>
  tasks?: ProjectTask[]
  created_at: string
  updated_at: string
}

export interface AcceptanceReport {
  id: string
  report_number: string
  project_id: string
  customer_id: string
  created_by: string
  content?: string
  is_signed: boolean
  signed_at?: string
  created_at: string
}
