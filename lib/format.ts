/**
 * Centralized formatting utilities for the application
 * All price and number formatting should use these functions
 */

/**
 * Format a price in MXN currency with proper separators
 * Uses Mexican locale: comma for thousands, period for decimals
 * 
 * @param price - The price value to format
 * @param showDecimals - Whether to show decimal places (default: true)
 * @returns Formatted price string with $ prefix and MXN suffix
 * 
 * @example
 * formatPrice(40999) // "$40,999.00 MXN"
 * formatPrice(40999, false) // "$40,999 MXN"
 */
export function formatPrice(price: number, showDecimals: boolean = true): string {
  const formatted = price.toLocaleString('en-US', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  });
  return `$${formatted} MXN`;
}

/**
 * Format a price value only (without $ and MXN)
 * Useful when you need to construct custom price displays
 * 
 * @param price - The price value to format
 * @param showDecimals - Whether to show decimal places (default: true)
 * @returns Formatted number string with proper separators
 * 
 * @example
 * formatPriceValue(40999) // "40,999.00"
 * formatPriceValue(40999, false) // "40,999"
 */
export function formatPriceValue(price: number, showDecimals: boolean = true): string {
  return price.toLocaleString('en-US', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  });
}

/**
 * Format a number with thousand separators
 * 
 * @param value - The number to format
 * @returns Formatted number string
 * 
 * @example
 * formatNumber(1234567) // "1,234,567"
 */
export function formatNumber(value: number): string {
  return value.toLocaleString('en-US');
}
