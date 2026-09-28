import React from 'react';
import { X, ShieldCheck, HelpCircle, Code, Calculator, ExternalLink, Zap } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 sm:p-8 text-slate-800">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Zap className="w-6 h-6 text-amber-300 fill-amber-300" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">About RideWise</h2>
            <p className="text-xs text-slate-500 font-medium">
              Transparent, Ethical Ride Fare Comparison for Indian Commuters
            </p>
          </div>
        </div>

        <div className="space-y-6 text-sm">
          {/* Section 1: How comparison works */}
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-2">
              <Calculator className="w-4 h-4 text-blue-600" />
              How Fare Estimates Are Calculated
            </h3>
            <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
              RideWise analyzes the precise road distance and driving duration between your pickup point and destination using Google Maps Platform Routes API. It then runs simultaneous evaluations across Rapido, Uber, and Ola service adapters using standardized urban transit rate cards:
            </p>
            <ul className="mt-2.5 space-y-1.5 text-xs text-slate-600 pl-4 list-disc">
              <li>
                <strong>Base Fare:</strong> Fixed flag-fall charge covering initial distance (typically 1.5 to 2.0 km).
              </li>
              <li>
                <strong>Distance Rate:</strong> Metered per-kilometer fee calibrated to current fuel and operational benchmarks in major Indian metros.
              </li>
              <li>
                <strong>Time Factor:</strong> Two-wheelers (Rapido Bike, Uber Moto, Ola Bike) calculate lane filtering benefits (~15% faster transit during congestion), while autos and cabs account for standard urban signal delays.
              </li>
            </ul>
          </div>

          {/* Section 2: 3 Independent Recommendations */}
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              The 3 Smart Recommendations
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                <span className="font-bold text-xs text-emerald-800 block">1. Cheapest Ride</span>
                <span className="text-[11px] text-emerald-700 mt-0.5 block">
                  Identifies the absolute lowest out-of-pocket fare among all available categories.
                </span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                <span className="font-bold text-xs text-amber-800 block">2. Fastest Pickup</span>
                <span className="text-[11px] text-amber-700 mt-0.5 block">
                  Flags the vehicle category with the nearest estimated driver in your pickup zone.
                </span>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                <span className="font-bold text-xs text-blue-800 block">3. Shortest Journey</span>
                <span className="text-[11px] text-blue-700 mt-0.5 block">
                  Selects the transport mode that reaches your destination with the least transit time.
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Availability & Demo Data Policy */}
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-2">
              <HelpCircle className="w-4 h-4 text-amber-600" />
              Authorized APIs & Demo Estimates Policy
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              RideWise strictly adheres to platform terms and does not use unauthorized scraping, unofficial endpoints, or bypass rate limits. Until official partner API credentials are provided by Rapido, Uber, or Ola, estimates are generated via a calibrated benchmark simulator and prominently labeled with:
            </p>
            <div className="mt-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950 text-xs font-semibold">
              ⚠️ "Demo estimate — not a live fare."
            </div>
            <p className="text-slate-500 text-xs mt-2">
              Demo estimates do not guarantee actual driver availability or final surge rates. Users are always directed to book directly on the official Rapido, Uber, or Ola applications.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Got it, Back to Compare
          </button>
        </div>
      </div>
    </div>
  );
};
