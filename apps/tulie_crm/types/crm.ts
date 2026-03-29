import { User, Brand } from './shared'
import { Invoice, Payment } from './erp'
import { ContractMilestone, ProjectTask, Project, AcceptanceReport, ProjectWorkItem, RequiredDocument, DeliveryLink, WorkItemStatus } from './workspace'

export type CustomerStatus = 'lead' | 'prospect' | 'customer' | 'vip' | 'churned'

export interface Customer {
  id: string
  company_name: string
  tax_code?: string
  email?: string
  phone?: string
  address?: string
  invoice_address?: string
  industry?: string
  company_size?: string
  website?: string
  representative?: string
  representative_title?: string
  position?: string
  abbreviation?: string
  customer_type: 'individual' | 'business'
  is_info_unlocked: boolean
  status: CustomerStatus
  assigned_to: string
  assigned_user?: User
  last_contact_at?: string
  tags?: string[]
  notes?: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface Contact {
  id: string
  customer_id: string
  name: string
  position?: string
  email?: string
  phone?: string
  is_primary: boolean
  birthday?: string
  created_at: string
}

export interface CustomerNote {
  id: string
  customer_id: string
  user_id: string
  user?: User
  content: string
  type: 'note' | 'call' | 'email' | 'meeting'
  created_at: string
}

export type DealStatus = 'new' | 'briefing' | 'proposal_sent' | 'closed_won' | 'closed_lost'
export type DealPriority = 'low' | 'medium' | 'high'

export interface Deal {
  id: string
  title: string
  description?: string
  customer_id: string
  customer?: Customer
  budget?: number
  status: DealStatus
  priority: DealPriority
  assigned_to?: string
  assigned_user?: User
  created_by: string
  creator?: User
  quotations?: Quotation[]
  brand: Brand
  created_at: string
  updated_at: string
}

export type QuotationStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired' | 'converted'
export type QuotationType = 'standard' | 'proposal'

export interface Quotation {
  id: string
  quotation_number: string
  customer_id: string
  customer?: Customer
  created_by: string
  creator?: User
  status: QuotationStatus
  type: QuotationType
  proposal_content?: any

  title?: string
  description?: string
  terms?: string
  notes?: string
  subtotal: number
  discount_percent?: number
  discount_amount?: number
  vat_percent: number
  vat_amount: number
  total_amount: number
  valid_until: string
  public_token: string
  password_hash?: string
  financial_password_hash?: string
  viewed_at?: string
  view_count: number
  accepted_at?: string
  rejected_at?: string
  confirmer_info?: {
    name: string
    phone: string
    email: string
    position?: string
  }
  deal_id?: string
  project_id?: string
  deal?: Deal
  project?: Project
  items?: QuotationItem[]
  bank_name?: string
  bank_account_no?: string
  bank_account_name?: string
  bank_branch?: string
  brand: Brand
  created_at: string
  updated_at: string
}

export interface QuotationItem {
  id: string
  quotation_id?: string
  product_id?: string | null
  product_name: string
  description?: string
  quantity: number
  unit: string
  unit_price: number
  cost_price?: number
  discount?: number
  vat_percent?: number
  total_price: number
  sort_order: number 
  section_name?: string | null 
  is_optional?: boolean
  alternative_group?: string | null
}

export interface CustomerSnapshot {
  company_name: string
  tax_code?: string
  email?: string
  phone?: string
  address?: string
  invoice_address?: string
  representative?: string
  representative_title?: string
  position?: string
}

export type ContractStatus = 'draft' | 'sent' | 'viewed' | 'signed' | 'active' | 'completed' | 'cancelled' | 'suspended'

export interface Contract {
  id: string
  contract_number: string
  customer_id: string
  customer?: Customer
  quotation_id?: string
  quotation?: Quotation
  created_by: string
  creator?: User
  title: string
  description?: string
  status: ContractStatus
  total_amount: number
  start_date: string
  end_date?: string
  signed_date?: string
  terms?: string
  attachments?: string[]
  items?: ContractItem[]
  milestones?: ContractMilestone[]
  type: 'contract' | 'order'
  order_number?: string
  project_id?: string
  project?: Project
  brand: Brand
  password_hash?: string
  financial_password_hash?: string
  customer_snapshot?: CustomerSnapshot
  created_at: string
  updated_at: string
}

export interface ContractItem {
  id: string
  contract_id?: string
  product_id?: string
  name: string
  quantity: number
  unit: string
  unit_price: number
  total: number
}

export interface CustomerFilters {
  status?: CustomerStatus
  assigned_to?: string
  search?: string
  tags?: string[]
}

export interface QuotationFilters {
  status?: QuotationStatus
  customer_id?: string
  created_by?: string
  date_from?: string
  date_to?: string
}

export interface ContractFilters {
  status?: ContractStatus
  customer_id?: string
  date_from?: string
  date_to?: string
}

export type RetailOrderStatus = 'draft' | 'pending' | 'editing' | 'edit_done' | 'waiting_ship' | 'shipping' | 'completed' | 'cancelled'
export type DeliveryType = 'digital' | 'physical'
export type RetailPaymentStatus = 'pending' | 'partial' | 'paid'

export interface RetailOrder {
  id: string
  order_number: string
  stt: number
  customer_name: string
  customer_phone?: string
  customer_email?: string
  source_system?: string 
  external_id?: string 
  brand: Brand
  order_date: string
  total_amount: number
  deposit_amount: number
  paid_amount: number
  shipping_fee: number 
  payment_status: RetailPaymentStatus
  order_status: RetailOrderStatus
  delivery_type: DeliveryType
  resource_link?: string
  demo_link?: string
  delivery_date?: string 
  public_token?: string 
  needs_vat: boolean
  vat_info?: {
    tax_code?: string
    company_name?: string
    company_address?: string
    email?: string
  }
  notes?: string
  tracking_number?: string 
  shipping_info?: {
    recipient_name?: string
    recipient_phone?: string
    address?: string
    ward?: string
    district?: string
    province?: string
  }
  metadata?: Record<string, any>
  created_by?: string
  creator?: User
  items?: RetailOrderItem[]
  created_at: string
  updated_at: string
}

export interface RetailOrderItem {
  id: string
  order_id: string
  product_id?: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  sort_order: number
}

export type SupportTicketStatus = 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed'
export type SupportTicketPriority = 'low' | 'medium' | 'high' | 'urgent'
export type SupportTicketCategory = 'bug' | 'feature' | 'support' | 'warranty' | 'other'

export interface SupportTicket {
  id: string
  ticket_number: string
  project_id?: string
  project?: Project
  customer_id: string
  customer?: Customer
  assigned_to?: string
  assigned_user?: User
  title: string
  description?: string
  status: SupportTicketStatus
  priority: SupportTicketPriority
  category: SupportTicketCategory
  created_by?: string
  creator?: User
  resolved_at?: string
  closed_at?: string
  messages?: TicketMessage[]
  created_at: string
  updated_at: string
}

export interface TicketMessage {
  id: string
  ticket_id: string
  sender_type: 'staff' | 'customer'
  sender_name: string
  content: string
  attachments?: string[]
  created_at: string
}

export interface DocumentTemplate {
  id: string
  name: string
  type: 'contract' | 'invoice' | 'payment_request' | 'quotation' | 'order' | 'delivery_minutes' | 'confirmation'
  content: string 
  variables: string[] 
  is_default?: boolean
  created_at: string
  updated_at: string
}

export interface DocumentBundle {
  id: string
  name: string
  description?: string
  customer_id?: string
  contract_id?: string
  templates: string[] 
  generated_documents?: GeneratedDocument[]
  share_token?: string
  expires_at?: string
  created_at: string
}

export interface GeneratedDocument {
  id: string
  bundle_id: string
  template_id: string
  template_name: string
  content: string 
  status: 'draft' | 'pending_review' | 'approved' | 'signed'
  signed_at?: string
  created_at: string
}
