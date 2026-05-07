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
import { Navigate } from 'react-router-dom';

// Dashboards — shared shell
import DashboardLayout from './pages/dashboard/DashboardLayout';
import WorkspaceHome from './pages/dashboard/WorkspaceHome';
import WorkspaceEvents from './pages/dashboard/WorkspaceEvents';
import DashboardHome from './pages/dashboard/DashboardHome';
import DashboardEvents from './pages/dashboard/DashboardEvents';
import DashboardTodos from './pages/dashboard/DashboardTodos';
import DashboardWishlist from './pages/dashboard/DashboardWishlist';
import DashboardGroupWishlist from './pages/dashboard/DashboardGroupWishlist';
import DashboardCollaborators from './pages/dashboard/DashboardCollaborators';
import DashboardSettings from './pages/dashboard/DashboardSettings';
import DashboardRSVP from './pages/dashboard/DashboardRSVP';
import DashboardEventWorkspace from './pages/dashboard/DashboardEventWorkspace';
import DashboardBudget from './pages/dashboard/DashboardBudget';
import WorkspaceBudget from './pages/dashboard/WorkspaceBudget';
import ProductsMarketplace from './pages/discover/ProductsMarketplace';

// Workspace-aware vendor page (personal → DashboardVendors, corporate → CorporateVendors)
import WorkspaceVendors from './pages/dashboard/WorkspaceVendors';

// Corporate pages (loaded lazily via unified /dashboard shell)
import CorporateApprovals from './pages/dashboard/corporate/CorporateApprovals';
import CorporateEmployees from './pages/dashboard/corporate/CorporateEmployees';
import CorporateRFQs from './pages/dashboard/corporate/CorporateRFQs';
import CorporateWallet from './pages/dashboard/corporate/CorporateWallet';
import CorporateAudit from './pages/dashboard/corporate/CorporateAudit';
import CorporateReports from './pages/dashboard/corporate/CorporateReports';
import CorporateIntegrations from './pages/dashboard/corporate/CorporateIntegrations';

// Features
import CreateEvent from './pages/events/CreateEvent';
import WalletPage from './pages/wallet/Wallet';
import CheckIn from './pages/checkin/CheckIn';
import WishlistCreator from './pages/wishlist/WishlistCreator';
import PublicWishlist from './pages/wishlist/PublicWishlist';
import RSVPAccept from './pages/rsvp/RSVPAccept';

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

        {/* Discover — primary spec paths */}
        <Route path="/discover" element={<Layout><DiscoverEvents /></Layout>} />
        <Route path="/discover/:id" element={<Layout><EventDetail /></Layout>} />
        {/* Legacy aliases (keep working) */}
        <Route path="/discover/events" element={<Layout><DiscoverEvents /></Layout>} />
        <Route path="/discover/events/:id" element={<Layout><EventDetail /></Layout>} />
        <Route path="/discover/products" element={<Layout><DiscoverProducts /></Layout>} />
        <Route path="/products" element={<Layout><ProductsMarketplace /></Layout>} />
        <Route path="/discover/products/:id" element={<Layout><ProductDetail /></Layout>} />
        <Route path="/discover/vendors" element={<Layout><DiscoverVendors /></Layout>} />
        <Route path="/discover/vendors/:id" element={<Layout><VendorDetail /></Layout>} />

        {/* Auth */}
        <Route path="/login" element={<Login type="personal" />} />
        <Route path="/business/login" element={<Login type="business" />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/business/signup" element={<Navigate to="/signup" replace />} />
        <Route path="/onboarding" element={<Navigate to="/signup" replace />} />

        {/* Unified dashboard shell — role-aware rendering */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          {/* Home — switches between CorporateHome / DashboardHome based on workspace */}
          <Route index element={<WorkspaceHome />} />

          {/* Events — switches between CorporateEvents / DashboardEvents */}
          <Route path="events" element={<WorkspaceEvents />} />
          <Route path="events/:id" element={<DashboardEventWorkspace />} />

          {/* Personal routes */}
          <Route path="todos" element={<DashboardTodos />} />
          <Route path="wishlist" element={<DashboardWishlist />} />
          <Route path="group-wishlist" element={<DashboardGroupWishlist />} />
          <Route path="rsvp" element={<DashboardRSVP />} />
          <Route path="collaborators" element={<DashboardCollaborators />} />
          <Route path="settings" element={<DashboardSettings />} />

          {/* Budget — switches between personal and corporate views */}
          <Route path="budget" element={<WorkspaceBudget />} />

          {/* Products marketplace inside dashboard */}
          <Route path="products" element={<ProductsMarketplace />} />

          {/* Corporate-only routes */}
          <Route path="approvals" element={<CorporateApprovals />} />
          <Route path="employees" element={<CorporateEmployees />} />
          <Route path="vendors" element={<WorkspaceVendors />} />
          <Route path="rfqs" element={<CorporateRFQs />} />
          <Route path="wallet" element={<CorporateWallet />} />
          <Route path="audit" element={<CorporateAudit />} />
          <Route path="reports" element={<CorporateReports />} />
          <Route path="integrations" element={<CorporateIntegrations />} />
        </Route>

        <Route path="/planner" element={<Navigate to="/dashboard" replace />} />
        <Route path="/corporate" element={<Navigate to="/dashboard" replace />} />

        {/* Events */}
        <Route path="/events/create" element={<Layout hideFooter><CreateEvent /></Layout>} />

        {/* Wallet */}
        <Route path="/wallet" element={<Layout hideFooter><WalletPage /></Layout>} />

        {/* Wishlist */}
        <Route path="/wishlist/create" element={<WishlistCreator />} />
        <Route path="/wish/:slug" element={<Layout hideFooter><PublicWishlist /></Layout>} />

        {/* RSVP accept (public, no nav) */}
        <Route path="/rsvp/:token" element={<RSVPAccept />} />

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
