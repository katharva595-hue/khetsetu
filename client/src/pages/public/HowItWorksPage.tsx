import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Sprout, Building, CheckCircle2, ArrowRight, Truck, ShieldCheck, Calculator } from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          How KhetSetu Works
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          The seamless workflow connecting farmers and buyers with intelligent supply aggregation
        </p>
      </div>

      {/* Step by step for Buyer & Farmer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* For Farmers */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-warm-border shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-agri-dark text-white flex items-center justify-center font-bold">
              🌾
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">For Farmers & FPOs</h2>
              <p className="text-xs text-slate-500">Sell direct without middlemen commission</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-agri-100 text-agri-800 font-extrabold flex items-center justify-center shrink-0">
                1
              </span>
              <div>
                <p className="font-bold text-slate-900">Quick Registration & KYC</p>
                <p className="text-slate-500 mt-0.5">
                  Sign up with OTP, add farm location (village, district), and upload Kisan Credit Card or land details.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-agri-100 text-agri-800 font-extrabold flex items-center justify-center shrink-0">
                2
              </span>
              <div>
                <p className="font-bold text-slate-900">List Produce Lots</p>
                <p className="text-slate-500 mt-0.5">
                  Set expected price per kg, quantity, harvest readiness, quality grade (Grade A/B/C), and photos.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-agri-100 text-agri-800 font-extrabold flex items-center justify-center shrink-0">
                3
              </span>
              <div>
                <p className="font-bold text-slate-900">Receive Direct Bids & Counter-Offer</p>
                <p className="text-slate-500 mt-0.5">
                  Accept bids from verified buyers or submit counter offers directly through the in-app chat.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-agri-100 text-agri-800 font-extrabold flex items-center justify-center shrink-0">
                4
              </span>
              <div>
                <p className="font-bold text-slate-900">Secure Escrow Payout</p>
                <p className="text-slate-500 mt-0.5">
                  Funds are secured in Escrow before dispatch and released directly to your bank account upon delivery.
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/register"
            className="block w-full py-2.5 rounded-xl text-center text-xs font-bold text-white bg-agri-dark hover:bg-agri-forest shadow transition"
          >
            Register as a Farmer
          </Link>
        </div>

        {/* For Buyers */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-warm-border shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-agri-forest text-white flex items-center justify-center font-bold">
              🏢
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">For Bulk Buyers & Mills</h2>
              <p className="text-xs text-slate-500">Fast, automated, multi-farmer procurement</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-extrabold flex items-center justify-center shrink-0">
                1
              </span>
              <div>
                <p className="font-bold text-slate-900">Submit Bulk Demand</p>
                <p className="text-slate-500 mt-0.5">
                  Specify crop (e.g. Wheat), required tonnage (e.g. 1,000 kg), grade, budget cap, and delivery window.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-extrabold flex items-center justify-center shrink-0">
                2
              </span>
              <div>
                <p className="font-bold text-slate-900">Intelligent Supply Matching</p>
                <p className="text-slate-500 mt-0.5">
                  Algorithm scans local farmers, calculates Haversine transit distances, and aggregates supply automatically.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-extrabold flex items-center justify-center shrink-0">
                3
              </span>
              <div>
                <p className="font-bold text-slate-900">Review Itemized Plan</p>
                <p className="text-slate-500 mt-0.5">
                  Inspect each farmer's contribution, individual prices, weighted average price, and selection rationale.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-extrabold flex items-center justify-center shrink-0">
                4
              </span>
              <div>
                <p className="font-bold text-slate-900">1-Click Order Execution</p>
                <p className="text-slate-500 mt-0.5">
                  Convert the entire combined procurement plan into active orders with real-time tracking and dispute protection.
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/buyer/procurement"
            className="block w-full py-2.5 rounded-xl text-center text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 shadow transition"
          >
            Try Procurement Matching
          </Link>
        </div>
      </div>
    </div>
  );
};
