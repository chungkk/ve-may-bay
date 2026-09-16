// ============================================
// TypeScript types for flight data
// ============================================

// Travelpayouts API response types
export interface TravelpayoutsTicket {
  price: number;
  airline: string;
  flight_number: number;
  departure_at: string;
  return_at: string;
  expires_at: string;
  number_of_changes: number;
  destination: string;
  origin: string;
  gate: string;
  found_at: string;
}

export interface TravelpayoutsCheapResponse {
  success: boolean;
  data: Record<string, Record<string, TravelpayoutsTicket>>;
  currency: string;
}

export interface TravelpayoutsMonthMatrixItem {
  origin: string;
  destination: string;
  depart_date: string;
  return_date: string;
  number_of_changes: number;
  value: number;
  found_at: string;
  distance: number;
  actual: boolean;
  gate: string;
  show_to_affiliates: boolean;
  trip_class: number;
}

export interface TravelpayoutsMonthMatrixResponse {
  success: boolean;
  data: TravelpayoutsMonthMatrixItem[];
  currency: string;
}

// App-level types
export interface FlightResult {
  id: string;
  origin: string;
  destination: string;
  price: number;
  currency: string;
  airline: string;
  flightNumber: number;
  departureAt: string;
  returnAt: string;
  expiresAt: string;
  stops: number;
  foundAt: string;
  affiliateUrl: string;
}

export interface PriceCalendarDay {
  date: string;
  price: number | null;
  origin: string;
  destination: string;
  stops: number;
  isActual: boolean;
}

export interface SearchParams {
  origin: string;
  destination: string;
  departDate?: string;
  returnDate?: string;
  currency?: string;
}

export interface PriceAlert {
  id: string;
  email: string;
  origin: string;
  destination: string;
  targetPrice: number;
  currency: string;
  departDateFrom: string;
  departDateTo: string;
  isActive: boolean;
  language: 'vi' | 'de';
  createdAt: string;
  lastNotified: string | null;
  notifyCount: number;
}

// i18n types
export type Locale = 'vi' | 'de';

export interface Translation {
  nav: {
    home: string;
    search: string;
    calendar: string;
    alerts: string;
  };
  hero: {
    title: string;
    subtitle: string;
    cta: string;
  };
  search: {
    from: string;
    to: string;
    departDate: string;
    returnDate: string;
    searchBtn: string;
    searching: string;
    results: string;
    noResults: string;
    cheapest: string;
    direct: string;
    stops: string;
    stop: string;
    bookNow: string;
    setAlert: string;
    priceFrom: string;
    perPerson: string;
    roundTrip: string;
    oneWay: string;
  };
  calendar: {
    title: string;
    subtitle: string;
    cheapestDay: string;
    selectMonth: string;
  };
  alert: {
    title: string;
    subtitle: string;
    emailLabel: string;
    targetPrice: string;
    createBtn: string;
    success: string;
    manage: string;
  };
  common: {
    loading: string;
    error: string;
    retry: string;
    currency: string;
    or: string;
    and: string;
    back: string;
    close: string;
    powered: string;
  };
  footer: {
    disclaimer: string;
    copyright: string;
  };
}
