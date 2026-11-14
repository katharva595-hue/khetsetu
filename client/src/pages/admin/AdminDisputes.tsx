import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert, XCircle, ArrowRight } from 'lucide-react';
import api from '../../services/api';

export const AdminDisputes: React.FC = () => {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [resolutionText, setResolutionText] = useState('');
  const [activeDisputeId, setActiveDisputeId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  const fetchDisputes = () => {
    setIsLoading(true);
    api
      .get('/admin/disputes')
      .then((res) => setDisputes(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleResolve = async (id: string, status: 'RESOLVED' | 'DISMISSED') => {
    try {
      await api.put(`/admin/disputes/${id}`, {
        status,
        adminResolution:
          resolutionText ||
          (status === 'RESOLVED'
            ? 'Dispute validated. 15% discount applied and escrow released to parties.'
            : 'Dispute investigated and dismissed due to verified weighbridge documentation.'),
      });

      setActionSuccess(`Dispute marked as ${status}`);
      setActiveDisputeId(null);
      setResolutionText('');
      fetchDisputes();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to resolve dispute');
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-warm-border pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900">Trade Disputes Resolution Center</h1>
        <p className="text-xs text-slate-500 mt-1">
          Investigate produce quality claims, quantity weighbridge discrepancies, and arbitrate escrow releases
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
          <p className="text-xs text-slate-500 mt-2">Loading disputes...</p>
        </div>
      ) : disputes.length === 0 ? (
        <div className="bg-white rounded-3xl border border-warm-border p-12 text-center text-xs text-slate-500">
          No trade disputes filed. All platform trades are executing smoothly!
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((dispute) => (
            <div
              key={dispute.id}
              className="bg-white rounded-2xl border border-warm-border p-6 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-base text-slate-900">
                      Dispute on Order #{dispute.order?.orderNumber}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                        dispute.status === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : dispute.status === 'DISMISSED'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {dispute.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Raised by: <strong>{dispute.raisedBy?.name}</strong> ({dispute.raisedBy?.role}) vs.{' '}
                    <strong>{dispute.againstUser?.name}</strong> ({dispute.againstUser?.role})
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs font-semibold text-slate-400">Order Amount</span>
                  <p className="text-sm font-black text-slate-900">
                    ₹{dispute.order?.totalAmount?.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-rose-50/70 rounded-2xl border border-rose-200 text-xs space-y-1">
                <span className="font-extrabold text-rose-950">Claim: {dispute.reason}</span>
                <p className="text-slate-700 leading-relaxed">"{dispute.description}"</p>
              </div>

              {dispute.adminResolution && (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-800">
                  <span className="font-bold text-slate-900">Admin Arbitrated Resolution:</span>
                  <p className="mt-0.5">{dispute.adminResolution}</p>
                </div>
              )}

              {dispute.status === 'OPEN' && (
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <input
                    type="text"
                    value={activeDisputeId === dispute.id ? resolutionText : ''}
                    onFocus={() => setActiveDisputeId(dispute.id)}
                    onChange={(e) => setResolutionText(e.target.value)}
                    placeholder="Enter formal admin settlement verdict / escrow release notes..."
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200"
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleResolve(dispute.id, 'RESOLVED')}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition"
                    >
                      Enforce Resolution & Release
                    </button>
                    <button
                      onClick={() => handleResolve(dispute.id, 'DISMISSED')}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                    >
                      Dismiss Claim
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
