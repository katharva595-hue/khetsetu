import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  Filter,
  MapPin,
  ShieldCheck,
  Tag,
  ArrowUpDown,
  Sparkles,
  MessageSquare,
  BadgeDollarSign,
  X,
  CheckCircle,
} from 'lucide-react';
import api from '../../services/api';

export const MarketplacePage: React.FC = () => {
  const { user, isBuyer } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedGrade, setSelectedGrade] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);

  // Modal for placing bid
  const [selectedListing, setSelectedListing] = useState<any | null>(null);
  const [bidPrice, setBidPrice] = useState('');
  const [bidQty, setBidQty] = useState('');
  const [bidMessage, setBidMessage] = useState('');
  const [bidSuccess, setBidSuccess] = useState('');
  const [bidError, setBidError] = useState('');
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);

  useEffect(() => {
    // Fetch categories
    api
      .get('/listings/categories')
      .then((res) => setCategories(res.data))
      .catch(() => {});
  }, []);

  const fetchListings = () => {
    setIsLoading(true);
    const params: any = {};
    if (selectedCategory !== 'ALL') params.category = selectedCategory;
    if (selectedGrade !== 'ALL') params.grade = selectedGrade;
    if (searchQuery.trim()) params.search = searchQuery.trim();
    if (sortBy) params.sortBy = sortBy;

    api
      .get('/listings', { params })
      .then((res) => setListings(res.data))
      .catch((err) => console.error('Failed to fetch listings', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchListings();
  }, [selectedCategory, selectedGrade, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchListings();
  };

  const openBidModal = (listing: any) => {
    setSelectedListing(listing);
    setBidPrice(String(listing.pricePerKg));
    setBidQty(String(Math.min(100, listing.quantity)));
    setBidMessage('');
    setBidSuccess('');
    setBidError('');
  };

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setBidError('Please sign in as a buyer to place a bid');
      return;
    }

    setBidError('');
    setIsSubmittingBid(true);

    try {
      await api.post('/bids', {
        listingId: selectedListing.id,
        offeredPrice: Number(bidPrice),
        quantity: Number(bidQty),
        message: bidMessage,
      });

      setBidSuccess(`Bid placed successfully for ${bidQty} kg at ₹${bidPrice}/kg! The farmer has been notified.`);
      setTimeout(() => {
        setSelectedListing(null);
      }, 2000);
    } catch (err: any) {
      setBidError(err.response?.data?.message || 'Failed to place bid');
    } finally {
      setIsSubmittingBid(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-warm-border pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-agri-700 bg-agri-50 px-2.5 py-1 rounded-full border border-agri-200">
            Real Agricultural Lots
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-2">Verified Produce Marketplace</h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse and negotiate directly with verified farmers across regional agricultural belts
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search wheat, soybean, onion, variety..."
              className="w-full text-xs font-semibold pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-agri-leaf"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-agri-dark hover:bg-agri-forest transition"
          >
            Search
          </button>
        </form>
      </div>

      {/* Filter and Sorting Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-warm-border shadow-sm">
        {/* Categories Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              selectedCategory === 'ALL'
                ? 'bg-agri-dark text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Crops
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedCategory === cat.slug
                  ? 'bg-agri-dark text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Quality & Sort Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <span>Grade:</span>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none"
            >
              <option value="ALL">All Grades</option>
              <option value="GRADE_A">Grade A (Premium)</option>
              <option value="GRADE_B">Grade B (Standard)</option>
              <option value="GRADE_C">Grade C (Industrial)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none"
            >
              <option value="newest">Newest Listed</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Produce Listings Grid */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-4 border-agri-dark border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 mt-2 font-medium">Loading verified agricultural listings...</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-warm-border p-8">
          <p className="text-sm font-bold text-slate-800">No produce listings found matching your criteria</p>
          <p className="text-xs text-slate-500 mt-1">Try clearing filters or search query</p>
          <button
            onClick={() => {
              setSelectedCategory('ALL');
              setSelectedGrade('ALL');
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-agri-dark text-white"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-warm-border overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                {/* Image & Quality Grade Badge */}
                <div className="relative h-44 overflow-hidden bg-slate-100">
                  <img
                    src={
                      item.images?.[0]?.imageUrl ||
                      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80'
                    }
                    alt={item.cropName}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md shadow-sm ${
                        item.qualityGrade === 'GRADE_A'
                          ? 'bg-emerald-600 text-white'
                          : item.qualityGrade === 'GRADE_B'
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-600 text-white'
                      }`}
                    >
                      {item.qualityGrade.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[11px] font-bold">
                    Stock: {item.quantity} {item.unit}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 group-hover:text-agri-dark transition">
                        {item.cropName}
                      </h3>
                      {item.variety && (
                        <p className="text-[11px] font-semibold text-agri-700">{item.variety}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-slate-900">₹{item.pricePerKg}</span>
                      <span className="text-[11px] text-slate-500 font-semibold">/{item.unit}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Location & Farmer */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 truncate max-w-[170px]">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {item.farmer?.location || 'Indore District, MP'}
                    </span>
                    {item.farmer?.isVerified && (
                      <span className="inline-flex items-center gap-0.5 text-emerald-700 font-bold shrink-0">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-0">
                <button
                  onClick={() => openBidModal(item)}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-agri-dark bg-agri-100 hover:bg-agri-200 transition flex items-center justify-center gap-1.5 border border-agri-300/60"
                >
                  <BadgeDollarSign className="w-4 h-4 text-agri-700" />
                  <span>Place Bid / Negotiate</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Place Bid Modal */}
      {selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-warm-border relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setSelectedListing(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-agri-dark text-white flex items-center justify-center font-bold">
                <BadgeDollarSign className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Submit Bid / Counter Offer</h3>
                <p className="text-xs text-slate-500">
                  {selectedListing.cropName} ({selectedListing.variety || 'Standard'})
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1 mb-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Farmer Expected Price:</span>
                <span className="font-bold text-slate-900">₹{selectedListing.pricePerKg}/kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Available Quantity:</span>
                <span className="font-bold text-slate-900">{selectedListing.quantity} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Location:</span>
                <span className="font-semibold text-slate-700">{selectedListing.farmer?.location}</span>
              </div>
            </div>

            {bidError && (
              <div className="mb-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                {bidError}
              </div>
            )}

            {bidSuccess && (
              <div className="mb-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{bidSuccess}</span>
              </div>
            )}

            <form onSubmit={handlePlaceBid} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Offered Price (₹/kg)</label>
                  <input
                    type="number"
                    required
                    value={bidPrice}
                    onChange={(e) => setBidPrice(e.target.value)}
                    min="1"
                    step="0.5"
                    className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-agri-leaf"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quantity Needed (kg)</label>
                  <input
                    type="number"
                    required
                    value={bidQty}
                    onChange={(e) => setBidQty(e.target.value)}
                    min="1"
                    max={selectedListing.quantity}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-agri-leaf"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Message to Farmer (Optional)</label>
                <textarea
                  rows={2}
                  value={bidMessage}
                  onChange={(e) => setBidMessage(e.target.value)}
                  placeholder="e.g. Can take entire lot if delivered within 48 hours to Indore mill."
                  className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-agri-leaf"
                ></textarea>
              </div>

              <div className="p-2.5 rounded-lg bg-agri-50 border border-agri-200 text-[11px] text-agri-900 flex justify-between font-bold">
                <span>Total Offer Value:</span>
                <span>₹{(Number(bidPrice || 0) * Number(bidQty || 0)).toLocaleString()}</span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedListing(null)}
                  className="w-1/3 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBid}
                  className="w-2/3 py-2.5 rounded-xl text-xs font-bold text-white bg-agri-dark hover:bg-agri-forest shadow-md transition disabled:opacity-50"
                >
                  {isSubmittingBid ? 'Submitting Bid...' : 'Submit Bid to Farmer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
