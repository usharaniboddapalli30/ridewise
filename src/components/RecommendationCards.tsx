import React from 'react';
import { DollarSign, Clock, Zap, ArrowRight, ExternalLink, ShieldCheck } from 'lucide-react';
import { RideQuote, RideRecommendation } from '../types/index.js';

interface RecommendationCardsProps {
  recommendations: RideRecommendation;
  onSelectRide: (ride: RideQuote) => void;
}

export const RecommendationCards: React.FC<RecommendationCardsProps> = ({
  recommendations,
  onSelectRide
}) => {
  const { cheapest, fastestPickup, shortestJourney } = recommendations;

  if (!cheapest && !fastestPickup && !shortestJourney) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
            Top Recommendations
          </h3>
          <p className="text-xs text-slate-500">
            Smart picks based on budget, driver proximity, and transit time
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* 1. Cheapest Ride */}
        {cheapest && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-white border border-emerald-200/80 p-4.5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
                  Cheapest Ride
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {cheapest.providerName}
                </span>
              </div>

              <div className="mt-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-slate-900">
                    ₹{cheapest.fareInr}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">est.</span>
                </div>
                <div className="text-xs font-semibold text-slate-800 mt-0.5">
                  {cheapest.tierName}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                  {cheapest.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-emerald-100 flex items-center justify-between text-xs text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[10px]">Pickup:</span>
                  <span className="font-semibold text-slate-800">{cheapest.pickupEtaMinutes} min</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Trip time:</span>
                  <span className="font-semibold text-slate-800">{cheapest.totalJourneyMinutes} min</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Savings:</span>
                  <span className="font-semibold text-emerald-700">Best Price</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-2">
              <a
                href={cheapest.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <span>Book on {cheapest.providerName}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* 2. Fastest Pickup */}
        {fastestPickup && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white border border-amber-200/80 p-4.5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 w-16 h-16 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                  <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                  Fastest Pickup
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {fastestPickup.providerName}
                </span>
              </div>

              <div className="mt-2">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold text-amber-950">
                    {fastestPickup.pickupEtaMinutes} min
                  </span>
                  <span className="text-xs text-slate-500 font-medium">arrival</span>
                </div>
                <div className="text-xs font-semibold text-slate-800 mt-0.5">
                  {fastestPickup.tierName}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                  Nearest driver in your pickup zone
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-amber-100 flex items-center justify-between text-xs text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[10px]">Fare:</span>
                  <span className="font-semibold text-slate-800">₹{fastestPickup.fareInr}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Trip time:</span>
                  <span className="font-semibold text-slate-800">{fastestPickup.totalJourneyMinutes} min</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Driver:</span>
                  <span className="font-semibold text-amber-700">Immediate</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-2">
              <a
                href={fastestPickup.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <span>Book on {fastestPickup.providerName}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* 3. Shortest Journey */}
        {shortestJourney && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-white border border-blue-200/80 p-4.5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 w-16 h-16 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  Shortest Journey
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {shortestJourney.providerName}
                </span>
              </div>

              <div className="mt-2">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold text-blue-950">
                    {shortestJourney.totalJourneyMinutes} min
                  </span>
                  <span className="text-xs text-slate-500 font-medium">transit</span>
                </div>
                <div className="text-xs font-semibold text-slate-800 mt-0.5">
                  {shortestJourney.tierName}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                  Quickest point-to-point transit route
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-blue-100 flex items-center justify-between text-xs text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[10px]">Fare:</span>
                  <span className="font-semibold text-slate-800">₹{shortestJourney.fareInr}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Pickup:</span>
                  <span className="font-semibold text-slate-800">{shortestJourney.pickupEtaMinutes} min</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Traffic:</span>
                  <span className="font-semibold text-blue-700">Quickest</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-2">
              <a
                href={shortestJourney.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <span>Book on {shortestJourney.providerName}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
