import { User, Brand } from './shared'
import { Customer, Contract, Quotation, RetailOrderItem } from './crm'
import { Project } from './workspace'

export interface RevenueTarget {
  id: string
  period_type: 'monthly' | 'quarterly' | 'yearly'
  period_start: string
  period_end: string
  target_amount: number
  actual_amount: number
  brand: Brand
  notes?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface RevenueProgress {
  target: RevenueTarget | null
  actual: number
  percentage: number
  period_label: string
}

export interface Vendor {
  id: string
  name: string
  contact_name?: string
  email?: string
  phone?: string
  address?: string
  tax_code?: string
  bank_account?: string
  bank_name?: string
  created_at: string
  updated_at: string
}

export interface ExpenseCategory {
  id: string
  name: string
  description?: string
  parent_id?: string
  created_at: string
}

export interface Expense {
  id: string
  category_id: string
  category?: ExpenseCategory
  vendor_id?: string
  vendor?: Vendor
  invoice_id?: string
  amount: number
  description: string
  date: string
  receipt_url?: string
  created_by: string
  creator?: User
  created_at: string
  updated_at: string
}

export type InvoiceType = 'output' | 'input'
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled'

export interface Invoice {
  id: string
  invoice_number: string
  type: InvoiceType
  contract_id?: string
  contract?: Contract
  project_id?: string
  project?: Project
  customer_id?: string
  customer?: Customer
  vendor_id?: string
  vendor?: Vendor
  created_by: string
  creator?: User
  status: InvoiceStatus
  issue_date: string
  due_date: string
  subtotal: number
  vat_percent: number
  vat_amount: number
  total_amount: number
  paid_amount: number
  notes?: string
  items?: InvoiceItem[]
  payments?: Payment[]
  pdf_url?: string
  lookup_info?: string
  quotation_id?: string
  brand: Brand
  created_at: string
  updated_at: string
}

export interface InvoiceItem {
  id: string
  invoice_id?: string
  description: string
  quantity: number
  unit: string
  unit_price: number
  total: number
}

export interface Payment {
  id: string
  invoice_id: string
  amount: number
  payment_date: string
  payment_method: string
  notes?: string
  created_by: string
  created_at: string
}

export interface Product {
  id: string
  name: string
  sku?: string
  brand: Brand
  category?: string
  description?: string
  unit: string
  price: number
  cost_price?: number
  is_active: boolean
  default_templates?: string[]
  created_at: string
  updated_at: string
}

export interface DashboardStats {
  revenue: {
    total: number
    change: number
    period: string
  }
  customers: {
    total: number
    new: number
    change: number
  }
  contracts: {
    active: number
    pending: number
    change: number
  }
  invoices: {
    pending: number
    overdue: number
    total_outstanding: number
  }
  health_score: number
  conversion_rate: number
  efficiency_score: number
}

export interface RevenueDetailItem {
  source: 'sepay' | 'invoice' | 'retail_order'
  description: string
  amount: number
  reference_id?: string
  reference_code?: string
  customer_name?: string
  date?: string
}

export interface RevenueData {
  date: string
  revenue: number
  expenses: number
  profit: number
  details?: RevenueDetailItem[]
}

export interface InvoiceFilters {
  type?: InvoiceType
  status?: InvoiceStatus
  customer_id?: string
  vendor_id?: string
  date_from?: string
  date_to?: string
}
