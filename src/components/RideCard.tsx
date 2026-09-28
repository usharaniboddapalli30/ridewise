import React, { useState } from 'react';
import {
  Clock,
  Navigation,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Bike,
  Car
} from 'lucide-react';
import { RideQuote } from '../types/index.js';

interface RideCardProps {
  ride: RideQuote;
  isBestPrice?: boolean;
  isFastestPickup?: boolean;
  isShortestJourney?: boolean;
}

export const RideCard: React.FC<RideCardProps> = ({
  ride,
  isBestPrice,
  isFastestPickup,
  isShortestJourney
}) => {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const isRapido = ride.provider === 'rapido';
  const isOla = ride.provider === 'ola';
  const isNammaYatri = ride.provider === 'namma_yatri';
  const isBluSmart = ride.provider === 'blusmart';
  const isBike = ride.category === 'bike';
  const isAuto = ride.category === 'auto';

  // Availability badge config
  const getAvailabilityBadge = () => {
    switch (ride.availability) {
      case 'AVAILABLE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Available
          </span>
        );
      case 'HIGH_DEMAND':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            High Demand
          </span>
        );
      case 'UNAVAILABLE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-500" />
            Unavailable
          </span>
        );
      case 'NOT_VERIFIED':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <HelpCircle className="w-3 h-3 text-slate-400" />
            Not Verified
          </span>
        );
    }
  };

  return (
    <div
      className={`rounded-2xl border transition-all overflow-hidden ${
        isBestPrice
          ? 'border-emerald-300 bg-white shadow-md shadow-emerald-500/5 ring-1 ring-emerald-400/30'
          : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs hover:shadow-sm'
      }`}
    >
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left: Provider & Vehicle Info */}
          <div className="flex items-start gap-3.5">
            {/* Provider Logo Avatar */}
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs font-bold text-base ${
                isRapido
                  ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300/60'
                  : isOla
                  ? 'bg-lime-400 text-slate-950 ring-2 ring-lime-300/60'
                  : isNammaYatri
                  ? 'bg-yellow-400 text-slate-950 ring-2 ring-yellow-300/80 font-black'
                  : isBluSmart
                  ? 'bg-cyan-500 text-white ring-2 ring-cyan-400/80 font-black'
                  : 'bg-slate-950 text-white ring-2 ring-slate-800'
              }`}
            >
              {isRapido ? (
                <span className="tracking-tighter">R</span>
              ) : isOla ? (
                <span className="text-xs font-black tracking-tight">OLA</span>
              ) : isNammaYatri ? (
                <span className="text-xs font-black tracking-tight">NY</span>
              ) : isBluSmart ? (
                <span className="text-[11px] font-black tracking-tight">BLU</span>
              ) : (
                <span className="tracking-tight">Uber</span>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-base font-bold text-slate-900">{ride.tierName}</h4>
                {/* Badges */}
                {ride.isElectric && (
                  <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200">
                    🌱 100% EV
                  </span>
                )}
                {isNammaYatri && (
                  <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-yellow-100 text-yellow-900 border border-yellow-200">
                    0% Commission
                  </span>
                )}
                {isBestPrice && (
                  <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Lowest Fare
                  </span>
                )}
                {isFastestPickup && (
                  <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                    Fastest Driver
                  </span>
                )}
                {isShortestJourney && !isFastestPickup && (
                  <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                    Quickest Trip
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                {ride.description}
              </p>

              {/* Status, capacity, and ETA indicators */}
              <div className="flex flex-wrap items-center gap-2.5 mt-2 text-xs text-slate-600">
                <span className="flex items-center gap-1 font-semibold text-slate-800">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  {ride.pickupEtaMinutes} min pickup
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 text-slate-600">
                  <Navigation className="w-3.5 h-3.5 text-slate-400" />
                  {ride.totalJourneyMinutes} min trip ({ride.distanceKm} km)
                </span>
                {ride.capacity && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500 font-medium">
                      👥 {ride.capacity.seats} seats
                    </span>
                  </>
                )}
                <span className="text-slate-300">•</span>
                {getAvailabilityBadge()}
              </div>
            </div>
          </div>

          {/* Right: Fare & Booking CTA */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
            <div className="text-left sm:text-right">
              <div className="flex items-baseline sm:justify-end gap-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  ₹{ride.fareInr}
                </span>
              </div>
              {ride.fareRange && (
                <div className="text-[11px] text-slate-400 font-medium">
                  Est. ₹{ride.fareRange.min} - ₹{ride.fareRange.max}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="p-2 text-slate-400 hover:text-slate-700 text-xs rounded-lg hover:bg-slate-100 transition-colors"
                title="View fare calculation breakdown"
              >
                {showBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              <a
                href={ride.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all active:scale-[0.98] ${
                  isRapido
                    ? 'bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-amber-400/20'
                    : isOla
                    ? 'bg-lime-400 hover:bg-lime-500 text-slate-950 shadow-lime-400/20'
                    : isNammaYatri
                    ? 'bg-yellow-400 hover:bg-yellow-500 text-slate-950 shadow-yellow-400/20'
                    : isBluSmart
                    ? 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-cyan-600/20'
                    : 'bg-slate-950 hover:bg-slate-800 text-white shadow-slate-900/20'
                }`}
              >
                <span>Book on {ride.providerName}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Demo Estimate Notice Tag */}
        {ride.isDemoEstimate && (
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1 font-medium text-amber-700/90 bg-amber-50 px-2 py-0.5 rounded-md">
              <Sparkles className="w-3 h-3 text-amber-600" />
              {ride.disclaimer}
            </span>
            <span className="hidden sm:inline text-slate-400">
              Updated just now
            </span>
          </div>
        )}

        {/* Expandable Fare Breakdown */}
        {showBreakdown && (
          <div className="mt-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
            <div className="font-semibold text-slate-700 flex items-center justify-between">
              <span>Fare Breakdown & Estimator Rules</span>
              <span className="text-[11px] text-slate-500 font-normal">Standard Metro Rate Card</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-600 pt-1">
              {ride.breakdown && (
                <>
                  <div className="bg-white p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Base Fare:</span>
                    <span className="font-semibold text-slate-800">₹{ride.breakdown.baseFare}</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Per Km Rate:</span>
                    <span className="font-semibold text-slate-800">₹{ride.breakdown.perKmFare}/km</span>
                  </div>
                </>
              )}
              <div className="bg-white p-2 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 block">Distance:</span>
                <span className="font-semibold text-slate-800">{ride.distanceKm} km</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 italic pt-1">
              Final fare in the {ride.providerName} app may vary based on real-time traffic delays, driver surge, waiting time, and applicable city tolls.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
