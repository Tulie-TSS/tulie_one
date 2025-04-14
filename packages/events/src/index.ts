/**
 * @repo/events — Cross-App Integration Events
 *
 * Defines the contract for events flowing between Tulie apps:
 * - CRM → ERP: contract.signed, milestone.due
 * - CRM → Workspace: contract.signed (create project)
 * - ERP → CRM: payment.received, invoice.overdue
 * - Workforce → Workspace: task.created (AI-generated)
 */

// ─── Event Types ────────────────────────────────

export type EventSource = 'crm' | 'erp' | 'workspace' | 'workforce'

export interface BaseEvent {
  id: string
  source: EventSource
  timestamp: string
  userId?: string
  organizationId?: string
}

// ─── CRM → ERP Events ──────────────────────────

export interface ContractSignedEvent extends BaseEvent {
  type: 'contract.signed'
  source: 'crm'
  payload: {
    contractId: string
    customerId: string
    totalAmount: number
    milestones: Array<{
      id: string
      title: string
      amount: number
      dueDate: string
    }>
  }
}

export interface MilestoneDueEvent extends BaseEvent {
  type: 'milestone.due'
  source: 'crm'
  payload: {
    contractId: string
    milestoneId: string
    customerId: string
    amount: number
    dueDate: string
    description: string
  }
}

export interface DealWonEvent extends BaseEvent {
  type: 'deal.won'
  source: 'crm'
  payload: {
    dealId: string
    customerId: string
    dealValue: number
    products: Array<{ productId: string; quantity: number; unitPrice: number }>
  }
}

// ─── ERP → CRM Events ──────────────────────────

export interface PaymentReceivedEvent extends BaseEvent {
  type: 'payment.received'
  source: 'erp'
  payload: {
    paymentId: string
    invoiceId: string
    contractId?: string
    customerId: string
    amount: number
    paidAmount: number
    totalAmount: number
    status: 'partial' | 'paid'
  }
}

export interface InvoiceOverdueEvent extends BaseEvent {
  type: 'invoice.overdue'
  source: 'erp'
  payload: {
    invoiceId: string
    invoiceNumber: string
    customerId: string
    overdueAmount: number
    daysOverdue: number
  }
}

// ─── CRM → Workspace Events ────────────────────

export interface ProjectCreateEvent extends BaseEvent {
  type: 'project.create'
  source: 'crm'
  payload: {
    contractId: string
    customerId: string
    projectName: string
    startDate: string
    endDate: string
    tasks: Array<{
      title: string
      description: string
      dueDate: string
      assigneeId?: string
    }>
  }
}

// ─── Workspace → ERP Events ────────────────────

export interface ProjectCompleteEvent extends BaseEvent {
  type: 'project.complete'
  source: 'workspace'
  payload: {
    projectId: string
    contractId?: string
    customerId?: string
    completedAt: string
  }
}

// ─── Workforce → Workspace Events ──────────────

export interface AITaskCreatedEvent extends BaseEvent {
  type: 'ai.task.created'
  source: 'workforce'
  payload: {
    agentId: string
    taskTitle: string
    taskDescription: string
    priority: 'low' | 'medium' | 'high'
    suggestedAssignee?: string
  }
}

// ─── Union Type ─────────────────────────────────

export type TulieEvent =
  | ContractSignedEvent
  | MilestoneDueEvent
  | DealWonEvent
  | PaymentReceivedEvent
  | InvoiceOverdueEvent
  | ProjectCreateEvent
  | ProjectCompleteEvent
  | AITaskCreatedEvent

export type TulieEventType = TulieEvent['type']

// ─── Event Handlers ─────────────────────────────

export type EventHandler<T extends TulieEvent = TulieEvent> = (event: T) => Promise<void>

export type EventHandlerMap = {
  [K in TulieEventType]?: EventHandler<Extract<TulieEvent, { type: K }>>
}

// ─── Utilities ──────────────────────────────────

export function createEvent<T extends TulieEvent>(
  type: T['type'],
  source: T['source'],
  payload: T['payload'],
  userId?: string
): T {
  return {
    id: crypto.randomUUID(),
    type,
    source,
    timestamp: new Date().toISOString(),
    userId,
    payload,
  } as T
}
