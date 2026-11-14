import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  PackagePlus,
  Boxes,
  FileText,
  BadgeDollarSign,
  Truck,
  MessageSquare,
  CloudSun,
  TrendingUp,
  Stethoscope,
  User,
  Sparkles,
  Users,
  ShieldCheck,
  AlertTriangle,
  Scale,
  LogOut,
} from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: any;
  highlight?: boolean;
}

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { user, logout, isFarmer, isBuyer, isAdmin } = useAuth();

  const farmerLinks: NavItem[] = [
    { to: '/farmer', label: 'Overview', icon: LayoutDashboard },
    { to: '/farmer/listings', label: 'My Listings', icon: Boxes },
    { to: '/farmer/add-produce', label: 'Add Produce', icon: PackagePlus },
    { to: '/farmer/buyer-requirements', label: 'Buyer Requirements', icon: FileText },
    { to: '/farmer/bids', label: 'Bids & Offers', icon: BadgeDollarSign },
    { to: '/farmer/orders', label: 'Orders & Sales', icon: Truck },
    { to: '/messages', label: 'Messages', icon: MessageSquare },
    { to: '/farmer/weather', label: 'Weather Forecast', icon: CloudSun },
    { to: '/farmer/mandi', label: 'Mandi Rates', icon: TrendingUp },
    { to: '/farmer/advisory', label: 'Agri Advisory & AI', icon: Stethoscope },
    { to: '/farmer/profile', label: 'Farm Profile & KYC', icon: User },
  ];

  const buyerLinks: NavItem[] = [
    { to: '/buyer', label: 'Overview', icon: LayoutDashboard },
    { to: '/buyer/marketplace', label: 'Browse Produce', icon: Boxes },
    { to: '/buyer/procurement', label: 'Intelligent Matching', icon: Sparkles, highlight: true },
    { to: '/buyer/procurement-plans', label: 'Procurement Plans', icon: FileText },
    { to: '/buyer/bids', label: 'My Bids', icon: BadgeDollarSign },
    { to: '/buyer/orders', label: 'Orders & Tracking', icon: Truck },
    { to: '/messages', label: 'Messages', icon: MessageSquare },
    { to: '/buyer/mandi', label: 'Mandi Rates', icon: TrendingUp },
    { to: '/buyer/profile', label: 'Buyer Profile', icon: User },
  ];

  const adminLinks: NavItem[] = [
    { to: '/admin', label: 'Overview & KPIs', icon: LayoutDashboard },
    { to: '/admin/users', label: 'User Accounts', icon: Users },
    { to: '/admin/verifications', label: 'KYC Verifications', icon: ShieldCheck },
    { to: '/admin/listings', label: 'Produce Listings', icon: Boxes },
    { to: '/admin/bids', label: 'Bids Monitor', icon: BadgeDollarSign },
    { to: '/admin/orders', label: 'Orders & Trades', icon: Truck },
    { to: '/admin/disputes', label: 'Disputes Center', icon: AlertTriangle },
    { to: '/admin/mandi', label: 'Mandi Benchmark', icon: Scale },
    { to: '/admin/advisory', label: 'Advisories Editor', icon: Stethoscope },
  ];

  const links = isFarmer ? farmerLinks : isBuyer ? buyerLinks : adminLinks;

  return (
    <aside className="w-64 bg-white border-r border-warm-border min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4">
      <div>
        {/* Role Pill Banner */}
        <div className="mb-4 px-3 py-2.5 rounded-xl bg-agri-50 border border-agri-200 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-agri-dark text-white flex items-center justify-center font-bold text-sm">
            {isFarmer ? '🌾' : isBuyer ? '🏢' : '⚙️'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-agri-900 truncate">{user?.name}</p>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-agri-700">
              {isFarmer ? 'Verified Farmer' : isBuyer ? 'Agricultural Buyer' : 'Platform Admin'}
            </p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/farmer' || link.to === '/buyer' || link.to === '/admin'}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-agri-dark text-white shadow-sm'
                      : link.highlight
                      ? 'bg-amber-50 text-amber-900 hover:bg-amber-100/70 border border-amber-200/60'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Icon className={`w-4 h-4 ${link.highlight ? 'text-amber-600' : ''}`} />
                <span>{link.label}</span>
                {link.highlight && (
                  <span className="ml-auto text-[9px] font-bold uppercase bg-amber-500 text-white px-1.5 py-0.5 rounded-full">
                    AI Match
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Logout button at bottom */}
      <div className="pt-4 border-t border-slate-100">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
