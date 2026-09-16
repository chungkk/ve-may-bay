// ============================================
// Airport & City Data for German ↔ Vietnam routes
// ============================================

export interface Airport {
  code: string;
  name_vi: string;
  name_de: string;
  city_vi: string;
  city_de: string;
  country_vi: string;
  country_de: string;
  country_code: string;
}

// German airports
export const GERMAN_AIRPORTS: Airport[] = [
  { code: 'FRA', name_vi: 'Sân bay Frankfurt', name_de: 'Flughafen Frankfurt', city_vi: 'Frankfurt', city_de: 'Frankfurt am Main', country_vi: 'Đức', country_de: 'Deutschland', country_code: 'DE' },
  { code: 'MUC', name_vi: 'Sân bay Munich', name_de: 'Flughafen München', city_vi: 'Munich', city_de: 'München', country_vi: 'Đức', country_de: 'Deutschland', country_code: 'DE' },
  { code: 'BER', name_vi: 'Sân bay Berlin Brandenburg', name_de: 'Flughafen Berlin Brandenburg', city_vi: 'Berlin', city_de: 'Berlin', country_vi: 'Đức', country_de: 'Deutschland', country_code: 'DE' },
  { code: 'DUS', name_vi: 'Sân bay Düsseldorf', name_de: 'Flughafen Düsseldorf', city_vi: 'Düsseldorf', city_de: 'Düsseldorf', country_vi: 'Đức', country_de: 'Deutschland', country_code: 'DE' },
  { code: 'HAM', name_vi: 'Sân bay Hamburg', name_de: 'Flughafen Hamburg', city_vi: 'Hamburg', city_de: 'Hamburg', country_vi: 'Đức', country_de: 'Deutschland', country_code: 'DE' },
  { code: 'STR', name_vi: 'Sân bay Stuttgart', name_de: 'Flughafen Stuttgart', city_vi: 'Stuttgart', city_de: 'Stuttgart', country_vi: 'Đức', country_de: 'Deutschland', country_code: 'DE' },
  { code: 'CGN', name_vi: 'Sân bay Cologne/Bonn', name_de: 'Flughafen Köln/Bonn', city_vi: 'Cologne', city_de: 'Köln', country_vi: 'Đức', country_de: 'Deutschland', country_code: 'DE' },
  { code: 'HAJ', name_vi: 'Sân bay Hannover', name_de: 'Flughafen Hannover', city_vi: 'Hannover', city_de: 'Hannover', country_vi: 'Đức', country_de: 'Deutschland', country_code: 'DE' },
  { code: 'NUE', name_vi: 'Sân bay Nuremberg', name_de: 'Flughafen Nürnberg', city_vi: 'Nuremberg', city_de: 'Nürnberg', country_vi: 'Đức', country_de: 'Deutschland', country_code: 'DE' },
  { code: 'LEJ', name_vi: 'Sân bay Leipzig', name_de: 'Flughafen Leipzig/Halle', city_vi: 'Leipzig', city_de: 'Leipzig', country_vi: 'Đức', country_de: 'Deutschland', country_code: 'DE' },
];

// Vietnamese airports
export const VIETNAM_AIRPORTS: Airport[] = [
  { code: 'SGN', name_vi: 'Sân bay Tân Sơn Nhất', name_de: 'Flughafen Tan Son Nhat', city_vi: 'TP. Hồ Chí Minh', city_de: 'Ho-Chi-Minh-Stadt', country_vi: 'Việt Nam', country_de: 'Vietnam', country_code: 'VN' },
  { code: 'HAN', name_vi: 'Sân bay Nội Bài', name_de: 'Flughafen Noi Bai', city_vi: 'Hà Nội', city_de: 'Hanoi', country_vi: 'Việt Nam', country_de: 'Vietnam', country_code: 'VN' },
  { code: 'DAD', name_vi: 'Sân bay Đà Nẵng', name_de: 'Flughafen Da Nang', city_vi: 'Đà Nẵng', city_de: 'Da Nang', country_vi: 'Việt Nam', country_de: 'Vietnam', country_code: 'VN' },
  { code: 'CXR', name_vi: 'Sân bay Cam Ranh', name_de: 'Flughafen Cam Ranh', city_vi: 'Nha Trang', city_de: 'Nha Trang', country_vi: 'Việt Nam', country_de: 'Vietnam', country_code: 'VN' },
  { code: 'PQC', name_vi: 'Sân bay Phú Quốc', name_de: 'Flughafen Phu Quoc', city_vi: 'Phú Quốc', city_de: 'Phu Quoc', country_vi: 'Việt Nam', country_de: 'Vietnam', country_code: 'VN' },
  { code: 'HUI', name_vi: 'Sân bay Phú Bài', name_de: 'Flughafen Phu Bai', city_vi: 'Huế', city_de: 'Hue', country_vi: 'Việt Nam', country_de: 'Vietnam', country_code: 'VN' },
];

// Popular European destinations (from Germany)
export const EUROPE_AIRPORTS: Airport[] = [
  { code: 'BKK', name_vi: 'Sân bay Suvarnabhumi', name_de: 'Flughafen Suvarnabhumi', city_vi: 'Bangkok', city_de: 'Bangkok', country_vi: 'Thái Lan', country_de: 'Thailand', country_code: 'TH' },
  { code: 'ICN', name_vi: 'Sân bay Incheon', name_de: 'Flughafen Incheon', city_vi: 'Seoul', city_de: 'Seoul', country_vi: 'Hàn Quốc', country_de: 'Südkorea', country_code: 'KR' },
  { code: 'NRT', name_vi: 'Sân bay Narita', name_de: 'Flughafen Narita', city_vi: 'Tokyo', city_de: 'Tokio', country_vi: 'Nhật Bản', country_de: 'Japan', country_code: 'JP' },
  { code: 'SIN', name_vi: 'Sân bay Changi', name_de: 'Flughafen Changi', city_vi: 'Singapore', city_de: 'Singapur', country_vi: 'Singapore', country_de: 'Singapur', country_code: 'SG' },
  { code: 'IST', name_vi: 'Sân bay Istanbul', name_de: 'Flughafen Istanbul', city_vi: 'Istanbul', city_de: 'Istanbul', country_vi: 'Thổ Nhĩ Kỳ', country_de: 'Türkei', country_code: 'TR' },
  { code: 'BCN', name_vi: 'Sân bay Barcelona', name_de: 'Flughafen Barcelona', city_vi: 'Barcelona', city_de: 'Barcelona', country_vi: 'Tây Ban Nha', country_de: 'Spanien', country_code: 'ES' },
  { code: 'PMI', name_vi: 'Sân bay Palma de Mallorca', name_de: 'Flughafen Palma de Mallorca', city_vi: 'Mallorca', city_de: 'Mallorca', country_vi: 'Tây Ban Nha', country_de: 'Spanien', country_code: 'ES' },
  { code: 'AYT', name_vi: 'Sân bay Antalya', name_de: 'Flughafen Antalya', city_vi: 'Antalya', city_de: 'Antalya', country_vi: 'Thổ Nhĩ Kỳ', country_de: 'Türkei', country_code: 'TR' },
];

// All airports combined
export const ALL_AIRPORTS: Airport[] = [
  ...GERMAN_AIRPORTS,
  ...VIETNAM_AIRPORTS,
  ...EUROPE_AIRPORTS,
];

// Popular routes (pre-defined)
export interface PopularRoute {
  origin: string;
  destination: string;
  emoji: string;
  label_vi: string;
  label_de: string;
}

export const POPULAR_ROUTES: PopularRoute[] = [
  { origin: 'FRA', destination: 'SGN', emoji: '🇻🇳', label_vi: 'Frankfurt → Sài Gòn', label_de: 'Frankfurt → Ho-Chi-Minh-Stadt' },
  { origin: 'FRA', destination: 'HAN', emoji: '🇻🇳', label_vi: 'Frankfurt → Hà Nội', label_de: 'Frankfurt → Hanoi' },
  { origin: 'MUC', destination: 'SGN', emoji: '🇻🇳', label_vi: 'Munich → Sài Gòn', label_de: 'München → Ho-Chi-Minh-Stadt' },
  { origin: 'BER', destination: 'SGN', emoji: '🇻🇳', label_vi: 'Berlin → Sài Gòn', label_de: 'Berlin → Ho-Chi-Minh-Stadt' },
  { origin: 'BER', destination: 'HAN', emoji: '🇻🇳', label_vi: 'Berlin → Hà Nội', label_de: 'Berlin → Hanoi' },
  { origin: 'FRA', destination: 'DAD', emoji: '🇻🇳', label_vi: 'Frankfurt → Đà Nẵng', label_de: 'Frankfurt → Da Nang' },
  { origin: 'FRA', destination: 'BKK', emoji: '🇹🇭', label_vi: 'Frankfurt → Bangkok', label_de: 'Frankfurt → Bangkok' },
  { origin: 'FRA', destination: 'ICN', emoji: '🇰🇷', label_vi: 'Frankfurt → Seoul', label_de: 'Frankfurt → Seoul' },
];

// Airline info
export interface AirlineInfo {
  code: string;
  name: string;
  logo_url: string;
}

export const AIRLINES: Record<string, AirlineInfo> = {
  'VN': { code: 'VN', name: 'Vietnam Airlines', logo_url: 'https://pics.avs.io/70/70/VN.png' },
  'VJ': { code: 'VJ', name: 'VietJet Air', logo_url: 'https://pics.avs.io/70/70/VJ.png' },
  'QH': { code: 'QH', name: 'Bamboo Airways', logo_url: 'https://pics.avs.io/70/70/QH.png' },
  'LH': { code: 'LH', name: 'Lufthansa', logo_url: 'https://pics.avs.io/70/70/LH.png' },
  'TK': { code: 'TK', name: 'Turkish Airlines', logo_url: 'https://pics.avs.io/70/70/TK.png' },
  'QR': { code: 'QR', name: 'Qatar Airways', logo_url: 'https://pics.avs.io/70/70/QR.png' },
  'EK': { code: 'EK', name: 'Emirates', logo_url: 'https://pics.avs.io/70/70/EK.png' },
  'SQ': { code: 'SQ', name: 'Singapore Airlines', logo_url: 'https://pics.avs.io/70/70/SQ.png' },
  'CX': { code: 'CX', name: 'Cathay Pacific', logo_url: 'https://pics.avs.io/70/70/CX.png' },
  'KE': { code: 'KE', name: 'Korean Air', logo_url: 'https://pics.avs.io/70/70/KE.png' },
  'BR': { code: 'BR', name: 'EVA Air', logo_url: 'https://pics.avs.io/70/70/BR.png' },
  'CI': { code: 'CI', name: 'China Airlines', logo_url: 'https://pics.avs.io/70/70/CI.png' },
  'EY': { code: 'EY', name: 'Etihad Airways', logo_url: 'https://pics.avs.io/70/70/EY.png' },
  'OZ': { code: 'OZ', name: 'Asiana Airlines', logo_url: 'https://pics.avs.io/70/70/OZ.png' },
};

// Helper: Get airport by code
export function getAirport(code: string): Airport | undefined {
  return ALL_AIRPORTS.find(a => a.code === code);
}

// Helper: Get airline name
export function getAirlineName(code: string): string {
  return AIRLINES[code]?.name || code;
}

// Helper: Get airline logo URL
export function getAirlineLogo(code: string): string {
  return `https://pics.avs.io/70/70/${code}.png`;
}

// Country flag emoji mapping
export const COUNTRY_FLAGS: Record<string, string> = {
  'DE': '🇩🇪',
  'VN': '🇻🇳',
  'TH': '🇹🇭',
  'KR': '🇰🇷',
  'JP': '🇯🇵',
  'SG': '🇸🇬',
  'TR': '🇹🇷',
  'ES': '🇪🇸',
};

// Country group codes for "search all airports in a country"
export const COUNTRY_GROUPS: Record<string, { label_vi: string; flag: string; airports: Airport[] }> = {
  'ALL_DE': { label_vi: 'Tất cả sân bay Đức', flag: '🇩🇪', airports: GERMAN_AIRPORTS },
  'ALL_VN': { label_vi: 'Tất cả sân bay Việt Nam', flag: '🇻🇳', airports: VIETNAM_AIRPORTS },
};

/**
 * Resolve a code (airport or country group) to an array of IATA codes.
 * - "ALL_DE" → ["FRA","MUC","BER",...] 
 * - "ALL_VN" → ["SGN","HAN","DAD",...]
 * - "FRA"    → ["FRA"]
 */
export function resolveAirportCodes(code: string): string[] {
  const group = COUNTRY_GROUPS[code];
  if (group) {
    return group.airports.map(a => a.code);
  }
  return [code];
}

/**
 * Check if a code is a country group
 */
export function isCountryGroup(code: string): boolean {
  return code in COUNTRY_GROUPS;
}
