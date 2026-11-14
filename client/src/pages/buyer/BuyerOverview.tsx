import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  Truck,
  BadgeDollarSign,
  FileText,
  Boxes,
  ArrowRight,
  TrendingUp,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import api from '../../services/api';

export const BuyerOverview: React.FC = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [bids, setBids] = useState<any[]>([]);
  const [mandiRates, setMandiRates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/procurement/plans').catch(() => ({ data: [] })),
      api.get('/orders').catch(() => ({ data: [] })),
      api.get('/bids').catch(() => ({ data: [] })),
      api.get('/mandi').catch(() => ({ data: { prices: [] } })),
    ])
      .then(([plansRes, ordersRes, bidsRes, mandiRes]) => {
        setPlans(plansRes.data || []);
        setOrders(ordersRes.data || []);
        setBids(bidsRes.data || []);
        setMandiRates(mandiRes.data?.prices?.slice(0, 5) || []);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const totalProcuredAmount = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-agri-dark to-agri-forest text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-agri-200">Buyer Workspace</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">Welcome back, {user?.name}</h1>
          <p className="text-xs text-agri-100 mt-1 max-w-xl">
            {user?.buyerProfile?.companyName || 'Institutional Agri Procurement'} • {user?.buyerProfile?.city || 'Indore'}
          </p>
        </div>

        <Link
          to="/buyer/procurement"
          className="px-5 py-3 rounded-2xl font-extrabold text-xs text-slate-900 bg-amber-400 hover:bg-amber-300 shadow-md transition flex items-center gap-2 shrink-0"
        >
          <Sparkles className="w-4 h-4 text-slate-900" />
          <span>Launch Multi-Farmer Matcher</span>
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-warm-border shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Procurement Plans</span>
            <FileText className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{plans.length}</p>
          <span className="text-[11px] text-emerald-600 font-semibold">Active & Confirmed</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-warm-border shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Executed Orders</span>
            <Truck className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{orders.length}</p>
          <span className="text-[11px] text-slate-500 font-medium">In transit & delivered</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-warm-border shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Bids</span>
            <BadgeDollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {bids.filter((b) => b.status === 'PENDING' || b.status === 'COUNTERED').length}
          </p>
          <span className="text-[11px] text-amber-600 font-semibold">In negotiation</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-warm-border shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Trade Value</span>
            <span className="text-xs font-bold text-agri-dark">₹</span>
          </div>
          <p className="text-2xl font-black text-agri-dark">₹{totalProcuredAmount.toLocaleString()}</p>
          <span className="text-[11px] text-slate-500 font-medium">Escrow protected</span>
        </div>
      </div>

      {/* Two Column Section: Recent Procurement Plans & Mandi Ticker */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Recent Procurement Plans */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-warm-border shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Recent Procurement Plans</span>
            </h3>
            <Link to="/buyer/procurement-plans" className="text-xs font-bold text-agri-700 hover:underline">
              View all plans
            </Link>
          </div>

          {plans.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-xs text-slate-500">No procurement plans created yet.</p>
              <Link
                to="/buyer/procurement"
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-agri-dark"
              >
                <span>Create First Plan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {plans.slice(0, 3).map((plan) => (
                <div
                  key={plan.id}
                  className="p-4 rounded-2xl border border-slate-100 hover:border-agri-300 transition bg-slate-50/50 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-extrabold text-slate-900">
                        {plan.requirement?.cropName || 'Produce'} Plan #{plan.id.slice(0, 6)}
                      </span>
                      <p className="text-[11px] text-slate-500">
                        {plan.totalMatchedQty} kg matched • {plan.items?.length || 0} farmers aggregated
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-slate-900">
                        ₹{plan.totalEstimatedCost.toLocaleString()}
                      </span>
                      <p className="text-[10px] text-slate-500 font-semibold">
                        Avg: ₹{plan.weightedAvgPrice}/kg
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px]">
                    <span
                      className={`font-bold px-2 py-0.5 rounded ${
                        plan.status === 'ORDERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {plan.status}
                    </span>
                    <Link
                      to="/buyer/procurement-plans"
                      className="text-agri-dark font-bold hover:underline flex items-center gap-1"
                    >
                      View Breakdown <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Live Mandi Rates */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-warm-border shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>APMC Mandi Watch</span>
            </h3>
            <Link to="/buyer/mandi" className="text-xs font-bold text-agri-700 hover:underline">
              All Rates
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {mandiRates.map((m, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">{m.commodity}</p>
                  <p className="text-[10px] text-slate-400">{m.marketName}</p>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-slate-900">₹{m.modalPrice}/Qtl</p>
                  <p className="text-[10px] text-slate-500">₹{(m.modalPrice / 100).toFixed(1)}/kg</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
