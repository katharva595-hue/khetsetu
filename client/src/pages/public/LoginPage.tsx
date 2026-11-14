import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sprout, Lock, User, Sparkles, ArrowRight, ShieldCheck, CheckCircle } from 'lucide-react';
import api from '../../services/api';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState<'FARMER' | 'BUYER' | 'ADMIN'>('FARMER');
  const [identifier, setIdentifier] = useState('farmer@khetsetu.com');
  const [password, setPassword] = useState('Farmer@123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const demoAccounts = {
    FARMER: {
      identifier: 'farmer@khetsetu.com',
      password: 'Farmer@123',
      name: 'Rameshwar Patel (Farmer)',
      desc: 'Sanwer village, MP. Has active Sharbati Wheat and Chickpea listings.',
      target: '/farmer',
    },
    BUYER: {
      identifier: 'buyer@khetsetu.com',
      password: 'Buyer@123',
      name: 'Vikas Agrawal (Malwa Agro Mills)',
      desc: 'Indore Central Hub. Has open bulk wheat procurement requirements.',
      target: '/buyer',
    },
    ADMIN: {
      identifier: 'admin@khetsetu.com',
      password: 'Admin@123',
      name: 'KhetSetu System SuperAdmin',
      desc: 'Platform monitor, verification requests, analytics and dispute center.',
      target: '/admin',
    },
  };

  const selectRoleTab = (role: 'FARMER' | 'BUYER' | 'ADMIN') => {
    setActiveRole(role);
    setIdentifier(demoAccounts[role].identifier);
    setPassword(demoAccounts[role].password);
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await api.post('/auth/login', { identifier, password });
      const { token, user } = res.data;
      login(token, user);

      if (user.role === 'FARMER') navigate('/farmer');
      else if (user.role === 'BUYER') navigate('/buyer');
      else if (user.role === 'ADMIN') navigate('/admin');
      else navigate('/marketplace');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOneClickDemo = (role: 'FARMER' | 'BUYER' | 'ADMIN') => {
    selectRoleTab(role);
    setIsLoading(true);
    api
      .post('/auth/login', {
        identifier: demoAccounts[role].identifier,
        password: demoAccounts[role].password,
      })
      .then((res) => {
        const { token, user } = res.data;
        login(token, user);
        navigate(demoAccounts[role].target);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Demo login failed');
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-warm-bg">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl shadow-xl border border-warm-border">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-agri-dark text-white mb-3 shadow-md">
            <Sprout className="w-7 h-7 text-agri-300" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Sign in to KhetSetu</h2>
          <p className="mt-1 text-xs text-slate-500">Access your role-specific dashboard and trade tools</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => selectRoleTab('FARMER')}
            className={`py-2 text-xs font-bold rounded-lg transition ${
              activeRole === 'FARMER'
                ? 'bg-white text-agri-dark shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🌾 Farmer
          </button>
          <button
            type="button"
            onClick={() => selectRoleTab('BUYER')}
            className={`py-2 text-xs font-bold rounded-lg transition ${
              activeRole === 'BUYER'
                ? 'bg-white text-agri-dark shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🏢 Buyer
          </button>
          <button
            type="button"
            onClick={() => selectRoleTab('ADMIN')}
            className={`py-2 text-xs font-bold rounded-lg transition ${
              activeRole === 'ADMIN'
                ? 'bg-white text-agri-dark shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ⚙️ Admin
          </button>
        </div>

        {/* Instant One-Click Demo Badge */}
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-left">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Demo Account Ready
            </span>
            <button
              type="button"
              onClick={() => handleOneClickDemo(activeRole)}
              className="text-[11px] font-extrabold text-agri-dark hover:underline flex items-center gap-0.5"
            >
              1-Click Demo Sign-in <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <p className="text-xs font-semibold text-slate-800">{demoAccounts[activeRole].name}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">{demoAccounts[activeRole].desc}</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email or Phone Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full text-xs font-semibold pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-agri-leaf"
                placeholder="email@domain.com or 10-digit mobile"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">Password</label>
              <span className="text-[11px] text-agri-700 font-medium hover:underline cursor-pointer">
                Forgot password?
              </span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs font-semibold pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-agri-leaf"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-white bg-agri-dark hover:bg-agri-forest shadow-md transition disabled:opacity-50"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In as {activeRole}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-600">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-agri-dark hover:underline">
              Create a free account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
