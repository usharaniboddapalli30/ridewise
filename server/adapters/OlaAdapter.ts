import {
  AvailabilityStatus,
  LocationCoordinate,
  RideQuote,
  RideServiceAdapter,
  RouteMetrics
} from './types.js';

export class OlaServiceAdapter implements RideServiceAdapter {
  public provider: 'ola' = 'ola';
  private clientId?: string;
  private clientSecret?: string;
  private apiKey?: string;
  private baseUrl: string;

  constructor() {
    this.clientId = process.env.OLA_CLIENT_ID;
    this.clientSecret = process.env.OLA_CLIENT_SECRET;
    this.apiKey = process.env.OLA_API_KEY;
    this.baseUrl = process.env.OLA_API_BASE_URL || 'https://devapi.olacabs.com';
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
   * Production method for official Ola Developer API integration.
   * Developers configure OLA_API_KEY or OLA_CLIENT_ID / OLA_CLIENT_SECRET.
   * Endpoint: GET /v1/products?pickup_lat=...&pickup_lng=...&drop_lat=...&drop_lng=...
   */
  private async fetchLiveQuotes(
    origin: LocationCoordinate,
    destination: LocationCoordinate,
    route: RouteMetrics
  ): Promise<RideQuote[]> {
    try {
      const url = new URL(`${this.baseUrl}/v1/products`);
      url.searchParams.set('pickup_lat', origin.lat.toString());
      url.searchParams.set('pickup_lng', origin.lng.toString());
      url.searchParams.set('drop_lat', destination.lat.toString());
      url.searchParams.set('drop_lng', destination.lng.toString());

      const response = await fetch(url.toString(), {
        headers: {
          'X-APP-TOKEN': this.apiKey || '',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Ola API responded with status ${response.status}`);
      }

      const data = await response.json();
      const nowIso = new Date().toISOString();

      return (data.categories || []).map((cat: any) => {
        const isBike = /bike/i.test(cat.display_name);
        const isAuto = /auto/i.test(cat.display_name);
        const category = isBike ? 'bike' : isAuto ? 'auto' : 'cab';
        const bookingUrl = this.buildOlaBookingUrl(origin, destination);

        return {
          id: `ola-${cat.id || Math.random()}`,
          provider: 'ola',
          providerName: 'Ola',
          category,
          tierName: cat.display_name || 'Ola Cab',
          description: cat.description || this.getTierDescription(cat.display_name),
          fareInr: Math.round(cat.fare_breakup?.cost || 100),
          fareRange: cat.fare_breakup?.cost_range ? { min: cat.fare_breakup.cost_range.min, max: cat.fare_breakup.cost_range.max } : undefined,
          pickupEtaMinutes: cat.eta || 4,
          totalJourneyMinutes: Math.round(route.durationMinutes),
          distanceKm: route.distanceKm,
          availability: (cat.eta ? 'AVAILABLE' : 'HIGH_DEMAND') as AvailabilityStatus,
          isDemoEstimate: false,
          disclaimer: 'Live authorized quote from Ola Developer API.',
          bookingUrl,
          deepLinkUrl: bookingUrl,
          updatedAt: nowIso
        };
      });
    } catch (error) {
      console.warn('Ola live API estimate failed, falling back to demo estimate:', error);
      return this.generateDemoQuotes(origin, destination, route);
    }
  }

  /**
   * Deterministic benchmark estimates for Ola India (Ola Bike, Ola Auto, Ola Mini, Ola Prime Sedan, Ola Prime SUV)
   */
  private generateDemoQuotes(
    origin: LocationCoordinate,
    destination: LocationCoordinate,
    route: RouteMetrics
  ): RideQuote[] {
    const dist = Math.max(0.8, route.distanceKm);
    const duration = Math.max(3, route.durationMinutes);
    const nowIso = new Date().toISOString();

    const bookingUrl = this.buildOlaBookingUrl(origin, destination);

    // 1. Ola Bike: Base ₹21 + ₹9.1/km + minute charge
    const bikeBase = 21;
    const bikeFare = Math.round(Math.max(25, bikeBase + Math.max(0, dist - 1.5) * 9.1 + duration * 0.42));
    const bikePickup = Math.min(5, Math.max(2, Math.round(2 + (dist % 3))));
    const bikeDuration = Math.max(4, Math.round(duration * 0.86));

    // 2. Ola Auto: Base ₹33 + ₹14.6/km
    const autoBase = 33;
    const autoFare = Math.round(Math.max(35, autoBase + Math.max(0, dist - 1.8) * 14.6 + duration * 0.6));
    const autoPickup = Math.min(6, Math.max(2, Math.round(3 + (dist % 3))));
    const autoDuration = Math.round(duration * 0.95);

    // 3. Ola Mini (Compact AC Cab): Base ₹62 + ₹16.4/km
    const miniBase = 62;
    const miniFare = Math.round(Math.max(78, miniBase + dist * 16.4 + duration * 1.05));
    const miniPickup = Math.min(6, Math.max(3, Math.round(3 + (dist % 4))));
    const miniDuration = Math.round(duration);

    // 4. Ola Prime Sedan: Base ₹92 + ₹21.2/km
    const sedanBase = 92;
    const sedanFare = Math.round(Math.max(115, sedanBase + dist * 21.2 + duration * 1.35));
    const sedanPickup = Math.min(7, Math.max(4, Math.round(4 + (dist % 3))));
    const sedanDuration = Math.round(duration);

    // 5. Ola Prime SUV: Base ₹128 + ₹27.0/km
    const suvBase = 128;
    const suvFare = Math.round(Math.max(155, suvBase + dist * 27.0 + duration * 1.75));
    const suvPickup = Math.min(9, Math.max(5, Math.round(5 + (dist % 4))));
    const suvDuration = Math.round(duration * 1.04);

    const quotes: RideQuote[] = [
      {
        id: `ola-bike-${Math.round(dist * 10)}`,
        provider: 'ola',
        providerName: 'Ola',
        category: 'bike',
        tierName: 'Ola Bike',
        description: 'Fast, budget-friendly two-wheeler ride with verified rider & helmet.',
        fareInr: bikeFare,
        fareRange: {
          min: Math.max(20, Math.round(bikeFare * 0.95)),
          max: Math.round(bikeFare * 1.08)
        },
        pickupEtaMinutes: bikePickup,
        totalJourneyMinutes: bikeDuration,
        distanceKm: Number(dist.toFixed(1)),
        availability: 'AVAILABLE',
        isDemoEstimate: true,
        disclaimer: 'Demo estimate — not a live fare. Authorization credentials required for live dispatch.',
        bookingUrl,
        deepLinkUrl: bookingUrl,
        breakdown: {
          baseFare: bikeBase,
          perKmFare: 9.1
        },
        updatedAt: nowIso
      },
      {
        id: `ola-auto-${Math.round(dist * 10)}`,
        provider: 'ola',
        providerName: 'Ola',
        category: 'auto',
        tierName: 'Ola Auto',
        description: 'Doorstep auto rickshaw with upfront digital fare and no meter bargaining.',
        fareInr: autoFare,
        fareRange: {
          min: Math.max(32, Math.round(autoFare * 0.95)),
          max: Math.round(autoFare * 1.1)
        },
        pickupEtaMinutes: autoPickup,
        totalJourneyMinutes: autoDuration,
        distanceKm: Number(dist.toFixed(1)),
        availability: 'AVAILABLE',
        isDemoEstimate: true,
        disclaimer: 'Demo estimate — not a live fare. Authorization credentials required for live dispatch.',
        bookingUrl,
        deepLinkUrl: bookingUrl,
        breakdown: {
          baseFare: autoBase,
          perKmFare: 14.6
        },
        updatedAt: nowIso
      },
      {
        id: `ola-mini-${Math.round(dist * 10)}`,
        provider: 'ola',
        providerName: 'Ola',
        category: 'cab',
        tierName: 'Ola Mini',
        description: 'Compact AC hatchback cabs. Reliable and affordable everyday travel.',
        fareInr: miniFare,
        fareRange: {
          min: Math.round(miniFare * 0.96),
          max: Math.round(miniFare * 1.12)
        },
        pickupEtaMinutes: miniPickup,
        totalJourneyMinutes: miniDuration,
        distanceKm: Number(dist.toFixed(1)),
        availability: 'AVAILABLE',
        isDemoEstimate: true,
        disclaimer: 'Demo estimate — not a live fare. Authorization credentials required for live dispatch.',
        bookingUrl,
        deepLinkUrl: bookingUrl,
        breakdown: {
          baseFare: miniBase,
          perKmFare: 16.4
        },
        updatedAt: nowIso
      },
      {
        id: `ola-prime-sedan-${Math.round(dist * 10)}`,
        provider: 'ola',
        providerName: 'Ola',
        category: 'cab',
        tierName: 'Ola Prime Sedan',
        description: 'Comfortable sedans with free in-cab Wi-Fi and top-rated drivers.',
        fareInr: sedanFare,
        fareRange: {
          min: Math.round(sedanFare * 0.96),
          max: Math.round(sedanFare * 1.14)
        },
        pickupEtaMinutes: sedanPickup,
        totalJourneyMinutes: sedanDuration,
        distanceKm: Number(dist.toFixed(1)),
        availability: 'AVAILABLE',
        isDemoEstimate: true,
        disclaimer: 'Demo estimate — not a live fare. Authorization credentials required for live dispatch.',
        bookingUrl,
        deepLinkUrl: bookingUrl,
        breakdown: {
          baseFare: sedanBase,
          perKmFare: 21.2
        },
        updatedAt: nowIso
      },
      {
        id: `ola-prime-suv-${Math.round(dist * 10)}`,
        provider: 'ola',
        providerName: 'Ola',
        category: 'cab',
        tierName: 'Ola Prime SUV',
        description: 'Spacious 6-seater SUVs for comfortable group travel and luggage.',
        fareInr: suvFare,
        fareRange: {
          min: Math.round(suvFare * 0.96),
          max: Math.round(suvFare * 1.15)
        },
        pickupEtaMinutes: suvPickup,
        totalJourneyMinutes: suvDuration,
        distanceKm: Number(dist.toFixed(1)),
        availability: 'AVAILABLE',
        isDemoEstimate: true,
        disclaimer: 'Demo estimate — not a live fare. Authorization credentials required for live dispatch.',
        bookingUrl,
        deepLinkUrl: bookingUrl,
        breakdown: {
          baseFare: suvBase,
          perKmFare: 27.0
        },
        updatedAt: nowIso
      }
    ];

    return quotes;
  }

  private buildOlaBookingUrl(origin: LocationCoordinate, destination: LocationCoordinate): string {
    const pickupName = encodeURIComponent(origin.address || 'Pickup');
    const dropName = encodeURIComponent(destination.address || 'Dropoff');
    return `https://book.olacabs.com/?pickup_lat=${origin.lat}&pickup_lng=${origin.lng}&drop_lat=${destination.lat}&drop_lng=${destination.lng}&pickup_name=${pickupName}&drop_name=${dropName}`;
  }

  private getTierDescription(tier: string): string {
    if (/bike/i.test(tier)) return 'Fast two-wheeler ride with helmet.';
    if (/auto/i.test(tier)) return 'Everyday auto rickshaw at fixed fare.';
    if (/sedan/i.test(tier)) return 'Comfortable sedan with WiFi & AC.';
    if (/suv/i.test(tier)) return 'Spacious 6-seater SUV for family/luggage.';
    return 'Comfortable AC cab for city commutes.';
  }
}
