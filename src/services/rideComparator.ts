import {
  ComparisonResponse,
  LocationCoordinate,
  RideQuote,
  RideRecommendation,
  RouteMetrics
} from '../types/index.js';

export function computeLocalRoute(
  origin: LocationCoordinate,
  destination: LocationCoordinate
): RouteMetrics {
  const R = 6371; // Earth's radius in km
  const dLat = ((destination.lat - origin.lat) * Math.PI) / 180;
  const dLon = ((destination.lng - origin.lng) * Math.PI) / 180;
  const lat1 = (origin.lat * Math.PI) / 180;
  const lat2 = (destination.lat * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLineKm = R * c;

  const roadDistanceKm = Math.max(0.8, Math.round(straightLineKm * 1.38 * 10) / 10);
  const averageSpeedKmh = roadDistanceKm < 5 ? 20 : 25;
  const travelDurationMinutes = Math.max(5, Math.round((roadDistanceKm / averageSpeedKmh) * 60 + 3));

  const polylinePoints: Array<{ lat: number; lng: number }> = [];
  const steps = 15;
  for (let i = 0; i <= steps; i++) {
    const fraction = i / steps;
    const curveOffset = Math.sin(fraction * Math.PI) * 0.003;
    polylinePoints.push({
      lat: origin.lat + (destination.lat - origin.lat) * fraction + curveOffset,
      lng: origin.lng + (destination.lng - origin.lng) * fraction - curveOffset * 0.5
    });
  }

  return {
    distanceKm: roadDistanceKm,
    durationMinutes: travelDurationMinutes,
    summary: 'Estimated via city arterial roads',
    polylinePoints
  };
}

export function generateAllQuotes(
  origin: LocationCoordinate,
  destination: LocationCoordinate,
  route: RouteMetrics
): ComparisonResponse {
  const dist = Math.max(0.8, route.distanceKm);
  const duration = Math.max(3, route.durationMinutes);
  const nowIso = new Date().toISOString();

  // Booking URLs
  const rapidoWeb = 'https://www.rapido.bike';
  const rapidoDeepLink = `rapido://ride?pickup_lat=${origin.lat.toFixed(6)}&pickup_lng=${origin.lng.toFixed(6)}&drop_lat=${destination.lat.toFixed(6)}&drop_lng=${destination.lng.toFixed(6)}`;

  const uberPickup = encodeURIComponent(origin.address || 'Pickup');
  const uberDrop = encodeURIComponent(destination.address || 'Destination');
  const uberUrl = `https://m.uber.com/ul/?action=setPickup&pickup[latitude]=${origin.lat}&pickup[longitude]=${origin.lng}&pickup[formatted_address]=${uberPickup}&dropoff[latitude]=${destination.lat}&dropoff[longitude]=${destination.lng}&dropoff[formatted_address]=${uberDrop}`;

  const olaUrl = `https://book.olacabs.com/?pickup_lat=${origin.lat}&pickup_lng=${origin.lng}&drop_lat=${destination.lat}&drop_lng=${destination.lng}&pickup_name=${uberPickup}&drop_name=${uberDrop}`;

  const nyUrl = 'https://nammayatri.in';
  const bluUrl = 'https://blu-smart.com';

  const rides: RideQuote[] = [
    // 1. Rapido Bike
    {
      id: `rapido-bike-${Math.round(dist * 10)}`,
      provider: 'rapido',
      providerName: 'Rapido',
      category: 'bike',
      tierName: 'Rapido Bike',
      description: 'Single passenger two-wheeler. Ideal for zipping through Indian city traffic.',
      fareInr: Math.round(Math.max(25, 20 + Math.max(0, dist - 1.5) * 9.2 + duration * 0.4)),
      fareRange: {
        min: Math.max(20, Math.round((20 + Math.max(0, dist - 1.5) * 9.2) * 0.95)),
        max: Math.round((20 + Math.max(0, dist - 1.5) * 9.2) * 1.08)
      },
      pickupEtaMinutes: Math.min(5, Math.max(2, Math.round(2 + (dist % 3)))),
      totalJourneyMinutes: Math.max(4, Math.round(duration * 0.85)),
      distanceKm: Number(dist.toFixed(1)),
      availability: 'AVAILABLE',
      isDemoEstimate: true,
      disclaimer: 'Demo estimate — not a live fare. Authorization credentials required for live dispatch.',
      bookingUrl: rapidoWeb,
      deepLinkUrl: rapidoDeepLink,
      capacity: { seats: 1 },
      breakdown: { baseFare: 20, perKmFare: 9.2 },
      updatedAt: nowIso
    },
    // 2. Rapido Auto
    {
      id: `rapido-auto-${Math.round(dist * 10)}`,
      provider: 'rapido',
      providerName: 'Rapido',
      category: 'auto',
      tierName: 'Rapido Auto',
      description: 'Doorstep 3-wheeler auto rickshaw with metered estimate and zero haggling.',
      fareInr: Math.round(Math.max(35, 32 + Math.max(0, dist - 1.8) * 14.8 + duration * 0.6)),
      fareRange: {
        min: Math.max(30, Math.round((32 + Math.max(0, dist - 1.8) * 14.8) * 0.95)),
        max: Math.round((32 + Math.max(0, dist - 1.8) * 14.8) * 1.1)
      },
      pickupEtaMinutes: Math.min(6, Math.max(3, Math.round(3 + (dist % 4)))),
      totalJourneyMinutes: Math.round(duration * 0.95),
      distanceKm: Number(dist.toFixed(1)),
      availability: 'AVAILABLE',
      isDemoEstimate: true,
      disclaimer: 'Demo estimate — not a live fare. Authorization credentials required for live dispatch.',
      bookingUrl: rapidoWeb,
      deepLinkUrl: rapidoDeepLink,
      capacity: { seats: 3 },
      breakdown: { baseFare: 32, perKmFare: 14.8 },
      updatedAt: nowIso
    },
    // 3. Uber Moto
    {
      id: `uber-moto-${Math.round(dist * 10)}`,
      provider: 'uber',
      providerName: 'Uber',
      category: 'bike',
      tierName: 'Uber Moto',
      description: 'Affordable two-wheeler ride with helmet provided. Quick pickup.',
      fareInr: Math.round(Math.max(25, 22 + Math.max(0, dist - 1.5) * 9.5 + duration * 0.45)),
      fareRange: {
        min: Math.max(22, Math.round((22 + Math.max(0, dist - 1.5) * 9.5) * 0.95)),
        max: Math.round((22 + Math.max(0, dist - 1.5) * 9.5) * 1.08)
      },
      pickupEtaMinutes: Math.min(6, Math.max(2, Math.round(3 + (dist % 2)))),
      totalJourneyMinutes: Math.max(4, Math.round(duration * 0.88)),
      distanceKm: Number(dist.toFixed(1)),
      availability: 'AVAILABLE',
      isDemoEstimate: true,
      disclaimer: 'Demo estimate — not a live fare. Authorization credentials required for live dispatch.',
      bookingUrl: uberUrl,
      deepLinkUrl: uberUrl,
      capacity: { seats: 1 },
      breakdown: { baseFare: 22, perKmFare: 9.5 },
      updatedAt: nowIso
    },
    // 4. Uber Auto
    {
      id: `uber-auto-${Math.round(dist * 10)}`,
      provider: 'uber',
      providerName: 'Uber',
      category: 'auto',
      tierName: 'Uber Auto',
      description: 'Everyday hassle-free auto rides at upfront digital prices.',
      fareInr: Math.round(Math.max(38, 35 + Math.max(0, dist - 1.8) * 15.2 + duration * 0.65)),
      fareRange: {
        min: Math.max(35, Math.round((35 + Math.max(0, dist - 1.8) * 15.2) * 0.95)),
        max: Math.round((35 + Math.max(0, dist - 1.8) * 15.2) * 1.1)
      },
      pickupEtaMinutes: Math.min(6, Math.max(2, Math.round(2 + (dist % 3)))),
      totalJourneyMinutes: Math.round(duration * 0.96),
      distanceKm: Number(dist.toFixed(1)),
      availability: 'AVAILABLE',
      isDemoEstimate: true,
      disclaimer: 'Demo estimate — not a live fare. Authorization credentials required for live dispatch.',
      bookingUrl: uberUrl,
      deepLinkUrl: uberUrl,
      capacity: { seats: 3 },
      breakdown: { baseFare: 35, perKmFare: 15.2 },
      updatedAt: nowIso
    },
    // 5. Uber Go
    {
      id: `uber-go-${Math.round(dist * 10)}`,
      provider: 'uber',
      providerName: 'Uber',
      category: 'cab',
      tierName: 'Uber Go',
      description: 'Affordable, compact AC rides for everyday commutes. Seats up to 4.',
      fareInr: Math.round(Math.max(80, 65 + dist * 16.8 + duration * 1.1)),
      fareRange: {
        min: Math.round((65 + dist * 16.8) * 0.96),
        max: Math.round((65 + dist * 16.8) * 1.12)
      },
      pickupEtaMinutes: Math.min(7, Math.max(3, Math.round(4 + (dist % 4)))),
      totalJourneyMinutes: Math.round(duration),
      distanceKm: Number(dist.toFixed(1)),
      availability: 'AVAILABLE',
      isDemoEstimate: true,
      disclaimer: 'Demo estimate — not a live fare. Authorization credentials required for live dispatch.',
      bookingUrl: uberUrl,
      deepLinkUrl: uberUrl,
      capacity: { seats: 4, luggage: 2 },
      breakdown: { baseFare: 65, perKmFare: 16.8 },
      updatedAt: nowIso
    },
    // 6. Uber Premier
    {
      id: `uber-premier-${Math.round(dist * 10)}`,
      provider: 'uber',
      providerName: 'Uber',
      category: 'cab',
      tierName: 'Uber Premier',
      description: 'Comfortable sedans with top-rated drivers and extra legroom.',
      fareInr: Math.round(Math.max(120, 95 + dist * 21.8 + duration * 1.4)),
      fareRange: {
        min: Math.round((95 + dist * 21.8) * 0.96),
        max: Math.round((95 + dist * 21.8) * 1.15)
      },
      pickupEtaMinutes: Math.min(8, Math.max(4, Math.round(5 + (dist % 3)))),
      totalJourneyMinutes: Math.round(duration),
      distanceKm: Number(dist.toFixed(1)),
      availability: 'AVAILABLE',
      isDemoEstimate: true,
      disclaimer: 'Demo estimate — not a live fare. Authorization credentials required for live dispatch.',
      bookingUrl: uberUrl,
      deepLinkUrl: uberUrl,
      capacity: { seats: 4, luggage: 3 },
      breakdown: { baseFare: 95, perKmFare: 21.8 },
      updatedAt: nowIso
    },
    // 7. Uber XL
    {
      id: `uber-xl-${Math.round(dist * 10)}`,
      provider: 'uber',
      providerName: 'Uber',
      category: 'cab',
      tierName: 'Uber XL',
      description: 'Spacious SUVs with room for up to 6 passengers or extra luggage.',
      fareInr: Math.round(Math.max(160, 130 + dist * 27.5 + duration * 1.8)),
      fareRange: {
        min: Math.round((130 + dist * 27.5) * 0.96),
        max: Math.round((130 + dist * 27.5) * 1.15)
      },
      pickupEtaMinutes: Math.min(10, Math.max(5, Math.round(6 + (dist % 5)))),
      totalJourneyMinutes: Math.round(duration * 1.05),
      distanceKm: Number(dist.toFixed(1)),
      availability: 'AVAILABLE',
      isDemoEstimate: true,
      disclaimer: 'Demo estimate — not a live fare. Authorization credentials required for live dispatch.',
      bookingUrl: uberUrl,
      deepLinkUrl: uberUrl,
      capacity: { seats: 6, luggage: 4 },
      breakdown: { baseFare: 130, perKmFare: 27.5 },
      updatedAt: nowIso
    },
    // 8. Ola Bike
    {
      id: `ola-bike-${Math.round(dist * 10)}`,
      provider: 'ola',
      providerName: 'Ola',
      category: 'bike',
      tierName: 'Ola Bike',
      description: 'Fast, budget-friendly two-wheeler ride with verified rider & helmet.',
      fareInr: Math.round(Math.max(25, 21 + Math.max(0, dist - 1.5) * 9.1 + duration * 0.42)),
      fareRange: {
        min: Math.max(20, Math.round((21 + Math.max(0, dist - 1.5) * 9.1) * 0.95)),
        max: Math.round((21 + Math.max(0, dist - 1.5) * 9.1) * 1.08)
      },
      pickupEtaMinutes: Math.min(5, Math.max(2, Math.round(2 + (dist % 3)))),
      totalJourneyMinutes: Math.max(4, Math.round(duration * 0.86)),
      distanceKm: Number(dist.toFixed(1)),
      availability: 'AVAILABLE',
      isDemoEstimate: true,
      disclaimer: 'Demo estimate — not a live fare. Authorization credentials required for live dispatch.',
      bookingUrl: olaUrl,
      deepLinkUrl: olaUrl,
      capacity: { seats: 1 },
      breakdown: { baseFare: 21, perKmFare: 9.1 },
      updatedAt: nowIso
    },
    // 9. Ola Auto
    {
      id: `ola-auto-${Math.round(dist * 10)}`,
      provider: 'ola',
      providerName: 'Ola',
      category: 'auto',
      tierName: 'Ola Auto',
      description: 'Doorstep auto rickshaw with upfront digital fare and no meter bargaining.',
      fareInr: Math.round(Math.max(35, 33 + Math.max(0, dist - 1.8) * 14.6 + duration * 0.6)),
      fareRange: {
        min: Math.max(32, Math.round((33 + Math.max(0, dist - 1.8) * 14.6) * 0.95)),
        max: Math.round((33 + Math.max(0, dist - 1.8) * 14.6) * 1.1)
      },
      pickupEtaMinutes: Math.min(6, Math.max(2, Math.round(3 + (dist % 3)))),
      totalJourneyMinutes: Math.round(duration * 0.95),
      distanceKm: Number(dist.toFixed(1)),
      availability: 'AVAILABLE',
      isDemoEstimate: true,
      disclaimer: 'Demo estimate — not a live fare. Authorization credentials required for live dispatch.',
      bookingUrl: olaUrl,
      deepLinkUrl: olaUrl,
      capacity: { seats: 3 },
      breakdown: { baseFare: 33, perKmFare: 14.6 },
      updatedAt: nowIso
    },
    // 10. Ola Mini
    {
      id: `ola-mini-${Math.round(dist * 10)}`,
      provider: 'ola',
      providerName: 'Ola',
      category: 'cab',
      tierName: 'Ola Mini',
      description: 'Compact AC hatchback cabs. Reliable and affordable everyday travel.',
      fareInr: Math.round(Math.max(78, 62 + dist * 16.4 + duration * 1.05)),
      fareRange: {
        min: Math.round((62 + dist * 16.4) * 0.96),
        max: Math.round((62 + dist * 16.4) * 1.12)
      },
      pickupEtaMinutes: Math.min(6, Math.max(3, Math.round(3 + (dist % 4)))),
      totalJourneyMinutes: Math.round(duration),
      distanceKm: Number(dist.toFixed(1)),
      availability: 'AVAILABLE',
      isDemoEstimate: true,
      disclaimer: 'Demo estimate — not a live fare. Authorization credentials required for live dispatch.',
      bookingUrl: olaUrl,
      deepLinkUrl: olaUrl,
      capacity: { seats: 4, luggage: 2 },
      breakdown: { baseFare: 62, perKmFare: 16.4 },
      updatedAt: nowIso
    },
    // 11. Namma Yatri Auto
    {
      id: `ny-auto-${Math.round(dist * 10)}`,
      provider: 'namma_yatri',
      providerName: 'Namma Yatri',
      category: 'auto',
      tierName: 'Namma Yatri Auto',
      description: '100% direct-to-driver auto. Zero commission, govt metered rate.',
      fareInr: Math.round(Math.max(30, 30 + Math.max(0, dist - 2.0) * 14.2)),
      fareRange: {
        min: Math.max(30, Math.round((30 + Math.max(0, dist - 2.0) * 14.2) * 0.95)),
        max: Math.round((30 + Math.max(0, dist - 2.0) * 14.2) * 1.05)
      },
      pickupEtaMinutes: Math.min(5, Math.max(2, Math.round(2 + (dist % 3)))),
      totalJourneyMinutes: Math.round(duration * 0.95),
      distanceKm: Number(dist.toFixed(1)),
      availability: 'AVAILABLE',
      isDemoEstimate: true,
      disclaimer: 'Demo estimate — not a live fare. Authorization credentials required for live dispatch.',
      bookingUrl: nyUrl,
      deepLinkUrl: nyUrl,
      capacity: { seats: 3, luggage: 1 },
      breakdown: { baseFare: 30, perKmFare: 14.2 },
      updatedAt: nowIso
    },
    // 12. Namma Yatri Cab
    {
      id: `ny-cab-${Math.round(dist * 10)}`,
      provider: 'namma_yatri',
      providerName: 'Namma Yatri',
      category: 'cab',
      tierName: 'Namma Yatri Cab',
      description: 'Affordable community-driven cab with direct driver UPI payments.',
      fareInr: Math.round(Math.max(75, 60 + dist * 15.5)),
      fareRange: {
        min: Math.round((60 + dist * 15.5) * 0.95),
        max: Math.round((60 + dist * 15.5) * 1.08)
      },
      pickupEtaMinutes: Math.min(7, Math.max(3, Math.round(3 + (dist % 4)))),
      totalJourneyMinutes: Math.round(duration),
      distanceKm: Number(dist.toFixed(1)),
      availability: 'AVAILABLE',
      isDemoEstimate: true,
      disclaimer: 'Demo estimate — not a live fare. Authorization credentials required for live dispatch.',
      bookingUrl: nyUrl,
      deepLinkUrl: nyUrl,
      capacity: { seats: 4, luggage: 2 },
      breakdown: { baseFare: 60, perKmFare: 15.5 },
      updatedAt: nowIso
    },
    // 13. BluSmart EV Sedan
    {
      id: `blu-sedan-${Math.round(dist * 10)}`,
      provider: 'blusmart',
      providerName: 'BluSmart EV',
      category: 'cab',
      tierName: 'BluSmart EV Sedan',
      description: '100% Electric sedan. Guaranteed zero cancellations & zero surge.',
      fareInr: Math.round(Math.max(120, 99 + Math.max(0, dist - 3.0) * 19.5 + duration * 0.8)),
      fareRange: {
        min: Math.round(Math.max(120, 99 + Math.max(0, dist - 3.0) * 19.5 + duration * 0.8)),
        max: Math.round(Math.max(120, 99 + Math.max(0, dist - 3.0) * 19.5 + duration * 0.8))
      },
      pickupEtaMinutes: Math.min(8, Math.max(4, Math.round(5 + (dist % 3)))),
      totalJourneyMinutes: Math.round(duration),
      distanceKm: Number(dist.toFixed(1)),
      availability: 'AVAILABLE',
      isDemoEstimate: true,
      disclaimer: 'Demo estimate — not a live fare. Authorization credentials required for live dispatch.',
      bookingUrl: bluUrl,
      deepLinkUrl: bluUrl,
      isElectric: true,
      capacity: { seats: 4, luggage: 2 },
      breakdown: { baseFare: 99, perKmFare: 19.5 },
      updatedAt: nowIso
    }
  ];

  const cheapest = rides.reduce((prev, curr) => (curr.fareInr < prev.fareInr ? curr : prev), rides[0]);
  const fastestPickup = rides.reduce((prev, curr) => (curr.pickupEtaMinutes < prev.pickupEtaMinutes ? curr : prev), rides[0]);
  const shortestJourney = rides.reduce((prev, curr) => (curr.totalJourneyMinutes < prev.totalJourneyMinutes ? curr : prev), rides[0]);

  const nowUtc = new Date();
  const istHours = (nowUtc.getUTCHours() + 5 + Math.floor((nowUtc.getUTCMinutes() + 30) / 60)) % 24;
  const isRushHour = (istHours >= 8 && istHours <= 11) || (istHours >= 17 && istHours <= 21);

  return {
    route,
    origin,
    destination,
    rides,
    recommendations: { cheapest, fastestPickup, shortestJourney },
    isDemoMode: true,
    notices: [
      'Demo estimate — not a live fare.',
      'Calculated using verified Indian urban benchmark fare models (fuel, base fare, and per-km rates).'
    ],
    rushHourActive: isRushHour,
    updatedAt: nowIso
  };
}
