import {
  AvailabilityStatus,
  LocationCoordinate,
  RideQuote,
  RideServiceAdapter,
  RouteMetrics
} from './types.js';

export class UberServiceAdapter implements RideServiceAdapter {
  public provider: 'uber' = 'uber';
  private serverToken?: string;
  private clientId?: string;
  private clientSecret?: string;
  private baseUrl: string;

  constructor() {
    this.serverToken = process.env.UBER_SERVER_TOKEN;
    this.clientId = process.env.UBER_CLIENT_ID;
    this.clientSecret = process.env.UBER_CLIENT_SECRET;
    this.baseUrl = process.env.UBER_API_BASE_URL || 'https://api.uber.com/v1.2';
  }

  public isConfigured(): boolean {
    return Boolean(this.serverToken || (this.clientId && this.clientSecret));
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
   * Official Uber Developer API integration:
   * GET /v1.2/estimates/price
   * Headers: Authorization: Token <UBER_SERVER_TOKEN>
   */
  private async fetchLiveQuotes(
    origin: LocationCoordinate,
    destination: LocationCoordinate,
    route: RouteMetrics
  ): Promise<RideQuote[]> {
    try {
      const url = new URL(`${this.baseUrl}/estimates/price`);
      url.searchParams.set('start_latitude', origin.lat.toString());
      url.searchParams.set('start_longitude', origin.lng.toString());
      url.searchParams.set('end_latitude', destination.lat.toString());
      url.searchParams.set('end_longitude', destination.lng.toString());

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Token ${this.serverToken}`,
          'Accept-Language': 'en_IN'
        }
      });

      if (!response.ok) {
        throw new Error(`Uber API price estimate returned status ${response.status}`);
      }

      const data = await response.json();
      const nowIso = new Date().toISOString();

      return (data.prices || []).map((price: any) => {
        const displayName = price.display_name || 'Uber';
        const isBike = /moto|bike/i.test(displayName);
        const isAuto = /auto/i.test(displayName);
        const category = isBike ? 'bike' : isAuto ? 'auto' : 'cab';

        const bookingUrl = this.buildUberUrl(origin, destination);

        return {
          id: `uber-${price.product_id || Math.random()}`,
          provider: 'uber',
          providerName: 'Uber',
          category,
          tierName: displayName,
          description: this.getTierDescription(displayName),
          fareInr: Math.round(price.estimate ? Number(String(price.estimate).replace(/[^0-9.]/g, '')) : (price.high_estimate || 100)),
          fareRange: {
            min: Math.round(price.low_estimate || price.estimate || 50),
            max: Math.round(price.high_estimate || price.estimate || 100)
          },
          pickupEtaMinutes: Math.round((price.duration || 300) / 60) > 10 ? 4 : 3,
          totalJourneyMinutes: Math.round((price.duration || route.durationMinutes * 60) / 60),
          distanceKm: price.distance ? Number(price.distance.toFixed(1)) : route.distanceKm,
          availability: 'AVAILABLE' as AvailabilityStatus,
          isDemoEstimate: false,
          disclaimer: 'Live quote from official Uber Rides API.',
          bookingUrl,
          deepLinkUrl: bookingUrl,
          updatedAt: nowIso
        };
      });
    } catch (error) {
      console.warn('Uber live API estimate failed, falling back to demo estimate:', error);
      return this.generateDemoQuotes(origin, destination, route);
    }
  }

  /**
   * Deterministic benchmark estimates for Uber India (Uber Moto, Uber Auto, Uber Go, Uber Premier, Uber XL)
   */
  private generateDemoQuotes(
    origin: LocationCoordinate,
    destination: LocationCoordinate,
    route: RouteMetrics
  ): RideQuote[] {
    const dist = Math.max(0.8, route.distanceKm);
    const duration = Math.max(3, route.durationMinutes);
    const nowIso = new Date().toISOString();

    const bookingUrl = this.buildUberUrl(origin, destination);

    // 1. Uber Moto: Base ₹22 + ₹9.5/km + minute charge
    const motoBase = 22;
    const motoFare = Math.round(Math.max(25, motoBase + Math.max(0, dist - 1.5) * 9.5 + duration * 0.45));
    const motoPickup = Math.min(6, Math.max(2, Math.round(3 + (dist % 2))));
    const motoDuration = Math.max(4, Math.round(duration * 0.88));

    // 2. Uber Auto: Base ₹35 + ₹15/km
    const autoBase = 35;
    const autoFare = Math.round(Math.max(38, autoBase + Math.max(0, dist - 1.8) * 15.2 + duration * 0.65));
    const autoPickup = Math.min(6, Math.max(2, Math.round(2 + (dist % 3))));
    const autoDuration = Math.round(duration * 0.96);

    // 3. Uber Go (Hatchback): Base ₹65 + ₹16.5/km
    const goBase = 65;
    const goFare = Math.round(Math.max(80, goBase + dist * 16.8 + duration * 1.1));
    const goPickup = Math.min(7, Math.max(3, Math.round(4 + (dist % 4))));
    const goDuration = Math.round(duration);

    // 4. Uber Premier (Sedan): Base ₹95 + ₹21.5/km
    const premierBase = 95;
    const premierFare = Math.round(Math.max(120, premierBase + dist * 21.8 + duration * 1.4));
    const premierPickup = Math.min(8, Math.max(4, Math.round(5 + (dist % 3))));
    const premierDuration = Math.round(duration);

    // 5. Uber XL (6-seater SUV): Base ₹130 + ₹27.5/km
    const xlBase = 130;
    const xlFare = Math.round(Math.max(160, xlBase + dist * 27.5 + duration * 1.8));
    const xlPickup = Math.min(10, Math.max(5, Math.round(6 + (dist % 5))));
    const xlDuration = Math.round(duration * 1.05);

    const quotes: RideQuote[] = [
      {
        id: `uber-moto-${Math.round(dist * 10)}`,
        provider: 'uber',
        providerName: 'Uber',
        category: 'bike',
        tierName: 'Uber Moto',
        description: 'Affordable two-wheeler ride with helmet provided. Quick pickup.',
        fareInr: motoFare,
        fareRange: {
          min: Math.max(22, Math.round(motoFare * 0.95)),
          max: Math.round(motoFare * 1.08)
        },
        pickupEtaMinutes: motoPickup,
        totalJourneyMinutes: motoDuration,
        distanceKm: Number(dist.toFixed(1)),
        availability: 'AVAILABLE',
        isDemoEstimate: true,
        disclaimer: 'Demo estimate — not a live fare. Authorization credentials required for live dispatch.',
        bookingUrl,
        deepLinkUrl: bookingUrl,
        breakdown: {
          baseFare: motoBase,
          perKmFare: 9.5
        },
        updatedAt: nowIso
      },
      {
        id: `uber-auto-${Math.round(dist * 10)}`,
        provider: 'uber',
        providerName: 'Uber',
        category: 'auto',
        tierName: 'Uber Auto',
        description: 'Everyday hassle-free auto rides at upfront digital prices.',
        fareInr: autoFare,
        fareRange: {
          min: Math.max(35, Math.round(autoFare * 0.95)),
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
          perKmFare: 15.2
        },
        updatedAt: nowIso
      },
      {
        id: `uber-go-${Math.round(dist * 10)}`,
        provider: 'uber',
        providerName: 'Uber',
        category: 'cab',
        tierName: 'Uber Go',
        description: 'Affordable, compact AC rides for everyday commutes. Seats up to 4.',
        fareInr: goFare,
        fareRange: {
          min: Math.round(goFare * 0.96),
          max: Math.round(goFare * 1.12)
        },
        pickupEtaMinutes: goPickup,
        totalJourneyMinutes: goDuration,
        distanceKm: Number(dist.toFixed(1)),
        availability: 'AVAILABLE',
        isDemoEstimate: true,
        disclaimer: 'Demo estimate — not a live fare. Authorization credentials required for live dispatch.',
        bookingUrl,
        deepLinkUrl: bookingUrl,
        breakdown: {
          baseFare: goBase,
          perKmFare: 16.8
        },
        updatedAt: nowIso
      },
      {
        id: `uber-premier-${Math.round(dist * 10)}`,
        provider: 'uber',
        providerName: 'Uber',
        category: 'cab',
        tierName: 'Uber Premier',
        description: 'Comfortable sedans with top-rated drivers and extra legroom.',
        fareInr: premierFare,
        fareRange: {
          min: Math.round(premierFare * 0.96),
          max: Math.round(premierFare * 1.15)
        },
        pickupEtaMinutes: premierPickup,
        totalJourneyMinutes: premierDuration,
        distanceKm: Number(dist.toFixed(1)),
        availability: 'AVAILABLE',
        isDemoEstimate: true,
        disclaimer: 'Demo estimate — not a live fare. Authorization credentials required for live dispatch.',
        bookingUrl,
        deepLinkUrl: bookingUrl,
        breakdown: {
          baseFare: premierBase,
          perKmFare: 21.8
        },
        updatedAt: nowIso
      },
      {
        id: `uber-xl-${Math.round(dist * 10)}`,
        provider: 'uber',
        providerName: 'Uber',
        category: 'cab',
        tierName: 'Uber XL',
        description: 'Spacious SUVs with room for up to 6 passengers or extra luggage.',
        fareInr: xlFare,
        fareRange: {
          min: Math.round(xlFare * 0.96),
          max: Math.round(xlFare * 1.15)
        },
        pickupEtaMinutes: xlPickup,
        totalJourneyMinutes: xlDuration,
        distanceKm: Number(dist.toFixed(1)),
        availability: 'AVAILABLE',
        isDemoEstimate: true,
        disclaimer: 'Demo estimate — not a live fare. Authorization credentials required for live dispatch.',
        bookingUrl,
        deepLinkUrl: bookingUrl,
        breakdown: {
          baseFare: xlBase,
          perKmFare: 27.5
        },
        updatedAt: nowIso
      }
    ];

    return quotes;
  }

  private buildUberUrl(origin: LocationCoordinate, destination: LocationCoordinate): string {
    const pickupAddress = encodeURIComponent(origin.address || 'Pickup');
    const dropoffAddress = encodeURIComponent(destination.address || 'Destination');
    return `https://m.uber.com/ul/?action=setPickup&pickup[latitude]=${origin.lat}&pickup[longitude]=${origin.lng}&pickup[formatted_address]=${pickupAddress}&dropoff[latitude]=${destination.lat}&dropoff[longitude]=${destination.lng}&dropoff[formatted_address]=${dropoffAddress}`;
  }

  private getTierDescription(tier: string): string {
    if (/moto|bike/i.test(tier)) return 'Affordable two-wheeler ride with helmet.';
    if (/auto/i.test(tier)) return 'Affordable 3-wheeler auto rickshaw.';
    if (/premier/i.test(tier)) return 'Comfortable sedan with top-rated drivers.';
    if (/xl/i.test(tier)) return 'Spacious 6-seater SUV for family or luggage.';
    return 'Comfortable AC cab for everyday travel.';
  }
}
