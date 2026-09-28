import {
  AvailabilityStatus,
  LocationCoordinate,
  RideQuote,
  RideServiceAdapter,
  RouteMetrics
} from './types.js';

export class NammaYatriServiceAdapter implements RideServiceAdapter {
  public provider: 'namma_yatri' = 'namma_yatri';
  private apiKey?: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.NAMMA_YATRI_API_KEY;
    this.baseUrl = process.env.NAMMA_YATRI_API_BASE_URL || 'https://api.nammayatri.in/v1';
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
      const response = await fetch(`${this.baseUrl}/ondc/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          start_location: { gps: `${origin.lat},${origin.lng}` },
          end_location: { gps: `${destination.lat},${destination.lng}` }
        })
      });

      if (!response.ok) throw new Error(`Status ${response.status}`);
      const data = await response.json();
      return (data.quotes || []).map((q: any) => ({
        id: `ny-${q.id}`,
        provider: 'namma_yatri',
        providerName: 'Namma Yatri',
        category: q.category === 'AUTO' ? 'auto' : 'cab',
        tierName: q.name || 'Namma Yatri Auto',
        description: 'Direct-to-driver 0% commission ride via Beckn/ONDC.',
        fareInr: Math.round(q.estimated_cost),
        pickupEtaMinutes: q.eta_minutes || 3,
        totalJourneyMinutes: Math.round(route.durationMinutes),
        distanceKm: route.distanceKm,
        availability: 'AVAILABLE' as AvailabilityStatus,
        isDemoEstimate: false,
        disclaimer: 'Live quote from Namma Yatri open mobility protocol.',
        bookingUrl: 'https://nammayatri.in',
        deepLinkUrl: 'https://nammayatri.in',
        capacity: { seats: q.category === 'AUTO' ? 3 : 4 },
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

    // Namma Yatri follows government regulated meter rate with zero platform commission
    // Standard Auto: Base ₹30 for first 2 km, then ₹15/km, no middleman cut.
    const autoBase = 30;
    const autoFare = Math.round(Math.max(30, autoBase + Math.max(0, dist - 2.0) * 14.2));
    const autoPickup = Math.min(5, Math.max(2, Math.round(2 + (dist % 3))));

    // Namma Yatri Cab (Non-AC / AC Direct)
    const cabBase = 60;
    const cabFare = Math.round(Math.max(75, cabBase + dist * 15.5));
    const cabPickup = Math.min(7, Math.max(3, Math.round(3 + (dist % 4))));

    const webBooking = 'https://nammayatri.in';

    return [
      {
        id: `ny-auto-${Math.round(dist * 10)}`,
        provider: 'namma_yatri',
        providerName: 'Namma Yatri',
        category: 'auto',
        tierName: 'Namma Yatri Auto',
        description: '100% direct-to-driver auto. Zero commission, govt metered rate.',
        fareInr: autoFare,
        fareRange: {
          min: Math.max(30, Math.round(autoFare * 0.95)),
          max: Math.round(autoFare * 1.05)
        },
        pickupEtaMinutes: autoPickup,
        totalJourneyMinutes: Math.round(duration * 0.95),
        distanceKm: Number(dist.toFixed(1)),
        availability: 'AVAILABLE',
        isDemoEstimate: true,
        disclaimer: 'Demo estimate — not a live fare. Authorization credentials required for live dispatch.',
        bookingUrl: webBooking,
        deepLinkUrl: webBooking,
        capacity: { seats: 3, luggage: 1 },
        breakdown: {
          baseFare: autoBase,
          perKmFare: 14.2
        },
        updatedAt: nowIso
      },
      {
        id: `ny-cab-${Math.round(dist * 10)}`,
        provider: 'namma_yatri',
        providerName: 'Namma Yatri',
        category: 'cab',
        tierName: 'Namma Yatri Cab',
        description: 'Affordable community-driven cab with direct driver UPI payments.',
        fareInr: cabFare,
        fareRange: {
          min: Math.round(cabFare * 0.95),
          max: Math.round(cabFare * 1.08)
        },
        pickupEtaMinutes: cabPickup,
        totalJourneyMinutes: Math.round(duration),
        distanceKm: Number(dist.toFixed(1)),
        availability: 'AVAILABLE',
        isDemoEstimate: true,
        disclaimer: 'Demo estimate — not a live fare. Authorization credentials required for live dispatch.',
        bookingUrl: webBooking,
        deepLinkUrl: webBooking,
        capacity: { seats: 4, luggage: 2 },
        breakdown: {
          baseFare: cabBase,
          perKmFare: 15.5
        },
        updatedAt: nowIso
      }
    ];
  }
}
