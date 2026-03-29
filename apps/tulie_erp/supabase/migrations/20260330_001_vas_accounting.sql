-- ============================================================
-- VAS Accounting Module — Supabase Migration
-- Adapted from Viet-ERP Prisma schema → Supabase PostgreSQL + RLS
-- Compliant with TT200 (large enterprises) + TT133 (SMEs)
-- ============================================================

-- ============================================================
-- CHART OF ACCOUNTS — Hệ thống tài khoản kế toán VAS
-- ============================================================

CREATE TYPE account_type AS ENUM (
  'ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE', 'CONTRA_ASSET', 'CONTRA_REVENUE'
);

CREATE TYPE account_group AS ENUM (
  'GROUP_1', 'GROUP_2', 'GROUP_3', 'GROUP_4', 'GROUP_5', 'GROUP_6', 'GROUP_7', 'GROUP_8', 'GROUP_9'
);

CREATE TYPE normal_balance AS ENUM ('DEBIT', 'CREDIT');

CREATE TABLE acc_accounts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_number  TEXT NOT NULL,
  name            TEXT NOT NULL,
  name_en         TEXT,
  description     TEXT,
  account_type    account_type NOT NULL,
  account_group   account_group NOT NULL,
  normal_balance  normal_balance NOT NULL,
  parent_id       UUID REFERENCES acc_accounts(id),
  level           INT DEFAULT 1,
  is_active       BOOLEAN DEFAULT true,
  is_system_account BOOLEAN DEFAULT false,
  is_bank_account BOOLEAN DEFAULT false,
  currency        TEXT DEFAULT 'VND',
  vas_code        TEXT,
  tt200_code      TEXT,
  tt133_code      TEXT,
  opening_balance DECIMAL(18, 4) DEFAULT 0,
  current_balance DECIMAL(18, 4) DEFAULT 0,
  user_id         UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(account_number, user_id)
);

CREATE INDEX idx_acc_accounts_user ON acc_accounts(user_id, account_type);
CREATE INDEX idx_acc_accounts_parent ON acc_accounts(user_id, parent_id);
CREATE INDEX idx_acc_accounts_group ON acc_accounts(user_id, account_group);

-- ============================================================
-- FISCAL PERIODS — Kỳ kế toán
-- ============================================================

CREATE TYPE fiscal_status AS ENUM ('OPEN', 'CLOSED', 'LOCKED');
CREATE TYPE period_status AS ENUM ('OPEN', 'SOFT_CLOSE', 'HARD_CLOSE', 'REOPENED');

CREATE TABLE acc_fiscal_years (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year        INT NOT NULL,
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  is_current  BOOLEAN DEFAULT false,
  status      fiscal_status DEFAULT 'OPEN',
  user_id     UUID NOT NULL REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(year, user_id)
);

CREATE TABLE acc_fiscal_periods (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fiscal_year_id  UUID NOT NULL REFERENCES acc_fiscal_years(id) ON DELETE CASCADE,
  period          INT NOT NULL,
  name            TEXT NOT NULL,
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  status          period_status DEFAULT 'OPEN',
  closed_at       TIMESTAMPTZ,
  closed_by       UUID,
  user_id         UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(fiscal_year_id, period)
);

-- ============================================================
-- JOURNAL ENTRIES — Bút toán kế toán
-- ============================================================

CREATE TYPE journal_type AS ENUM (
  'GENERAL', 'CASH_RECEIPT', 'CASH_PAYMENT', 'BANK_RECEIPT', 'BANK_PAYMENT',
  'SALES', 'PURCHASE', 'PAYROLL', 'DEPRECIATION', 'ADJUSTMENT', 'CLOSING', 'OPENING', 'REVERSAL'
);

CREATE TYPE journal_source AS ENUM ('MANUAL', 'SYSTEM', 'IMPORT', 'RECURRING');
CREATE TYPE journal_status AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'POSTED', 'REVERSED', 'REJECTED');

CREATE TABLE acc_journal_entries (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_number      TEXT NOT NULL,
  entry_date        DATE NOT NULL,
  posting_date      DATE,
  fiscal_period_id  UUID REFERENCES acc_fiscal_periods(id),
  journal_type      journal_type NOT NULL,
  source            journal_source DEFAULT 'MANUAL',
  source_module     TEXT,
  source_ref        TEXT,
  description       TEXT NOT NULL,
  total_debit       DECIMAL(18, 4) NOT NULL,
  total_credit      DECIMAL(18, 4) NOT NULL,
  currency          TEXT DEFAULT 'VND',
  exchange_rate     DECIMAL(12, 6) DEFAULT 1,
  status            journal_status DEFAULT 'DRAFT',
  approved_by       UUID,
  approved_at       TIMESTAMPTZ,
  posted_by         UUID,
  posted_at         TIMESTAMPTZ,
  reversal_of       UUID,
  attachments       JSONB,
  tags              TEXT[],
  user_id           UUID NOT NULL REFERENCES auth.users(id),
  created_by        UUID NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now(),
  UNIQUE(entry_number, user_id)
);

CREATE INDEX idx_journal_entries_date ON acc_journal_entries(user_id, entry_date);
CREATE INDEX idx_journal_entries_status ON acc_journal_entries(user_id, status);
CREATE INDEX idx_journal_entries_type ON acc_journal_entries(user_id, journal_type);

CREATE TABLE acc_journal_lines (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id    UUID NOT NULL REFERENCES acc_journal_entries(id) ON DELETE CASCADE,
  line_number         INT NOT NULL,
  account_id          UUID NOT NULL REFERENCES acc_accounts(id),
  description         TEXT,
  debit_amount        DECIMAL(18, 4) DEFAULT 0,
  credit_amount       DECIMAL(18, 4) DEFAULT 0,
  currency            TEXT DEFAULT 'VND',
  exchange_rate       DECIMAL(12, 6) DEFAULT 1,
  department_id       TEXT,
  cost_center_id      TEXT,
  project_id          TEXT,
  customer_id         TEXT,
  supplier_id         TEXT,
  user_id             UUID NOT NULL REFERENCES auth.users(id),
  created_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_journal_lines_entry ON acc_journal_lines(journal_entry_id);
CREATE INDEX idx_journal_lines_account ON acc_journal_lines(account_id);

-- ============================================================
-- E-INVOICE — Hóa đơn điện tử (NĐ123/2020)
-- ============================================================

CREATE TYPE einvoice_status AS ENUM (
  'DRAFT', 'SIGNED', 'SENT_TO_BUYER', 'TRANSMITTED', 'ACCEPTED',
  'REJECTED', 'CANCELLED', 'ADJUSTED', 'REPLACED', 'ERROR'
);

CREATE TYPE einvoice_type AS ENUM ('ORIGINAL', 'ADJUSTMENT', 'REPLACEMENT');

CREATE TABLE acc_einvoices (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_template    TEXT DEFAULT '01GTKT',
  invoice_series      TEXT NOT NULL,
  invoice_number      TEXT NOT NULL,
  invoice_date        DATE NOT NULL,
  signed_date         TIMESTAMPTZ,
  seller_tax_code     TEXT NOT NULL,
  seller_name         TEXT NOT NULL,
  seller_address      TEXT,
  buyer_tax_code      TEXT,
  buyer_name          TEXT NOT NULL,
  buyer_address       TEXT,
  payment_method      TEXT,
  subtotal            DECIMAL(18, 4) NOT NULL,
  vat_rate            DECIMAL(5, 4) DEFAULT 0.10,
  vat_amount          DECIMAL(18, 4) NOT NULL,
  total_amount        DECIMAL(18, 4) NOT NULL,
  amount_in_words     TEXT,
  currency            TEXT DEFAULT 'VND',
  exchange_rate       DECIMAL(12, 6) DEFAULT 1,
  status              einvoice_status DEFAULT 'DRAFT',
  lookup_code         TEXT,
  digital_signature   TEXT,
  qr_code             TEXT,
  xml_content         TEXT,
  tax_authority_code  TEXT,
  cancel_reason       TEXT,
  adjustment_of       UUID,
  replacement_of      UUID,
  invoice_type        einvoice_type DEFAULT 'ORIGINAL',
  provider_ref        TEXT,
  user_id             UUID NOT NULL REFERENCES auth.users(id),
  created_by          UUID NOT NULL,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now(),
  UNIQUE(invoice_series, invoice_number, user_id)
);

CREATE INDEX idx_einvoices_status ON acc_einvoices(user_id, status);
CREATE INDEX idx_einvoices_buyer ON acc_einvoices(user_id, buyer_tax_code);
CREATE INDEX idx_einvoices_date ON acc_einvoices(user_id, invoice_date);

CREATE TABLE acc_einvoice_lines (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  einvoice_id     UUID NOT NULL REFERENCES acc_einvoices(id) ON DELETE CASCADE,
  line_number     INT NOT NULL,
  item_name       TEXT NOT NULL,
  item_code       TEXT,
  unit            TEXT,
  quantity        DECIMAL(12, 4) NOT NULL,
  unit_price      DECIMAL(18, 4) NOT NULL,
  amount          DECIMAL(18, 4) NOT NULL,
  vat_rate        DECIMAL(5, 4) DEFAULT 0,
  vat_amount      DECIMAL(18, 4) DEFAULT 0,
  discount        DECIMAL(18, 4) DEFAULT 0,
  total_amount    DECIMAL(18, 4) NOT NULL,
  user_id         UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_einvoice_lines ON acc_einvoice_lines(einvoice_id);

-- ============================================================
-- TAX DECLARATIONS — Tờ khai thuế
-- ============================================================

CREATE TYPE tax_declaration_type AS ENUM (
  'VAT_MONTHLY', 'VAT_QUARTERLY', 'CIT_QUARTERLY', 'CIT_ANNUAL',
  'PIT_MONTHLY', 'PIT_ANNUAL', 'FCT'
);
CREATE TYPE tax_period_type AS ENUM ('MONTHLY', 'QUARTERLY', 'ANNUAL');
CREATE TYPE tax_status AS ENUM ('DRAFT', 'CALCULATED', 'REVIEWED', 'SUBMITTED', 'ACCEPTED', 'REJECTED', 'AMENDED');

CREATE TABLE acc_tax_declarations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  declaration_type    tax_declaration_type NOT NULL,
  period              TEXT NOT NULL,
  period_type         tax_period_type NOT NULL,
  due_date            DATE NOT NULL,
  filing_date         DATE,
  taxable_revenue     DECIMAL(18, 4) DEFAULT 0,
  tax_amount          DECIMAL(18, 4) DEFAULT 0,
  deductible_tax      DECIMAL(18, 4) DEFAULT 0,
  payable_amount      DECIMAL(18, 4) DEFAULT 0,
  status              tax_status DEFAULT 'DRAFT',
  xml_content         TEXT,
  confirmation_code   TEXT,
  notes               TEXT,
  user_id             UUID NOT NULL REFERENCES auth.users(id),
  created_by          UUID NOT NULL,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now(),
  UNIQUE(declaration_type, period, user_id)
);

-- ============================================================
-- BANK RECONCILIATION — Đối chiếu ngân hàng
-- ============================================================

CREATE TABLE acc_bank_accounts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_number  TEXT NOT NULL,
  bank_name       TEXT NOT NULL,
  branch_name     TEXT,
  account_name    TEXT NOT NULL,
  currency        TEXT DEFAULT 'VND',
  gl_account_id   UUID REFERENCES acc_accounts(id),
  is_active       BOOLEAN DEFAULT true,
  current_balance DECIMAL(18, 4) DEFAULT 0,
  user_id         UUID NOT NULL REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(account_number, user_id)
);

-- ============================================================
-- BUDGET — Ngân sách
-- ============================================================

CREATE TYPE budget_type AS ENUM ('OPERATING', 'CAPITAL', 'PROJECT', 'DEPARTMENT');
CREATE TYPE budget_status AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'ACTIVE', 'CLOSED');

CREATE TABLE acc_budgets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  fiscal_year   INT NOT NULL,
  budget_type   budget_type NOT NULL,
  status        budget_status DEFAULT 'DRAFT',
  total_amount  DECIMAL(18, 4) DEFAULT 0,
  approved_by   UUID,
  approved_at   TIMESTAMPTZ,
  user_id       UUID NOT NULL REFERENCES auth.users(id),
  created_by    UUID NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(name, fiscal_year, user_id)
);

CREATE TABLE acc_budget_lines (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id       UUID NOT NULL REFERENCES acc_budgets(id) ON DELETE CASCADE,
  account_id      UUID NOT NULL REFERENCES acc_accounts(id),
  period          INT NOT NULL,
  amount          DECIMAL(18, 4) NOT NULL,
  actual_amount   DECIMAL(18, 4) DEFAULT 0,
  variance        DECIMAL(18, 4) DEFAULT 0,
  department_id   TEXT,
  cost_center_id  TEXT,
  user_id         UUID NOT NULL REFERENCES auth.users(id)
);

-- ============================================================
-- ROW LEVEL SECURITY — Bảo mật theo người dùng
-- ============================================================

ALTER TABLE acc_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE acc_fiscal_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE acc_fiscal_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE acc_journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE acc_journal_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE acc_einvoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE acc_einvoice_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE acc_tax_declarations ENABLE ROW LEVEL SECURITY;
ALTER TABLE acc_bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE acc_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE acc_budget_lines ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only access their own data
CREATE POLICY "Users access own accounts" ON acc_accounts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own fiscal_years" ON acc_fiscal_years FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own fiscal_periods" ON acc_fiscal_periods FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own journal_entries" ON acc_journal_entries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own journal_lines" ON acc_journal_lines FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own einvoices" ON acc_einvoices FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own einvoice_lines" ON acc_einvoice_lines FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own tax_declarations" ON acc_tax_declarations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own bank_accounts" ON acc_bank_accounts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own budgets" ON acc_budgets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own budget_lines" ON acc_budget_lines FOR ALL USING (auth.uid() = user_id);
