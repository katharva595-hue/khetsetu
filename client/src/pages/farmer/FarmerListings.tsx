import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Boxes,
  PackagePlus,
  Trash2,
  Edit3,
  Eye,
  BadgeDollarSign,
  MapPin,
  CheckCircle2,
  X,
} from 'lucide-react';
import api from '../../services/api';

export const FarmerListings: React.FC = () => {
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Edit modal
  const [editListing, setEditListing] = useState<any | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editQty, setEditQty] = useState('');
  const [editStatus, setEditStatus] = useState('ACTIVE');

  const fetchListings = () => {
    setIsLoading(true);
    api
      .get('/listings/farmer/my')
      .then((res) => setListings(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/listings/${id}`);
      setActionSuccess('Produce listing deleted successfully');
      setDeleteId(null);
      fetchListings();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to delete listing');
    }
  };

  const openEditModal = (item: any) => {
    setEditListing(item);
    setEditPrice(String(item.pricePerKg));
    setEditQty(String(item.quantity));
    setEditStatus(item.status);
  };

  const handleUpdateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editListing) return;

    try {
      await api.put(`/listings/${editListing.id}`, {
        pricePerKg: Number(editPrice),
        quantity: Number(editQty),
        status: editStatus,
      });

      setActionSuccess('Produce lot updated successfully');
      setEditListing(null);
      fetchListings();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to update listing');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-warm-border pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">My Produce Listings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your crop lots, available quantities, expected prices, and view buyer inquiries
          </p>
        </div>

        <Link
          to="/farmer/add-produce"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-agri-dark hover:bg-agri-forest shadow-sm transition"
        >
          <PackagePlus className="w-4 h-4 text-amber-300" />
          <span>Add New Produce</span>
        </Link>
      </div>

      {actionSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
          {actionError}
        </div>
      )}

      {isLoading ? (
        <div className="py-16 text-center">
          <div className="inline-block w-8 h-8 border-4 border-agri-dark border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 mt-2">Loading your listings...</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-warm-border p-12 text-center space-y-3">
          <Boxes className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Produce Listed Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            List your freshly harvested or standing crops to receive direct bulk procurement offers.
          </p>
          <Link
            to="/farmer/add-produce"
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-agri-dark"
          >
            Create First Produce Listing
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-warm-border overflow-hidden shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 bg-slate-100">
                  <img
                    src={
                      item.images?.[0]?.imageUrl ||
                      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80'
                    }
                    alt={item.cropName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-black/60 text-white backdrop-blur-sm">
                      {item.qualityGrade.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 bg-agri-dark text-white px-2 py-0.5 rounded text-[11px] font-bold">
                    Stock: {item.quantity} {item.unit}
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900">{item.cropName}</h3>
                      <p className="text-[11px] font-bold text-agri-700">{item.variety || 'Standard Variety'}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-slate-900">₹{item.pricePerKg}</span>
                      <span className="text-xs text-slate-500 font-semibold">/{item.unit}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">{item.description}</p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-slate-400" /> {item.viewsCount} Views
                    </span>
                    <span className="flex items-center gap-1 font-bold text-amber-700">
                      <BadgeDollarSign className="w-3.5 h-3.5" /> {item.bids?.length || 0} Bids
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="p-4 pt-0 flex gap-2">
                <button
                  onClick={() => openEditModal(item)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition flex items-center justify-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setDeleteId(item.id)}
                  className="p-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Listing Modal */}
      {editListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-warm-border space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900">Edit {editListing.cropName}</h3>
              <button onClick={() => setEditListing(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateListing} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Expected Price (₹/kg)</label>
                <input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  step="0.5"
                  className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Available Quantity (kg)</label>
                <input
                  type="number"
                  value={editQty}
                  onChange={(e) => setEditQty(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Listing Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="ACTIVE">ACTIVE (Visible in Marketplace)</option>
                  <option value="SOLD_OUT">SOLD OUT</option>
                  <option value="DRAFT">DRAFT</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditListing(null)}
                  className="w-1/3 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2 rounded-xl text-xs font-bold text-white bg-agri-dark hover:bg-agri-forest shadow transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-warm-border space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">Confirm Deletion</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete this produce listing? This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteId(null)}
                className="w-1/2 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="w-1/2 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
