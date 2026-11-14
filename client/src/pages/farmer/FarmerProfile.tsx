import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, ShieldCheck, MapPin, CheckCircle2, Save, FileText, Upload } from 'lucide-react';
import api from '../../services/api';

export const FarmerProfile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const profile = user?.farmerProfile;

  const [name, setName] = useState(user?.name || '');
  const [village, setVillage] = useState(profile?.village || 'Sanwer');
  const [district, setDistrict] = useState(profile?.district || 'Indore');
  const [state, setState] = useState(profile?.state || 'Madhya Pradesh');
  const [pincode, setPincode] = useState(profile?.pincode || '453551');
  const [farmAreaAcres, setFarmAreaAcres] = useState(String(profile?.farmAreaAcres || 12.5));
  const [soilType, setSoilType] = useState(profile?.soilType || 'Deep Black Cotton Soil');
  const [primaryCrops, setPrimaryCrops] = useState(profile?.primaryCrops || 'Wheat, Soybean, Chickpea');

  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccess('');
    setError('');

    try {
      await api.put('/auth/profile', {
        name,
        village,
        district,
        state,
        pincode,
        farmAreaAcres: Number(farmAreaAcres),
        soilType,
        primaryCrops,
      });

      await refreshUser();
      setSuccess('Farm profile and location updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="border-b border-warm-border pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900">Farm Profile & KYC Verification</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your farm geo-location, soil parameters, and verified farmer credentials
        </p>
      </div>

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      {/* KYC Badge Card */}
      <div className="p-5 rounded-3xl bg-white border border-warm-border shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Government KYC Status</h3>
            <p className="text-xs text-slate-500">
              {user?.isVerified
                ? 'Your farmer credentials and land record (Bhulekh) are verified.'
                : 'Pending administrative verification.'}
            </p>
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            user?.isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
          }`}
        >
          {user?.isVerified ? 'KYC Verified' : 'Under Review'}
        </span>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="bg-white p-6 rounded-3xl border border-warm-border shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Farmer Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-200"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Village / Gram</label>
            <input
              type="text"
              required
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">District</label>
            <input
              type="text"
              required
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
            <input
              type="text"
              required
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Pincode</label>
            <input
              type="text"
              required
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Farm Land Area (Acres)</label>
            <input
              type="number"
              value={farmAreaAcres}
              onChange={(e) => setFarmAreaAcres(e.target.value)}
              step="0.5"
              className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Soil Type</label>
            <input
              type="text"
              value={soilType}
              onChange={(e) => setSoilType(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Primary Crops Cultivated</label>
          <input
            type="text"
            value={primaryCrops}
            onChange={(e) => setPrimaryCrops(e.target.value)}
            className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200"
          />
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-3 rounded-2xl text-xs font-bold text-white bg-agri-dark hover:bg-agri-forest shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Update Farm Profile'}</span>
        </button>
      </form>
    </div>
  );
};
