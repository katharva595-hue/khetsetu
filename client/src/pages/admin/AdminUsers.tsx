import React, { useEffect, useState } from 'react';
import { Users, ShieldCheck, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';
import api from '../../services/api';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  const fetchUsers = () => {
    setIsLoading(true);
    api
      .get('/admin/users')
      .then((res) => setUsers(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleVerify = async (userId: string, currentVal: boolean) => {
    try {
      await api.put(`/admin/users/${userId}`, { isVerified: !currentVal });
      setActionSuccess(`User verification status toggled to ${!currentVal ? 'VERIFIED' : 'UNVERIFIED'}`);
      fetchUsers();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to update user');
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.put(`/admin/users/${userId}`, { status: nextStatus });
      setActionSuccess(`User status changed to ${nextStatus}`);
      fetchUsers();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to update user');
    }
  };

  const filteredUsers =
    roleFilter === 'ALL' ? users : users.filter((u) => u.role === roleFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-warm-border pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">User Account Administration</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage farmer and buyer permissions, grant KYC verification badges, or suspend accounts
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold">
          {['ALL', 'FARMER', 'BUYER', 'ADMIN'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg transition ${
                roleFilter === r ? 'bg-white text-agri-dark shadow-sm' : 'text-slate-600'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
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
          <p className="text-xs text-slate-500 mt-2">Loading user directory...</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-warm-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-warm-border text-slate-500 uppercase font-extrabold text-[10px] tracking-wider">
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Location / Org</th>
                  <th className="p-4">KYC Verified</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={u.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=User'}
                          alt={u.name}
                          className="w-8 h-8 rounded-full border border-slate-200 bg-white"
                        />
                        <div>
                          <p className="font-extrabold text-slate-900">{u.name}</p>
                          <p className="text-[11px] text-slate-400">
                            {u.email} • {u.phone}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                          u.role === 'FARMER'
                            ? 'bg-emerald-100 text-emerald-800'
                            : u.role === 'BUYER'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="p-4 text-slate-500">
                      {u.farmerProfile
                        ? `${u.farmerProfile.village}, ${u.farmerProfile.district}`
                        : u.buyerProfile
                        ? `${u.buyerProfile.companyName} (${u.buyerProfile.city})`
                        : 'System Administrator'}
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => handleToggleVerify(u.id, u.isVerified)}
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg transition ${
                          u.isVerified
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{u.isVerified ? 'Verified' : 'Unverified'}</span>
                      </button>
                    </td>

                    <td className="p-4">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleToggleStatus(u.id, u.status)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${
                            u.status === 'ACTIVE'
                              ? 'text-rose-700 bg-rose-50 hover:bg-rose-100'
                              : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                          }`}
                        >
                          {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
