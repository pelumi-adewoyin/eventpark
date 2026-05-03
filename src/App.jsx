import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import KYCModal from './components/modals/KYCModal';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public pages
import Landing from './pages/Landing';
import DiscoverEvents from './pages/discover/Events';
import EventDetail from './pages/discover/EventDetail';
import DiscoverProducts from './pages/discover/Products';
import ProductDetail from './pages/discover/ProductDetail';
import DiscoverVendors from './pages/discover/Vendors';
import VendorDetail from './pages/discover/VendorDetail';
import VendorPortal from './pages/VendorPortal';

// Auth
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Onboarding from './pages/auth/Onboarding';

// Dashboards
import DIYDashboard from './pages/dashboard/DIYDashboard';
import PlannerDashboard from './pages/dashboard/PlannerDashboard';
import CorporateDashboard from './pages/dashboard/CorporateDashboard';

// Features
import CreateEvent from './pages/events/CreateEvent';
import WalletPage from './pages/wallet/Wallet';
import CheckIn from './pages/checkin/CheckIn';

function Layout({ children, hideFooter = false, hideNav = false }) {
  return (
    <>
      {!hideNav && <Navbar />}
      <main>{children}</main>
      {!hideFooter && <Footer />}
    </>
  );
}

function AppContent() {
  return (
    <>
      <KYCModal />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#1f2937',
            color: '#f9fafb',
            borderRadius: '14px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '500',
            border: '1px solid rgba(255,255,255,0.08)',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#f9fafb' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#f9fafb' } },
        }}
      />
      <Routes>
        {/* Public marketing */}
        <Route path="/" element={<Layout><Landing /></Layout>} />
        <Route path="/vendor-portal" element={<Layout><VendorPortal /></Layout>} />

        {/* Discover */}
        <Route path="/discover/events" element={<Layout><DiscoverEvents /></Layout>} />
        <Route path="/discover/events/:id" element={<Layout><EventDetail /></Layout>} />
        <Route path="/discover/products" element={<Layout><DiscoverProducts /></Layout>} />
        <Route path="/discover/products/:id" element={<Layout><ProductDetail /></Layout>} />
        <Route path="/discover/vendors" element={<Layout><DiscoverVendors /></Layout>} />
        <Route path="/discover/vendors/:id" element={<Layout><VendorDetail /></Layout>} />

        {/* Auth */}
        <Route path="/login" element={<Login type="personal" />} />
        <Route path="/signup" element={<Signup type="personal" />} />
        <Route path="/business/login" element={<Login type="business" />} />
        <Route path="/business/signup" element={<Signup type="business" />} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* Dashboards — no top nav, have their own sidebar */}
        <Route path="/dashboard" element={<DIYDashboard />} />
        <Route path="/planner" element={<PlannerDashboard />} />
        <Route path="/corporate" element={<CorporateDashboard />} />

        {/* Events */}
        <Route path="/events/create" element={<Layout hideFooter><CreateEvent /></Layout>} />

        {/* Wallet */}
        <Route path="/wallet" element={<Layout hideFooter><WalletPage /></Layout>} />

        {/* Day-of check-in */}
        <Route path="/checkin/:id" element={<CheckIn />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}
