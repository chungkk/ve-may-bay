// ============================================
// SerpApi Google Flights Client
// Key rotation + in-memory cache
// ============================================

const SERPAPI_BASE = 'https://serpapi.com/search.json';

// ---- Key Rotation ----
const SERPAPI_KEYS = (process.env.SERPAPI_KEYS || process.env.SERPAPI_KEY || '')
  .split(',')
  .map(k => k.trim())
  .filter(Boolean);

let currentKeyIndex = 0;

function getNextKey(): string {
  if (SERPAPI_KEYS.length === 0) {
    throw new Error('No SerpApi keys configured');
  }
  const key = SERPAPI_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % SERPAPI_KEYS.length;
  return key;
}

// ---- In-Memory Cache ----
const CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

interface CacheEntry {
  data: SerpApiParsedResult;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

function getCacheKey(params: Record<string, string>): string {
  return `${params.departure_id}-${params.arrival_id}-${params.outbound_date}-${params.return_date || 'oneway'}-${params.currency}`;
}

function getFromCache(key: string): SerpApiParsedResult | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: SerpApiParsedResult): void {
  // Limit cache size to 200 entries
  if (cache.size > 200) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
  cache.set(key, { data, timestamp: Date.now() });
}

// ---- Types ----
export interface SerpApiFlightLeg {
  departure_airport: {
    name: string;
    id: string;
    time: string;
  };
  arrival_airport: {
    name: string;
    id: string;
    time: string;
  };
  duration: number;
  airplane: string;
  airline: string;
  airline_logo: string;
  flight_number: string;
  travel_class: string;
  extensions?: string[];
  overnight?: boolean;
  legroom?: string;
}

export interface SerpApiLayover {
  duration: number;
  name: string;
  id: string;
  overnight?: boolean;
}

export interface SerpApiFlight {
  flights: SerpApiFlightLeg[];
  layovers?: SerpApiLayover[];
  total_duration: number;
  price: number;
  type?: string;
  airline_logo?: string;
  extensions?: string[];
  carbon_emissions?: {
    this_flight: number;
    typical_for_this_route: number;
    difference_percent: number;
  };
  booking_token?: string;
}

export interface SerpApiResponse {
  search_metadata: {
    id: string;
    status: string;
    created_at: string;
    total_time_taken: number;
  };
  search_parameters: Record<string, string>;
  best_flights?: SerpApiFlight[];
  other_flights?: SerpApiFlight[];
  price_insights?: {
    lowest_price: number;
    price_level: string;
    typical_price_range: [number, number];
  };
  error?: string;
}

export interface RealTimeFlightResult {
  id: string;
  origin: string;
  originName: string;
  destination: string;
  destinationName: string;
  price: number;
  currency: string;
  departureTime: string;
  arrivalTime: string;
  returnDepartureTime?: string;
  returnArrivalTime?: string;
  totalDuration: number;
  airline: string;
  airlineLogo: string;
  flightNumber: string;
  stops: number;
  layovers: Array<{ city: string; code: string; duration: number }>;
  legs: Array<{
    airline: string;
    airlineLogo: string;
    flightNumber: string;
    from: string;
    fromName: string;
    to: string;
    toName: string;
    departTime: string;
    arriveTime: string;
    duration: number;
    airplane: string;
  }>;
  isBest: boolean;
  bookingToken?: string;
  departDate: string;
  returnDate?: string;
  carbonEmissions?: number;
  baggage?: {
    carryOn?: string;      // e.g. "1x xách tay"
    checkedBag?: string;   // e.g. "1x 23kg" or "Không bao gồm"
    checkedBagFee?: string; // e.g. "€40"
  };
  extensions?: string[];
}

interface SerpApiParsedResult {
  bestFlights: RealTimeFlightResult[];
  otherFlights: RealTimeFlightResult[];
  priceInsights?: {
    lowestPrice: number;
    priceLevel: string;
    typicalRange: [number, number];
  };
  cached: boolean;
}

// ---- Main Search Function ----
export async function searchGoogleFlights(params: {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  currency?: string;
  adults?: number;
  type?: 'round_trip' | 'one_way';
}): Promise<SerpApiParsedResult> {
  const {
    origin,
    destination,
    departDate,
    returnDate,
    currency = 'EUR',
    adults = 1,
    type = returnDate ? 'round_trip' : 'one_way',
  } = params;

  // Check cache first
  const cacheParams = {
    departure_id: origin,
    arrival_id: destination,
    outbound_date: departDate,
    return_date: returnDate || '',
    currency,
  };
  const cacheKey = getCacheKey(cacheParams);
  const cached = getFromCache(cacheKey);

  if (cached) {
    console.log(`[SerpApi] Cache HIT: ${origin} → ${destination} | ${departDate}`);
    return { ...cached, cached: true };
  }

  // Pick next API key (rotation)
  const apiKey = getNextKey();
  const keyIndex = SERPAPI_KEYS.indexOf(apiKey) + 1;

  const searchParams = new URLSearchParams({
    engine: 'google_flights',
    departure_id: origin,
    arrival_id: destination,
    outbound_date: departDate,
    currency,
    hl: 'vi',
    adults: String(adults),
    type: type === 'one_way' ? '2' : '1',
    api_key: apiKey,
  });

  if (returnDate && type === 'round_trip') {
    searchParams.set('return_date', returnDate);
  }

  const url = `${SERPAPI_BASE}?${searchParams.toString()}`;

  console.log(`[SerpApi] Key #${keyIndex}/${SERPAPI_KEYS.length} | ${origin} → ${destination} | ${departDate}${returnDate ? ' → ' + returnDate : ''}`);

  const response = await fetch(url);

  if (!response.ok) {
    // If this key hit rate limit, try next key
    if (response.status === 429 && SERPAPI_KEYS.length > 1) {
      console.log(`[SerpApi] Key #${keyIndex} rate limited, trying next key...`);
      return searchGoogleFlights(params);
    }
    throw new Error(`SerpApi error: ${response.status} ${response.statusText}`);
  }

  const data: SerpApiResponse = await response.json();

  if (data.error) {
    throw new Error(`SerpApi error: ${data.error}`);
  }

  const bestFlights = (data.best_flights || []).map((f, i) =>
    normalizeFlight(f, i, true, currency, departDate, returnDate)
  );
  const otherFlights = (data.other_flights || []).map((f, i) =>
    normalizeFlight(f, i + bestFlights.length, false, currency, departDate, returnDate)
  );

  const result: SerpApiParsedResult = {
    bestFlights,
    otherFlights,
    priceInsights: data.price_insights ? {
      lowestPrice: data.price_insights.lowest_price,
      priceLevel: data.price_insights.price_level,
      typicalRange: data.price_insights.typical_price_range,
    } : undefined,
    cached: false,
  };

  // Save to cache
  setCache(cacheKey, result);
  console.log(`[SerpApi] Cached: ${cacheKey} (cache size: ${cache.size})`);

  return result;
}

// ---- Normalize ----
function normalizeFlight(
  flight: SerpApiFlight,
  index: number,
  isBest: boolean,
  currency: string,
  departDate: string,
  returnDate?: string
): RealTimeFlightResult {
  const firstLeg = flight.flights[0];
  const lastLeg = flight.flights[flight.flights.length - 1];

  const legs = flight.flights.map(leg => ({
    airline: leg.airline,
    airlineLogo: leg.airline_logo,
    flightNumber: leg.flight_number,
    from: leg.departure_airport.id,
    fromName: leg.departure_airport.name,
    to: leg.arrival_airport.id,
    toName: leg.arrival_airport.name,
    departTime: leg.departure_airport.time,
    arriveTime: leg.arrival_airport.time,
    duration: leg.duration,
    airplane: leg.airplane || '',
  }));

  const layovers = (flight.layovers || []).map(l => ({
    city: l.name,
    code: l.id,
    duration: l.duration,
  }));

  // Parse baggage info from extensions
  const allExtensions = [
    ...(flight.extensions || []),
    ...(firstLeg.extensions || []),
  ];
  const baggage = parseBaggageInfo(allExtensions);

  return {
    id: `gf-${index}-${firstLeg.departure_airport.id}-${lastLeg.arrival_airport.id}-${flight.price}`,
    origin: firstLeg.departure_airport.id,
    originName: firstLeg.departure_airport.name,
    destination: lastLeg.arrival_airport.id,
    destinationName: lastLeg.arrival_airport.name,
    price: flight.price,
    currency,
    departureTime: firstLeg.departure_airport.time,
    arrivalTime: lastLeg.arrival_airport.time,
    totalDuration: flight.total_duration,
    airline: firstLeg.airline,
    airlineLogo: firstLeg.airline_logo,
    flightNumber: firstLeg.flight_number,
    stops: flight.flights.length - 1,
    layovers,
    legs,
    isBest,
    bookingToken: flight.booking_token,
    departDate,
    returnDate,
    carbonEmissions: flight.carbon_emissions?.this_flight,
    baggage,
    extensions: allExtensions.length > 0 ? allExtensions : undefined,
  };
}

// ---- Baggage Parser ----
function parseBaggageInfo(extensions: string[]): RealTimeFlightResult['baggage'] {
  if (!extensions || extensions.length === 0) return undefined;

  let carryOn: string | undefined;
  let checkedBag: string | undefined;
  let checkedBagFee: string | undefined;

  for (const ext of extensions) {
    const lower = ext.toLowerCase();

    // Carry-on detection
    if (lower.includes('carry-on') || lower.includes('carry on') || lower.includes('cabin bag') || lower.includes('xách tay') || lower.includes('personal item')) {
      if (lower.includes('no carry-on') || lower.includes('not included')) {
        carryOn = 'Không bao gồm';
      } else {
        carryOn = ext.replace(/included/i, '').trim() || 'Có';
      }
    }

    // Checked bag detection
    if (lower.includes('checked bag') || lower.includes('baggage') || lower.includes('ký gửi')) {
      if (lower.includes('no checked') || lower.includes('not included')) {
        checkedBag = 'Không bao gồm';
      } else {
        // Try to extract weight: "1x50lb", "23kg", "1 checked bag"
        const weightMatch = ext.match(/(\d+)\s*(kg|lb)/i);
        const countMatch = ext.match(/(\d+)\s*(x|×)/i);
        if (weightMatch) {
          const weight = weightMatch[1];
          const unit = weightMatch[2].toLowerCase();
          const count = countMatch ? countMatch[1] : '1';
          checkedBag = `${count}x ${weight}${unit}`;
        } else {
          checkedBag = ext.replace(/included/i, '').trim() || 'Có';
        }
      }
    }

    // Fee detection
    const feeMatch = ext.match(/(\$|€|£|USD|EUR)\s*(\d+)/i) || ext.match(/(\d+)\s*(\$|€|£|USD|EUR)/i);
    if (feeMatch && (lower.includes('bag') || lower.includes('checked'))) {
      checkedBagFee = ext;
    }
  }

  if (!carryOn && !checkedBag && !checkedBagFee) return undefined;

  return { carryOn, checkedBag, checkedBagFee };
}

// ---- Helpers ----
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}p`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}p`;
}

/** Get cache stats */
export function getCacheStats() {
  return {
    size: cache.size,
    keys: SERPAPI_KEYS.length,
    currentKeyIndex: currentKeyIndex + 1,
  };
}
