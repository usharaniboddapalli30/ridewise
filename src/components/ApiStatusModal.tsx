import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Key, Terminal, ExternalLink, ShieldCheck } from 'lucide-react';
import { AdapterStatus } from '../types/index.js';

interface ApiStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiStatusModal: React.FC<ApiStatusModalProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<AdapterStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/api/adapters/status')
        .then((res) => res.json())
        .then((data) => {
          setStatus(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Failed to fetch adapter status:', err);
          setLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 sm:p-8 text-slate-800">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-900/20">
            <Key className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">API Adapter Architecture & Live Setup</h2>
            <p className="text-xs text-slate-500 font-medium">
              Modular integration for authorized ride provider credentials
            </p>
          </div>
        </div>

        <div className="space-y-6 text-sm">
          {/* Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Rapido Card */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs text-slate-900">Rapido Adapter</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    status?.rapido.configured
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {status?.rapido.configured ? 'Live API' : 'Demo Mode'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mb-2">
                Quotes for <strong>Bike & Auto</strong>.
              </p>
              <div className="text-[10px] text-slate-500 space-y-1">
                <div>Required Env:</div>
                <code className="block bg-white p-1.5 rounded border border-slate-200 text-slate-800 font-mono text-[9px]">
                  RAPIDO_CLIENT_ID<br />
                  RAPIDO_API_KEY
                </code>
              </div>
            </div>

            {/* Uber Card */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs text-slate-900">Uber Adapter</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    status?.uber.configured
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {status?.uber.configured ? 'Live API' : 'Demo Mode'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mb-2">
                Quotes for <strong>Moto, Auto & Cabs</strong>.
              </p>
              <div className="text-[10px] text-slate-500 space-y-1">
                <div>Required Env:</div>
                <code className="block bg-white p-1.5 rounded border border-slate-200 text-slate-800 font-mono text-[9px]">
                  UBER_SERVER_TOKEN<br />
                  UBER_CLIENT_ID
                </code>
              </div>
            </div>

            {/* Ola Card */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs text-slate-900">Ola Adapter</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    status?.ola?.configured
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {status?.ola?.configured ? 'Live API' : 'Demo Mode'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mb-2">
                Quotes for <strong>Bike, Auto, Mini & Prime</strong>.
              </p>
              <div className="text-[10px] text-slate-500 space-y-1">
                <div>Required Env:</div>
                <code className="block bg-white p-1.5 rounded border border-slate-200 text-slate-800 font-mono text-[9px]">
                  OLA_CLIENT_ID<br />
                  OLA_API_KEY
                </code>
              </div>
            </div>

            {/* Namma Yatri Card */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs text-slate-900">Namma Yatri</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    status?.namma_yatri?.configured
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {status?.namma_yatri?.configured ? 'Live API' : 'Demo Mode'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mb-2">
                Quotes for <strong>Auto & Direct Cabs</strong> (0% Commission).
              </p>
              <div className="text-[10px] text-slate-500 space-y-1">
                <div>Required Env:</div>
                <code className="block bg-white p-1.5 rounded border border-slate-200 text-slate-800 font-mono text-[9px]">
                  NAMMA_YATRI_API_KEY
                </code>
              </div>
            </div>

            {/* BluSmart Card */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs text-slate-900">BluSmart EV</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    status?.blusmart?.configured
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {status?.blusmart?.configured ? 'Live API' : 'Demo Mode'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mb-2">
                Quotes for <strong>100% Electric Sedans & SUVs</strong>.
              </p>
              <div className="text-[10px] text-slate-500 space-y-1">
                <div>Required Env:</div>
                <code className="block bg-white p-1.5 rounded border border-slate-200 text-slate-800 font-mono text-[9px]">
                  BLUSMART_API_KEY
                </code>
              </div>
            </div>
          </div>

          {/* How to Connect Authorized Live Data */}
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-2">
              <Terminal className="w-4 h-4 text-blue-600" />
              How to Connect Authorized APIs
            </h3>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                <h4 className="font-bold text-blue-900 mb-1">1. Uber Developer Platform</h4>
                <p>
                  Register at <a href="https://developer.uber.com" target="_blank" rel="noopener noreferrer" className="underline font-semibold text-blue-800">developer.uber.com</a>, create an application with the Rides API scope, and copy your <code>Server Token</code> into your server environment as <code>UBER_SERVER_TOKEN</code>.
                </p>
              </div>

              <div className="p-3 bg-lime-50 border border-lime-200 rounded-xl">
                <h4 className="font-bold text-lime-950 mb-1">2. Ola Developer Platform</h4>
                <p>
                  Access <a href="https://developers.olacabs.com" target="_blank" rel="noopener noreferrer" className="underline font-semibold text-lime-900">developers.olacabs.com</a> to generate an <code>X-APP-TOKEN</code> and client credentials, then set <code>OLA_API_KEY</code> and <code>OLA_CLIENT_ID</code>.
                </p>
              </div>

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                <h4 className="font-bold text-yellow-950 mb-1">3. Namma Yatri (Beckn / ONDC Open Mobility)</h4>
                <p>
                  Integrates with open mobility network (BAP/BPP ONDC protocol). Set <code>NAMMA_YATRI_API_KEY</code> to connect directly to the live Beckn subscriber gateway.
                </p>
              </div>

              <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-xl">
                <h4 className="font-bold text-cyan-950 mb-1">4. BluSmart Electric Mobility API</h4>
                <p>
                  Direct enterprise B2B partner integration for 100% electric zero-cancellation rides. Set <code>BLUSMART_API_KEY</code>.
                </p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <h4 className="font-bold text-amber-900 mb-1">5. Rapido Partner Program</h4>
                <p>
                  Partner integrations require a business partnership agreement with Rapido Corporate. Once credentials are provided, inject <code>RAPIDO_CLIENT_ID</code> and <code>RAPIDO_API_KEY</code> into the server environment.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <h4 className="font-bold text-slate-800 mb-1">3. Automated Fallback Safety</h4>
                <p>
                  If external API calls encounter rate-limiting or network issues, the adapters automatically fall back to benchmarked estimates so users are never left stranded with a blank screen.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
