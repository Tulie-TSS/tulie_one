/**
 * E-Invoice Module - Nghị định 123/2020/NĐ-CP
 * Hóa đơn điện tử
 */

import { type EInvoiceData, type EInvoiceItem, VATRate, EInvoiceStatus } from "../types/index";
import { calculateVAT } from "../tax/vat";
import { numberToWordsVN } from "../utils/currency";

/** Generate invoice number with standard format */
export function generateInvoiceNumber(series: string, sequence: number): string {
  return `${series}${sequence.toString().padStart(7, "0")}`;
}

/** Calculate e-invoice item totals */
export function calculateInvoiceItem(
  description: string,
  quantity: number,
  unitPrice: number,
  vatRate: VATRate,
  unit: string = "Cái",
  discount: number = 0,
  itemCode?: string
): EInvoiceItem {
  const amount = Math.round(quantity * unitPrice) - discount;
  const vatAmount = calculateVAT(amount, vatRate);
  const totalAmount = amount + vatAmount;

  return {
    itemCode,
    description,
    quantity,
    unitPrice,
    unit,
    discount,
    vatRate,
    amount,
    vatAmount,
    totalAmount,
  };
}

/** Calculate invoice totals from items */
export function calculateInvoiceTotals(items: EInvoiceItem[]): {
  totalBeforeVAT: number;
  totalVAT: number;
  totalAfterVAT: number;
  amountInWords: string;
} {
  const totalBeforeVAT = items.reduce((sum, item) => sum + item.amount, 0);
  const totalVAT = items.reduce((sum, item) => sum + item.vatAmount, 0);
  const totalAfterVAT = items.reduce((sum, item) => sum + item.totalAmount, 0);

  return {
    totalBeforeVAT,
    totalVAT,
    totalAfterVAT,
    amountInWords: numberToWordsVN(totalAfterVAT),
  };
}

/** Validate e-invoice data before signing */
export function validateEInvoice(invoice: EInvoiceData): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!invoice.seller.name) errors.push("Thiếu tên người bán");
  if (!invoice.seller.taxCode) errors.push("Thiếu MST người bán");
  if (!invoice.seller.address) errors.push("Thiếu địa chỉ người bán");
  if (!invoice.buyer.name) errors.push("Thiếu tên người mua");
  if (!invoice.invoiceNumber) errors.push("Thiếu số hóa đơn");
  if (!invoice.series) errors.push("Thiếu ký hiệu hóa đơn");
  if (invoice.items.length === 0) errors.push("Hóa đơn phải có ít nhất 1 mặt hàng");

  // Validate totals
  const calculated = calculateInvoiceTotals(invoice.items);
  if (Math.abs(calculated.totalAfterVAT - invoice.totalAfterVAT) > 1) {
    errors.push("Tổng tiền không khớp với chi tiết hàng hóa");
  }

  return { valid: errors.length === 0, errors };
}

/** Standard e-invoice templates per NĐ123 */
export const EINVOICE_TEMPLATES = {
  "01GTKT": { name: "Hóa đơn GTGT", description: "Hóa đơn giá trị gia tăng" },
  "02GTTT": { name: "Hóa đơn bán hàng", description: "Hóa đơn bán hàng thông thường" },
  "06HDXK": { name: "Hóa đơn xuất khẩu", description: "Hóa đơn xuất khẩu hàng hóa" },
} as const;

/** Get next invoice status in workflow */
export function getNextInvoiceStatuses(current: EInvoiceStatus): EInvoiceStatus[] {
  const transitions: Record<EInvoiceStatus, EInvoiceStatus[]> = {
    [EInvoiceStatus.DRAFT]: [EInvoiceStatus.SIGNED],
    [EInvoiceStatus.SIGNED]: [EInvoiceStatus.SENT_TO_BUYER, EInvoiceStatus.CANCELLED],
    [EInvoiceStatus.SENT_TO_BUYER]: [EInvoiceStatus.TRANSMITTED, EInvoiceStatus.CANCELLED],
    [EInvoiceStatus.TRANSMITTED]: [EInvoiceStatus.ACCEPTED, EInvoiceStatus.REJECTED],
    [EInvoiceStatus.ACCEPTED]: [EInvoiceStatus.ADJUSTED, EInvoiceStatus.CANCELLED],
    [EInvoiceStatus.REJECTED]: [EInvoiceStatus.DRAFT],
    [EInvoiceStatus.CANCELLED]: [],
    [EInvoiceStatus.ADJUSTED]: [],
    [EInvoiceStatus.REPLACED]: [],
    [EInvoiceStatus.ERROR]: [EInvoiceStatus.DRAFT],
  };
  return transitions[current] ?? [];
}
