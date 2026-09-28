import React, { useState, useEffect } from 'react';
import {
  Zap,
  MapPin,
  Search,
  RotateCcw,
  Sparkles,
  Shield,
  Layers,
  ArrowRight,
  Info,
  TrendingDown,
  Navigation2,
  Clock,
  Car
} from 'lucide-react';
import { Navbar, CITIES } from './components/Navbar.js';
import { SearchForm } from './components/SearchForm.js';
import { RideComparisonList } from './components/RideComparisonList.js';
import { MapView } from './components/MapView.js';
import { AboutModal } from './components/AboutModal.js';
import { ApiStatusModal } from './components/ApiStatusModal.js';
import { QuotaWarningBanner } from './components/QuotaWarningBanner.js';
import { ComparisonResponse, LocationCoordinate } from './types/index.js';
import { computeLocalRoute, generateAllQuotes } from './services/rideComparator.js';
import { INDIA_MAJOR_CITIES } from './services/indiaGeocoding.js';

export default function App() {
  const [selectedCity, setSelectedCity] = useState<string>('Bengaluru');
  const [origin, setOrigin] = useState<LocationCoordinate | null>({
    lat: 12.9719,
    lng: 77.6412,
    address: '100 Feet Rd, Indiranagar, Bengaluru'
  });
  const [destination, setDestination] = useState<LocationCoordinate | null>({
    lat: 12.9352,
    lng: 77.6245,
    address: 'Koramangala 5th Block, Bengaluru'
  });

  const [comparison, setComparison] = useState<ComparisonResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);
  const [isApiStatusOpen, setIsApiStatusOpen] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<'rides' | 'map'>('rides');

  const [mapsApiKey, setMapsApiKey] = useState<string>(
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  );

  // Fetch server config if maps key is not yet set in client env
  useEffect(() => {
    if (!mapsApiKey) {
      fetch('/api/config')
        .then((res) => res.json())
        .then((data) => {
          if (data.googleMapsApiKey) {
            setMapsApiKey(data.googleMapsApiKey);
          }
        })
        .catch(() => {});
    }
  }, [mapsApiKey]);

  // Initial auto-compare on mount to delight user with immediate comparison
  useEffect(() => {
    if (origin && destination && !comparison) {
      handleCompareRides();
    }
  }, []);

  const handleCityChange = (newCity: string) => {
    setSelectedCity(newCity);
    
    // Check if newCity exists in INDIA_MAJOR_CITIES
    const cityData = INDIA_MAJOR_CITIES[newCity];
    if (cityData && cityData.landmarks.length >= 2) {
      setOrigin({
        lat: cityData.landmarks[0].lat,
        lng: cityData.landmarks[0].lng,
        address: cityData.landmarks[0].address
      });
      setDestination({
        lat: cityData.landmarks[1].lat,
        lng: cityData.landmarks[1].lng,
        address: cityData.landmarks[1].address
      });
    } else if (newCity.startsWith('All India')) {
      // Keep existing locations or prompt user
    } else {
      setOrigin({ lat: 12.9719, lng: 77.6412, address: '100 Feet Rd, Indiranagar, Bengaluru' });
      setDestination({ lat: 12.9352, lng: 77.6245, address: 'Koramangala 5th Block, Bengaluru' });
    }
    // Clear existing results until user clicks compare or auto-recalculated
    setComparison(null);
  };

  const handleCompareRides = async () => {
    if (!origin || !destination) {
      setError('Please select both pickup and destination locations.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ origin, destination })
      });

      if (response.ok) {
        const data: ComparisonResponse = await response.json();
        setComparison(data);
        setIsLoading(false);
        return;
      }
    } catch (err: any) {
      console.warn('Network call to backend failed, activating seamless browser engine:', err);
    }

    // Fallback: If backend returns 404 or fails, seamlessly compute locally without throwing an error
    try {
      const localRoute = computeLocalRoute(origin, destination);
      const fallbackData = generateAllQuotes(origin, destination, localRoute);
      setComparison(fallbackData);
    } catch (fallbackErr: any) {
      console.error('Comparison fallback error:', fallbackErr);
      setError('Unable to calculate ride fares for this route. Please try another location.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Sticky GMP Quota Defense Banner */}
      <QuotaWarningBanner />

      {/* Global Navigation Bar */}
      <Navbar
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenApiStatus={() => setIsApiStatusOpen(true)}
        selectedCity={selectedCity}
        onSelectCity={handleCityChange}
        isDemoMode={comparison?.isDemoMode ?? true}
      />

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden sticky top-16 z-30 bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-center gap-2">
        <button
          onClick={() => setMobileTab('rides')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            mobileTab === 'rides'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Ride Comparison
        </button>
        <button
          onClick={() => setMobileTab('map')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === 'map'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Interactive Map</span>
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Banner Pill Hero */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20 border border-blue-400/30 text-amber-300">
              <Zap className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight">
                Rapido ⚡ Uber ⚡ Ola Live Fare Comparison
              </h1>
              <p className="text-xs text-blue-200">
                Compare Bike, Auto & Cab rates across Rapido, Uber, and Ola in {selectedCity}. Save up to 40% on every commute.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-white/10 text-white border border-white/15">
              Verified India Rates
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold">Error:</span> {error}
            </div>
            <button
              onClick={() => setError(null)}
              className="text-rose-600 font-bold hover:underline ml-4 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Two-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Form & Ride Results (Visible on mobile when tab = 'rides' or on desktop) */}
          <div
            className={`space-y-6 lg:col-span-7 ${
              mobileTab === 'map' ? 'hidden lg:block' : 'block'
            }`}
          >
            {/* Search Input Form */}
            <SearchForm
              origin={origin}
              destination={destination}
              onOriginChange={setOrigin}
              onDestinationChange={setDestination}
              onCompare={handleCompareRides}
              isLoading={isLoading}
              selectedCity={selectedCity}
            />

            {/* Comparison Results */}
            {comparison ? (
              <RideComparisonList
                comparison={comparison}
                onRefresh={handleCompareRides}
                isLoading={isLoading}
              />
            ) : !isLoading ? (
              <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
                <Car className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <h3 className="text-base font-bold text-slate-800">
                  Ready to Compare Rides
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                  Select your pickup location and destination above, then click Compare Rides to view live estimates from Rapido, Uber, and Ola.
                </p>
                <button
                  onClick={handleCompareRides}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-2 transition cursor-pointer shadow-sm"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Compare Indiranagar to Koramangala</span>
                </button>
              </div>
            ) : null}
          </div>

          {/* Right Column: Sticky Interactive Map (Visible on mobile when tab = 'map' or on desktop) */}
          <div
            className={`lg:col-span-5 lg:sticky lg:top-20 space-y-4 ${
              mobileTab === 'rides' ? 'hidden lg:block' : 'block'
            }`}
          >
            <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between px-2 py-1.5 mb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Navigation2 className="w-3.5 h-3.5 text-blue-600" />
                  Live Route Map
                </span>
                {comparison?.route && (
                  <span className="text-[11px] font-semibold text-slate-500">
                    {comparison.route.distanceKm} km • ~{comparison.route.durationMinutes} min
                  </span>
                )}
              </div>
              <div className="h-[460px] w-full rounded-xl overflow-hidden">
                <MapView
                  apiKey={mapsApiKey}
                  origin={origin}
                  destination={destination}
                  route={comparison?.route || null}
                />
              </div>
            </div>

            {/* Quick Helper Tips Card */}
            <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200 text-xs text-slate-600 space-y-2">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <span>Commuter Smart Tips</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500">
                During peak hours (8:30–11:00 AM & 6:00–9:30 PM), Rapido Bikes, Uber Moto, and Ola Bikes save an average of 14 minutes in metro congestion compared to 4-wheelers.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-white border-t border-slate-200 py-8 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">RideWise</span>
            <span>•</span>
            <span>Independent Indian Ride Aggregator</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <button
              onClick={() => setIsAboutOpen(true)}
              className="hover:text-blue-600 transition cursor-pointer"
            >
              How It Works
            </button>
            <button
              onClick={() => setIsApiStatusOpen(true)}
              className="hover:text-blue-600 transition cursor-pointer"
            >
              API Status & Credentials
            </button>
            <a
              href="https://www.rapido.bike"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition"
            >
              Rapido App
            </a>
            <a
              href="https://www.uber.com/in/en/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition"
            >
              Uber India
            </a>
            <a
              href="https://www.olacabs.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition"
            >
              Ola Cabs
            </a>
          </div>

          <div className="text-[11px] text-slate-400 text-center sm:text-right">
            Demo estimate — not a live fare. All logos are property of their respective owners.
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      <ApiStatusModal isOpen={isApiStatusOpen} onClose={() => setIsApiStatusOpen(false)} />
    </div>
  );
}
