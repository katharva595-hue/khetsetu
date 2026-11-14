import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Search,
  Filter,
  ShieldCheck,
  Building,
  ArrowUpDown,
  Calendar,
  Layers,
} from 'lucide-react';
import api from '../../services/api';

export const MandiPage: React.FC = () => {
  const [prices, setPrices] = useState<any[]>([]);
  const [commodities, setCommodities] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [selectedCommodity, setSelectedCommodity] = useState('ALL');
  const [selectedState, setSelectedState] = useState('ALL');
  const [search, setSearch] = useState('');
  const [sourceInfo, setSourceInfo] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchPrices = () => {
    setIsLoading(true);
    const params: any = {};
    if (selectedCommodity !== 'ALL') params.commodity = selectedCommodity;
    if (selectedState !== 'ALL') params.state = selectedState;
    if (search.trim()) params.search = search.trim();

    api
      .get('/mandi', { params })
      .then((res) => {
        setPrices(res.data.prices || []);
        setCommodities(res.data.commodities || []);
        setStates(res.data.states || []);
        setSourceInfo(res.data.source || 'APMC Agmarknet Feed');
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchPrices();
  }, [selectedCommodity, selectedState]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-warm-border pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">APMC Mandi Price Discovery</h1>
          <p className="text-xs text-slate-500 mt-1">
            Official mandi benchmark modal rates across state agricultural marketing boards
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Agmarknet & APMC Live Sync Active</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-warm-border shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 text-xs font-bold text-slate-600">
            <span>Crop:</span>
            <select
              value={selectedCommodity}
              onChange={(e) => setSelectedCommodity(e.target.value)}
              className="text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
            >
              <option value="ALL">All Commodities</option>
              {commodities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-slate-600">
            <span>State:</span>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
            >
              <option value="ALL">All States</option>
              {states.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 max-w-xs w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchPrices()}
            placeholder="Search mandi, district..."
            className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
          />
          <button
            onClick={fetchPrices}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-agri-dark hover:bg-agri-forest"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Mandi Prices Table */}
      {isLoading ? (
        <div className="py-16 text-center">
          <div className="inline-block w-8 h-8 border-4 border-agri-dark border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 mt-2">Loading official mandi reports...</p>
        </div>
      ) : prices.length === 0 ? (
        <div className="bg-white rounded-3xl border border-warm-border p-12 text-center text-xs text-slate-500">
          No mandi prices found for the selected filter.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-warm-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-warm-border text-slate-500 uppercase font-extrabold text-[10px] tracking-wider">
                  <th className="p-4">Commodity</th>
                  <th className="p-4">APMC Mandi</th>
                  <th className="p-4">District / State</th>
                  <th className="p-4">Min Price</th>
                  <th className="p-4">Max Price</th>
                  <th className="p-4">Modal Price (₹/Qtl)</th>
                  <th className="p-4">Rate (₹/kg)</th>
                  <th className="p-4">Sync Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {prices.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-4 font-black text-slate-900">{p.commodity}</td>
                    <td className="p-4 font-bold text-agri-dark">{p.marketName}</td>
                    <td className="p-4 text-slate-500">
                      {p.district}, {p.state}
                    </td>
                    <td className="p-4 text-slate-600">₹{p.minPrice}</td>
                    <td className="p-4 text-slate-600">₹{p.maxPrice}</td>
                    <td className="p-4">
                      <span className="font-black text-sm text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        ₹{p.modalPrice}
                      </span>
                    </td>
                    <td className="p-4 font-extrabold text-slate-900">
                      ₹{(p.modalPrice / 100).toFixed(1)}/kg
                    </td>
                    <td className="p-4 text-[10px] text-slate-400 font-medium">
                      {p.isVerifiedGov ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Gov
                        </span>
                      ) : (
                        p.source
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
