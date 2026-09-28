import {
  AvailabilityStatus,
  LocationCoordinate,
  RideQuote,
  RideServiceAdapter,
  RouteMetrics
} from './types.js';

export class BluSmartServiceAdapter implements RideServiceAdapter {
  public provider: 'blusmart' = 'blusmart';
  private apiKey?: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.BLUSMART_API_KEY;
    this.baseUrl = process.env.BLUSMART_API_BASE_URL || 'https://api.blu-smart.com/v1';
  }

  public isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  public async getQuotes(
    origin: LocationCoordinate,
    destination: LocationCoordinate,
    route: RouteMetrics
  ): Promise<RideQuote[]> {
    if (this.isConfigured()) {
      return this.fetchLiveQuotes(origin, destination, route);
    }
    return this.generateDemoQuotes(origin, destination, route);
  }

  private async fetchLiveQuotes(
    origin: LocationCoordinate,
    destination: LocationCoordinate,
    route: RouteMetrics
  ): Promise<RideQuote[]> {
    try {
      const response = await fetch(`${this.baseUrl}/rides/estimate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          pickup_lat: origin.lat,
          pickup_lng: origin.lng,
          drop_lat: destination.lat,
          drop_lng: destination.lng
        })
      });

      if (!response.ok) throw new Error(`Status ${response.status}`);
      const data = await response.json();
      return (data.fares || []).map((f: any) => ({
        id: `blu-${f.category_id}`,
        provider: 'blusmart',
        providerName: 'BluSmart EV',
        category: 'cab',
        tierName: f.title || 'BluSmart EV Sedan',
        description: '100% Electric AC cab. Zero surge, zero driver cancellations.',
        fareInr: Math.round(f.total_fare),
        pickupEtaMinutes: f.eta || 6,
        totalJourneyMinutes: Math.round(route.durationMinutes),
        distanceKm: route.distanceKm,
        availability: 'AVAILABLE' as AvailabilityStatus,
        isDemoEstimate: false,
        disclaimer: 'Live quote from BluSmart EV platform.',
        bookingUrl: 'https://blu-smart.com',
        deepLinkUrl: 'https://blu-smart.com',
        isElectric: true,
        capacity: { seats: 4, luggage: 2 },
        updatedAt: new Date().toISOString()
      }));
    } catch {
      return this.generateDemoQuotes(origin, destination, route);
    }
  }

  private generateDemoQuotes(
    origin: LocationCoordinate,
    destination: LocationCoordinate,
    route: RouteMetrics
  ): RideQuote[] {
    const dist = Math.max(0.8, route.distanceKm);
    const duration = Math.max(3, route.durationMinutes);
    const nowIso = new Date().toISOString();

    // BluSmart Pricing: Transparent, zero-surge electric cab model
    // EV Sedan: Base ₹99 (includes 3km) + ₹19.5/km, no dynamic surge multiplier ever
    const sedanBase = 99;
    const sedanFare = Math.round(Math.max(120, sedanBase + Math.max(0, dist - 3.0) * 19.5 + duration * 0.8));
    const sedanPickup = Math.min(8, Math.max(4, Math.round(5 + (dist % 3))));

    // EV Premium / XL: Base ₹149 (includes 3km) + ₹24.5/km
    const premiumBase = 149;
    const premiumFare = Math.round(Math.max(180, premiumBase + Math.max(0, dist - 3.0) * 24.5 + duration * 1.1));
    const premiumPickup = Math.min(9, Math.max(5, Math.round(6 + (dist % 4))));

    const webBooking = 'https://blu-smart.com';

    return [
      {
        id: `blu-sedan-${Math.round(dist * 10)}`,
        provider: 'blusmart',
        providerName: 'BluSmart EV',
        category: 'cab',
        tierName: 'BluSmart EV Sedan',
        description: '100% Electric sedan. Guaranteed zero cancellations & zero surge.',
        fareInr: sedanFare,
        fareRange: {
          min: sedanFare,
          max: sedanFare // BluSmart never has surge pricing!
        },
        pickupEtaMinutes: sedanPickup,
        totalJourneyMinutes: Math.round(duration),
        distanceKm: Number(dist.toFixed(1)),
        availability: 'AVAILABLE',
        isDemoEstimate: true,
        disclaimer: 'Demo estimate — not a live fare. Authorization credentials required for live dispatch.',
        bookingUrl: webBooking,
        deepLinkUrl: webBooking,
        isElectric: true,
        capacity: { seats: 4, luggage: 2 },
        breakdown: {
          baseFare: sedanBase,
          perKmFare: 19.5
        },
        updatedAt: nowIso
      },
      {
        id: `blu-premium-${Math.round(dist * 10)}`,
        provider: 'blusmart',
        providerName: 'BluSmart EV',
        category: 'cab',
        tierName: 'BluSmart EV Premium',
        description: 'Spacious electric SUV (BYD / MG). Whisper quiet & zero emission.',
        fareInr: premiumFare,
        fareRange: {
          min: premiumFare,
          max: premiumFare
        },
        pickupEtaMinutes: premiumPickup,
        totalJourneyMinutes: Math.round(duration),
        distanceKm: Number(dist.toFixed(1)),
        availability: 'AVAILABLE',
        isDemoEstimate: true,
        disclaimer: 'Demo estimate — not a live fare. Authorization credentials required for live dispatch.',
        bookingUrl: webBooking,
        deepLinkUrl: webBooking,
        isElectric: true,
        capacity: { seats: 5, luggage: 3 },
        breakdown: {
          baseFare: premiumBase,
          perKmFare: 24.5
        },
        updatedAt: nowIso
      }
    ];
  }
}
