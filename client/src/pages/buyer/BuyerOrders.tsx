import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Truck,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Package,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import api from '../../services/api';

export const BuyerOrders: React.FC = () => {
  const [searchParams] = useSearchParams();
  const highlightedOrderId = searchParams.get('orderId');

  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(highlightedOrderId);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Dispute modal state
  const [disputeModalOrder, setDisputeModalOrder] = useState<any | null>(null);
  const [disputeReason, setDisputeReason] = useState('Quality mismatch with Grade A specification');
  const [disputeDescription, setDisputeDescription] = useState('');

  const fetchOrders = () => {
    setIsLoading(true);
    api
      .get('/orders')
      .then((res) => {
        setOrders(res.data || []);
        if (highlightedOrderId) {
          setExpandedOrderId(highlightedOrderId);
        } else if (res.data?.length > 0 && !expandedOrderId) {
          setExpandedOrderId(res.data[0].id);
        }
      })
      .catch((err) => console.error('Failed to load orders', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      setActionSuccess(`Order updated to "${status}" and Escrow released to farmers!`);
      fetchOrders();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleRaiseDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeModalOrder) return;

    try {
      await api.post(`/orders/${disputeModalOrder.id}/dispute`, {
        reason: disputeReason,
        description: disputeDescription,
      });

      setActionSuccess('Dispute raised successfully. Escrow funds placed on hold pending admin review.');
      setDisputeModalOrder(null);
      fetchOrders();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to submit dispute');
    }
  };

  const statusProgression = [
    'CONFIRMED',
    'PROCESSING',
    'READY_FOR_DISPATCH',
    'IN_TRANSIT',
    'DELIVERED',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-warm-border pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900">Procurement Orders & Deliveries</h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor fulfillment, multi-farmer dispatches, release escrow payments, or raise trade disputes
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
          <p className="text-xs text-slate-500 mt-2">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-warm-border p-12 text-center space-y-2">
          <Truck className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Orders Executed Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Confirm a procurement plan or accept a farmer's counter offer to initiate an order.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const currentStepIdx = statusProgression.indexOf(order.status);

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-warm-border shadow-sm overflow-hidden transition"
              >
                {/* Order Summary Header */}
                <div
                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                  className="p-5 cursor-pointer hover:bg-slate-50/50 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-base text-slate-900">
                        Order #{order.orderNumber}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                          order.status === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'IN_TRANSIT'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.status.replace('_', ' ')}
                      </span>
                      {order.disputes?.length > 0 && (
                        <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-rose-600" /> Dispute Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      Ordered: {new Date(order.createdAt).toLocaleDateString()} • {order.items?.length || 0} Farmer Lots
                    </p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-base font-black text-slate-900">
                        ₹{order.totalAmount.toLocaleString()}
                      </p>
                      <p className="text-[11px] font-semibold text-emerald-700">
                        Escrow: {order.paymentStatus}
                      </p>
                    </div>

                    <button className="p-1 rounded-lg text-slate-400 hover:bg-slate-200">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Fulfillment Details */}
                {isExpanded && (
                  <div className="p-5 pt-0 border-t border-slate-100 space-y-5 bg-slate-50/30">
                    {/* Status Progress Stepper */}
                    <div className="pt-4">
                      <div className="flex items-center justify-between relative">
                        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0"></div>
                        {statusProgression.map((s, idx) => {
                          const isDone = idx <= currentStepIdx;
                          const isCurrent = idx === currentStepIdx;
                          return (
                            <div key={s} className="relative z-10 flex flex-col items-center">
                              <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                                  isDone
                                    ? 'bg-agri-dark text-white'
                                    : 'bg-white text-slate-400 border border-slate-300'
                                } ${isCurrent ? 'ring-4 ring-agri-200' : ''}`}
                              >
                                {isDone ? '✓' : idx + 1}
                              </div>
                              <span className="text-[9px] font-bold text-slate-600 mt-1 uppercase text-center hidden sm:block">
                                {s.replace(/_/g, ' ')}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Delivery Address & Note */}
                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs flex flex-col sm:flex-row justify-between gap-2">
                      <div>
                        <span className="text-slate-400 font-bold uppercase text-[10px]">
                          Delivery Destination
                        </span>
                        <p className="text-slate-800 font-medium">{order.deliveryAddress}</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <span className="text-slate-400 font-bold uppercase text-[10px]">
                          Payment Escrow Status
                        </span>
                        <p className="font-bold text-emerald-700">
                          {order.paymentStatus === 'RELEASED' ? 'Funds Released to Farmers' : 'Held in KhetSetu Secure Escrow'}
                        </p>
                      </div>
                    </div>

                    {/* Multi-Farmer Items Breakdown */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                        Aggregated Farmer Items
                      </h4>
                      {order.items?.map((item: any, idx: number) => (
                        <div
                          key={item.id || idx}
                          className="p-3.5 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-900">
                              {item.listing?.cropName || 'Produce Lot'}
                            </span>
                            <p className="text-[11px] text-slate-500">
                              Farmer: <strong>{item.farmer?.name || 'Local Farmer'}</strong> (Phone: {item.farmer?.phone || 'Confidential'})
                            </p>
                            <span className="inline-block mt-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                              Status: {item.itemStatus}
                            </span>
                          </div>

                          <div className="text-left sm:text-right">
                            <span className="font-black text-slate-900">
                              {item.quantity} kg @ ₹{item.unitPrice}/kg
                            </span>
                            <p className="text-[11px] font-bold text-agri-700">
                              Total: ₹{item.totalPrice.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Action Buttons: Confirm Delivery or Raise Dispute */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                      <button
                        onClick={() => setDisputeModalOrder(order)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 hover:bg-rose-50 border border-rose-200 transition flex items-center gap-1.5"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Raise Trade Dispute</span>
                      </button>

                      {order.status !== 'DELIVERED' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                          className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-agri-dark hover:bg-agri-forest shadow-md transition flex items-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Confirm Produce Delivery & Release Escrow</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Raise Dispute Modal */}
      {disputeModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-warm-border space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Raise Trade Dispute</h3>
                <p className="text-xs text-slate-500">Order #{disputeModalOrder.orderNumber}</p>
              </div>
            </div>

            <form onSubmit={handleRaiseDispute} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dispute Reason</label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Quality mismatch with Grade A specification">
                    Quality mismatch with agreed grade
                  </option>
                  <option value="Quantity shortage upon weighbridge arrival">
                    Quantity shortage upon arrival
                  </option>
                  <option value="Severe transit delay exceeding delivery deadline">
                    Severe transit delay
                  </option>
                  <option value="Moisture content damage or rot">
                    Moisture content damage or rot
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Description</label>
                <textarea
                  required
                  rows={3}
                  value={disputeDescription}
                  onChange={(e) => setDisputeDescription(e.target.value)}
                  placeholder="Provide weighbridge slip details, moisture reading, or visual defect notes..."
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-agri-leaf"
                ></textarea>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                Submitting a dispute immediately freezes the Escrow funds of ₹
                {disputeModalOrder.totalAmount.toLocaleString()} for admin investigation.
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDisputeModalOrder(null)}
                  className="w-1/3 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md transition"
                >
                  Submit Dispute to Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
