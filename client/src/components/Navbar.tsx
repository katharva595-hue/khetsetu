import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sprout,
  Bell,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Layers,
  Sparkles,
  BarChart3,
  CloudSun,
  ShieldCheck,
  Menu,
  X,
} from 'lucide-react';
import api from '../services/api';

export const Navbar: React.FC = () => {
  const { user, token, logout, isFarmer, isBuyer, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (token) {
      api
        .get('/notifications')
        .then((res) => setNotifications(res.data || []))
        .catch(() => {});
    }
  }, [token, location.pathname]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };

  const getDashboardPath = () => {
    if (isFarmer) return '/farmer';
    if (isBuyer) return '/buyer';
    if (isAdmin) return '/admin';
    return '/marketplace';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-warm-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-agri-dark text-white flex items-center justify-center shadow-md group-hover:bg-agri-forest transition">
                <Sprout className="w-6 h-6 text-agri-300" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-agri-dark">
                  Khet<span className="text-agri-600">Setu</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                  AgriTech Marketplace
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
              <Link
                to="/marketplace"
                className={`px-3 py-2 rounded-lg transition hover:text-agri-dark hover:bg-slate-100 ${
                  location.pathname === '/marketplace' ? 'text-agri-dark font-semibold bg-agri-50' : ''
                }`}
              >
                Marketplace
              </Link>
              <Link
                to="/buyer/procurement"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition hover:text-agri-dark hover:bg-slate-100 ${
                  location.pathname.includes('/procurement') ? 'text-agri-dark font-semibold bg-agri-50' : ''
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                Intelligent Procurement
              </Link>
              <Link
                to="/mandi"
                className={`flex items-center gap-1 px-3 py-2 rounded-lg transition hover:text-agri-dark hover:bg-slate-100 ${
                  location.pathname === '/mandi' ? 'text-agri-dark font-semibold bg-agri-50' : ''
                }`}
              >
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                Mandi Rates
              </Link>
              <Link
                to="/weather"
                className={`flex items-center gap-1 px-3 py-2 rounded-lg transition hover:text-agri-dark hover:bg-slate-100 ${
                  location.pathname === '/weather' ? 'text-agri-dark font-semibold bg-agri-50' : ''
                }`}
              >
                <CloudSun className="w-4 h-4 text-sky-500" />
                Weather
              </Link>
              <Link
                to="/how-it-works"
                className="px-3 py-2 rounded-lg transition hover:text-agri-dark hover:bg-slate-100"
              >
                How It Works
              </Link>
            </nav>
          </div>

          {/* Right Header Section: User State, Notifications, Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Dashboard Link Shortcut */}
                <Link
                  to={getDashboardPath()}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-agri-100 text-agri-800 hover:bg-agri-200 transition border border-agri-300/60"
                >
                  <Layers className="w-3.5 h-3.5" />
                  {isFarmer ? 'Farmer Portal' : isBuyer ? 'Buyer Portal' : 'Admin Console'}
                </Link>

                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 rounded-lg text-slate-600 hover:text-agri-dark hover:bg-slate-100 transition"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold bg-amber-500 text-white rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Popover */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-warm-border p-3 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          Notifications ({unreadCount} new)
                        </span>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-[11px] text-agri-700 hover:underline font-medium"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 mt-2">
                        {notifications.length === 0 ? (
                          <p className="text-xs text-slate-400 text-center py-4">No notifications yet</p>
                        ) : (
                          notifications.slice(0, 6).map((n) => (
                            <div
                              key={n.id}
                              onClick={() => {
                                if (n.link) navigate(n.link);
                                setShowNotifications(false);
                              }}
                              className={`p-2 rounded-lg cursor-pointer transition text-xs ${
                                !n.isRead ? 'bg-agri-50/60 font-medium' : 'hover:bg-slate-50 text-slate-600'
                              }`}
                            >
                              <div className="font-semibold text-slate-900">{n.title}</div>
                              <div className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">{n.message}</div>
                              <div className="text-[10px] text-slate-400 mt-1">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition"
                  >
                    <img
                      src={user.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=Khet'}
                      alt={user.name}
                      className="w-8 h-8 rounded-full border border-agri-300 bg-white"
                    />
                    <div className="hidden sm:flex flex-col text-left">
                      <span className="text-xs font-bold text-slate-800 truncate max-w-[110px]">{user.name}</span>
                      <span className="text-[10px] text-agri-700 font-semibold">{user.role}</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-warm-border py-1.5 z-50">
                      <div className="px-3 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900">{user.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                        {user.isVerified && (
                          <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified KYC
                          </span>
                        )}
                      </div>
                      <Link
                        to={getDashboardPath()}
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        <Layers className="w-4 h-4 text-slate-400" />
                        Dashboard
                      </Link>
                      <Link
                        to={`${getDashboardPath()}/profile`}
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        Profile & Settings
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                          navigate('/');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:text-agri-dark hover:bg-slate-100 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-agri-dark hover:bg-agri-forest shadow-sm transition"
                >
                  Join KhetSetu
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          <Link
            to="/marketplace"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Marketplace
          </Link>
          <Link
            to="/buyer/procurement"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Intelligent Procurement
          </Link>
          <Link
            to="/mandi"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Mandi Rates
          </Link>
          <Link
            to="/weather"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Weather & Advisories
          </Link>
          <Link
            to="/how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            How It Works
          </Link>
          {user && (
            <Link
              to={getDashboardPath()}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-bold text-agri-800 bg-agri-100"
            >
              Go to Dashboard
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
