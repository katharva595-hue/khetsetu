import React, { useEffect, useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, FileText, Clock, User } from 'lucide-react';
import api from '../../services/api';

export const AdminVerifications: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  const fetchVerifications = () => {
    setIsLoading(true);
    api
      .get('/admin/verifications')
      .then((res) => setRequests(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  const handleUpdate = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await api.put(`/admin/verifications/${id}`, {
        status,
        adminNotes: status === 'APPROVED' ? 'Approved by SuperAdmin' : 'Rejected due to incomplete doc',
      });

      setActionSuccess(`Verification request ${status}`);
      fetchVerifications();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to update verification request');
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-warm-border pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900">KYC Verification Queue</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review land records, Kisan Credit Cards, GSTIN certificates, and grant platform verified badges
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
          <p className="text-xs text-slate-500 mt-2">Loading KYC queue...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-3xl border border-warm-border p-12 text-center text-xs text-slate-500">
          No KYC verification requests pending at this time.
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-2xl border border-warm-border p-5 shadow-sm space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">{req.user?.name}</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {req.role}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                        req.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : req.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Phone: {req.user?.phone} • Email: {req.user?.email}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs font-bold text-slate-900">
                    {req.documentType?.replace(/_/g, ' ')}
                  </span>
                  <p className="text-[11px] font-mono font-semibold text-slate-500">
                    Doc #{req.documentNumber}
                  </p>
                </div>
              </div>

              {req.adminNotes && (
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <strong>Admin Remarks:</strong> {req.adminNotes}
                </p>
              )}

              {req.status === 'PENDING' && (
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => handleUpdate(req.id, 'APPROVED')}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve & Grant Verified Badge</span>
                  </button>
                  <button
                    onClick={() => handleUpdate(req.id, 'REJECTED')}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition flex items-center gap-1.5"
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
    </div>
  );
};
