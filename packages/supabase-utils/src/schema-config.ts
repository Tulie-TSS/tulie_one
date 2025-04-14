/**
 * Schema Configuration for Tulie One Multi-App Supabase Setup
 *
 * This file defines which schema each app uses in the shared Supabase project.
 * Each app MUST use its designated schema to avoid data collisions.
 */

export const SCHEMA_CONFIG = {
  /** Core CRM tables - Owner: tulie_crm */
  crm: "public",

  /** AI Workforce (agents, threads, FB ads) - Owner: tulie_workforce */
  workforce: "workforce",

  /** Project management (tasks, projects, cycles) - Owner: tulie_workspace */
  workspace: "workspace",

  /** Accounting/ERP - Owner: tulie_erp (future) */
  erp: "erp",

  /** HRM - Owner: tulie_hrm (future) */
  hrm: "hrm",
} as const;

export type AppSchema = keyof typeof SCHEMA_CONFIG;
export type SchemaName = (typeof SCHEMA_CONFIG)[AppSchema];

/**
 * Get the schema name for a given app
 */
export function getSchemaForApp(app: AppSchema): SchemaName {
  return SCHEMA_CONFIG[app];
}

/**
 * Validate that a schema name is valid
 */
export function isValidSchema(schema: string): schema is SchemaName {
  return Object.values(SCHEMA_CONFIG).includes(schema as SchemaName);
}

/**
 * Get all available schemas
 */
export function getAllSchemas(): SchemaName[] {
  return Object.values(SCHEMA_CONFIG);
}

/**
 * Schema ownership documentation
 */
export const SCHEMA_OWNERS = {
  [SCHEMA_CONFIG.crm]: {
    owner: "tulie_crm",
    description:
      "Core CRM tables: customers, deals, quotations, contracts, invoices",
    tables: [
      "customers",
      "contacts",
      "deals",
      "quotations",
      "contracts",
      "invoices",
      "projects",
      "leads",
      "products",
      "users",
      "notifications",
      "work_items",
      "project_tasks",
    ],
    crossSchemaReferences: [
      { column: "project_id", references: "workspace.projects.crm_project_id" },
      {
        column: "work_item_id",
        references: "workspace.tasks.crm_work_item_id",
      },
    ],
  },

  [SCHEMA_CONFIG.workforce]: {
    owner: "tulie_workforce",
    description: "AI agents, chat threads, FB ads, content management",
    tables: [
      "organizations",
      "profiles",
      "agents",
      "threads",
      "messages",
      "tasks",
      "documents",
      "document_embeddings",
      "memories",
      "fb_ad_accounts",
      "fb_campaigns",
      "fb_adsets",
      "fb_ads",
      "fb_alerts",
      "content_posts",
      "content_templates",
      "ai_providers",
      "ai_models",
    ],
    crossSchemaReferences: [
      { column: "user_id", references: "public.users.id" },
    ],
  },

  [SCHEMA_CONFIG.workspace]: {
    owner: "tulie_workspace",
    description: "Project management: tasks, projects, cycles, notifications",
    tables: [
      "projects",
      "cycles",
      "tags",
      "tasks",
      "task_tags",
      "task_comments",
      "templates",
      "notifications",
    ],
    crossSchemaReferences: [
      { column: "crm_project_id", references: "public.projects.id" },
      { column: "crm_work_item_id", references: "public.work_items.id" },
      { column: "assigned_to", references: "public.users.id" },
    ],
  },

  [SCHEMA_CONFIG.erp]: {
    owner: "tulie_erp",
    description:
      "Accounting: accounts, fiscal years, journal entries, invoices",
    tables: [
      "acc_accounts",
      "acc_fiscal_years",
      "acc_fiscal_periods",
      "acc_journal_entries",
      "acc_journal_lines",
      "acc_einvoices",
      "acc_einvoice_lines",
      "acc_tax_declarations",
      "acc_bank_accounts",
      "acc_budgets",
      "acc_budget_lines",
    ],
    crossSchemaReferences: [],
    status: "future",
  },

  [SCHEMA_CONFIG.hrm]: {
    owner: "tulie_hrm",
    description: "HRM: employees, departments, attendance, payroll",
    tables: [
      "hrm_employees",
      "hrm_departments",
      "hrm_positions",
      "hrm_attendances",
      "hrm_leaves",
      "hrm_payroll",
    ],
    crossSchemaReferences: [],
    status: "future",
  },
} as const;
