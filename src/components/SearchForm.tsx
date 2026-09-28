import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Navigation,
  ArrowUpDown,
  Search,
  Clock,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Globe2
} from 'lucide-react';
import { LocationCoordinate } from '../types/index.js';
import {
  INDIA_MAJOR_CITIES,
  searchIndiaLocation,
  reverseGeocodeIndiaLocation,
  IndiaLocationSuggestion
} from '../services/indiaGeocoding.js';

interface SearchFormProps {
  origin: LocationCoordinate | null;
  destination: LocationCoordinate | null;
  onOriginChange: (loc: LocationCoordinate | null) => void;
  onDestinationChange: (loc: LocationCoordinate | null) => void;
  onCompare: () => void;
  isLoading: boolean;
  selectedCity: string;
}

export const SearchForm: React.FC<SearchFormProps> = ({
  origin,
  destination,
  onOriginChange,
  onDestinationChange,
  onCompare,
  isLoading,
  selectedCity
}) => {
  const [pickupText, setPickupText] = useState(origin?.address || '');
  const [destText, setDestText] = useState(destination?.address || '');
  const [isLocating, setIsLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  const [activeInput, setActiveInput] = useState<'pickup' | 'dest' | null>(null);
  const [suggestions, setSuggestions] = useState<IndiaLocationSuggestion[]>([]);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);

  const isAllIndia = selectedCity.startsWith('All India');
  const cityConfig = !isAllIndia && INDIA_MAJOR_CITIES[selectedCity] ? INDIA_MAJOR_CITIES[selectedCity] : null;
  const currentCityLandmarks = cityConfig
    ? cityConfig.landmarks
    : INDIA_MAJOR_CITIES['Bengaluru'].landmarks;

  // Update text fields if parent coordinates change externally
  useEffect(() => {
    if (origin?.address) {
      setPickupText(origin.address);
    }
  }, [origin]);

  useEffect(() => {
    if (destination?.address) {
      setDestText(destination.address);
    }
  }, [destination]);

  // Debounce search across entire India
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTextChange = (type: 'pickup' | 'dest', text: string) => {
    if (type === 'pickup') {
      setPickupText(text);
      if (!text.trim()) onOriginChange(null);
    } else {
      setDestText(text);
      if (!text.trim()) onDestinationChange(null);
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!text.trim()) {
      setSuggestions(
        currentCityLandmarks.slice(0, 5).map(lm => ({
          name: lm.name,
          address: lm.address,
          city: selectedCity,
          lat: lm.lat,
          lng: lm.lng
        }))
      );
      setIsSearchingSuggestions(false);
      return;
    }

    setIsSearchingSuggestions(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchIndiaLocation(
          text,
          isAllIndia ? undefined : selectedCity
        );
        setSuggestions(results);
      } catch (err) {
        console.warn('Geocoding error:', err);
      } finally {
        setIsSearchingSuggestions(false);
      }
    }, 220);
  };

  const handleSelectSuggestion = (
    type: 'pickup' | 'dest',
    item: IndiaLocationSuggestion
  ) => {
    const loc: LocationCoordinate = {
      lat: item.lat,
      lng: item.lng,
      address: item.name ? `${item.name}, ${item.city || item.address}` : item.address
    };

    if (type === 'pickup') {
      setPickupText(loc.address || item.name);
      onOriginChange(loc);
    } else {
      setDestText(loc.address || item.name);
      onDestinationChange(loc);
    }
    setActiveInput(null);
  };

  const handleSwap = () => {
    const tempOrigin = origin;
    const tempOriginText = pickupText;

    onOriginChange(destination);
    setPickupText(destText);

    onDestinationChange(tempOrigin);
    setDestText(tempOriginText);
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const readableAddress = await reverseGeocodeIndiaLocation(latitude, longitude);
        setIsLocating(false);
        setPickupText(readableAddress);
        onOriginChange({
          lat: latitude,
          lng: longitude,
          address: readableAddress
        });
      },
      (error) => {
        setIsLocating(false);
        setLocError('Unable to retrieve your location. Please check browser permissions.');
        console.warn('Geolocation error:', error);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleQuickPreset = (fromIndex: number, toIndex: number) => {
    const from = currentCityLandmarks[fromIndex];
    const to = currentCityLandmarks[toIndex];
    if (from && to) {
      setPickupText(from.name);
      onOriginChange({ lat: from.lat, lng: from.lng, address: from.address });
      setDestText(to.name);
      onDestinationChange({ lat: to.lat, lng: to.lng, address: to.address });
    }
  };

  const canCompare = Boolean(origin && destination);

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 p-5 sm:p-6 transition-all">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span>Compare Live Estimates</span>
        </h2>
        <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
          <Globe2 className="w-3.5 h-3.5 text-blue-600" />
          <span>{isAllIndia ? 'All India Coverage' : selectedCity}</span>
        </div>
      </div>

      {locError && (
        <div className="mb-4 flex items-center gap-2 p-3 text-xs rounded-xl bg-amber-50 text-amber-900 border border-amber-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{locError}</span>
        </div>
      )}

      {/* Form Inputs Container */}
      <div className="relative space-y-3">
        {/* Pickup Input */}
        <div className="relative">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              Pickup Location (Any location in India)
            </span>
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isLocating}
              className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer transition disabled:opacity-50"
            >
              <Navigation className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Locating...' : 'Use My GPS'}</span>
            </button>
          </label>

          <div className="relative">
            <input
              type="text"
              value={pickupText}
              placeholder="Search pickup locality, landmark, airport, or street anywhere in India..."
              onFocus={() => {
                setActiveInput('pickup');
                if (suggestions.length === 0) {
                  setSuggestions(
                    currentCityLandmarks.slice(0, 5).map(lm => ({
                      name: lm.name,
                      address: lm.address,
                      city: selectedCity,
                      lat: lm.lat,
                      lng: lm.lng
                    }))
                  );
                }
              }}
              onChange={(e) => handleTextChange('pickup', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition shadow-2xs font-medium"
            />
            {origin && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            )}
          </div>

          {/* Pickup Suggestion Dropdown */}
          {activeInput === 'pickup' && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden max-h-64 overflow-y-auto">
              <div className="p-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <span>{isAllIndia ? 'Search Across India' : `Popular in ${selectedCity} & India`}</span>
                {isSearchingSuggestions && <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />}
              </div>
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onMouseDown={() => handleSelectSuggestion('pickup', item)}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-blue-50/70 border-b border-slate-100 last:border-0 transition-colors flex items-start gap-2.5 cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-semibold text-slate-800">{item.name}</span>
                      {item.state && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                          {item.state}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">{item.address}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Swap Button Divider */}
        <div className="flex justify-center -my-1 relative z-10">
          <button
            type="button"
            onClick={handleSwap}
            title="Swap pickup and destination"
            className="p-1.5 rounded-full bg-white border border-slate-200 shadow-md text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-all active:scale-95 cursor-pointer"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Destination Input */}
        <div className="relative">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            Destination (Any location in India)
          </label>
          <div className="relative">
            <input
              type="text"
              value={destText}
              placeholder="Search destination locality, office, station, or address in India..."
              onFocus={() => {
                setActiveInput('dest');
                if (suggestions.length === 0) {
                  setSuggestions(
                    currentCityLandmarks.slice(0, 5).map(lm => ({
                      name: lm.name,
                      address: lm.address,
                      city: selectedCity,
                      lat: lm.lat,
                      lng: lm.lng
                    }))
                  );
                }
              }}
              onChange={(e) => handleTextChange('dest', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition shadow-2xs font-medium"
            />
            {destination && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-600">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            )}
          </div>

          {/* Destination Suggestion Dropdown */}
          {activeInput === 'dest' && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden max-h-64 overflow-y-auto">
              <div className="p-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <span>{isAllIndia ? 'Search Across India' : `Popular Destinations in ${selectedCity} & India`}</span>
                {isSearchingSuggestions && <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />}
              </div>
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onMouseDown={() => handleSelectSuggestion('dest', item)}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-blue-50/70 border-b border-slate-100 last:border-0 transition-colors flex items-start gap-2.5 cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-semibold text-slate-800">{item.name}</span>
                      {item.state && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                          {item.state}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">{item.address}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Popular Presets Quick Chips */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <div className="text-[11px] font-medium text-slate-500 mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Popular {isAllIndia ? 'India' : selectedCity} routes:</span>
          </span>
          <span className="text-[10px] text-slate-400">All India Address Search Enabled</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {currentCityLandmarks.length >= 3 && (
            <>
              <button
                type="button"
                onClick={() => handleQuickPreset(0, 1)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-medium transition-colors border border-slate-200 cursor-pointer"
              >
                {currentCityLandmarks[0].name.split(' ')[0]} ⇄ {currentCityLandmarks[1].name.split(' ')[0]}
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset(1, 2)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-medium transition-colors border border-slate-200 cursor-pointer"
              >
                {currentCityLandmarks[1].name.split(' ')[0]} ⇄ Airport
              </button>
              {currentCityLandmarks.length >= 4 && (
                <button
                  type="button"
                  onClick={() => handleQuickPreset(0, 3)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-medium transition-colors border border-slate-200 hidden sm:inline-block cursor-pointer"
                >
                  {currentCityLandmarks[0].name.split(' ')[0]} ⇄ {currentCityLandmarks[3].name.split(' ')[0]}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Compare Rides Button */}
      <div className="mt-5">
        <button
          type="button"
          onClick={onCompare}
          disabled={!canCompare || isLoading}
          className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
            canCompare && !isLoading
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/25 active:scale-[0.99] cursor-pointer'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Evaluating Real-Time Quotes...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Compare Rides in {isAllIndia ? 'India' : selectedCity}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
