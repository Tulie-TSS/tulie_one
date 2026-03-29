/**
 * VAT Calculation Module
 * Nghị định 44/2023/NĐ-CP - Vietnamese VAT regulations
 */

import { VATRate } from "../types/index";

/** Calculate VAT amount from a base amount */
export function calculateVAT(amount: number, rate: VATRate): number {
  if (amount < 0) throw new Error("Amount must be non-negative");
  return Math.round((amount * rate) / 100);
}

/** Calculate total amount including VAT */
export function calculateAmountWithVAT(amount: number, rate: VATRate): number {
  if (amount < 0) throw new Error("Amount must be non-negative");
  return amount + calculateVAT(amount, rate);
}

/** Reverse calculate base amount from total (includes VAT) */
export function calculateBaseAmountFromTotal(total: number, rate: VATRate): number {
  if (total < 0) throw new Error("Total must be non-negative");
  if (rate === VATRate.ZERO) return total;
  return Math.round((total * 100) / (100 + rate));
}

/** VAT category mapping */
const VAT_CATEGORY_MAP: Record<string, VATRate> = {
  // Standard 10%
  GENERAL: VATRate.STANDARD,
  RETAIL: VATRate.STANDARD,
  WHOLESALE: VATRate.STANDARD,
  MANUFACTURING: VATRate.STANDARD,
  SERVICES: VATRate.STANDARD,
  TOURISM: VATRate.STANDARD,
  RESTAURANT: VATRate.STANDARD,
  HOTEL: VATRate.STANDARD,
  // Reduced 5%
  AGRICULTURAL_PRODUCTS: VATRate.REDUCED,
  FOOD_PRODUCTS: VATRate.REDUCED,
  MEDICINE: VATRate.REDUCED,
  ANIMAL_FEED: VATRate.REDUCED,
  FERTILIZER: VATRate.REDUCED,
  SEEDS: VATRate.REDUCED,
  // Special 8%
  COAL: VATRate.SPECIAL,
  CIGARETTES: VATRate.SPECIAL,
  BEER: VATRate.SPECIAL,
  SPIRITS: VATRate.SPECIAL,
  // Exempt 0%
  EDUCATION: VATRate.ZERO,
  HEALTHCARE: VATRate.ZERO,
  FINANCIAL_SERVICES: VATRate.ZERO,
  INSURANCE: VATRate.ZERO,
  EXPORT: VATRate.ZERO,
};

/** Get VAT rate for a product/service category */
export function vatRateForCategory(category: string): VATRate {
  return VAT_CATEGORY_MAP[category.toUpperCase()] ?? VATRate.STANDARD;
}

/** Check if a category is VAT exempt */
export function isVATExempt(category: string): boolean {
  return vatRateForCategory(category) === VATRate.ZERO;
}

/** Get all valid VAT rates */
export function getValidVATRates(): VATRate[] {
  return [VATRate.ZERO, VATRate.REDUCED, VATRate.SPECIAL, VATRate.STANDARD];
}

/** Format VAT rate as display string */
export function formatVATRate(rate: VATRate): string {
  return `${rate}%`;
}

/** VAT line item calculation */
export interface LineItemWithVAT {
  amount: number;
  rate: VATRate;
  vatAmount: number;
  totalWithVAT: number;
}

/** Calculate VAT for a single line item */
export function calculateLineItemVAT(amount: number, rate: VATRate): LineItemWithVAT {
  const vatAmount = calculateVAT(amount, rate);
  return { amount, rate, vatAmount, totalWithVAT: amount + vatAmount };
}

/** VAT aggregation result */
export interface VATAggregation {
  totalBeforeVAT: number;
  totalVAT: number;
  totalAfterVAT: number;
}

/** Aggregate VAT across multiple line items */
export function aggregateVAT(items: LineItemWithVAT[]): VATAggregation {
  return {
    totalBeforeVAT: items.reduce((sum, item) => sum + item.amount, 0),
    totalVAT: items.reduce((sum, item) => sum + item.vatAmount, 0),
    totalAfterVAT: items.reduce((sum, item) => sum + item.totalWithVAT, 0),
  };
}

/** Validate VAT totals consistency (allow 1₫ rounding tolerance) */
export function validateVATTotals(aggregation: VATAggregation): { valid: boolean; message?: string } {
  const expected = aggregation.totalBeforeVAT + aggregation.totalVAT;
  const diff = Math.abs(expected - aggregation.totalAfterVAT);
  if (diff > 1) {
    return { valid: false, message: `Chênh lệch VAT: ${expected} vs ${aggregation.totalAfterVAT}` };
  }
  return { valid: true };
}
