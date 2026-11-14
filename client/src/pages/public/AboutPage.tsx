import React from 'react';
import { Sprout, Users, ShieldCheck, TrendingUp, Sparkles, Award } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Hero */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-agri-100 text-agri-800 text-xs font-bold border border-agri-200">
          <Award className="w-3.5 h-3.5 text-agri-700" />
          <span>Academic SRS Project & Smart India Hackathon Solution</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          About KhetSetu Platform
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Connecting farmers directly with agricultural consumers, traders, and bulk food processors through
          algorithmic multi-farmer supply aggregation.
        </p>
      </div>

      {/* Vision & Mission */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-warm-border shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Sprout className="w-6 h-6 text-emerald-700" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Our Vision</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            To eliminate exploitative non-value-adding middlemen in the agricultural supply chain, ensuring that
            farmers realize a fair share of the consumer rupee while guaranteeing institutional buyers fresh,
            verified produce with transparent logistics and escrow security.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-warm-border shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <Sparkles className="w-6 h-6 text-amber-700" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">The Core Innovation</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Existing agricultural portals merely list individual lots, forcing bulk buyers to manually negotiate
            with dozens of smallholders. KhetSetu starts with the buyer's bulk requirement and works backwards—using
            a multi-criteria decision algorithm to combine nearby small farm lots into one unified procurement plan.
          </p>
        </div>
      </div>

      {/* SRS Lab Documentation & Engineering Integrity */}
      <div className="bg-white p-8 rounded-3xl border border-warm-border shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Engineering Specification & System Design</h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          KhetSetu was architected according to the rigorous software engineering standards of the Medi-Caps University
          Software Requirements Specification (SRS), incorporating Context-level 0-Level Data Flow Diagrams (DFD),
          1-Level Functional Decomposition, and Actor Use-Case boundary definitions.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <h4 className="font-bold text-xs text-slate-800">0-Level DFD</h4>
            <p className="text-[11px] text-slate-500 mt-1">
              External entity interaction bridging farmers, buyers, Mandi APIs, and weather sensory data.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <h4 className="font-bold text-xs text-slate-800">1-Level DFD</h4>
            <p className="text-[11px] text-slate-500 mt-1">
              Subprocess modularization across Authentication, Crop Database, Weather Engine, and Query Support.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <h4 className="font-bold text-xs text-slate-800">Use Case Model</h4>
            <p className="text-[11px] text-slate-500 mt-1">
              Strict role-based segregation separating Farmer, Buyer, Admin, and Agronomy Expert privileges.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
