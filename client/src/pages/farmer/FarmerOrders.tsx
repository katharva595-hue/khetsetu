import React, { useEffect, useState } from 'react';
import {
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import api from '../../services/api';

export const FarmerOrders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  const fetchOrders = () => {
    setIsLoading(true);
    api
      .get('/orders')
      .then((res) => setOrders(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateItemStatus = async (orderId: string, itemId: string, status: string) => {
    try {
      await api.put(`/orders/${orderId}/status`, {
        itemId,
        status,
      });

      setActionSuccess(`Fulfillment status updated to "${status}"`);
      fetchOrders();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to update item status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-warm-border pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900">Orders & Dispatches</h1>
        <p className="text-xs text-slate-500 mt-1">
          Fulfil confirmed procurement orders, pack produce, and track escrow payouts
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
          <p className="text-xs text-slate-500 mt-2">Loading sales orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-warm-border p-12 text-center space-y-2">
          <Truck className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Sales Orders Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When buyers confirm procurement plans or accept bids on your lots, confirmed orders will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-warm-border p-6 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-base text-slate-900">Order #{order.orderNumber}</span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-agri-100 text-agri-800">
                      Overall: {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Buyer: <strong>{order.buyer?.name}</strong> • Phone: {order.buyer?.phone}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs font-semibold text-slate-400">Escrow Payment</span>
                  <p className="text-sm font-black text-emerald-700">{order.paymentStatus}</p>
                </div>
              </div>

              {/* Items assigned to this farmer */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Your Produce Allocated for Fulfillment
                </h4>

                {order.items?.map((item: any) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <h5 className="font-black text-slate-900 text-sm">
                        {item.listing?.cropName || 'Produce Lot'}
                      </h5>
                      <p className="text-slate-600 font-semibold mt-0.5">
                        {item.quantity} kg @ ₹{item.unitPrice}/kg • Total Payout: ₹
                        {item.totalPrice.toLocaleString()}
                      </p>
                      <span className="inline-block mt-1 font-bold text-[10px] bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded">
                        Current Status: {item.itemStatus}
                      </span>
                    </div>

                    {/* Progress actions for Farmer */}
                    <div className="flex items-center gap-2 shrink-0">
                      {item.itemStatus === 'CONFIRMED' && (
                        <button
                          onClick={() => handleUpdateItemStatus(order.id, item.id, 'PACKED')}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-agri-dark hover:bg-agri-forest shadow-sm"
                        >
                          Mark as Packed & Graded
                        </button>
                      )}
                      {item.itemStatus === 'PACKED' && (
                        <button
                          onClick={() => handleUpdateItemStatus(order.id, item.id, 'IN_TRANSIT')}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 shadow-sm"
                        >
                          Mark Dispatched / In Transit
                        </button>
                      )}
                      {item.itemStatus === 'IN_TRANSIT' && (
                        <span className="text-xs font-bold text-sky-700">
                          Produce in transit to buyer warehouse
                        </span>
                      )}
                      {item.itemStatus === 'DELIVERED' && (
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Delivered & Escrow Released
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
