/**
 * Vietnamese Currency (VNĐ) Formatting & Conversion
 */

const CURRENCY_SYMBOL = "₫";
const THOUSANDS_SEPARATOR = ".";
const DECIMAL_SEPARATOR = ",";

/** Format amount as VND: 1234567 => "1.234.567 ₫" */
export function formatVND(amount: number): string {
  if (!Number.isFinite(amount)) throw new Error("Amount must be a finite number");
  const rounded = Math.round(amount);
  const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, THOUSANDS_SEPARATOR);
  return `${formatted} ${CURRENCY_SYMBOL}`;
}

/** Format with decimals: 1234567.89 => "1.234.567,89 ₫" */
export function formatVNDWithDecimals(amount: number, decimals: number = 0): string {
  if (!Number.isFinite(amount)) throw new Error("Amount must be a finite number");
  const fixed = amount.toFixed(decimals);
  const [intPart, decPart] = fixed.split(".");
  const formatted = parseInt(intPart, 10).toString().replace(/\B(?=(\d{3})+(?!\d))/g, THOUSANDS_SEPARATOR);
  if (decimals === 0) return `${formatted} ${CURRENCY_SYMBOL}`;
  return `${formatted}${DECIMAL_SEPARATOR}${decPart} ${CURRENCY_SYMBOL}`;
}

/** Compact format for large amounts: 1500000 => "1.5 triệu" */
export function formatVNDCompact(amount: number): string {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)} tỷ`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)} triệu`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)} nghìn`;
  return formatVND(amount);
}

/** Vietnamese number-to-words arrays */
const ONES = ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
const TENS = ["", "mười", "hai mươi", "ba mươi", "bốn mươi", "năm mươi", "sáu mươi", "bảy mươi", "tám mươi", "chín mươi"];
const SCALE = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];

function convertChunk(num: number): string {
  if (num === 0) return "";
  const parts: string[] = [];
  const hundreds = Math.floor(num / 100);
  if (hundreds > 0) parts.push(`${ONES[hundreds]} trăm`);
  const remainder = num % 100;
  if (remainder > 0) {
    if (remainder < 10) {
      if (hundreds > 0) parts.push("lẻ");
      parts.push(ONES[remainder]);
    } else if (remainder === 10) {
      parts.push("mười");
    } else if (remainder < 20) {
      parts.push(`mười ${ONES[remainder - 10]}`);
    } else {
      const tens = Math.floor(remainder / 10);
      const ones = remainder % 10;
      parts.push(TENS[tens]);
      if (ones === 1) parts.push("mốt");
      else if (ones === 5) parts.push("lăm");
      else if (ones > 0) parts.push(ONES[ones]);
    }
  }
  return parts.join(" ");
}

/** Convert number to Vietnamese words: 1234567 => "Một triệu hai trăm ba mươi bốn nghìn năm trăm sáu mươi bảy đồng" */
export function numberToWordsVN(amount: number): string {
  if (!Number.isInteger(amount) || amount < 0) throw new Error("Amount must be a non-negative integer");
  if (amount === 0) return "Không đồng";
  const parts: string[] = [];
  let remaining = amount;
  let scale = 0;
  while (remaining > 0 && scale < SCALE.length) {
    const chunk = remaining % 1000;
    if (chunk !== 0) {
      const chunkWords = convertChunk(chunk);
      parts.unshift(scale > 0 ? `${chunkWords} ${SCALE[scale]}` : chunkWords);
    }
    remaining = Math.floor(remaining / 1000);
    scale++;
  }
  const result = parts.join(" ").trim();
  return result.charAt(0).toUpperCase() + result.slice(1) + " đồng";
}

/** Parse VND formatted string: "1.234.567 ₫" => 1234567 */
export function parseVND(formatted: string): number {
  if (!formatted) throw new Error("Input must be a non-empty string");
  let cleaned = formatted.replace(CURRENCY_SYMBOL, "").replace(/\s/g, "").trim();
  cleaned = cleaned.replace(new RegExp("\\" + THOUSANDS_SEPARATOR, "g"), "");
  cleaned = cleaned.replace(DECIMAL_SEPARATOR, ".");
  const parsed = parseFloat(cleaned);
  if (!Number.isFinite(parsed) || parsed < 0) throw new Error("Invalid number format");
  return Math.round(parsed);
}

/** Convert currency at exchange rate */
export function convertCurrency(amount: number, exchangeRate: number): number {
  if (amount < 0 || exchangeRate <= 0) throw new Error("Invalid amount or exchange rate");
  return Math.round(amount * exchangeRate);
}
