import React, { useEffect, useState } from 'react';
import {
  BadgeDollarSign,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  User,
  MapPin,
  X,
} from 'lucide-react';
import api from '../../services/api';

export const FarmerBids: React.FC = () => {
  const [bids, setBids] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Counter Modal
  const [counterBid, setCounterBid] = useState<any | null>(null);
  const [counterPrice, setCounterPrice] = useState('');
  const [counterMessage, setCounterMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBids = () => {
    setIsLoading(true);
    api
      .get('/bids')
      .then((res) => setBids(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchBids();
  }, []);

  const handleUpdateStatus = async (bidId: string, status: string) => {
    try {
      await api.put(`/bids/${bidId}/status`, { status });
      setActionSuccess(`Bid marked as ${status}`);
      fetchBids();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to update bid');
    }
  };

  const openCounterModal = (bid: any) => {
    setCounterBid(bid);
    setCounterPrice(String(bid.listing?.pricePerKg || bid.offeredPrice + 2));
    setCounterMessage('We can supply Grade A sorted lot at this revised price.');
  };

  const handleSendCounter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!counterBid) return;

    setIsSubmitting(true);
    try {
      await api.put(`/bids/${counterBid.id}/status`, {
        status: 'COUNTERED',
        counterPrice: Number(counterPrice),
        counterMessage,
      });

      setActionSuccess('Counter offer sent to buyer successfully!');
      setCounterBid(null);
      fetchBids();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to send counter offer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-warm-border pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900">Bids & Offers Received</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review purchase proposals from buyers, accept fair bids, or send counter-offers
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
          <h3 className="text-base font-bold text-slate-800">No Bids Received Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When buyers or millers place offers on your produce lots, they will appear here.
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
                      Offer for {bid.listing?.cropName}
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
                    Buyer: <strong>{bid.buyer?.name}</strong> •{' '}
                    {bid.buyer?.buyerProfile?.companyName || 'Institutional Trader'}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-base font-black text-slate-900">
                    ₹{bid.offeredPrice}/kg for {bid.quantity} kg
                  </span>
                  <p className="text-[11px] font-bold text-agri-700">
                    Total Value: ₹{(bid.offeredPrice * bid.quantity).toLocaleString()}
                  </p>
                </div>
              </div>

              {bid.message && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
                  <span className="font-bold text-slate-800">Buyer Message:</span> "{bid.message}"
                </div>
              )}

              {bid.status === 'COUNTERED' && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                  <span className="font-bold">Your Counter Offer:</span> ₹{bid.counterPrice}/kg (
                  "{bid.counterMessage}")
                </div>
              )}

              {/* Action Buttons for Pending or Countered Bids */}
              {bid.status === 'PENDING' && (
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleUpdateStatus(bid.id, 'ACCEPTED')}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Accept Bid</span>
                  </button>
                  <button
                    onClick={() => openCounterModal(bid)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 transition flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                    <span>Counter Offer</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(bid.id, 'REJECTED')}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition flex items-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Counter Offer Modal */}
      {counterBid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-warm-border space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900">Send Counter Offer</h3>
              <button onClick={() => setCounterBid(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <p>
                Buyer offered: <strong>₹{counterBid.offeredPrice}/kg</strong> for {counterBid.quantity} kg
              </p>
            </div>

            <form onSubmit={handleSendCounter} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Counter Price (₹/kg)</label>
                <input
                  type="number"
                  required
                  value={counterPrice}
                  onChange={(e) => setCounterPrice(e.target.value)}
                  step="0.5"
                  className="w-full text-xs font-bold px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-agri-leaf"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Counter Message / Note</label>
                <textarea
                  rows={2}
                  value={counterMessage}
                  onChange={(e) => setCounterMessage(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-agri-leaf"
                ></textarea>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCounterBid(null)}
                  className="w-1/3 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 py-2.5 rounded-xl text-xs font-bold text-white bg-agri-dark hover:bg-agri-forest shadow transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending...' : 'Send Counter Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
