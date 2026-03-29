/**
 * Social Insurance Calculation Module
 * BHXH, BHYT, BHTN - per 2024 Vietnamese regulations
 */

import { BASE_SALARY_2024, SOCIAL_INSURANCE_CAP_MULTIPLIER } from "../types/index";

/** Insurance rates as percentage of salary */
export const INSURANCE_RATES = {
  // Employee contribution rates
  employee: {
    bhxh: 8,    // Bảo hiểm xã hội
    bhyt: 1.5,  // Bảo hiểm y tế
    bhtn: 1,    // Bảo hiểm thất nghiệp
  },
  // Employer contribution rates
  employer: {
    bhxh: 17.5,
    bhyt: 3,
    bhtn: 1,
  },
} as const;

/** Maximum salary for BHXH/BHYT contribution */
export const BHXH_SALARY_CAP = BASE_SALARY_2024 * SOCIAL_INSURANCE_CAP_MULTIPLIER; // 20 x 2,340,000 = 46,800,000

/** Maximum salary for BHTN contribution */
export const BHTN_SALARY_CAP = 20 * 4_680_000; // 20 x regional minimum wage (Region 1)

export interface InsuranceCalculation {
  baseSalary: number;
  cappedSalary: number;
  employee: {
    bhxh: number;
    bhyt: number;
    bhtn: number;
    total: number;
  };
  employer: {
    bhxh: number;
    bhyt: number;
    bhtn: number;
    total: number;
  };
  totalContribution: number;
  netSalaryAfterInsurance: number;
}

/** Calculate insurance contributions for an employee */
export function calculateInsurance(grossSalary: number): InsuranceCalculation {
  const cappedSalary = Math.min(grossSalary, BHXH_SALARY_CAP);

  const employee = {
    bhxh: Math.round((cappedSalary * INSURANCE_RATES.employee.bhxh) / 100),
    bhyt: Math.round((cappedSalary * INSURANCE_RATES.employee.bhyt) / 100),
    bhtn: Math.round((Math.min(grossSalary, BHTN_SALARY_CAP) * INSURANCE_RATES.employee.bhtn) / 100),
    total: 0,
  };
  employee.total = employee.bhxh + employee.bhyt + employee.bhtn;

  const employer = {
    bhxh: Math.round((cappedSalary * INSURANCE_RATES.employer.bhxh) / 100),
    bhyt: Math.round((cappedSalary * INSURANCE_RATES.employer.bhyt) / 100),
    bhtn: Math.round((Math.min(grossSalary, BHTN_SALARY_CAP) * INSURANCE_RATES.employer.bhtn) / 100),
    total: 0,
  };
  employer.total = employer.bhxh + employer.bhyt + employer.bhtn;

  return {
    baseSalary: grossSalary,
    cappedSalary,
    employee,
    employer,
    totalContribution: employee.total + employer.total,
    netSalaryAfterInsurance: grossSalary - employee.total,
  };
}

/** Calculate total insurance cost for company (multiple employees) */
export function calculateCompanyInsurance(
  employees: Array<{ name: string; grossSalary: number }>
): {
  employees: Array<{ name: string } & InsuranceCalculation>;
  totals: {
    totalGrossSalary: number;
    totalEmployeeContribution: number;
    totalEmployerContribution: number;
    totalCost: number;
  };
} {
  const results = employees.map(emp => ({
    name: emp.name,
    ...calculateInsurance(emp.grossSalary),
  }));

  const totals = {
    totalGrossSalary: results.reduce((s, e) => s + e.baseSalary, 0),
    totalEmployeeContribution: results.reduce((s, e) => s + e.employee.total, 0),
    totalEmployerContribution: results.reduce((s, e) => s + e.employer.total, 0),
    totalCost: results.reduce((s, e) => s + e.totalContribution, 0),
  };

  return { employees: results, totals };
}
