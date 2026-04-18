/**
 * @repo/vietnam - Vietnamese Market Compliance Types
 * Based on: TT200/TT133, NĐ123/2020, BHXH/BHYT/BHTN regulations
 */

// ============================================================
// VAT (Thuế GTGT) - Nghị định 44/2023/NĐ-CP
// ============================================================

export enum VATRate {
  ZERO = 0,       // Xuất khẩu, giáo dục, y tế
  REDUCED = 5,    // Nông sản, thực phẩm, thuốc
  SPECIAL = 8,    // Than, bia, rượu, thuốc lá
  STANDARD = 10,  // Hàng hóa/dịch vụ chung
}

export enum VATExemptCategory {
  EDUCATION = "EDUCATION",
  HEALTHCARE = "HEALTHCARE",
  AGRICULTURE = "AGRICULTURE",
  EXPORT = "EXPORT",
  FOOD_FOR_POOR = "FOOD_FOR_POOR",
  RELIGIOUS = "RELIGIOUS",
}

// ============================================================
// Chart of Accounts (Hệ thống tài khoản VAS)
// ============================================================

export enum AccountType {
  ASSET = "ASSET",                     // Tài sản
  LIABILITY = "LIABILITY",             // Nợ phải trả
  EQUITY = "EQUITY",                   // Vốn chủ sở hữu
  REVENUE = "REVENUE",                 // Doanh thu
  EXPENSE = "EXPENSE",                 // Chi phí
  CONTRA_ASSET = "CONTRA_ASSET",       // Khấu hao / dự phòng
  CONTRA_REVENUE = "CONTRA_REVENUE",   // Giảm trừ doanh thu
}

export enum AccountGroup {
  GROUP_1 = "GROUP_1",   // Tài sản ngắn hạn
  GROUP_2 = "GROUP_2",   // Tài sản dài hạn
  GROUP_3 = "GROUP_3",   // Nợ phải trả
  GROUP_4 = "GROUP_4",   // Vốn chủ sở hữu
  GROUP_5 = "GROUP_5",   // Doanh thu
  GROUP_6 = "GROUP_6",   // Chi phí sản xuất kinh doanh
  GROUP_7 = "GROUP_7",   // Thu nhập khác
  GROUP_8 = "GROUP_8",   // Chi phí khác
  GROUP_9 = "GROUP_9",   // Xác định kết quả kinh doanh
}

export enum NormalBalance {
  DEBIT = "DEBIT",
  CREDIT = "CREDIT",
}

// ============================================================
// Journal Entries (Bút toán kế toán)
// ============================================================

export enum JournalType {
  GENERAL = "GENERAL",               // Phiếu kế toán tổng hợp
  CASH_RECEIPT = "CASH_RECEIPT",     // Phiếu thu
  CASH_PAYMENT = "CASH_PAYMENT",     // Phiếu chi
  BANK_RECEIPT = "BANK_RECEIPT",     // Báo có ngân hàng
  BANK_PAYMENT = "BANK_PAYMENT",     // Báo nợ ngân hàng
  SALES = "SALES",                   // Hóa đơn bán hàng
  PURCHASE = "PURCHASE",             // Hóa đơn mua hàng
  PAYROLL = "PAYROLL",               // Bảng lương
  DEPRECIATION = "DEPRECIATION",     // Khấu hao
  ADJUSTMENT = "ADJUSTMENT",         // Bút toán điều chỉnh
  CLOSING = "CLOSING",               // Bút toán kết chuyển
  OPENING = "OPENING",               // Bút toán đầu kỳ
  REVERSAL = "REVERSAL",             // Bút toán đảo
}

export enum JournalStatus {
  DRAFT = "DRAFT",
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  POSTED = "POSTED",
  REVERSED = "REVERSED",
  REJECTED = "REJECTED",
}

export enum JournalSource {
  MANUAL = "MANUAL",
  SYSTEM = "SYSTEM",
  IMPORT = "IMPORT",
  RECURRING = "RECURRING",
}

// ============================================================
// Invoices (Hóa đơn)
// ============================================================

export enum InvoiceStatus {
  DRAFT = "DRAFT",
  PENDING_APPROVAL = "PENDING_APPROVAL",
  APPROVED = "APPROVED",
  PARTIALLY_PAID = "PARTIALLY_PAID",
  PAID = "PAID",
  OVERDUE = "OVERDUE",
  CANCELLED = "CANCELLED",
}

export enum PaymentMethod {
  CASH = "CASH",
  BANK_TRANSFER = "BANK_TRANSFER",
  CHECK = "CHECK",
  CREDIT_CARD = "CREDIT_CARD",
  E_WALLET = "E_WALLET",
  OFFSET = "OFFSET",
  OTHER = "OTHER",
}

export enum PaymentStatus {
  DRAFT = "DRAFT",
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  RECONCILED = "RECONCILED",
  CANCELLED = "CANCELLED",
}

// ============================================================
// E-Invoice (Hóa đơn điện tử) - NĐ123/2020
// ============================================================

export enum EInvoiceProvider {
  VNPT = "VNPT",
  VIETTEL = "VIETTEL",
  FPT = "FPT",
  BKAV = "BKAV",
}

export enum EInvoiceStatus {
  DRAFT = "DRAFT",
  SIGNED = "SIGNED",
  SENT_TO_BUYER = "SENT_TO_BUYER",
  TRANSMITTED = "TRANSMITTED",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
  ADJUSTED = "ADJUSTED",
  REPLACED = "REPLACED",
  ERROR = "ERROR",
}

export enum EInvoiceType {
  ORIGINAL = "ORIGINAL",
  ADJUSTMENT = "ADJUSTMENT",
  REPLACEMENT = "REPLACEMENT",
}

// ============================================================
// Tax declarations (Tờ khai thuế)
// ============================================================

export enum TaxDeclarationType {
  VAT_MONTHLY = "VAT_MONTHLY",
  VAT_QUARTERLY = "VAT_QUARTERLY",
  CIT_QUARTERLY = "CIT_QUARTERLY",
  CIT_ANNUAL = "CIT_ANNUAL",
  PIT_MONTHLY = "PIT_MONTHLY",
  PIT_ANNUAL = "PIT_ANNUAL",
  FCT = "FCT",
}

export enum TaxPeriodType {
  MONTHLY = "MONTHLY",
  QUARTERLY = "QUARTERLY",
  ANNUAL = "ANNUAL",
}

export enum TaxStatus {
  DRAFT = "DRAFT",
  CALCULATED = "CALCULATED",
  REVIEWED = "REVIEWED",
  SUBMITTED = "SUBMITTED",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  AMENDED = "AMENDED",
}

// ============================================================
// Insurance (Bảo hiểm xã hội)
// ============================================================

export enum InsuranceType {
  BHXH = "BHXH",   // Bảo hiểm xã hội
  BHYT = "BHYT",   // Bảo hiểm y tế
  BHTN = "BHTN",   // Bảo hiểm thất nghiệp
}

// ============================================================
// Banking (Ngân hàng Việt Nam)
// ============================================================

export enum BankCode {
  VCB = "VCB",     // Vietcombank
  BIDV = "BIDV",   // BIDV
  TCB = "TCB",     // Techcombank
  MB = "MB",       // MB Bank
  VPB = "VPB",     // VPBank
  ACB = "ACB",     // ACB
  SHB = "SHB",     // SHB
  TPB = "TPB",     // TPBank
  HDB = "HDB",     // HDBank
  STB = "STB",     // Sacombank
  VIB = "VIB",     // VIB
  OCB = "OCB",     // OCB
}

// ============================================================
// Fiscal (Kỳ kế toán)
// ============================================================

export enum FiscalStatus {
  OPEN = "OPEN",
  CLOSED = "CLOSED",
  LOCKED = "LOCKED",
}

export enum PeriodStatus {
  OPEN = "OPEN",
  SOFT_CLOSE = "SOFT_CLOSE",
  HARD_CLOSE = "HARD_CLOSE",
  REOPENED = "REOPENED",
}

// ============================================================
// Budget (Ngân sách)
// ============================================================

export enum BudgetType {
  OPERATING = "OPERATING",
  CAPITAL = "CAPITAL",
  PROJECT = "PROJECT",
  DEPARTMENT = "DEPARTMENT",
}

export enum BudgetStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  APPROVED = "APPROVED",
  ACTIVE = "ACTIVE",
  CLOSED = "CLOSED",
}

// ============================================================
// Company/Tax settings
// ============================================================

export enum CompanySize {
  STARTUP = "STARTUP",
  MICRO = "MICRO",
  SMALL = "SMALL",
  MEDIUM = "MEDIUM",
  LARGE = "LARGE",
}

// ============================================================
// Interfaces
// ============================================================

export interface PITBracket {
  fromIncome: number;
  toIncome: number;
  rate: number;
  deductionAmount: number;
}

export interface EInvoiceParty {
  name: string;
  taxCode?: string;
  address: string;
  phone?: string;
  email?: string;
  accountNumber?: string;
  bankName?: string;
}

export interface EInvoiceItem {
  itemCode?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  unit: string;
  discount?: number;
  vatRate: VATRate;
  amount: number;
  vatAmount: number;
  totalAmount: number;
}

export interface EInvoiceData {
  invoiceNumber: string;
  series: string;
  date: Date;
  seller: EInvoiceParty;
  buyer: EInvoiceParty;
  items: EInvoiceItem[];
  totalBeforeVAT: number;
  totalVAT: number;
  totalAfterVAT: number;
  paymentMethod: PaymentMethod;
  status: EInvoiceStatus;
}

export interface InsuranceRecord {
  employeeId: string;
  employeeName: string;
  salary: number;
  bhxhRate: number;
  bhytRate: number;
  bhtnRate: number;
  bhxhAmount: number;
  bhytAmount: number;
  bhtnAmount: number;
  totalInsuranceAmount: number;
}

export interface BankInfo {
  code: BankCode;
  name: string;
  englishName: string;
  swiftCode: string;
  bin: string;
}

// ============================================================
// Constants
// ============================================================

export const CURRENCY_CODE = "VND";
export const MINIMUM_WAGE_2024 = 1_800_000;
export const PERSONAL_DEDUCTION = 11_000_000;       // Giảm trừ bản thân
export const DEPENDENT_DEDUCTION = 4_400_000;        // Giảm trừ người phụ thuộc
export const SOCIAL_INSURANCE_CAP_MULTIPLIER = 20;   // 20x mức lương cơ sở
export const BASE_SALARY_2024 = 2_340_000;           // Mức lương cơ sở 2024
