import React, { useEffect, useState } from 'react';
import {
  Users,
  Boxes,
  Truck,
  BadgeDollarSign,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  MapPin,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api';

export const AdminOverview: React.FC = () => {
  const [stats, setStats] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api
      .get('/admin/analytics')
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-agri-dark text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            System Administration & Control Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">Platform Analytics & Metrics</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Calculated in real-time directly from transactional database records
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md text-emerald-300 border border-white/10 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Platform Operational</span>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-4 border-agri-dark border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 mt-2">Computing real-time platform statistics...</p>
        </div>
      ) : stats ? (
        <div className="space-y-8">
          {/* Main KPI Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-warm-border shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total Users</span>
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">{stats.totalUsers}</p>
              <span className="text-[11px] text-slate-500 font-medium">
                {stats.totalFarmers} Farmers • {stats.totalBuyers} Buyers
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-warm-border shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Active Produce Lots</span>
                <Boxes className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">{stats.activeListings}</p>
              <span className="text-[11px] text-slate-500 font-medium">
                {stats.totalListings} Total lots posted
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-warm-border shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Gross Trade Volume</span>
                <span className="text-xs font-bold text-agri-dark">₹</span>
              </div>
              <p className="text-2xl font-black text-agri-dark">
                ₹{stats.totalProcurementValue.toLocaleString()}
              </p>
              <span className="text-[11px] text-emerald-600 font-semibold">
                {stats.completedTrades} Completed trades
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-warm-border shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Disputes & Bids</span>
                <AlertTriangle className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-2xl font-black text-slate-900">{stats.openDisputes} Open</p>
              <span className="text-[11px] text-amber-600 font-medium">
                {stats.activeBids} Active negotiations
              </span>
            </div>
          </div>

          {/* Breakdown Section: Crop Volumes & Geographic Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Popular Crops & Aggregation Volume */}
            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-warm-border shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-agri-dark" />
                <span>Crop Volume Available on Platform</span>
              </h3>

              <div className="space-y-3 pt-2">
                {stats.popularCrops?.map((c: any, idx: number) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-800">
                      <span>{c.crop}</span>
                      <span>{c.volume.toLocaleString()} kg</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-agri-forest rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            (c.volume / (stats.popularCrops[0]?.volume || 1)) * 100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Farmer Geographic Concentration */}
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-warm-border shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Regional Farmer Concentration</span>
              </h3>

              <div className="divide-y divide-slate-100">
                {stats.geographicDistribution?.map((g: any, idx: number) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{g.district} District</span>
                    <span className="font-extrabold text-agri-dark bg-agri-50 px-2 py-0.5 rounded border border-agri-200">
                      {g.count} Farmers Registered
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
