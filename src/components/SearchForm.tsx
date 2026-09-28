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
  AlertCircle
} from 'lucide-react';
import { LocationCoordinate, PopularRoute } from '../types/index.js';

interface SearchFormProps {
  origin: LocationCoordinate | null;
  destination: LocationCoordinate | null;
  onOriginChange: (loc: LocationCoordinate | null) => void;
  onDestinationChange: (loc: LocationCoordinate | null) => void;
  onCompare: () => void;
  isLoading: boolean;
  selectedCity: string;
}

// Preset popular landmarks for instant suggestions in top Indian metros
const CITY_LANDMARKS: Record<string, Array<{ name: string; address: string; lat: number; lng: number }>> = {
  'Bengaluru': [
    { name: 'Indiranagar 100ft Road', address: '100 Feet Rd, HAL 2nd Stage, Indiranagar, Bengaluru', lat: 12.9719, lng: 77.6412 },
    { name: 'Koramangala 5th Block', address: 'Sony World Junction, Koramangala 5th Block, Bengaluru', lat: 12.9352, lng: 77.6245 },
    { name: 'Kempegowda Intl Airport (BLR)', address: 'BLR Airport Terminal 1, Devanahalli, Bengaluru', lat: 13.1986, lng: 77.7066 },
    { name: 'Whitefield ITPL', address: 'International Tech Park (ITPL), Whitefield, Bengaluru', lat: 12.9866, lng: 77.7381 },
    { name: 'HSR Layout Sector 2', address: '27th Main Rd, HSR Layout Sector 2, Bengaluru', lat: 12.9116, lng: 77.6534 },
    { name: 'MG Road Metro Station', address: 'MG Road, Shivaji Nagar, Bengaluru', lat: 12.9756, lng: 77.6066 }
  ],
  'Delhi NCR': [
    { name: 'Connaught Place Inner Circle', address: 'Connaught Place, New Delhi', lat: 28.6315, lng: 77.2167 },
    { name: 'DLF Cyber Hub Gurgaon', address: 'Cyber City, Phase 2, Gurugram, Haryana', lat: 28.4950, lng: 77.0895 },
    { name: 'Indira Gandhi Intl Airport (IGI T3)', address: 'Terminal 3, IGI Airport, New Delhi', lat: 28.5562, lng: 77.1000 },
    { name: 'Hauz Khas Village', address: 'Deer Park, Hauz Khas, New Delhi', lat: 28.5535, lng: 77.1945 },
    { name: 'Sector 18 Noida (Atta Market)', address: 'Sector 18, Noida, Uttar Pradesh', lat: 28.5708, lng: 77.3271 }
  ],
  'Mumbai': [
    { name: 'Bandra West (Linking Road)', address: 'Linking Road, Bandra West, Mumbai', lat: 19.0600, lng: 72.8360 },
    { name: 'Bandra Kurla Complex (BKC)', address: 'G Block, BKC, Bandra East, Mumbai', lat: 19.0673, lng: 72.8687 },
    { name: 'Chhatrapati Shivaji Maharaj Airport (T2)', address: 'Sahar, Andheri East, Mumbai', lat: 19.0896, lng: 72.8656 },
    { name: 'Churchgate Railway Station', address: 'Churchgate, Fort, Mumbai', lat: 18.9322, lng: 72.8264 },
    { name: 'Powai (Hiranandani Gardens)', address: 'Hiranandani Gardens, Powai, Mumbai', lat: 19.1197, lng: 72.9051 }
  ],
  'Hyderabad': [
    { name: 'Hitec City (Cyber Towers)', address: 'HITEC City, Madhapur, Hyderabad', lat: 17.4504, lng: 78.3808 },
    { name: 'Gachibowli Stadium', address: 'Old Mumbai Highway, Gachibowli, Hyderabad', lat: 17.4443, lng: 78.3498 },
    { name: 'Rajiv Gandhi Intl Airport (RGIA)', address: 'Shamshabad, Hyderabad', lat: 17.2403, lng: 78.4294 },
    { name: 'Jubilee Hills Check Post', address: 'Road No. 36, Jubilee Hills, Hyderabad', lat: 17.4326, lng: 78.4071 },
    { name: 'Charminar Old City', address: 'Char Kaman, Ghansi Bazaar, Hyderabad', lat: 17.3616, lng: 78.4747 }
  ],
  'Pune': [
    { name: 'Koregaon Park (North Main Rd)', address: 'Koregaon Park, Pune', lat: 18.5362, lng: 73.8940 },
    { name: 'Hinjawadi Phase 1 IT Park', address: 'Rajiv Gandhi Infotech Park, Hinjawadi, Pune', lat: 18.5913, lng: 73.7389 },
    { name: 'Viman Nagar (Phoenix Marketcity)', address: 'Viman Nagar, Pune', lat: 18.5621, lng: 73.9167 },
    { name: 'Pune Railway Station', address: 'Agarkar Nagar, Pune', lat: 18.5284, lng: 73.8744 }
  ],
  'Chennai': [
    { name: 'T. Nagar (Panagal Park)', address: 'Prakasam Rd, T. Nagar, Chennai', lat: 13.0418, lng: 80.2341 },
    { name: 'OMR Sholinganallur Junction', address: 'Old Mahabalipuram Rd, Sholinganallur, Chennai', lat: 12.9010, lng: 80.2279 },
    { name: 'Chennai International Airport (MAA)', address: 'GST Road, Meenambakkam, Chennai', lat: 12.9941, lng: 80.1709 },
    { name: 'Marina Beach Light House', address: 'Kamarajar Salai, Mylapore, Chennai', lat: 13.0390, lng: 80.2785 }
  ],
  'Kolkata': [
    { name: 'Park Street (Flurys)', address: 'Park Street, Kolkata', lat: 22.5535, lng: 88.3524 },
    { name: 'Salt Lake Sector V', address: 'Bidhannagar, Salt Lake Sector V, Kolkata', lat: 22.5804, lng: 88.4378 },
    { name: 'Netaji Subhash Chandra Bose Airport (CCU)', address: 'Dum Dum, Kolkata', lat: 22.6547, lng: 88.4467 },
    { name: 'Howrah Railway Station', address: 'Howrah, West Bengal', lat: 22.5839, lng: 88.3426 }
  ]
};

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
  const [suggestions, setSuggestions] = useState<Array<{ name: string; address: string; lat: number; lng: number }>>([]);

  const currentCityLandmarks = CITY_LANDMARKS[selectedCity] || CITY_LANDMARKS['Bengaluru'];

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

  // Dynamic filter for suggestions as user types
  const handleTextChange = (type: 'pickup' | 'dest', text: string) => {
    if (type === 'pickup') {
      setPickupText(text);
      if (!text.trim()) {
        onOriginChange(null);
      }
    } else {
      setDestText(text);
      if (!text.trim()) {
        onDestinationChange(null);
      }
    }

    if (!text.trim()) {
      setSuggestions(currentCityLandmarks.slice(0, 4));
      return;
    }

    const filtered = currentCityLandmarks.filter(
      item =>
        item.name.toLowerCase().includes(text.toLowerCase()) ||
        item.address.toLowerCase().includes(text.toLowerCase())
    );

    if (filtered.length > 0) {
      setSuggestions(filtered);
    } else {
      // Create a virtual match for the entered text centered around the city
      const center = currentCityLandmarks[0];
      setSuggestions([
        {
          name: text,
          address: `${text}, ${selectedCity}`,
          lat: center.lat + (Math.random() - 0.5) * 0.05,
          lng: center.lng + (Math.random() - 0.5) * 0.05
        }
      ]);
    }
  };

  const handleSelectSuggestion = (
    type: 'pickup' | 'dest',
    item: { name: string; address: string; lat: number; lng: number }
  ) => {
    if (type === 'pickup') {
      setPickupText(item.name);
      onOriginChange({
        lat: item.lat,
        lng: item.lng,
        address: item.name
      });
    } else {
      setDestText(item.name);
      onDestinationChange({
        lat: item.lat,
        lng: item.lng,
        address: item.name
      });
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
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;
        const address = `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
        setPickupText(address);
        onOriginChange({
          lat: latitude,
          lng: longitude,
          address: 'Current Location'
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
      onOriginChange({ lat: from.lat, lng: from.lng, address: from.name });
      setDestText(to.name);
      onDestinationChange({ lat: to.lat, lng: to.lng, address: to.name });
    }
  };

  const canCompare = Boolean(origin && destination);

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 p-5 sm:p-6 transition-all">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span>Compare Live Estimates</span>
        </h2>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
          {selectedCity}
        </span>
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
              Pickup Location
            </span>
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isLocating}
              className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1 text-[11px] hover:underline"
            >
              {isLocating ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                  <span>Detecting...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-3 h-3" />
                  <span>Use Current Location</span>
                </>
              )}
            </button>
          </label>

          <div className="relative">
            <input
              type="text"
              value={pickupText}
              placeholder={`Enter pickup spot in ${selectedCity}...`}
              onFocus={() => {
                setActiveInput('pickup');
                setSuggestions(currentCityLandmarks.slice(0, 4));
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
            <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden max-h-56 overflow-y-auto">
              <div className="p-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                Popular Pickup Points in {selectedCity}
              </div>
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onMouseDown={() => handleSelectSuggestion('pickup', item)}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-blue-50/70 border-b border-slate-100 last:border-0 transition-colors flex items-start gap-2.5"
                >
                  <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-slate-800">{item.name}</div>
                    <div className="text-[11px] text-slate-500 truncate max-w-xs">{item.address}</div>
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
            className="p-1.5 rounded-full bg-white border border-slate-200 shadow-md text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-all active:scale-95"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Destination Input */}
        <div className="relative">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            Destination
          </label>
          <div className="relative">
            <input
              type="text"
              value={destText}
              placeholder={`Where do you want to go in ${selectedCity}?`}
              onFocus={() => {
                setActiveInput('dest');
                setSuggestions(currentCityLandmarks.slice(0, 4));
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
            <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden max-h-56 overflow-y-auto">
              <div className="p-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                Popular Destinations in {selectedCity}
              </div>
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onMouseDown={() => handleSelectSuggestion('dest', item)}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-blue-50/70 border-b border-slate-100 last:border-0 transition-colors flex items-start gap-2.5"
                >
                  <MapPin className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-slate-800">{item.name}</div>
                    <div className="text-[11px] text-slate-500 truncate max-w-xs">{item.address}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Popular Presets Quick Chips */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <div className="text-[11px] font-medium text-slate-500 mb-2 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Quick 1-tap route presets:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {currentCityLandmarks.length >= 3 && (
            <>
              <button
                type="button"
                onClick={() => handleQuickPreset(0, 1)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-medium transition-colors border border-slate-200"
              >
                {currentCityLandmarks[0].name.split(' ')[0]} ⇄ {currentCityLandmarks[1].name.split(' ')[0]}
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset(1, 2)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-medium transition-colors border border-slate-200"
              >
                {currentCityLandmarks[1].name.split(' ')[0]} ⇄ Airport
              </button>
              {currentCityLandmarks.length >= 4 && (
                <button
                  type="button"
                  onClick={() => handleQuickPreset(0, 3)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-medium transition-colors border border-slate-200 hidden sm:inline-block"
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
              <span>Comparing Rapido & Uber Fares...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Compare Rides Now</span>
            </>
          )}
        </button>

        {!canCompare && (
          <p className="text-[11px] text-center text-slate-400 mt-2">
            Select both pickup and destination spots to compare live fares.
          </p>
        )}
      </div>
    </div>
  );
};
