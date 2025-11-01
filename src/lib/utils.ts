import { type ClassValue } from 'clsx'
// Use optimized imports for better tree-shaking
import { clsx, twMerge } from '$lib/config/tree-shaking'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date to a readable string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(current: number, total: number): number {
  if (total === 0) return 0
  return Math.round((current / total) * 100)
}

/**
 * Format currency values (expects amount in dollars)
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount)
}

/**
 * Convert cents to dollars and format as currency
 * This should be used when displaying prices from the database
 * which are stored in cents (e.g., 8000 cents = $80.00)
 */
export function formatCurrencyFromCents(cents: number | undefined | null, currency = 'USD'): string {
  if (cents === undefined || cents === null || isNaN(cents) || cents === 0) {
    return formatCurrency(0, currency)
  }
  const dollars = cents / 100
  return formatCurrency(dollars, currency)
}

/**
 * Convert cents to dollars (for calculations)
 */
export function centsToDollars(cents: number | undefined | null): number {
  if (cents === undefined || cents === null || isNaN(cents)) {
    return 0
  }
  return cents / 100
}

/**
 * Debounce function for search and input handling
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}