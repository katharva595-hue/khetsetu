import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'FARMER' | 'BUYER' | 'ADMIN';
  isVerified: boolean;
  avatarUrl?: string;
  farmerProfile?: {
    id: string;
    village: string;
    district: string;
    state: string;
    pincode: string;
    farmAreaAcres: number;
    experienceYears: number;
    soilType: string;
    primaryCrops: string;
    verifiedBadge: boolean;
    locations?: Array<{
      id: string;
      label: string;
      latitude: number;
      longitude: number;
      address: string;
    }>;
  };
  buyerProfile?: {
    id: string;
    companyName: string;
    businessType: string;
    gstin?: string;
    city: string;
    district: string;
    state: string;
    pincode: string;
    verifiedBadge: boolean;
  };
  unreadNotifications?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isFarmer: boolean;
  isBuyer: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('khetsetu_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('khetsetu_token');
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('khetsetu_token', newToken);
    localStorage.setItem('khetsetu_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('khetsetu_token');
    localStorage.removeItem('khetsetu_user');
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const res = await api.get('/auth/me');
      if (res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem('khetsetu_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error('Failed to refresh user profile', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      refreshUser();
    }
  }, [token]);

  const isFarmer = user?.role === 'FARMER';
  const isBuyer = user?.role === 'BUYER';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        refreshUser,
        isFarmer,
        isBuyer,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
