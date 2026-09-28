export type RideCategory = 'bike' | 'auto' | 'cab';
export type AvailabilityStatus = 'AVAILABLE' | 'HIGH_DEMAND' | 'UNAVAILABLE' | 'NOT_VERIFIED';
export type RideProvider = 'rapido' | 'uber' | 'ola' | 'namma_yatri' | 'blusmart';

export interface LocationCoordinate {
  lat: number;
  lng: number;
  address?: string;
}

export interface RouteMetrics {
  distanceKm: number;
  durationMinutes: number;
  summary?: string;
  encodedPolyline?: string;
  polylinePoints?: Array<{ lat: number; lng: number }>;
}

export interface RideQuote {
  id: string;
  provider: RideProvider;
  providerName: string;
  category: RideCategory;
  tierName: string;
  description: string;
  fareInr: number;
  fareRange?: {
    min: number;
    max: number;
  };
  pickupEtaMinutes: number;
  totalJourneyMinutes: number;
  distanceKm: number;
  availability: AvailabilityStatus;
  isDemoEstimate: boolean;
  disclaimer: string;
  bookingUrl: string;
  deepLinkUrl: string;
  capacity?: {
    seats: number;
    luggage?: number;
  };
  isElectric?: boolean;
  breakdown?: {
    baseFare: number;
    perKmFare: number;
    estimatedTollOrSurge?: number;
  };
  updatedAt: string;
}

export interface RideRecommendation {
  cheapest: RideQuote | null;
  fastestPickup: RideQuote | null;
  shortestJourney: RideQuote | null;
}

export interface ComparisonResponse {
  route: RouteMetrics;
  origin: LocationCoordinate;
  destination: LocationCoordinate;
  rides: RideQuote[];
  recommendations: RideRecommendation;
  isDemoMode: boolean;
  notices: string[];
  rushHourActive?: boolean;
  updatedAt: string;
}

export interface ProviderAdapterConfig {
  configured: boolean;
  mode: 'live' | 'demo';
  provider: string;
  supportedCategories: string[];
  requiredEnv: string[];
}

export interface AdapterStatus {
  rapido: ProviderAdapterConfig;
  uber: ProviderAdapterConfig;
  ola: ProviderAdapterConfig;
  namma_yatri: ProviderAdapterConfig;
  blusmart: ProviderAdapterConfig;
}

export interface PopularRoute {
  city: string;
  name: string;
  origin: LocationCoordinate;
  destination: LocationCoordinate;
}
