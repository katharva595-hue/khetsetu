import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, PackagePlus, ArrowRight, Image as ImageIcon, MapPin, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

export const AddProducePage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);

  const [cropName, setCropName] = useState('Wheat');
  const [categoryId, setCategoryId] = useState('');
  const [variety, setVariety] = useState('Sharbati Golden (C-306)');
  const [description, setDescription] = useState(
    'Prime export grade Sharbati wheat, zero pesticide residue on maturity, moisture under 10%.'
  );
  const [quantity, setQuantity] = useState('500');
  const [unit, setUnit] = useState('kg');
  const [pricePerKg, setPricePerKg] = useState('28');
  const [qualityGrade, setQualityGrade] = useState('GRADE_A');
  const [deliveryRadiusKm, setDeliveryRadiusKm] = useState('60');
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80'
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api
      .get('/listings/categories')
      .then((res) => {
        setCategories(res.data || []);
        if (res.data?.length > 0) {
          setCategoryId(res.data[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.post('/listings', {
        cropName,
        categoryId,
        variety,
        description,
        quantity: Number(quantity),
        unit,
        pricePerKg: Number(pricePerKg),
        qualityGrade,
        deliveryRadiusKm: Number(deliveryRadiusKm),
        imageUrls: [imageUrl],
      });

      setSuccess('Produce lot listed successfully in the live marketplace!');
      setTimeout(() => {
        navigate('/farmer/listings');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="border-b border-warm-border pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900">Add New Agricultural Produce</h1>
        <p className="text-xs text-slate-500 mt-1">
          Publish your lot to verified institutional buyers, food processors, and wholesalers
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-warm-border shadow-sm space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Crop Name</label>
            <input
              type="text"
              required
              value={cropName}
              onChange={(e) => setCropName(e.target.value)}
              placeholder="e.g. Wheat, Soybean, Onion"
              className="w-full text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-agri-leaf"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Crop Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-200 bg-white"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Variety / Cultivar</label>
            <input
              type="text"
              value={variety}
              onChange={(e) => setVariety(e.target.value)}
              placeholder="e.g. Sharbati Supreme, JS-9560"
              className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-agri-leaf"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Quality Grade</label>
            <select
              value={qualityGrade}
              onChange={(e) => setQualityGrade(e.target.value)}
              className="w-full text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-200 bg-white"
            >
              <option value="GRADE_A">Grade A (Prime / Export Quality)</option>
              <option value="GRADE_B">Grade B (Standard Market Quality)</option>
              <option value="GRADE_C">Grade C (Industrial / Processing)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Quantity</label>
            <input
              type="number"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="10"
              className="w-full text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-agri-leaf"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Unit</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-200 bg-white"
            >
              <option value="kg">kg (Kilogram)</option>
              <option value="quintal">quintal (100 kg)</option>
              <option value="ton">ton (1,000 kg)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Expected Price (₹/kg)</label>
            <input
              type="number"
              required
              value={pricePerKg}
              onChange={(e) => setPricePerKg(e.target.value)}
              min="1"
              step="0.5"
              className="w-full text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-agri-leaf"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Produce Description & Quality Highlights</label>
          <textarea
            rows={3}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe harvest method, moisture content, thresher sortex cleaning, organic practices..."
            className="w-full text-xs font-medium px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-agri-leaf"
          ></textarea>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Radius (km)</label>
            <input
              type="number"
              value={deliveryRadiusKm}
              onChange={(e) => setDeliveryRadiusKm(e.target.value)}
              min="10"
              max="300"
              className="w-full text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Produce Photo URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200"
            />
          </div>
        </div>

        {imageUrl && (
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <img src={imageUrl} alt="Preview" className="w-16 h-16 rounded-xl object-cover" />
            <div className="text-xs text-slate-600">
              <p className="font-bold text-slate-800">Image Preview Loaded</p>
              <p className="text-[11px] text-slate-400">High-resolution verified crop photo</p>
            </div>
          </div>
        )}

        <div className="pt-2 flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/farmer/listings')}
            className="w-1/3 py-3 rounded-2xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="w-2/3 py-3 rounded-2xl text-xs font-extrabold text-white bg-agri-dark hover:bg-agri-forest shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <PackagePlus className="w-4 h-4 text-amber-300" />
            <span>{isLoading ? 'Publishing Lot...' : 'Publish Produce Lot'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
