import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sprout, CheckCircle2, ArrowRight, ShieldCheck, Phone, MapPin, Building, Key } from 'lucide-react';
import api from '../../services/api';

export const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<'FARMER' | 'BUYER'>('FARMER');
  const [step, setStep] = useState<1 | 2>(1);

  // Common Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [demoOtp, setDemoOtp] = useState('');

  // Farmer specific
  const [village, setVillage] = useState('Sanwer');
  const [district, setDistrict] = useState('Indore');
  const [state, setState] = useState('Madhya Pradesh');
  const [pincode, setPincode] = useState('453551');
  const [farmAreaAcres, setFarmAreaAcres] = useState('7.5');
  const [experienceYears, setExperienceYears] = useState('10');
  const [soilType, setSoilType] = useState('Deep Black Cotton Soil');
  const [primaryCrops, setPrimaryCrops] = useState('Wheat, Soybean, Chickpea');
  const [latitude, setLatitude] = useState('22.9772');
  const [longitude, setLongitude] = useState('75.8286');

  // Buyer specific
  const [companyName, setCompanyName] = useState('Indore Agro Trading Co.');
  const [businessType, setBusinessType] = useState('WHOLESALER');
  const [gstin, setGstin] = useState('23AABCI9921M1ZN');
  const [city, setCity] = useState('Indore');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      setError('Please provide a valid 10-digit mobile number');
      return;
    }
    setError('');
    try {
      const res = await api.post('/auth/otp/request', { phone });
      setIsOtpSent(true);
      setDemoOtp(res.data.demoOtp || '123456');
    } catch {
      setIsOtpSent(true);
      setDemoOtp('123456');
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !password) {
      setError('Please fill all basic details');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const payload: any = {
        name,
        email,
        phone,
        password,
        role,
      };

      if (role === 'FARMER') {
        payload.village = village;
        payload.district = district;
        payload.state = state;
        payload.pincode = pincode;
        payload.farmAreaAcres = Number(farmAreaAcres);
        payload.experienceYears = Number(experienceYears);
        payload.soilType = soilType;
        payload.primaryCrops = primaryCrops;
        payload.latitude = Number(latitude);
        payload.longitude = Number(longitude);
      } else {
        payload.companyName = companyName;
        payload.businessType = businessType;
        payload.gstin = gstin;
        payload.city = city;
        payload.district = district;
        payload.state = state;
        payload.pincode = pincode;
      }

      const res = await api.post('/auth/register', payload);
      const { token, user } = res.data;
      login(token, user);

      if (role === 'FARMER') navigate('/farmer');
      else navigate('/buyer');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-warm-bg">
      <div className="max-w-xl w-full bg-white p-8 rounded-3xl shadow-xl border border-warm-border">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-agri-dark text-white mb-2 shadow-md">
            <Sprout className="w-7 h-7 text-agri-300" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Join KhetSetu Marketplace</h2>
          <p className="text-xs text-slate-500 mt-1">
            Step {step} of 2: {step === 1 ? 'Account Credentials & Phone' : 'Profile & Farm/Business Setup'}
          </p>
        </div>

        {/* Role Selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setRole('FARMER')}
            className={`p-3.5 rounded-2xl border text-left transition flex items-center gap-3 ${
              role === 'FARMER'
                ? 'border-agri-dark bg-agri-50/70 shadow-sm'
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="text-2xl">🌾</span>
            <div>
              <p className="text-xs font-bold text-slate-900">Farmer / FPO</p>
              <p className="text-[10px] text-slate-500">Sell produce, get fair prices, view mandi rates</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setRole('BUYER')}
            className={`p-3.5 rounded-2xl border text-left transition flex items-center gap-3 ${
              role === 'BUYER'
                ? 'border-agri-dark bg-agri-50/70 shadow-sm'
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="text-2xl">🏢</span>
            <div>
              <p className="text-xs font-bold text-slate-900">Buyer / Trader</p>
              <p className="text-[10px] text-slate-500">Intelligent procurement, bulk aggregation</p>
            </div>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        {/* Step 1: Basic Authentication */}
        {step === 1 && (
          <form onSubmit={handleNextStep} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === 'FARMER' ? 'e.g. Rameshwar Patel' : 'e.g. Vikas Agrawal'}
                className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-agri-leaf"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-agri-leaf"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number (with OTP)</label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9893000000"
                  className="flex-1 text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-agri-leaf"
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition shrink-0"
                >
                  {isOtpSent ? 'Resend' : 'Send OTP'}
                </button>
              </div>
              {isOtpSent && (
                <div className="mt-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-center justify-between">
                  <span>Demo OTP sent: <strong>{demoOtp}</strong></span>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    className="w-28 text-xs font-bold px-2 py-1 bg-white rounded border border-emerald-300"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-agri-leaf"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-white bg-agri-dark hover:bg-agri-forest shadow-md transition"
            >
              <span>Continue to Profile Setup</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Step 2: Role Details */}
        {step === 2 && (
          <form onSubmit={handleRegister} className="space-y-4">
            {role === 'FARMER' ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Village / Gram</label>
                    <input
                      type="text"
                      required
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">District</label>
                    <input
                      type="text"
                      required
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200"
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
                      className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Pincode</label>
                    <input
                      type="text"
                      required
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Farm Area (Acres)</label>
                    <input
                      type="number"
                      value={farmAreaAcres}
                      onChange={(e) => setFarmAreaAcres(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200"
                      step="0.5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Soil Type</label>
                    <input
                      type="text"
                      value={soilType}
                      onChange={(e) => setSoilType(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Primary Crops Cultivated</label>
                  <input
                    type="text"
                    value={primaryCrops}
                    onChange={(e) => setPrimaryCrops(e.target.value)}
                    placeholder="e.g. Wheat, Soybean, Gram"
                    className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Company / Firm Name</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Malwa Agro Processing Pvt Ltd"
                    className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Business Type</label>
                    <select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="WHOLESALER">Wholesaler / Trader</option>
                      <option value="PROCESSOR">Food Processor / Miller</option>
                      <option value="EXPORTER">Agricultural Exporter</option>
                      <option value="RETAILER">Retail Chain / Supermarket</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">GSTIN Number</label>
                    <input
                      type="text"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value)}
                      placeholder="23AAAAA0000A1Z5"
                      className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">District</label>
                    <input
                      type="text"
                      required
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="w-2/3 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white bg-agri-dark hover:bg-agri-forest shadow-md transition disabled:opacity-50"
              >
                {isLoading ? 'Creating Account...' : 'Complete Registration'}
              </button>
            </div>
          </form>
        )}

        <div className="text-center pt-4 mt-4 border-t border-slate-100">
          <p className="text-xs text-slate-600">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-agri-dark hover:underline">
              Log in to your account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
