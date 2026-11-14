import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  MapPin,
  Clock,
  ShieldCheck,
  Truck,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import api from '../../services/api';

export const BuyerProcurementPlans: React.FC = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<any[]>([]);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderError, setOrderError] = useState('');

  const fetchPlans = () => {
    setIsLoading(true);
    api
      .get('/procurement/plans')
      .then((res) => {
        setPlans(res.data || []);
        if (res.data?.length > 0 && !expandedPlanId) {
          setExpandedPlanId(res.data[0].id);
        }
      })
      .catch((err) => console.error('Failed to load plans', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleConvertToOrder = async (plan: any) => {
    setIsOrdering(true);
    setOrderError('');

    try {
      const res = await api.post(`/procurement/plans/${plan.id}/order`, {
        deliveryAddress: plan.requirement?.deliveryAddress || 'Indore Central Hub',
        paymentMethod: 'UPI / Escrow',
      });

      navigate(`/buyer/orders?orderId=${res.data.order.id}`);
    } catch (err: any) {
      setOrderError(err.response?.data?.message || 'Failed to convert plan to order');
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-warm-border pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Procurement Plans</h1>
          <p className="text-xs text-slate-500 mt-1">
            Aggregated multi-farmer supply plans computed by the KhetSetu matching algorithm
          </p>
        </div>

        <Link
          to="/buyer/procurement"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-agri-dark hover:bg-agri-forest shadow-sm transition"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>New Procurement Run</span>
        </Link>
      </div>

      {orderError && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
          {orderError}
        </div>
      )}

      {isLoading ? (
        <div className="py-16 text-center">
          <div className="inline-block w-8 h-8 border-4 border-agri-dark border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 mt-2">Loading procurement plans...</p>
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-white rounded-3xl border border-warm-border p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Procurement Plans Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Use our Intelligent Procurement Matching Engine to calculate aggregated farmer contributions and save
            custom procurement plans.
          </p>
          <Link
            to="/buyer/procurement"
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-agri-dark"
          >
            Launch Procurement Matching
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => {
            const isExpanded = expandedPlanId === plan.id;
            return (
              <div
                key={plan.id}
                className="bg-white rounded-3xl border border-warm-border shadow-sm overflow-hidden transition"
              >
                {/* Plan Header Card */}
                <div
                  onClick={() => setExpandedPlanId(isExpanded ? null : plan.id)}
                  className="p-5 cursor-pointer hover:bg-slate-50/50 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-base text-slate-900">
                        {plan.requirement?.cropName || 'Produce'} Plan #{plan.id.slice(0, 8)}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                          plan.status === 'ORDERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {plan.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-3">
                      <span>Created: {new Date(plan.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>Target: {plan.totalRequiredQty} kg</span>
                      <span>•</span>
                      <span>Matched: {plan.totalMatchedQty} kg</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-base font-black text-slate-900">
                        ₹{plan.totalEstimatedCost.toLocaleString()}
                      </p>
                      <p className="text-[11px] text-slate-500 font-semibold">
                        Avg: ₹{plan.weightedAvgPrice}/kg
                      </p>
                    </div>

                    <button className="p-1 rounded-lg text-slate-400 hover:bg-slate-200">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details: Itemized Farmers */}
                {isExpanded && (
                  <div className="p-5 pt-0 border-t border-slate-100 space-y-4 bg-slate-50/40">
                    <div className="pt-3 flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Aggregated Farmer Contributors ({plan.items?.length || 0} Lots)
                      </h4>

                      {plan.status !== 'ORDERED' && (
                        <button
                          onClick={() => handleConvertToOrder(plan)}
                          disabled={isOrdering}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-agri-dark hover:bg-agri-forest shadow transition flex items-center gap-2 disabled:opacity-50"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>{isOrdering ? 'Generating Order...' : 'Convert to Active Order'}</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      {plan.items?.map((item: any, idx: number) => (
                        <div
                          key={item.id || idx}
                          className="p-3.5 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">
                                {idx + 1}. {item.listing?.cropName || 'Produce Lot'}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                ({item.distanceKm} km distance)
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600">{item.reasonSelected}</p>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-black text-slate-900">
                              {item.allocatedQty} kg @ ₹{item.pricePerKg}/kg
                            </span>
                            <p className="text-[11px] font-bold text-agri-700">
                              Total: ₹{item.itemTotalCost.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
