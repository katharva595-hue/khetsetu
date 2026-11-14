import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  BadgeDollarSign,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import api from '../../services/api';

export const BuyerBids: React.FC = () => {
  const [bids, setBids] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  const fetchBids = () => {
    setIsLoading(true);
    api
      .get('/bids')
      .then((res) => setBids(res.data || []))
      .catch((err) => console.error('Failed to load bids', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchBids();
  }, []);

  const handleAcceptCounter = async (bidId: string) => {
    try {
      await api.put(`/bids/${bidId}/status`, { status: 'ACCEPTED' });
      setActionSuccess('Counter offer accepted! You can now execute order.');
      fetchBids();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to accept counter');
    }
  };

  const handleConvertToOrder = async (bidId: string) => {
    try {
      await api.post(`/bids/${bidId}/create-order`, {
        deliveryAddress: 'Direct Mandi Delivery / Warehouse',
      });
      setActionSuccess('Order created successfully and funds secured in Escrow!');
      fetchBids();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to convert bid to order');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-warm-border pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900">My Bids & Negotiations</h1>
        <p className="text-xs text-slate-500 mt-1">
          Track bids placed on individual farmer produce listings and handle counter-offers
        </p>
      </div>

      {actionSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
          {actionError}
        </div>
      )}

      {isLoading ? (
        <div className="py-16 text-center">
          <div className="inline-block w-8 h-8 border-4 border-agri-dark border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 mt-2">Loading bids...</p>
        </div>
      ) : bids.length === 0 ? (
        <div className="bg-white rounded-3xl border border-warm-border p-12 text-center space-y-2">
          <BadgeDollarSign className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Bids Placed Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Browse verified listings in the marketplace and place price offers directly to farmers.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bids.map((bid) => (
            <div
              key={bid.id}
              className="bg-white rounded-2xl border border-warm-border p-5 shadow-sm space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">
                      {bid.listing?.cropName} ({bid.listing?.qualityGrade?.replace('_', ' ') || 'Grade A'})
                    </span>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                        bid.status === 'ACCEPTED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : bid.status === 'COUNTERED'
                          ? 'bg-amber-100 text-amber-800'
                          : bid.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {bid.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Farmer: <strong>{bid.listing?.farmer?.name || 'Local Farmer'}</strong>
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-sm font-black text-slate-900">
                    Offered: ₹{bid.offeredPrice}/kg for {bid.quantity} kg
                  </span>
                  <p className="text-[11px] font-bold text-agri-700">
                    Total: ₹{(bid.offeredPrice * bid.quantity).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Message from Buyer */}
              {bid.message && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                  <span className="font-bold text-slate-800">Your Note:</span> "{bid.message}"
                </div>
              )}

              {/* Counter Offer Box */}
              {bid.status === 'COUNTERED' && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold">Farmer Counter Offer: ₹{bid.counterPrice}/kg</span>
                    <span className="font-bold text-amber-800">
                      New Total: ₹{((bid.counterPrice || bid.offeredPrice) * bid.quantity).toLocaleString()}
                    </span>
                  </div>
                  {bid.counterMessage && (
                    <p className="text-[11px] text-amber-800 italic">"{bid.counterMessage}"</p>
                  )}
                  <button
                    onClick={() => handleAcceptCounter(bid.id)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-agri-dark hover:bg-agri-forest shadow-sm"
                  >
                    Accept Counter Offer
                  </button>
                </div>
              )}

              {/* Convert Accepted Bid into Live Order */}
              {bid.status === 'ACCEPTED' && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Bid Accepted by Farmer!
                  </span>
                  <button
                    onClick={() => handleConvertToOrder(bid.id)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-agri-dark hover:bg-agri-forest shadow-sm transition flex items-center gap-1.5"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Execute Order & Escrow</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
