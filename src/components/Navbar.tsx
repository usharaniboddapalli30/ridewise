import React from 'react';
import { Sparkles, Info, ShieldCheck, Zap, MapPin } from 'lucide-react';

interface NavbarProps {
  onOpenAbout: () => void;
  onOpenApiStatus: () => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
  isDemoMode: boolean;
}

export const CITIES = [
  'All India (Search Any Location)',
  'Bengaluru',
  'Delhi NCR',
  'Mumbai',
  'Hyderabad',
  'Pune',
  'Chennai',
  'Kolkata',
  'Ahmedabad',
  'Jaipur',
  'Kochi',
  'Chandigarh',
  'Lucknow',
  'Indore',
  'Surat',
  'Visakhapatnam',
  'Coimbatore',
  'Goa',
  'Bhopal',
  'Patna',
  'Bhubaneswar'
];

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAbout,
  onOpenApiStatus,
  selectedCity,
  onSelectCity,
  isDemoMode
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 text-white shadow-md shadow-slate-900/10">
              <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  Ride<span className="text-blue-600">Wise</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                  🇮🇳 India
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden md:block">
                Rapido ⚡ Uber ⚡ Ola ⚡ Namma Yatri ⚡ BluSmart
              </p>
            </div>
          </div>

          {/* City Selector */}
          <div className="flex items-center gap-2">
            <div className="relative flex items-center bg-slate-100 hover:bg-slate-200/80 transition-colors rounded-lg px-2.5 py-1.5 border border-slate-200">
              <MapPin className="w-3.5 h-3.5 text-blue-600 mr-1.5" />
              <select
                aria-label="Select City"
                value={selectedCity}
                onChange={(e) => onSelectCity(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer pr-1"
              >
                {CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* API Status Badge Button */}
            <button
              onClick={onOpenApiStatus}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <div className={`w-2 h-2 rounded-full ${isDemoMode ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
              <span className="hidden sm:inline">
                {isDemoMode ? 'Demo Benchmark' : 'Live Connected'}
              </span>
              <span className="sm:hidden">Status</span>
            </button>

            {/* How It Works Button */}
            <button
              onClick={onOpenAbout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100/80 border border-blue-200 transition-colors"
            >
              <Info className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">How It Works</span>
              <span className="sm:hidden">About</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
