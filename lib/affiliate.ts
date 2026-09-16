// ============================================
// Affiliate Link Generator
// Generates Aviasales affiliate links for booking
// ============================================

const AVIASALES_MARKER = process.env.NEXT_PUBLIC_AVIASALES_MARKER || 'YOUR_MARKER';
const AVIASALES_BASE_URL = 'https://www.aviasales.com/search';

/**
 * Generate an Aviasales affiliate link for a flight search
 * Format: https://www.aviasales.com/search/{origin}{dd}{mm}{destination}{dd}{mm}{passengers}?marker={marker}
 * 
 * @param origin - IATA code (e.g., "FRA")
 * @param destination - IATA code (e.g., "SGN")
 * @param departDate - Departure date string (e.g., "2026-12-15")
 * @param returnDate - Optional return date string
 * @param passengers - Number of passengers (default: 1)
 */
export function generateAffiliateLink(
  origin: string,
  destination: string,
  departDate?: string,
  returnDate?: string,
  passengers: number = 1
): string {
  if (!departDate) {
    // No dates specified - just search the route
    return `${AVIASALES_BASE_URL}/${origin}${destination}${passengers}?marker=${AVIASALES_MARKER}`;
  }

  const depart = new Date(departDate);
  const departDD = String(depart.getDate()).padStart(2, '0');
  const departMM = String(depart.getMonth() + 1).padStart(2, '0');

  let searchPath = `${origin}${departDD}${departMM}${destination}`;

  if (returnDate) {
    const ret = new Date(returnDate);
    const retDD = String(ret.getDate()).padStart(2, '0');
    const retMM = String(ret.getMonth() + 1).padStart(2, '0');
    searchPath += `${retDD}${retMM}`;
  }

  searchPath += String(passengers);

  return `${AVIASALES_BASE_URL}/${searchPath}?marker=${AVIASALES_MARKER}`;
}

/**
 * Generate a deep link to a specific ticket on Aviasales
 * Used when we have the exact ticket data from the API
 */
export function generateTicketLink(
  origin: string,
  destination: string,
  departDate: string,
  returnDate?: string
): string {
  return generateAffiliateLink(origin, destination, departDate, returnDate);
}

/**
 * Format price with currency
 */
export function formatPrice(price: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Format date for display
 */
export function formatDate(dateStr: string, locale: 'vi' | 'de' = 'vi'): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Format date for short display (calendar)
 */
export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
  });
}

/**
 * Calculate number of stops from number_of_changes
 */
export function getStopsLabel(stops: number, locale: 'vi' | 'de' = 'vi'): string {
  if (stops === 0) return locale === 'vi' ? 'Bay thẳng' : 'Direktflug';
  if (stops === 1) return locale === 'vi' ? '1 điểm dừng' : '1 Zwischenstopp';
  return locale === 'vi' ? `${stops} điểm dừng` : `${stops} Zwischenstopps`;
}

/**
 * Get price level category for color coding
 */
export function getPriceLevel(price: number, cheapest: number): 'cheap' | 'mid' | 'expensive' {
  const ratio = price / cheapest;
  if (ratio <= 1.1) return 'cheap';
  if (ratio <= 1.5) return 'mid';
  return 'expensive';
}
