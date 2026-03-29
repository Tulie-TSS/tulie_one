/**
 * PIT (Personal Income Tax) Calculation
 * Thuế Thu nhập Cá nhân - Mẫu 05/KK-TNCN
 * Progressive tax brackets per Vietnamese regulations
 */

import { type PITBracket, PERSONAL_DEDUCTION, DEPENDENT_DEDUCTION } from "../types/index";

/** PIT Progressive Tax Brackets (monthly, VND) */
export const PIT_BRACKETS: PITBracket[] = [
  { fromIncome: 0,          toIncome: 5_000_000,    rate: 5,  deductionAmount: 0 },
  { fromIncome: 5_000_000,  toIncome: 10_000_000,   rate: 10, deductionAmount: 250_000 },
  { fromIncome: 10_000_000, toIncome: 18_000_000,   rate: 15, deductionAmount: 750_000 },
  { fromIncome: 18_000_000, toIncome: 32_000_000,   rate: 20, deductionAmount: 1_650_000 },
  { fromIncome: 32_000_000, toIncome: 52_000_000,   rate: 25, deductionAmount: 3_250_000 },
  { fromIncome: 52_000_000, toIncome: 80_000_000,   rate: 30, deductionAmount: 5_850_000 },
  { fromIncome: 80_000_000, toIncome: Infinity,     rate: 35, deductionAmount: 9_850_000 },
];

/** Calculate monthly PIT from gross income */
export function calculateMonthlyPIT(
  grossIncome: number,
  dependents: number = 0,
  otherDeductions: number = 0
): {
  grossIncome: number;
  personalDeduction: number;
  dependentDeduction: number;
  otherDeductions: number;
  taxableIncome: number;
  taxAmount: number;
  effectiveRate: number;
} {
  const personalDeduction = PERSONAL_DEDUCTION;
  const dependentDeduction = dependents * DEPENDENT_DEDUCTION;
  const totalDeductions = personalDeduction + dependentDeduction + otherDeductions;
  const taxableIncome = Math.max(0, grossIncome - totalDeductions);

  let taxAmount = 0;
  for (const bracket of PIT_BRACKETS) {
    if (taxableIncome <= 0) break;
    if (taxableIncome > bracket.fromIncome) {
      const taxableInBracket = Math.min(
        taxableIncome - bracket.fromIncome,
        bracket.toIncome - bracket.fromIncome
      );
      taxAmount += Math.round((taxableInBracket * bracket.rate) / 100);
    }
  }

  const effectiveRate = grossIncome > 0 ? (taxAmount / grossIncome) * 100 : 0;

  return {
    grossIncome,
    personalDeduction,
    dependentDeduction,
    otherDeductions,
    taxableIncome,
    taxAmount: Math.round(taxAmount),
    effectiveRate: Math.round(effectiveRate * 100) / 100,
  };
}

/** Calculate annual PIT */
export function calculateAnnualPIT(
  annualGrossIncome: number,
  dependents: number = 0,
  otherDeductions: number = 0
): ReturnType<typeof calculateMonthlyPIT> {
  const monthlyGross = annualGrossIncome / 12;
  const monthlyOther = otherDeductions / 12;
  const monthly = calculateMonthlyPIT(monthlyGross, dependents, monthlyOther);

  return {
    ...monthly,
    grossIncome: annualGrossIncome,
    personalDeduction: monthly.personalDeduction * 12,
    dependentDeduction: monthly.dependentDeduction * 12,
    otherDeductions,
    taxableIncome: monthly.taxableIncome * 12,
    taxAmount: monthly.taxAmount * 12,
  };
}

/** Get applicable tax bracket for a given taxable income */
export function getTaxBracket(taxableIncome: number): PITBracket | null {
  for (const bracket of PIT_BRACKETS) {
    if (taxableIncome >= bracket.fromIncome && taxableIncome < bracket.toIncome) {
      return bracket;
    }
  }
  return null;
}
