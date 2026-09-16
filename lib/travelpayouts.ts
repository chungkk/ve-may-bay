// ============================================
// Travelpayouts API Client
// ============================================

import type {
  TravelpayoutsCheapResponse,
  TravelpayoutsMonthMatrixResponse,
  FlightResult,
  PriceCalendarDay,
} from './types';
import { generateAffiliateLink } from './affiliate';

const API_BASE = 'https://api.travelpayouts.com';
const API_TOKEN = process.env.TRAVELPAYOUTS_API_TOKEN || '';

interface FetchOptions {
  origin: string;
  destination: string;
  departDate?: string;
  returnDate?: string;
  currency?: string;
}

/**
 * Fetch cheapest tickets from Travelpayouts
 */
export async function fetchCheapTickets(options: FetchOptions): Promise<FlightResult[]> {
  const { origin, destination, departDate, returnDate, currency = 'EUR' } = options;

  const params = new URLSearchParams({
    origin,
    destination,
    currency,
    token: API_TOKEN,
  });

  if (departDate) params.set('depart_date', departDate);
  if (returnDate) params.set('return_date', returnDate);

  const url = `${API_BASE}/v1/prices/cheap?${params.toString()}`;

  const response = await fetch(url, {
    headers: {
      'Accept-Encoding': 'gzip, deflate',
    },
    next: { revalidate: 1800 }, // Cache for 30 minutes
  });

  if (!response.ok) {
    console.error(`Travelpayouts API error: ${response.status} for ${origin} → ${destination}`);
    return [];
  }

  const data: TravelpayoutsCheapResponse = await response.json();

  if (!data.success || !data.data) {
    return [];
  }

  const results: FlightResult[] = [];
  const destData = data.data[destination];

  if (destData) {
    Object.entries(destData).forEach(([stopKey, ticket]) => {
      const stops = parseInt(stopKey);
      results.push({
        id: `${origin}-${destination}-${stops}-${ticket.departure_at}`,
        origin,
        destination,
        price: ticket.price,
        currency,
        airline: ticket.airline,
        flightNumber: ticket.flight_number,
        departureAt: ticket.departure_at,
        returnAt: ticket.return_at,
        expiresAt: ticket.expires_at,
        stops,
        foundAt: new Date().toISOString(),
        affiliateUrl: generateAffiliateLink(
          origin,
          destination,
          ticket.departure_at,
          ticket.return_at
        ),
      });
    });
  }

  // Sort by price
  results.sort((a, b) => a.price - b.price);

  return results;
}

/**
 * Fetch month price matrix from Travelpayouts
 */
export async function fetchMonthMatrix(options: FetchOptions): Promise<PriceCalendarDay[]> {
  const { origin, destination, departDate, currency = 'EUR' } = options;

  // departDate should be in YYYY-MM-DD format (first day of month)
  const month = departDate || new Date().toISOString().slice(0, 7) + '-01';

  const params = new URLSearchParams({
    origin,
    destination,
    month,
    currency,
    show_to_affiliates: 'true',
    token: API_TOKEN,
  });

  const url = `${API_BASE}/v2/prices/month-matrix?${params.toString()}`;

  const response = await fetch(url, {
    headers: {
      'Accept-Encoding': 'gzip, deflate',
    },
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!response.ok) {
    console.error(`Travelpayouts calendar API error: ${response.status} for ${origin} → ${destination}`);
    return [];
  }

  const data: TravelpayoutsMonthMatrixResponse = await response.json();

  if (!data.success || !data.data) {
    return [];
  }

  return data.data.map((item) => ({
    date: item.depart_date,
    price: item.value,
    origin: item.origin,
    destination: item.destination,
    stops: item.number_of_changes,
    isActual: item.actual,
  }));
}

/**
 * Fetch cheapest tickets for multiple popular routes
 * Used on homepage
 */
export async function fetchPopularRoutePrices(
  routes: Array<{ origin: string; destination: string }>,
  currency: string = 'EUR'
): Promise<Record<string, FlightResult | null>> {
  const results: Record<string, FlightResult | null> = {};

  // Fetch in parallel but respect rate limits (max 5 concurrent)
  const chunks: Array<Array<{ origin: string; destination: string }>> = [];
  for (let i = 0; i < routes.length; i += 5) {
    chunks.push(routes.slice(i, i + 5));
  }

  for (const chunk of chunks) {
    const promises = chunk.map(async (route) => {
      const key = `${route.origin}-${route.destination}`;
      try {
        const tickets = await fetchCheapTickets({
          origin: route.origin,
          destination: route.destination,
          currency,
        });
        results[key] = tickets.length > 0 ? tickets[0] : null;
      } catch {
        results[key] = null;
      }
    });

    await Promise.all(promises);
  }

  return results;
}
