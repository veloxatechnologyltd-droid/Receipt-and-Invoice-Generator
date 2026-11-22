export function parseAmount(value: string | number): number {
  if (typeof value === 'number') return isNaN(value) ? 0 : value

  // Strip everything that is not a digit, dot or minus sign.
  // Lets users type "1,500", "GH₵ 500", "$1,250.75" or " 12.50 " freely.
  const cleaned = value.replace(/[^0-9.-]/g, '')

  if (cleaned === '' || cleaned === '-' || cleaned === '.' || cleaned === '-.') return 0

  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}
