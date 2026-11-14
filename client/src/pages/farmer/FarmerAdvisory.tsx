import React, { useEffect, useState } from 'react';
import {
  Stethoscope,
  Bot,
  Send,
  AlertTriangle,
  CheckCircle2,
  Sprout,
  HelpCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api';

export const FarmerAdvisory: React.FC = () => {
  const [advisories, setAdvisories] = useState<any[]>([]);
  const [myQueries, setMyQueries] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'KNOWLEDGE' | 'AI_DOCTOR'>('AI_DOCTOR');

  // Query Form
  const [cropName, setCropName] = useState('Wheat');
  const [queryText, setQueryText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [latestAiResponse, setLatestAiResponse] = useState<any | null>(null);
  const [error, setError] = useState('');

  const fetchAdvisoriesAndQueries = () => {
    api
      .get('/advisory')
      .then((res) => setAdvisories(res.data || []))
      .catch(() => {});

    api
      .get('/advisory/queries')
      .then((res) => setMyQueries(res.data || []))
      .catch(() => {});
  };

  useEffect(() => {
    fetchAdvisoriesAndQueries();
  }, []);

  const handleAskDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryText.trim()) return;

    setError('');
    setIsSubmitting(true);
    setLatestAiResponse(null);

    try {
      const res = await api.post('/advisory/queries', {
        cropName,
        queryText,
      });

      setLatestAiResponse(res.data.query);
      setQueryText('');
      fetchAdvisoriesAndQueries();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to analyze crop issue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-warm-border pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Agricultural Advisory & AI Agronomist</h1>
          <p className="text-xs text-slate-500 mt-1">
            Instant crop disease identification, pest management directives, and verified agronomy guides
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('AI_DOCTOR')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'AI_DOCTOR' ? 'bg-white text-agri-dark shadow-sm' : 'text-slate-600'
            }`}
          >
            <Bot className="w-4 h-4 text-amber-500" />
            <span>AI Crop Doctor</span>
          </button>
          <button
            onClick={() => setActiveTab('KNOWLEDGE')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'KNOWLEDGE' ? 'bg-white text-agri-dark shadow-sm' : 'text-slate-600'
            }`}
          >
            <Sprout className="w-4 h-4 text-emerald-600" />
            <span>Agronomy Advisory Library</span>
          </button>
        </div>
      </div>

      {activeTab === 'AI_DOCTOR' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Ask Query Form */}
          <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-warm-border shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-agri-dark text-white flex items-center justify-center font-bold">
                <Bot className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Ask AI Agronomy Assistant</h3>
                <p className="text-[11px] text-slate-500">Describe crop symptoms or ask fertilizer recommendations</p>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {error}
              </div>
            )}

            <form onSubmit={handleAskDoctor} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Affected Crop</label>
                <select
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  className="w-full text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50"
                >
                  <option value="Wheat">Wheat (Rabi Season)</option>
                  <option value="Soybean">Soybean (Kharif Season)</option>
                  <option value="Chickpea / Gram">Chickpea / Gram (Desi Chana)</option>
                  <option value="Onion">Onion</option>
                  <option value="Tomato">Tomato</option>
                  <option value="Cotton">Cotton</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Describe Symptoms or Problem
                </label>
                <textarea
                  required
                  rows={4}
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  placeholder="e.g. Seeing linear yellow spots/stripes on wheat leaves during early morning fog. Leaf tips are turning brown. What spray is recommended?"
                  className="w-full text-xs font-medium px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-agri-leaf"
                ></textarea>
              </div>

              {/* Quick sample prompt buttons */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Quick Questions:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setQueryText(
                        'Yellow rust powdery spots on flag leaf of wheat crop. Need immediate fungicide dose.'
                      )
                    }
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-lg"
                  >
                    Yellow rust on wheat
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setQueryText('Caterpillars boring into chickpea pods. How to control using IPM bio-pesticide?')
                    }
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-lg"
                  >
                    Pod borer in gram
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setQueryText('What is the ideal split dose of Nitrogen and Zinc for maximum Sharbati grain weight?')
                    }
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-lg"
                  >
                    Fertilizer schedule
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-2xl text-xs font-extrabold text-white bg-agri-dark hover:bg-agri-forest shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{isSubmitting ? 'Analyzing Agronomy Model...' : 'Diagnose & Get Solution'}</span>
              </button>
            </form>
          </div>

          {/* AI Diagnostic Output Card */}
          <div className="lg:col-span-6 space-y-4">
            {latestAiResponse ? (
              <div className="bg-white p-6 rounded-3xl border border-agri-300 shadow-md space-y-4 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
                    <h3 className="font-extrabold text-sm text-slate-900">
                      Agronomy Diagnosis for {latestAiResponse.cropName}
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">
                    {new Date(latestAiResponse.answeredAt).toLocaleTimeString()}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                  <span className="font-bold text-slate-700">Your Query:</span>
                  <p className="text-slate-600 mt-0.5 italic">"{latestAiResponse.queryText}"</p>
                </div>

                <div className="p-4 bg-agri-50/70 rounded-2xl border border-agri-200 text-xs text-slate-800 space-y-3 leading-relaxed whitespace-pre-line">
                  {latestAiResponse.aiResponse}
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-3xl border border-warm-border text-center space-y-2">
                <Bot className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="font-extrabold text-sm text-slate-800">AI Agronomist Ready</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Type your farming question or crop symptom on the left to receive customized agronomic prescriptions.
                </p>
              </div>
            )}

            {/* Past Queries List */}
            {myQueries.length > 0 && (
              <div className="bg-white p-5 rounded-3xl border border-warm-border shadow-sm space-y-3">
                <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Past Diagnoses ({myQueries.length})
                </h4>
                <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                  {myQueries.map((q) => (
                    <div key={q.id} className="py-2.5 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{q.cropName}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(q.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-1">"{q.queryText}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Advisory Library Tab */}
      {activeTab === 'KNOWLEDGE' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {advisories.map((adv) => (
            <div
              key={adv.id}
              className="bg-white rounded-3xl border border-warm-border p-6 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                      adv.severity === 'HIGH'
                        ? 'bg-rose-100 text-rose-800'
                        : adv.severity === 'CRITICAL'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {adv.category.replace('_', ' ')} • {adv.severity}
                  </span>
                  <h3 className="font-extrabold text-base text-slate-900 mt-1">{adv.title}</h3>
                  <p className="text-[11px] font-bold text-agri-700">Target Crop: {adv.cropName}</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{adv.description}</p>

              {adv.symptoms && (
                <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100 text-xs">
                  <span className="font-bold text-rose-900">Symptoms to watch for:</span>
                  <p className="text-slate-700 mt-0.5">{adv.symptoms}</p>
                </div>
              )}

              <div className="p-3 bg-agri-50 rounded-xl border border-agri-200 text-xs text-agri-950">
                <span className="font-bold text-agri-900">Prescribed Agronomic Solution:</span>
                <p className="mt-0.5 leading-relaxed">{adv.solution}</p>
              </div>

              {adv.preventiveMeasures && (
                <p className="text-[11px] text-slate-500 font-medium">
                  <strong>Preventive:</strong> {adv.preventiveMeasures}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
