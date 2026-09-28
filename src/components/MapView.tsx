/// <reference types="google.maps" />
import React, { useEffect, useRef } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
  useMapsLibrary
} from '@vis.gl/react-google-maps';
import { MapPin, Navigation, Compass, AlertCircle } from 'lucide-react';
import { LocationCoordinate, RouteMetrics } from '../types/index.js';

interface MapViewProps {
  apiKey: string;
  origin: LocationCoordinate | null;
  destination: LocationCoordinate | null;
  route: RouteMetrics | null;
}

// Inner helper to manage route polyline and map bounds
const RouteRenderer: React.FC<{
  origin: LocationCoordinate | null;
  destination: LocationCoordinate | null;
  route: RouteMetrics | null;
}> = ({ origin, destination, route }) => {
  const map = useMap();
  const mapsLib = useMapsLibrary('maps');
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map || !mapsLib) return;

    // Clean up previous polyline
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    if (origin && destination) {
      // Fit bounds
      const bounds = new google.maps.LatLngBounds();
      bounds.extend({ lat: origin.lat, lng: origin.lng });
      bounds.extend({ lat: destination.lat, lng: destination.lng });

      // Add polyline points if available
      const pathPoints: google.maps.LatLngLiteral[] = [];
      if (route?.polylinePoints && route.polylinePoints.length > 0) {
        route.polylinePoints.forEach((p) => {
          pathPoints.push({ lat: p.lat, lng: p.lng });
          bounds.extend({ lat: p.lat, lng: p.lng });
        });
      } else {
        pathPoints.push({ lat: origin.lat, lng: origin.lng });
        pathPoints.push({ lat: destination.lat, lng: destination.lng });
      }

      const polyline = new mapsLib.Polyline({
        path: pathPoints,
        geodesic: true,
        strokeColor: '#2563eb', // Blue primary
        strokeOpacity: 0.85,
        strokeWeight: 5,
        map: map
      });

      polylineRef.current = polyline;

      map.fitBounds(bounds, {
        top: 60,
        bottom: 60,
        left: 60,
        right: 60
      });
    } else if (origin) {
      map.setCenter({ lat: origin.lat, lng: origin.lng });
      map.setZoom(14);
    } else if (destination) {
      map.setCenter({ lat: destination.lat, lng: destination.lng });
      map.setZoom(14);
    }

    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }
    };
  }, [map, mapsLib, origin, destination, route]);

  return null;
};

export const MapView: React.FC<MapViewProps> = ({
  apiKey,
  origin,
  destination,
  route
}) => {
  // Default center to central India / Bengaluru if none provided
  const defaultCenter = origin
    ? { lat: origin.lat, lng: origin.lng }
    : destination
    ? { lat: destination.lat, lng: destination.lng }
    : { lat: 12.9716, lng: 77.5946 }; // Bengaluru center

  if (!apiKey) {
    return (
      <div className="w-full h-full min-h-[380px] bg-slate-100 rounded-2xl border border-slate-200 flex flex-col items-center justify-center p-6 text-center">
        <MapPin className="w-10 h-10 text-slate-400 mb-3" />
        <h4 className="text-sm font-bold text-slate-700">Interactive Map Preview</h4>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Google Maps API key is required to render interactive vector tiles and live route polyline.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[380px] rounded-2xl overflow-hidden border border-slate-200 shadow-md">
      <APIProvider apiKey={apiKey}>
        <Map
          id="ride-wise-map"
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          defaultCenter={defaultCenter}
          defaultZoom={13}
          gestureHandling="greedy"
          disableDefaultUI={false}
          zoomControl={true}
          style={{ width: '100%', height: '100%', minHeight: '380px' }}
        >
          {/* Pickup Marker */}
          {origin && (
            <AdvancedMarker
              position={{ lat: origin.lat, lng: origin.lng }}
              title={origin.address || 'Pickup'}
            >
              <div className="flex flex-col items-center group cursor-pointer">
                <div className="px-2 py-1 bg-emerald-600 text-white font-bold text-[11px] rounded-md shadow-md mb-1 whitespace-nowrap border border-emerald-400">
                  📍 Pickup
                </div>
                <div className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-lg ring-2 ring-emerald-600 animate-pulse" />
              </div>
            </AdvancedMarker>
          )}

          {/* Destination Marker */}
          {destination && (
            <AdvancedMarker
              position={{ lat: destination.lat, lng: destination.lng }}
              title={destination.address || 'Destination'}
            >
              <div className="flex flex-col items-center group cursor-pointer">
                <div className="px-2 py-1 bg-rose-600 text-white font-bold text-[11px] rounded-md shadow-md mb-1 whitespace-nowrap border border-rose-400">
                  🏁 Dropoff
                </div>
                <div className="w-4 h-4 rounded-full bg-rose-500 border-2 border-white shadow-lg ring-2 ring-rose-600" />
              </div>
            </AdvancedMarker>
          )}

          {/* Polyline and Camera bounds controller */}
          <RouteRenderer origin={origin} destination={destination} route={route} />
        </Map>
      </APIProvider>

      {/* Floating Route Info Badge */}
      {route && (
        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-lg border border-slate-200/80 text-xs flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <Navigation className="w-3.5 h-3.5 text-blue-600" />
            <span>{route.distanceKm} km</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="text-slate-600 font-medium">
            ~{route.durationMinutes} mins
          </div>
        </div>
      )}
    </div>
  );
};
