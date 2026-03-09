// src/lib/locale.ts
// Browser locale to CurrencyCode detection utility
import type { CurrencyCode } from '../types'

/**
 * Detects the preferred currency from the browser's navigator.language.
 *
 * Mapping:
 *   ja / ja-* → JPY
 *   en-US     → USD
 *   all others → KRW (default, including SSR where navigator is undefined)
 */
export function detectCurrencyFromLocale(): CurrencyCode {
  if (typeof navigator === 'undefined') return 'KRW'

  const locale = navigator.language || 'ko'

  if (locale.startsWith('ja')) return 'JPY'
  if (locale === 'en-US' || locale.startsWith('en-US')) return 'USD'

  return 'KRW'
}
