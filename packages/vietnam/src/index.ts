/**
 * @repo/vietnam - Vietnamese Market Compliance Package
 *
 * Provides compliance utilities for Vietnamese enterprises:
 * - VAS Accounting (TT200/TT133)
 * - VAT/PIT/CIT Tax calculations
 * - E-Invoice NĐ123/2020
 * - Social Insurance (BHXH/BHYT/BHTN)
 * - VND currency formatting
 */

// Types & Enums
export * from "./types/index";

// Tax calculations
export * from "./tax/index";

// E-Invoice
export {
  generateInvoiceNumber,
  calculateInvoiceItem,
  calculateInvoiceTotals,
  validateEInvoice,
  getNextInvoiceStatuses,
  EINVOICE_TEMPLATES,
} from "./einvoice/index";

// Insurance
export {
  calculateInsurance,
  calculateCompanyInsurance,
  INSURANCE_RATES,
  BHXH_SALARY_CAP,
  BHTN_SALARY_CAP,
} from "./insurance/index";
export type { InsuranceCalculation } from "./insurance/index";

// Accounting
export {
  VAS_TT200_ACCOUNTS,
  getAccount,
  getChildAccounts,
  getAccountsByGroup,
  getAccountsByType,
  validateDoubleEntry,
} from "./accounting/index";
export type { VASAccount } from "./accounting/index";

// Currency & Utils
export * from "./utils/index";
