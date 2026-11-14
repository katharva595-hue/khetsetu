import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout & Components
import { Navbar } from './components/Navbar';
import { DashboardLayout } from './components/DashboardLayout';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { AboutPage } from './pages/public/AboutPage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';
import { MarketplacePage } from './pages/public/MarketplacePage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { MandiPage } from './pages/shared/MandiPage';
import { WeatherPage } from './pages/shared/WeatherPage';
import { MessagesPage } from './pages/shared/MessagesPage';

// Farmer Pages
import { FarmerOverview } from './pages/farmer/FarmerOverview';
import { FarmerListings } from './pages/farmer/FarmerListings';
import { AddProducePage } from './pages/farmer/AddProducePage';
import { FarmerBuyerRequirements } from './pages/farmer/FarmerBuyerRequirements';
import { FarmerBids } from './pages/farmer/FarmerBids';
import { FarmerOrders } from './pages/farmer/FarmerOrders';
import { FarmerAdvisory } from './pages/farmer/FarmerAdvisory';
import { FarmerProfile } from './pages/farmer/FarmerProfile';

// Buyer Pages
import { BuyerOverview } from './pages/buyer/BuyerOverview';
import { IntelligentProcurementPage } from './pages/buyer/IntelligentProcurementPage';
import { BuyerProcurementPlans } from './pages/buyer/BuyerProcurementPlans';
import { BuyerBids } from './pages/buyer/BuyerBids';
import { BuyerOrders } from './pages/buyer/BuyerOrders';
import { BuyerProfile } from './pages/buyer/BuyerProfile';

// Admin Pages
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminVerifications } from './pages/admin/AdminVerifications';
import { AdminDisputes } from './pages/admin/AdminDisputes';

// Protected Route Guard
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: string[];
}> = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'FARMER') return <Navigate to="/farmer" replace />;
    if (user.role === 'BUYER') return <Navigate to="/buyer" replace />;
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    return <Navigate to="/marketplace" replace />;
  }

  return <>{children}</>;
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Layout with Standard Navbar */}
          <Route
            path="/"
            element={
              <div className="min-h-screen bg-warm-bg flex flex-col">
                <Navbar />
                <main className="flex-1">
                  <LandingPage />
                </main>
              </div>
            }
          />
          <Route
            path="/about"
            element={
              <div className="min-h-screen bg-warm-bg flex flex-col">
                <Navbar />
                <main className="flex-1">
                  <AboutPage />
                </main>
              </div>
            }
          />
          <Route
            path="/how-it-works"
            element={
              <div className="min-h-screen bg-warm-bg flex flex-col">
                <Navbar />
                <main className="flex-1">
                  <HowItWorksPage />
                </main>
              </div>
            }
          />
          <Route
            path="/marketplace"
            element={
              <div className="min-h-screen bg-warm-bg flex flex-col">
                <Navbar />
                <main className="flex-1">
                  <MarketplacePage />
                </main>
              </div>
            }
          />
          <Route
            path="/mandi"
            element={
              <div className="min-h-screen bg-warm-bg flex flex-col">
                <Navbar />
                <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                  <MandiPage />
                </main>
              </div>
            }
          />
          <Route
            path="/weather"
            element={
              <div className="min-h-screen bg-warm-bg flex flex-col">
                <Navbar />
                <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                  <WeatherPage />
                </main>
              </div>
            }
          />
          <Route
            path="/login"
            element={
              <div className="min-h-screen bg-warm-bg flex flex-col">
                <Navbar />
                <main className="flex-1">
                  <LoginPage />
                </main>
              </div>
            }
          />
          <Route
            path="/register"
            element={
              <div className="min-h-screen bg-warm-bg flex flex-col">
                <Navbar />
                <main className="flex-1">
                  <RegisterPage />
                </main>
              </div>
            }
          />

          {/* Farmer Portal (Nested in DashboardLayout) */}
          <Route
            path="/farmer"
            element={
              <ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<FarmerOverview />} />
            <Route path="listings" element={<FarmerListings />} />
            <Route path="add-produce" element={<AddProducePage />} />
            <Route path="buyer-requirements" element={<FarmerBuyerRequirements />} />
            <Route path="bids" element={<FarmerBids />} />
            <Route path="orders" element={<FarmerOrders />} />
            <Route path="weather" element={<WeatherPage />} />
            <Route path="mandi" element={<MandiPage />} />
            <Route path="advisory" element={<FarmerAdvisory />} />
            <Route path="profile" element={<FarmerProfile />} />
          </Route>

          {/* Buyer Portal (Nested in DashboardLayout) */}
          <Route
            path="/buyer"
            element={
              <ProtectedRoute allowedRoles={['BUYER', 'ADMIN']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<BuyerOverview />} />
            <Route path="marketplace" element={<MarketplacePage />} />
            <Route path="procurement" element={<IntelligentProcurementPage />} />
            <Route path="procurement-plans" element={<BuyerProcurementPlans />} />
            <Route path="bids" element={<BuyerBids />} />
            <Route path="orders" element={<BuyerOrders />} />
            <Route path="mandi" element={<MandiPage />} />
            <Route path="profile" element={<BuyerProfile />} />
          </Route>

          {/* Admin Console (Nested in DashboardLayout) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminOverview />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="verifications" element={<AdminVerifications />} />
            <Route path="listings" element={<MarketplacePage />} />
            <Route path="bids" element={<FarmerBids />} />
            <Route path="orders" element={<BuyerOrders />} />
            <Route path="disputes" element={<AdminDisputes />} />
            <Route path="mandi" element={<MandiPage />} />
            <Route path="advisory" element={<FarmerAdvisory />} />
          </Route>

          {/* Shared Real-Time Messages */}
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<MessagesPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
