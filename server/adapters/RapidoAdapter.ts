import {
  AvailabilityStatus,
  LocationCoordinate,
  RideQuote,
  RideServiceAdapter,
  RouteMetrics
} from './types.js';

export class RapidoServiceAdapter implements RideServiceAdapter {
  public provider: 'rapido' = 'rapido';
  private clientId?: string;
  private clientSecret?: string;
  private apiKey?: string;
  private baseUrl: string;

  constructor() {
    this.clientId = process.env.RAPIDO_CLIENT_ID;
    this.clientSecret = process.env.RAPIDO_CLIENT_SECRET;
    this.apiKey = process.env.RAPIDO_API_KEY;
    this.baseUrl = process.env.RAPIDO_API_BASE_URL || 'https://api.rapido.bike';
  }

  public isConfigured(): boolean {
    return Boolean(this.apiKey || (this.clientId && this.clientSecret));
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

  /**
   * Production method for official Rapido Partner API integration.
   * Developers configure RAPIDO_API_KEY or RAPIDO_CLIENT_ID + RAPIDO_CLIENT_SECRET.
   */
  private async fetchLiveQuotes(
    origin: LocationCoordinate,
    destination: LocationCoordinate,
    route: RouteMetrics
  ): Promise<RideQuote[]> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/fare-estimates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Client-Id': this.clientId || ''
        },
        body: JSON.stringify({
          pickup: { latitude: origin.lat, longitude: origin.lng, address: origin.address },
          dropoff: { latitude: destination.lat, longitude: destination.lng, address: destination.address }
        })
      });

      if (!response.ok) {
        throw new Error(`Rapido API responded with status ${response.status}`);
      }

      // Expected format mapping when live API credentials are authenticated
      const data = await response.json();
      return (data.fares || []).map((item: any) => ({
        id: `rapido-${item.service_type}-${Date.now()}`,
        provider: 'rapido',
        providerName: 'Rapido',
        category: item.service_type === 'bike' ? 'bike' : 'auto',
        tierName: item.display_name || (item.service_type === 'bike' ? 'Rapido Bike' : 'Rapido Auto'),
        description: item.service_type === 'bike' ? 'Fastest 1-seater two-wheeler' : 'Reliable 3-seater auto rickshaw',
        fareInr: Math.round(item.fare_amount),
        fareRange: item.fare_range ? { min: item.fare_range.min, max: item.fare_range.max } : undefined,
        pickupEtaMinutes: item.eta_minutes ?? 3,
        totalJourneyMinutes: Math.round(route.durationMinutes),
        distanceKm: route.distanceKm,
        availability: item.available ? 'AVAILABLE' : 'UNAVAILABLE',
        isDemoEstimate: false,
        disclaimer: 'Live authorized quote from Rapido Partner API.',
        bookingUrl: `https://www.rapido.bike`,
        deepLinkUrl: `rapido://ride?pickup_lat=${origin.lat}&pickup_lng=${origin.lng}&drop_lat=${destination.lat}&drop_lng=${destination.lng}`,
        updatedAt: new Date().toISOString()
      }));
    } catch (error) {
      console.warn('Rapido live API call failed, falling back to demo estimate:', error);
      return this.generateDemoQuotes(origin, destination, route);
    }
  }

  /**
   * Deterministic, benchmarked estimate model for Indian cities (Bangalore, Delhi, Mumbai, Hyderabad, etc.)
   * Used when authorized credentials have not yet been connected.
   */
  private generateDemoQuotes(
    origin: LocationCoordinate,
    destination: LocationCoordinate,
    route: RouteMetrics
  ): RideQuote[] {
    const dist = Math.max(0.8, route.distanceKm);
    const duration = Math.max(3, route.durationMinutes);
    const nowIso = new Date().toISOString();

    // Rapido Bike Pricing Benchmark:
    // Base fare: ₹20 (covers first 1.5 km), then ₹9 per km.
    // Bike traffic advantage: ~15% faster transit through Indian urban traffic.
    const bikeBaseFare = 20;
    const bikeAdditionalKm = Math.max(0, dist - 1.5);
    const bikeFareRaw = bikeBaseFare + bikeAdditionalKm * 9.2 + (duration * 0.4);
    const bikeFare = Math.round(Math.max(25, bikeFareRaw));
    const bikeJourneyMinutes = Math.max(4, Math.round(duration * 0.85));
    const bikePickupEta = Math.min(5, Math.max(2, Math.round(2 + (dist % 3))));

    // Rapido Auto Pricing Benchmark:
    // Base fare: ₹32 (covers first 1.8 km), then ₹14.5 per km.
    const autoBaseFare = 32;
    const autoAdditionalKm = Math.max(0, dist - 1.8);
    const autoFareRaw = autoBaseFare + autoAdditionalKm * 14.8 + (duration * 0.6);
    const autoFare = Math.round(Math.max(35, autoFareRaw));
    const autoJourneyMinutes = Math.round(duration * 0.95);
    const autoPickupEta = Math.min(6, Math.max(3, Math.round(3 + (dist % 4))));

    const webBooking = `https://www.rapido.bike`;
    const deepLink = `rapido://ride?pickup_lat=${origin.lat.toFixed(6)}&pickup_lng=${origin.lng.toFixed(6)}&drop_lat=${destination.lat.toFixed(6)}&drop_lng=${destination.lng.toFixed(6)}`;

    const quotes: RideQuote[] = [
      {
        id: `rapido-bike-${Math.round(dist * 10)}`,
        provider: 'rapido',
        providerName: 'Rapido',
        category: 'bike',
        tierName: 'Rapido Bike',
        description: 'Single passenger two-wheeler. Ideal for zipping through Indian city traffic.',
        fareInr: bikeFare,
        fareRange: {
          min: Math.max(20, Math.round(bikeFare * 0.95)),
          max: Math.round(bikeFare * 1.08)
        },
        pickupEtaMinutes: bikePickupEta,
        totalJourneyMinutes: bikeJourneyMinutes,
        distanceKm: Number(dist.toFixed(1)),
        availability: 'AVAILABLE',
        isDemoEstimate: true,
        disclaimer: 'Demo estimate — not a live fare. Authorization credentials required for live dispatch.',
        bookingUrl: webBooking,
        deepLinkUrl: deepLink,
        breakdown: {
          baseFare: bikeBaseFare,
          perKmFare: 9.2
        },
        updatedAt: nowIso
      },
      {
        id: `rapido-auto-${Math.round(dist * 10)}`,
        provider: 'rapido',
        providerName: 'Rapido',
        category: 'auto',
        tierName: 'Rapido Auto',
        description: 'Doorstep 3-wheeler auto rickshaw with metered estimate and zero haggling.',
        fareInr: autoFare,
        fareRange: {
          min: Math.max(30, Math.round(autoFare * 0.95)),
          max: Math.round(autoFare * 1.1)
        },
        pickupEtaMinutes: autoPickupEta,
        totalJourneyMinutes: autoJourneyMinutes,
        distanceKm: Number(dist.toFixed(1)),
        availability: 'AVAILABLE',
        isDemoEstimate: true,
        disclaimer: 'Demo estimate — not a live fare. Authorization credentials required for live dispatch.',
        bookingUrl: webBooking,
        deepLinkUrl: deepLink,
        breakdown: {
          baseFare: autoBaseFare,
          perKmFare: 14.8
        },
        updatedAt: nowIso
      }
    ];

    return quotes;
  }
}
