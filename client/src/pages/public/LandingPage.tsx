import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Sprout,
  ShieldCheck,
  TrendingUp,
  Truck,
  ArrowRight,
  CheckCircle2,
  Users,
  MapPin,
  Clock,
  Layers,
  ChevronRight,
  Bot,
} from 'lucide-react';
import api from '../../services/api';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [mandiPrices, setMandiPrices] = useState<any[]>([]);
  const [quickCrop, setQuickCrop] = useState('Wheat');
  const [quickQty, setQuickQty] = useState('1000');
  const [quickMaxPrice, setQuickMaxPrice] = useState('30');

  useEffect(() => {
    api
      .get('/mandi')
      .then((res) => setMandiPrices(res.data.prices?.slice(0, 8) || []))
      .catch(() => {});
  }, []);

  const handleLaunchMatching = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(
      `/buyer/procurement?crop=${encodeURIComponent(quickCrop)}&qty=${quickQty}&maxPrice=${quickMaxPrice}`
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Live Mandi Rates Running Banner */}
      <div className="bg-agri-dark text-white text-xs py-2 px-4 overflow-x-hidden shadow-inner">
        <div className="flex items-center gap-6 whitespace-nowrap animate-marquee">
          <span className="font-bold text-amber-300 flex items-center gap-1.5 shrink-0">
            <TrendingUp className="w-3.5 h-3.5" /> LIVE MANDI APMC BENCHMARK:
          </span>
          {mandiPrices.length > 0 ? (
            mandiPrices.map((p, idx) => (
              <span key={idx} className="inline-flex items-center gap-2 text-slate-200 shrink-0">
                <span className="font-semibold text-white">{p.commodity}</span>
                <span className="text-[11px] text-slate-400">({p.marketName})</span>:
                <span className="font-bold text-amber-400">₹{p.modalPrice}/Qtl</span>
                <span className="text-slate-600">|</span>
              </span>
            ))
          ) : (
            <span className="text-slate-300">
              Indore Mandi: Wheat ₹2,750/Qtl • Soybean ₹4,420/Qtl • Gram ₹5,850/Qtl • Onion ₹2,250/Qtl
            </span>
          )}
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-[#f4f7f4] via-[#fbfaf7] to-[#fbfaf7] border-b border-warm-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Vision & Value */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300/80 text-emerald-900 text-xs font-semibold shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>Next-Gen Agricultural Supply-Chain Protocol</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Direct Farm Trade with{' '}
                <span className="text-agri-dark underline decoration-agri-400 underline-offset-8">
                  Intelligent Multi-Farmer
                </span>{' '}
                Procurement
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                KhetSetu eliminates unnecessary middlemen. Institutional buyers submit bulk requirements, and our
                intelligent matching engine automatically aggregates produce from nearby verified farmers—calculating
                distances, weighted prices, and delivery feasibility in seconds.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/buyer/procurement"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-agri-dark hover:bg-agri-forest shadow-lg shadow-agri-dark/20 transition transform hover:-translate-y-0.5"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Try Procurement Engine
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/marketplace"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-slate-700 bg-white hover:bg-slate-50 border border-warm-border shadow-sm transition"
                >
                  Browse 50+ Farm Lots
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80">
                <div>
                  <p className="text-2xl font-black text-agri-dark">0%</p>
                  <p className="text-xs text-slate-500 font-medium">Middlemen Commission</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-agri-dark">100%</p>
                  <p className="text-xs text-slate-500 font-medium">Verified KYC Farmers</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-agri-dark">&lt; 3 Sec</p>
                  <p className="text-xs text-slate-500 font-medium">Algorithmic Matching</p>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Quick Procurement Simulation Widget */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl shadow-2xl border border-warm-border p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-agri-100 text-agri-800 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-xl border-l border-b border-agri-300">
                  Live Engine Demo
                </div>

                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-agri-dark text-white flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Procurement Match Simulator</h3>
                    <p className="text-xs text-slate-500">Test multi-farmer aggregation in real-time</p>
                  </div>
                </div>

                <form onSubmit={handleLaunchMatching} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Crop Needed</label>
                    <select
                      value={quickCrop}
                      onChange={(e) => setQuickCrop(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-agri-leaf bg-slate-50/50"
                    >
                      <option value="Wheat">Wheat (Gehu - Sharbati / Lokwan)</option>
                      <option value="Soybean">Soybean (JS-9560 Yellow)</option>
                      <option value="Rice">Rice / Paddy (Pusa 1121)</option>
                      <option value="Onion">Onion (Nashik Red Hybrid)</option>
                      <option value="Tomato">Tomato (Processing Hybrid)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Quantity (kg)</label>
                      <input
                        type="number"
                        value={quickQty}
                        onChange={(e) => setQuickQty(e.target.value)}
                        className="w-full text-xs font-semibold px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-agri-leaf"
                        placeholder="1000"
                        min="50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Max Price (₹/kg)</label>
                      <input
                        type="number"
                        value={quickMaxPrice}
                        onChange={(e) => setQuickMaxPrice(e.target.value)}
                        className="w-full text-xs font-semibold px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-agri-leaf"
                        placeholder="30"
                        min="5"
                      />
                    </div>
                  </div>

                  {/* Algorithmic Match Preview Callout */}
                  <div className="p-3.5 rounded-xl bg-agri-50 border border-agri-200/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-agri-900 font-bold">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Supply Available Nearby:
                      </span>
                      <span className="text-emerald-700 font-extrabold">1,500 kg Available</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Matches up to 4 local farmers within 35 km radius in Indore/Sanwer belt at ₹26.4/kg avg.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-white bg-agri-dark hover:bg-agri-forest shadow-md transition"
                  >
                    <span>Run Intelligent Matching Algorithm</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Differentiator: How KhetSetu Solves the Intermediary Problem */}
      <section className="py-16 bg-white border-b border-warm-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-agri-700 bg-agri-50 px-3 py-1 rounded-full border border-agri-200">
              The Fundamental Problem & Solution
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
              Why Traditional Mandis & Portals Fail Buyers and Small Farmers
            </h2>
            <p className="text-sm text-slate-600 mt-3">
              Buyers need consistent, large lots. Small farmers only have 200-400 kg each. KhetSetu bridges this gap
              through intelligent, multi-farmer lot aggregation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-warm-bg border border-warm-border shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Traditional: Fragmented Supply</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                A buyer needing 1,000 kg has to browse dozens of individual ads, negotiate separate prices, and handle
                chaotic logistics from 5 different villages manually.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-agri-50/60 border border-agri-300 shadow-sm hover:shadow-md transition relative">
              <div className="absolute -top-3 right-4 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                KhetSetu Feature
              </div>
              <div className="w-12 h-12 rounded-xl bg-agri-dark text-white flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-amber-300" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">KhetSetu: Automated Aggregation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Submit 1 requirement. The algorithm finds Farmer A (300kg) + Farmer B (400kg) + Farmer C (200kg) +
                Farmer D (100kg), generating one cohesive procurement plan with combined shipping.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-warm-bg border border-warm-border shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Fair Pricing & Escrow Safety</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Weighted average pricing keeps procurement strictly under budget while guaranteeing farmers get
                direct bank payments without 6-12% commission deductions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Modules Preview */}
      <section className="py-16 bg-[#fbfaf7] border-b border-warm-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-agri-700">Holistic Ecosystem</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Everything for Farmer Prosperity and Buyer Efficiency
              </h2>
            </div>
            <Link
              to="/how-it-works"
              className="mt-3 md:mt-0 inline-flex items-center gap-1.5 text-xs font-bold text-agri-800 hover:text-agri-dark"
            >
              <span>Explore full feature specification</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-warm-border hover:border-agri-400 transition shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
                <Sprout className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Direct Farmer Marketplace</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Farmers list verified produce with photos, quality grades, exact farm coordinates, and harvest readiness.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-warm-border hover:border-agri-400 transition shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">APMC Mandi Price Feeds</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Live modal prices across Indore, Ujjain, Dewas, Bhopal, and national APMCs to guarantee fair deals.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-warm-border hover:border-agri-400 transition shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center mb-3">
                <Truck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Haversine Distance Routing</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pinpoints nearest produce to slash transportation costs and reduce transit carbon footprint.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-warm-border hover:border-agri-400 transition shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center mb-3">
                <Bot className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">AI Agronomy & Weather</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Hyperlocal weather forecasting, crop disease diagnosis, and agronomic advisory for optimal harvests.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-14 bg-agri-dark text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
            Ready to Experience Transparent Agricultural Commerce?
          </h2>
          <p className="text-sm text-agri-200 mb-8 max-w-2xl mx-auto">
            Log in with our pre-loaded test accounts (Farmer, Buyer, or Administrator) to test the complete platform
            end-to-end immediately.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/login"
              className="px-6 py-3 rounded-xl font-bold text-xs bg-amber-400 text-slate-900 hover:bg-amber-300 transition shadow-lg"
            >
              Sign In with Demo Accounts
            </Link>
            <Link
              to="/register"
              className="px-6 py-3 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white border border-white/20 transition"
            >
              Register New Farmer or Buyer
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
