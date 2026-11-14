import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Sprout,
  Boxes,
  BadgeDollarSign,
  CloudSun,
  TrendingUp,
  PackagePlus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Bot,
} from 'lucide-react';
import api from '../../services/api';

export const FarmerOverview: React.FC = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [bids, setBids] = useState<any[]>([]);
  const [weather, setWeather] = useState<any | null>(null);
  const [mandiPrices, setMandiPrices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/listings/farmer/my').catch(() => ({ data: [] })),
      api.get('/bids').catch(() => ({ data: [] })),
      api.get('/weather?lat=22.9772&lng=75.8286&location=Sanwer Farm Cluster').catch(() => ({ data: null })),
      api.get('/mandi').catch(() => ({ data: { prices: [] } })),
    ])
      .then(([listingsRes, bidsRes, weatherRes, mandiRes]) => {
        setListings(listingsRes.data || []);
        setBids(bidsRes.data || []);
        setWeather(weatherRes.data);
        setMandiPrices(mandiRes.data?.prices?.slice(0, 4) || []);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const totalStockKg = listings.reduce((sum, l) => sum + (l.quantity || 0), 0);
  const pendingBids = bids.filter((b) => b.status === 'PENDING');

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-agri-dark to-agri-forest text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-agri-200">Kisan Dashboard</span>
            {user?.isVerified && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-white/10 px-2 py-0.5 rounded-full border border-emerald-400/30">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> KYC Verified Farmer
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">Namaste, {user?.name}!</h1>
          <p className="text-xs text-agri-100 mt-1 max-w-xl">
            {user?.farmerProfile?.village || 'Sanwer'}, {user?.farmerProfile?.district || 'Indore'} •{' '}
            {user?.farmerProfile?.farmAreaAcres || 12} Acres ({user?.farmerProfile?.soilType || 'Black Soil'})
          </p>
        </div>

        <Link
          to="/farmer/add-produce"
          className="px-5 py-3 rounded-2xl font-extrabold text-xs text-slate-900 bg-amber-400 hover:bg-amber-300 shadow-md transition flex items-center gap-2 shrink-0"
        >
          <PackagePlus className="w-4 h-4 text-slate-900" />
          <span>Add New Produce Listing</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-warm-border shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Produce Lots</span>
            <Boxes className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{listings.length}</p>
          <span className="text-[11px] text-emerald-600 font-semibold">{totalStockKg.toLocaleString()} kg in stock</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-warm-border shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Incoming Buyer Bids</span>
            <BadgeDollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{pendingBids.length}</p>
          <span className="text-[11px] text-amber-600 font-semibold">Requires response</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-warm-border shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Local Temperature</span>
            <CloudSun className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{weather?.temperature ?? 28}°C</p>
          <span className="text-[11px] text-slate-500 font-medium">{weather?.condition ?? 'Sunny'}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-warm-border shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Indore Mandi Wheat</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-agri-dark">₹27.5/kg</p>
          <span className="text-[11px] text-slate-500 font-medium">₹2,750 / Quintal</span>
        </div>
      </div>

      {/* Weather Alert & Spray Advisory Banner */}
      {weather && (
        <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0">
              <CloudSun className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold text-sky-950">
                Agro-Weather Advisory for {weather.location}
              </p>
              <p className="text-[11px] text-sky-800">
                Humidity: {weather.humidity}% • Rain Probability: {weather.rainProb}% • Wind: {weather.windSpeed} km/h
              </p>
            </div>
          </div>
          <Link
            to="/farmer/weather"
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white text-sky-900 border border-sky-300 hover:bg-sky-100 transition shrink-0"
          >
            7-Day Farm Forecast
          </Link>
        </div>
      )}

      {/* Main Two Column Section: Incoming Bids & Produce Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Incoming Bids (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-warm-border shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <BadgeDollarSign className="w-4 h-4 text-amber-500" />
              <span>Incoming Bids from Buyers</span>
            </h3>
            <Link to="/farmer/bids" className="text-xs font-bold text-agri-700 hover:underline">
              View all bids ({bids.length})
            </Link>
          </div>

          {bids.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No bids received yet. Ensure your produce is listed with competitive prices!
            </div>
          ) : (
            <div className="space-y-3">
              {bids.slice(0, 3).map((bid) => (
                <div
                  key={bid.id}
                  className="p-4 rounded-2xl border border-slate-100 hover:border-agri-300 transition bg-slate-50/50 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-extrabold text-slate-900">
                        {bid.buyer?.name || 'Verified Buyer'} • {bid.buyer?.buyerProfile?.companyName || 'Agro Mills'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Crop: <strong>{bid.listing?.cropName}</strong>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-slate-900">
                        Offered: ₹{bid.offeredPrice}/kg
                      </span>
                      <p className="text-[10px] text-slate-500">For {bid.quantity} kg</p>
                    </div>
                  </div>

                  {bid.message && (
                    <p className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-100">
                      "{bid.message}"
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px]">
                    <span
                      className={`font-bold px-2 py-0.5 rounded ${
                        bid.status === 'ACCEPTED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {bid.status}
                    </span>
                    <Link
                      to="/farmer/bids"
                      className="text-agri-dark font-bold hover:underline flex items-center gap-1"
                    >
                      Review & Respond <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Quick Produce Stock & AI Diagnostic shortcut (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Produce Stock */}
          <div className="bg-white p-6 rounded-3xl border border-warm-border shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Boxes className="w-4 h-4 text-emerald-600" />
                <span>My Active Listings</span>
              </h3>
              <Link to="/farmer/listings" className="text-xs font-bold text-agri-700 hover:underline">
                Manage
              </Link>
            </div>

            <div className="space-y-2.5">
              {listings.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900">{item.cropName}</p>
                    <p className="text-[10px] text-slate-500">
                      Stock: {item.quantity} kg • {item.qualityGrade.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-slate-900">₹{item.pricePerKg}/kg</p>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Doctor Shortcut */}
          <div className="bg-gradient-to-br from-emerald-800 to-agri-dark text-white p-6 rounded-3xl shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 text-amber-300 flex items-center justify-center font-bold">
              <Bot className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-sm">AI Crop Disease & Advisory Assistant</h4>
            <p className="text-xs text-agri-100 leading-relaxed">
              Noticing yellow rust on wheat leaves or pod borers? Get instant biological and chemical spray solutions.
            </p>
            <Link
              to="/farmer/advisory"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 text-slate-900 hover:bg-amber-300 transition"
            >
              <span>Ask Crop Doctor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
