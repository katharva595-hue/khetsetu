import React, { useEffect, useState } from 'react';
import { FileText, MapPin, Calendar, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

export const FarmerBuyerRequirements: React.FC = () => {
  const [requirements, setRequirements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api
      .get('/procurement/requirements')
      .then((res) => setRequirements(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b border-warm-border pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900">Open Buyer Procurement Demands</h1>
        <p className="text-xs text-slate-500 mt-1">
          Wholesalers and food processors seeking bulk agricultural produce in your region
        </p>
      </div>

      {isLoading ? (
        <div className="py-16 text-center">
          <div className="inline-block w-8 h-8 border-4 border-agri-dark border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 mt-2">Scanning open buyer demands...</p>
        </div>
      ) : requirements.length === 0 ? (
        <div className="bg-white rounded-3xl border border-warm-border p-12 text-center space-y-2">
          <FileText className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Open Requirements Right Now</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Check back soon or ensure your produce listings are active to be matched automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requirements.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-3xl border border-warm-border p-6 shadow-sm space-y-4 hover:border-agri-300 transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-agri-700 bg-agri-50 px-2 py-0.5 rounded border border-agri-200">
                      Bulk Requirement
                    </span>
                    <h3 className="text-lg font-extrabold text-slate-900 mt-1">{req.cropName}</h3>
                    <p className="text-xs font-semibold text-slate-500">
                      {req.buyer?.buyerProfile?.companyName || req.buyer?.name || 'Verified Wholesaler'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-slate-900">
                      Up to ₹{req.maxPrice}/kg
                    </span>
                    <p className="text-[10px] text-slate-500 font-bold">Max Budget Cap</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Required Qty</span>
                    <p className="font-extrabold text-slate-900">
                      {req.requiredQuantity} {req.unit}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Quality Grade</span>
                    <p className="font-extrabold text-slate-900">{req.qualityGrade.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Deadline</span>
                    <p className="font-extrabold text-slate-900">
                      {new Date(req.deliveryDeadline).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Max Radius</span>
                    <p className="font-extrabold text-slate-900">{req.maxDistanceKm} km</p>
                  </div>
                </div>

                {req.notes && (
                  <p className="text-xs text-slate-600 line-clamp-2 italic">
                    "{req.notes}"
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {req.preferredLocation}
                </span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Status: {req.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
