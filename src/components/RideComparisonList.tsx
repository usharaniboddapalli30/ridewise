import React, { useState } from 'react';
import {
  Layers,
  ArrowDownUp,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Check,
  Compass,
  Clock
} from 'lucide-react';
import { ComparisonResponse, RideCategory, RideQuote } from '../types/index.js';
import { RecommendationCards } from './RecommendationCards.js';
import { RideCard } from './RideCard.js';

interface RideComparisonListProps {
  comparison: ComparisonResponse;
  onRefresh: () => void;
  isLoading: boolean;
}

type SortOption = 'price_asc' | 'pickup_fastest' | 'journey_fastest';

export const RideComparisonList: React.FC<RideComparisonListProps> = ({
  comparison,
  onRefresh,
  isLoading
}) => {
  const [activeCategory, setActiveCategory] = useState<RideCategory | 'all'>('all');
  const [evOnly, setEvOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortOption>('price_asc');

  const { rides, recommendations, route, isDemoMode, notices, rushHourActive } = comparison;

  // Filter by category and EV
  const filteredRides = rides.filter((ride) => {
    if (evOnly && !ride.isElectric) return false;
    if (activeCategory === 'all') return true;
    return ride.category === activeCategory;
  });

  // Sort rides
  const sortedRides = [...filteredRides].sort((a, b) => {
    if (sortBy === 'price_asc') {
      return a.fareInr - b.fareInr;
    }
    if (sortBy === 'pickup_fastest') {
      return a.pickupEtaMinutes - b.pickupEtaMinutes;
    }
    if (sortBy === 'journey_fastest') {
      return a.totalJourneyMinutes - b.totalJourneyMinutes;
    }
    return 0;
  });

  const bikeCount = rides.filter((r) => r.category === 'bike').length;
  const autoCount = rides.filter((r) => r.category === 'auto').length;
  const cabCount = rides.filter((r) => r.category === 'cab').length;
  const evCount = rides.filter((r) => r.isElectric).length;

  // Calculate potential savings
  const maxCabFare = Math.max(...rides.filter((r) => r.category === 'cab').map((r) => r.fareInr), 0);
  const potentialSavings = recommendations.cheapest && maxCabFare > recommendations.cheapest.fareInr
    ? maxCabFare - recommendations.cheapest.fareInr
    : 0;

  return (
    <div className="space-y-5">
      {/* Route Quick Summary Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg shadow-slate-900/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                <Compass className="w-3 h-3 mr-1" />
                Route Verified
              </span>
              <span className="text-xs text-slate-400">
                {comparison.origin.address?.split(',')[0]} ➔ {comparison.destination.address?.split(',')[0]}
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-3">
              <span className="text-xl font-bold text-white tracking-tight">
                {route.distanceKm} km
              </span>
              <span className="text-slate-400 text-sm">
                • approx {route.durationMinutes} mins drive
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Rates</span>
            </button>
          </div>
        </div>

        {/* Demo Disclaimer notice bar */}
        {isDemoMode && (
          <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-amber-300/90 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            <span>
              {notices[0] || 'Demo estimate — not a live fare.'} Connect API keys in backend environment to view authorized live driver dispatch.
            </span>
          </div>
        )}
      </div>

      {/* Dynamic Savings Callout */}
      {potentialSavings > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 text-xs text-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-emerald-800 bg-emerald-200/70 px-2.5 py-1 rounded-lg">
              Save up to ₹{potentialSavings}
            </span>
            <span className="text-slate-700">
              Choosing <strong>{recommendations.cheapest?.tierName}</strong> saves compared to premium cab fares on this route!
            </span>
          </div>
        </div>
      )}

      {/* Metro Rush Hour Warning Alert */}
      {rushHourActive && (
        <div className="bg-amber-50/90 border border-amber-200 rounded-2xl px-4 py-3 text-xs text-amber-950 flex items-center gap-2.5 shadow-2xs">
          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Metro Peak Traffic Active:</strong> Surface transit delays detected. Two-wheelers and autos bypass bottleneck queues.
          </span>
        </div>
      )}

      {/* Top 3 Independent Recommendations */}
      <RecommendationCards
        recommendations={recommendations}
        onSelectRide={(r) => {
          window.open(r.bookingUrl, '_blank');
        }}
      />

      {/* Filters and Sorting Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Category & EV Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto max-w-full">
          <button
            onClick={() => {
              setActiveCategory('all');
              setEvOnly(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeCategory === 'all' && !evOnly
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Rides ({rides.length})
          </button>
          <button
            onClick={() => {
              setActiveCategory('bike');
              setEvOnly(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
              activeCategory === 'bike' && !evOnly
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🏍️ Bikes</span>
            <span className="text-[10px] text-slate-400">({bikeCount})</span>
          </button>
          <button
            onClick={() => {
              setActiveCategory('auto');
              setEvOnly(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
              activeCategory === 'auto' && !evOnly
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🛺 Autos</span>
            <span className="text-[10px] text-slate-400">({autoCount})</span>
          </button>
          <button
            onClick={() => {
              setActiveCategory('cab');
              setEvOnly(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
              activeCategory === 'cab' && !evOnly
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🚗 Cabs</span>
            <span className="text-[10px] text-slate-400">({cabCount})</span>
          </button>
          {evCount > 0 && (
            <button
              onClick={() => setEvOnly(!evOnly)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                evOnly
                  ? 'bg-cyan-600 text-white shadow-2xs'
                  : 'bg-cyan-50 text-cyan-900 hover:bg-cyan-100 border border-cyan-200'
              }`}
            >
              <span>🌱 100% EV</span>
              <span className={`text-[10px] ${evOnly ? 'text-cyan-100' : 'text-cyan-700'}`}>({evCount})</span>
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <ArrowDownUp className="w-3.5 h-3.5" />
            Sort:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-white border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg px-2.5 py-1.5 outline-none cursor-pointer hover:border-slate-300"
          >
            <option value="price_asc">Lowest Fare (₹)</option>
            <option value="pickup_fastest">Fastest Pickup</option>
            <option value="journey_fastest">Shortest Trip Time</option>
          </select>
        </div>
      </div>

      {/* Rides List */}
      <div className="space-y-3">
        {sortedRides.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
            <Layers className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <h4 className="text-sm font-bold text-slate-800">No rides in this category</h4>
            <p className="text-xs text-slate-500 mt-1">
              Try switching back to "All Rides" to view available bikes, autos, and cabs.
            </p>
          </div>
        ) : (
          sortedRides.map((ride) => (
            <RideCard
              key={ride.id}
              ride={ride}
              isBestPrice={recommendations.cheapest?.id === ride.id}
              isFastestPickup={recommendations.fastestPickup?.id === ride.id}
              isShortestJourney={recommendations.shortestJourney?.id === ride.id}
            />
          ))
        )}
      </div>

      {/* Transparency & Disclaimer footer */}
      <div className="text-center text-[11px] text-slate-400 py-3">
        <p>
          Rates include standard city tax. Fares subject to live driver availability, rain surcharge, or toll gate charges.
        </p>
      </div>
    </div>
  );
};
