/**
 * VAS Chart of Accounts - Thông tư 200/2014/TT-BTC
 * Standard accounts for Vietnamese enterprises
 */

import { AccountType, AccountGroup, NormalBalance } from "../types/index";

export interface VASAccount {
  accountNumber: string;
  name: string;
  nameEn: string;
  accountType: AccountType;
  accountGroup: AccountGroup;
  normalBalance: NormalBalance;
  level: number;
  parentAccount?: string;
  isSystemAccount: boolean;
}

/** TT200 Chart of Accounts - Tài khoản cấp 1 & cấp 2 */
export const VAS_TT200_ACCOUNTS: VASAccount[] = [
  // ============ LOẠI 1: TÀI SẢN NGẮN HẠN ============
  { accountNumber: "111", name: "Tiền mặt", nameEn: "Cash on hand", accountType: AccountType.ASSET, accountGroup: AccountGroup.GROUP_1, normalBalance: NormalBalance.DEBIT, level: 1, isSystemAccount: true },
  { accountNumber: "1111", name: "Tiền Việt Nam", nameEn: "Vietnamese Dong", accountType: AccountType.ASSET, accountGroup: AccountGroup.GROUP_1, normalBalance: NormalBalance.DEBIT, level: 2, parentAccount: "111", isSystemAccount: true },
  { accountNumber: "1112", name: "Ngoại tệ", nameEn: "Foreign currencies", accountType: AccountType.ASSET, accountGroup: AccountGroup.GROUP_1, normalBalance: NormalBalance.DEBIT, level: 2, parentAccount: "111", isSystemAccount: true },
  { accountNumber: "112", name: "Tiền gửi ngân hàng", nameEn: "Cash at banks", accountType: AccountType.ASSET, accountGroup: AccountGroup.GROUP_1, normalBalance: NormalBalance.DEBIT, level: 1, isSystemAccount: true },
  { accountNumber: "1121", name: "Tiền Việt Nam", nameEn: "VND at banks", accountType: AccountType.ASSET, accountGroup: AccountGroup.GROUP_1, normalBalance: NormalBalance.DEBIT, level: 2, parentAccount: "112", isSystemAccount: true },
  { accountNumber: "1122", name: "Ngoại tệ", nameEn: "Foreign currencies at banks", accountType: AccountType.ASSET, accountGroup: AccountGroup.GROUP_1, normalBalance: NormalBalance.DEBIT, level: 2, parentAccount: "112", isSystemAccount: true },
  { accountNumber: "131", name: "Phải thu của khách hàng", nameEn: "Accounts receivable", accountType: AccountType.ASSET, accountGroup: AccountGroup.GROUP_1, normalBalance: NormalBalance.DEBIT, level: 1, isSystemAccount: true },
  { accountNumber: "133", name: "Thuế GTGT được khấu trừ", nameEn: "VAT deductible", accountType: AccountType.ASSET, accountGroup: AccountGroup.GROUP_1, normalBalance: NormalBalance.DEBIT, level: 1, isSystemAccount: true },
  { accountNumber: "1331", name: "Thuế GTGT được khấu trừ của hàng hóa, dịch vụ", nameEn: "VAT deductible on goods/services", accountType: AccountType.ASSET, accountGroup: AccountGroup.GROUP_1, normalBalance: NormalBalance.DEBIT, level: 2, parentAccount: "133", isSystemAccount: true },
  { accountNumber: "1332", name: "Thuế GTGT được khấu trừ của TSCĐ", nameEn: "VAT deductible on fixed assets", accountType: AccountType.ASSET, accountGroup: AccountGroup.GROUP_1, normalBalance: NormalBalance.DEBIT, level: 2, parentAccount: "133", isSystemAccount: true },
  { accountNumber: "136", name: "Phải thu nội bộ", nameEn: "Inter-company receivables", accountType: AccountType.ASSET, accountGroup: AccountGroup.GROUP_1, normalBalance: NormalBalance.DEBIT, level: 1, isSystemAccount: true },
  { accountNumber: "138", name: "Phải thu khác", nameEn: "Other receivables", accountType: AccountType.ASSET, accountGroup: AccountGroup.GROUP_1, normalBalance: NormalBalance.DEBIT, level: 1, isSystemAccount: true },
  { accountNumber: "141", name: "Tạm ứng", nameEn: "Advances", accountType: AccountType.ASSET, accountGroup: AccountGroup.GROUP_1, normalBalance: NormalBalance.DEBIT, level: 1, isSystemAccount: true },
  { accountNumber: "152", name: "Nguyên liệu, vật liệu", nameEn: "Raw materials", accountType: AccountType.ASSET, accountGroup: AccountGroup.GROUP_1, normalBalance: NormalBalance.DEBIT, level: 1, isSystemAccount: true },
  { accountNumber: "153", name: "Công cụ, dụng cụ", nameEn: "Tools and supplies", accountType: AccountType.ASSET, accountGroup: AccountGroup.GROUP_1, normalBalance: NormalBalance.DEBIT, level: 1, isSystemAccount: true },
  { accountNumber: "154", name: "Chi phí SXKD dở dang", nameEn: "Work in progress", accountType: AccountType.ASSET, accountGroup: AccountGroup.GROUP_1, normalBalance: NormalBalance.DEBIT, level: 1, isSystemAccount: true },
  { accountNumber: "155", name: "Thành phẩm", nameEn: "Finished goods", accountType: AccountType.ASSET, accountGroup: AccountGroup.GROUP_1, normalBalance: NormalBalance.DEBIT, level: 1, isSystemAccount: true },
  { accountNumber: "156", name: "Hàng hóa", nameEn: "Merchandise", accountType: AccountType.ASSET, accountGroup: AccountGroup.GROUP_1, normalBalance: NormalBalance.DEBIT, level: 1, isSystemAccount: true },

  // ============ LOẠI 2: TÀI SẢN DÀI HẠN ============
  { accountNumber: "211", name: "Tài sản cố định hữu hình", nameEn: "Tangible fixed assets", accountType: AccountType.ASSET, accountGroup: AccountGroup.GROUP_2, normalBalance: NormalBalance.DEBIT, level: 1, isSystemAccount: true },
  { accountNumber: "212", name: "Tài sản cố định thuê tài chính", nameEn: "Finance lease assets", accountType: AccountType.ASSET, accountGroup: AccountGroup.GROUP_2, normalBalance: NormalBalance.DEBIT, level: 1, isSystemAccount: true },
  { accountNumber: "213", name: "Tài sản cố định vô hình", nameEn: "Intangible fixed assets", accountType: AccountType.ASSET, accountGroup: AccountGroup.GROUP_2, normalBalance: NormalBalance.DEBIT, level: 1, isSystemAccount: true },
  { accountNumber: "214", name: "Hao mòn TSCĐ", nameEn: "Accumulated depreciation", accountType: AccountType.CONTRA_ASSET, accountGroup: AccountGroup.GROUP_2, normalBalance: NormalBalance.CREDIT, level: 1, isSystemAccount: true },
  { accountNumber: "241", name: "Xây dựng cơ bản dở dang", nameEn: "Construction in progress", accountType: AccountType.ASSET, accountGroup: AccountGroup.GROUP_2, normalBalance: NormalBalance.DEBIT, level: 1, isSystemAccount: true },
  { accountNumber: "242", name: "Chi phí trả trước", nameEn: "Prepaid expenses", accountType: AccountType.ASSET, accountGroup: AccountGroup.GROUP_2, normalBalance: NormalBalance.DEBIT, level: 1, isSystemAccount: true },

  // ============ LOẠI 3: NỢ PHẢI TRẢ ============
  { accountNumber: "331", name: "Phải trả cho người bán", nameEn: "Accounts payable", accountType: AccountType.LIABILITY, accountGroup: AccountGroup.GROUP_3, normalBalance: NormalBalance.CREDIT, level: 1, isSystemAccount: true },
  { accountNumber: "333", name: "Thuế và các khoản phải nộp NN", nameEn: "Taxes payable", accountType: AccountType.LIABILITY, accountGroup: AccountGroup.GROUP_3, normalBalance: NormalBalance.CREDIT, level: 1, isSystemAccount: true },
  { accountNumber: "3331", name: "Thuế GTGT phải nộp", nameEn: "VAT payable", accountType: AccountType.LIABILITY, accountGroup: AccountGroup.GROUP_3, normalBalance: NormalBalance.CREDIT, level: 2, parentAccount: "333", isSystemAccount: true },
  { accountNumber: "33311", name: "Thuế GTGT đầu ra", nameEn: "Output VAT", accountType: AccountType.LIABILITY, accountGroup: AccountGroup.GROUP_3, normalBalance: NormalBalance.CREDIT, level: 3, parentAccount: "3331", isSystemAccount: true },
  { accountNumber: "3334", name: "Thuế TNDN", nameEn: "Corporate Income Tax", accountType: AccountType.LIABILITY, accountGroup: AccountGroup.GROUP_3, normalBalance: NormalBalance.CREDIT, level: 2, parentAccount: "333", isSystemAccount: true },
  { accountNumber: "3335", name: "Thuế TNCN", nameEn: "Personal Income Tax", accountType: AccountType.LIABILITY, accountGroup: AccountGroup.GROUP_3, normalBalance: NormalBalance.CREDIT, level: 2, parentAccount: "333", isSystemAccount: true },
  { accountNumber: "334", name: "Phải trả người lao động", nameEn: "Payroll payable", accountType: AccountType.LIABILITY, accountGroup: AccountGroup.GROUP_3, normalBalance: NormalBalance.CREDIT, level: 1, isSystemAccount: true },
  { accountNumber: "335", name: "Chi phí phải trả", nameEn: "Accrued expenses", accountType: AccountType.LIABILITY, accountGroup: AccountGroup.GROUP_3, normalBalance: NormalBalance.CREDIT, level: 1, isSystemAccount: true },
  { accountNumber: "338", name: "Phải trả, phải nộp khác", nameEn: "Other payables", accountType: AccountType.LIABILITY, accountGroup: AccountGroup.GROUP_3, normalBalance: NormalBalance.CREDIT, level: 1, isSystemAccount: true },
  { accountNumber: "3383", name: "BHXH", nameEn: "Social Insurance payable", accountType: AccountType.LIABILITY, accountGroup: AccountGroup.GROUP_3, normalBalance: NormalBalance.CREDIT, level: 2, parentAccount: "338", isSystemAccount: true },
  { accountNumber: "3384", name: "BHYT", nameEn: "Health Insurance payable", accountType: AccountType.LIABILITY, accountGroup: AccountGroup.GROUP_3, normalBalance: NormalBalance.CREDIT, level: 2, parentAccount: "338", isSystemAccount: true },
  { accountNumber: "3386", name: "BHTN", nameEn: "Unemployment Insurance payable", accountType: AccountType.LIABILITY, accountGroup: AccountGroup.GROUP_3, normalBalance: NormalBalance.CREDIT, level: 2, parentAccount: "338", isSystemAccount: true },
  { accountNumber: "341", name: "Vay và nợ thuê tài chính", nameEn: "Borrowings and finance lease liabilities", accountType: AccountType.LIABILITY, accountGroup: AccountGroup.GROUP_3, normalBalance: NormalBalance.CREDIT, level: 1, isSystemAccount: true },

  // ============ LOẠI 4: VỐN CHỦ SỞ HỮU ============
  { accountNumber: "411", name: "Vốn đầu tư của chủ sở hữu", nameEn: "Owner's equity", accountType: AccountType.EQUITY, accountGroup: AccountGroup.GROUP_4, normalBalance: NormalBalance.CREDIT, level: 1, isSystemAccount: true },
  { accountNumber: "421", name: "Lợi nhuận sau thuế chưa phân phối", nameEn: "Retained earnings", accountType: AccountType.EQUITY, accountGroup: AccountGroup.GROUP_4, normalBalance: NormalBalance.CREDIT, level: 1, isSystemAccount: true },
  { accountNumber: "4211", name: "Lợi nhuận sau thuế chưa phân phối năm trước", nameEn: "Prior year retained earnings", accountType: AccountType.EQUITY, accountGroup: AccountGroup.GROUP_4, normalBalance: NormalBalance.CREDIT, level: 2, parentAccount: "421", isSystemAccount: true },
  { accountNumber: "4212", name: "Lợi nhuận sau thuế chưa phân phối năm nay", nameEn: "Current year retained earnings", accountType: AccountType.EQUITY, accountGroup: AccountGroup.GROUP_4, normalBalance: NormalBalance.CREDIT, level: 2, parentAccount: "421", isSystemAccount: true },

  // ============ LOẠI 5: DOANH THU ============
  { accountNumber: "511", name: "Doanh thu bán hàng và cung cấp dịch vụ", nameEn: "Revenue", accountType: AccountType.REVENUE, accountGroup: AccountGroup.GROUP_5, normalBalance: NormalBalance.CREDIT, level: 1, isSystemAccount: true },
  { accountNumber: "5111", name: "Doanh thu bán hàng hóa", nameEn: "Revenue from goods", accountType: AccountType.REVENUE, accountGroup: AccountGroup.GROUP_5, normalBalance: NormalBalance.CREDIT, level: 2, parentAccount: "511", isSystemAccount: true },
  { accountNumber: "5112", name: "Doanh thu bán thành phẩm", nameEn: "Revenue from finished goods", accountType: AccountType.REVENUE, accountGroup: AccountGroup.GROUP_5, normalBalance: NormalBalance.CREDIT, level: 2, parentAccount: "511", isSystemAccount: true },
  { accountNumber: "5113", name: "Doanh thu cung cấp dịch vụ", nameEn: "Revenue from services", accountType: AccountType.REVENUE, accountGroup: AccountGroup.GROUP_5, normalBalance: NormalBalance.CREDIT, level: 2, parentAccount: "511", isSystemAccount: true },
  { accountNumber: "515", name: "Doanh thu hoạt động tài chính", nameEn: "Financial income", accountType: AccountType.REVENUE, accountGroup: AccountGroup.GROUP_5, normalBalance: NormalBalance.CREDIT, level: 1, isSystemAccount: true },
  { accountNumber: "521", name: "Các khoản giảm trừ doanh thu", nameEn: "Revenue deductions", accountType: AccountType.CONTRA_REVENUE, accountGroup: AccountGroup.GROUP_5, normalBalance: NormalBalance.DEBIT, level: 1, isSystemAccount: true },

  // ============ LOẠI 6: CHI PHÍ SẢN XUẤT KINH DOANH ============
  { accountNumber: "621", name: "Chi phí nguyên vật liệu trực tiếp", nameEn: "Direct materials", accountType: AccountType.EXPENSE, accountGroup: AccountGroup.GROUP_6, normalBalance: NormalBalance.DEBIT, level: 1, isSystemAccount: true },
  { accountNumber: "622", name: "Chi phí nhân công trực tiếp", nameEn: "Direct labor", accountType: AccountType.EXPENSE, accountGroup: AccountGroup.GROUP_6, normalBalance: NormalBalance.DEBIT, level: 1, isSystemAccount: true },
  { accountNumber: "623", name: "Chi phí sử dụng máy thi công", nameEn: "Machine costs", accountType: AccountType.EXPENSE, accountGroup: AccountGroup.GROUP_6, normalBalance: NormalBalance.DEBIT, level: 1, isSystemAccount: true },
  { accountNumber: "627", name: "Chi phí sản xuất chung", nameEn: "Manufacturing overhead", accountType: AccountType.EXPENSE, accountGroup: AccountGroup.GROUP_6, normalBalance: NormalBalance.DEBIT, level: 1, isSystemAccount: true },
  { accountNumber: "632", name: "Giá vốn hàng bán", nameEn: "Cost of goods sold", accountType: AccountType.EXPENSE, accountGroup: AccountGroup.GROUP_6, normalBalance: NormalBalance.DEBIT, level: 1, isSystemAccount: true },
  { accountNumber: "635", name: "Chi phí tài chính", nameEn: "Financial expenses", accountType: AccountType.EXPENSE, accountGroup: AccountGroup.GROUP_6, normalBalance: NormalBalance.DEBIT, level: 1, isSystemAccount: true },
  { accountNumber: "641", name: "Chi phí bán hàng", nameEn: "Selling expenses", accountType: AccountType.EXPENSE, accountGroup: AccountGroup.GROUP_6, normalBalance: NormalBalance.DEBIT, level: 1, isSystemAccount: true },
  { accountNumber: "642", name: "Chi phí quản lý doanh nghiệp", nameEn: "General & admin expenses", accountType: AccountType.EXPENSE, accountGroup: AccountGroup.GROUP_6, normalBalance: NormalBalance.DEBIT, level: 1, isSystemAccount: true },

  // ============ LOẠI 7: THU NHẬP KHÁC ============
  { accountNumber: "711", name: "Thu nhập khác", nameEn: "Other income", accountType: AccountType.REVENUE, accountGroup: AccountGroup.GROUP_7, normalBalance: NormalBalance.CREDIT, level: 1, isSystemAccount: true },

  // ============ LOẠI 8: CHI PHÍ KHÁC ============
  { accountNumber: "811", name: "Chi phí khác", nameEn: "Other expenses", accountType: AccountType.EXPENSE, accountGroup: AccountGroup.GROUP_8, normalBalance: NormalBalance.DEBIT, level: 1, isSystemAccount: true },
  { accountNumber: "821", name: "Chi phí thuế TNDN", nameEn: "CIT expense", accountType: AccountType.EXPENSE, accountGroup: AccountGroup.GROUP_8, normalBalance: NormalBalance.DEBIT, level: 1, isSystemAccount: true },

  // ============ LOẠI 9: XÁC ĐỊNH KẾT QUẢ KINH DOANH ============
  { accountNumber: "911", name: "Xác định kết quả kinh doanh", nameEn: "Profit & Loss summary", accountType: AccountType.EQUITY, accountGroup: AccountGroup.GROUP_9, normalBalance: NormalBalance.CREDIT, level: 1, isSystemAccount: true },
];

/** Get account by number */
export function getAccount(accountNumber: string): VASAccount | undefined {
  return VAS_TT200_ACCOUNTS.find(a => a.accountNumber === accountNumber);
}

/** Get all child accounts of a parent */
export function getChildAccounts(parentAccountNumber: string): VASAccount[] {
  return VAS_TT200_ACCOUNTS.filter(a => a.parentAccount === parentAccountNumber);
}

/** Get all accounts in a group */
export function getAccountsByGroup(group: AccountGroup): VASAccount[] {
  return VAS_TT200_ACCOUNTS.filter(a => a.accountGroup === group);
}

/** Get all accounts by type */
export function getAccountsByType(type: AccountType): VASAccount[] {
  return VAS_TT200_ACCOUNTS.filter(a => a.accountType === type);
}

/** Validate double-entry: total debits must equal total credits */
export function validateDoubleEntry(
  lines: Array<{ debitAmount: number; creditAmount: number }>
): { valid: boolean; totalDebit: number; totalCredit: number; difference: number } {
  const totalDebit = lines.reduce((sum, l) => sum + l.debitAmount, 0);
  const totalCredit = lines.reduce((sum, l) => sum + l.creditAmount, 0);
  const difference = Math.abs(totalDebit - totalCredit);
  return { valid: difference < 1, totalDebit, totalCredit, difference };
}
