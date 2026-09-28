import { LocationCoordinate, RouteMetrics } from '../adapters/types.js';

export async function computeRoute(
  origin: LocationCoordinate,
  destination: LocationCoordinate
): Promise<RouteMetrics> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;

  if (apiKey) {
    try {
      const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
        method: 'POST',
        signal: AbortSignal.timeout(2500),
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.description'
        },
        body: JSON.stringify({
          origin: {
            location: {
              latLng: {
                latitude: origin.lat,
                longitude: origin.lng
              }
            }
          },
          destination: {
            location: {
              latLng: {
                latitude: destination.lat,
                longitude: destination.lng
              }
            }
          },
          travelMode: 'DRIVE',
          routingPreference: 'TRAFFIC_AWARE',
          computeAlternativeRoutes: false,
          languageCode: 'en-IN',
          units: 'METRIC'
        })
      });

      if (response.ok) {
        const data = await response.json();
        const route = data.routes?.[0];
        if (route) {
          const distanceMeters = route.distanceMeters || 0;
          const durationSeconds = parseInt(route.duration?.replace('s', '') || '0', 10);
          const distanceKm = Math.round((distanceMeters / 1000) * 10) / 10;
          const durationMinutes = Math.max(1, Math.round(durationSeconds / 60));

          return {
            distanceKm: distanceKm || 5.2,
            durationMinutes: durationMinutes || 18,
            summary: route.description || 'Fastest route via main road',
            encodedPolyline: route.polyline?.encodedPolyline,
            polylinePoints: decodePolyline(route.polyline?.encodedPolyline)
          };
        }
      }
    } catch (err) {
      console.warn('Routes API call failed on backend, using fallback estimation:', err);
    }
  }

  // Fallback calculation using Haversine formula + urban road curvature multiplier
  return calculateFallbackRoute(origin, destination);
}

function calculateFallbackRoute(
  origin: LocationCoordinate,
  destination: LocationCoordinate
): RouteMetrics {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(destination.lat - origin.lat);
  const dLon = toRad(destination.lng - origin.lng);
  const lat1 = toRad(origin.lat);
  const lat2 = toRad(destination.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLineKm = R * c;

  // Urban road multiplier in Indian cities typically ~1.35x straight line
  const roadDistanceKm = Math.max(0.8, Math.round(straightLineKm * 1.38 * 10) / 10);

  // Typical average speed in Indian metro traffic: ~20-25 km/h + 3 min signal delays
  const averageSpeedKmh = roadDistanceKm < 5 ? 20 : 25;
  const travelDurationMinutes = Math.max(5, Math.round((roadDistanceKm / averageSpeedKmh) * 60 + 3));

  // Generate intermediate points for smooth curve line on map
  const polylinePoints: Array<{ lat: number; lng: number }> = [];
  const steps = 15;
  for (let i = 0; i <= steps; i++) {
    const fraction = i / steps;
    // slight curve displacement
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

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

// Polyline decoder utility
function decodePolyline(encoded?: string): Array<{ lat: number; lng: number }> {
  if (!encoded) return [];
  const points: Array<{ lat: number; lng: number }> = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }

  return points;
}
