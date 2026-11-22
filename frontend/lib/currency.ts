export interface CurrencyOption {
  code: string
  label: string
  locale: string
  /** Overrides the Intl symbol where it would be ambiguous (e.g. "$" for CAD). */
  symbol?: string
}

export const DEFAULT_CURRENCY = 'GHS'

export const CURRENCIES: CurrencyOption[] = [
  { code: 'GHS', label: 'Ghanaian Cedi (GH₵)', locale: 'en-GH' },
  { code: 'NGN', label: 'Nigerian Naira (₦)', locale: 'en-NG' },
  { code: 'ZAR', label: 'South African Rand (R)', locale: 'en-ZA' },
  { code: 'KES', label: 'Kenyan Shilling (KSh)', locale: 'en-KE' },
  { code: 'EGP', label: 'Egyptian Pound (E£)', locale: 'en-EG' },
  { code: 'USD', label: 'US Dollar ($)', locale: 'en-US' },
  { code: 'EUR', label: 'Euro (€)', locale: 'de-DE' },
  { code: 'GBP', label: 'British Pound (£)', locale: 'en-GB' },
  { code: 'CAD', label: 'Canadian Dollar (C$)', locale: 'en-CA', symbol: 'C$' },
  { code: 'AUD', label: 'Australian Dollar (A$)', locale: 'en-AU', symbol: 'A$' },
  { code: 'INR', label: 'Indian Rupee (₹)', locale: 'en-IN' },
  { code: 'PKR', label: 'Pakistani Rupee (₨)', locale: 'en-PK' },
  { code: 'AED', label: 'UAE Dirham (د.إ)', locale: 'en-AE' },
  { code: 'SAR', label: 'Saudi Riyal (﷼)', locale: 'en-SA' },
  { code: 'JPY', label: 'Japanese Yen (¥)', locale: 'ja-JP', symbol: '¥' },
  { code: 'CNY', label: 'Chinese Yuan (CN¥)', locale: 'zh-CN', symbol: 'CN¥' },
  { code: 'SGD', label: 'Singapore Dollar (S$)', locale: 'en-SG', symbol: 'S$' },
  { code: 'BRL', label: 'Brazilian Real (R$)', locale: 'pt-BR' },
  { code: 'MXN', label: 'Mexican Peso (MX$)', locale: 'es-MX' },
  { code: 'CHF', label: 'Swiss Franc (CHF)', locale: 'de-CH', symbol: 'CHF ' },
  { code: 'SEK', label: 'Swedish Krona (kr)', locale: 'sv-SE' },
  { code: 'NOK', label: 'Norwegian Krone (kr)', locale: 'nb-NO' },
  { code: 'DKK', label: 'Danish Krone (kr)', locale: 'da-DK' },
  { code: 'PLN', label: 'Polish Zloty (zł)', locale: 'pl-PL' },
  { code: 'ZMW', label: 'Zambian Kwacha (ZK)', locale: 'en-ZM' },
  { code: 'UGX', label: 'Ugandan Shilling (USh)', locale: 'en-UG' },
  { code: 'TZS', label: 'Tanzanian Shilling (TSh)', locale: 'en-TZ' },
]

export function getCurrency(code?: string | null): CurrencyOption {
  return (
    CURRENCIES.find((c) => c.code === code) ||
    CURRENCIES.find((c) => c.code === DEFAULT_CURRENCY)!
  )
}

/**
 * Formats an amount using the business currency, with thousands separators
 * and two decimal places (e.g. 9000 -> "GH¢9,000.00").
 *
 * The symbol comes from the currency's own locale (so GHS renders as GH¢),
 * while the number always uses dot grouping and a dot decimal separator, so
 * amounts read consistently as 9,000.00 regardless of currency.
 */
export function formatCurrency(amount: number, code?: string | null): string {
  const currency = getCurrency(code)
  const value = typeof amount === 'number' && !isNaN(amount) ? amount : 0

  const symbol =
    currency.symbol ??
    new Intl.NumberFormat(currency.locale, { style: 'currency', currency: currency.code })
      .formatToParts(0)
      .find((part) => part.type === 'currency')?.value ??
    currency.code

  const number = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(value))

  return `${value < 0 ? '-' : ''}${symbol}${number}`
}
