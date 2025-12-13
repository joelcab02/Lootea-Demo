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

/**
 * Format odds/probability for display
 * Handles very small percentages - never shows "0.0000%"
 * 
 * @param odds - The odds value as a percentage (e.g., 0.00167 means 0.00167%)
 * @returns Formatted odds string with % suffix
 * 
 * @example
 * formatOdds(99.72) // "99.7%"
 * formatOdds(0.0835) // "0.08%"
 * formatOdds(0.00982) // "0.0098%"
 * formatOdds(0.00167) // "0.0017%"
 * formatOdds(0.00001) // "< 0.001%"
 */
export function formatOdds(odds: number): string {
  if (odds >= 10) {
    return `${odds.toFixed(1)}%`;
  } else if (odds >= 1) {
    return `${odds.toFixed(2)}%`;
  } else if (odds >= 0.1) {
    return `${odds.toFixed(2)}%`;
  } else if (odds >= 0.01) {
    return `${odds.toFixed(3)}%`;
  } else if (odds >= 0.001) {
    return `${odds.toFixed(4)}%`;
  } else if (odds > 0) {
    // For extremely small odds, check if it would round to zero
    const formatted = odds.toFixed(5);
    if (parseFloat(formatted) === 0) {
      return '< 0.001%';
    }
    return `${odds.toFixed(5)}%`;
  }
  return '0%';
}
