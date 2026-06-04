import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMe } from './features/auth/authSlice';
import { Loader2 } from 'lucide-react';

// Common Components
import Navbar from './components/Navbar';
import Cart from './features/cart/Cart';

// Pages & Screens
import Home from './pages/Home';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import StoreFront from './features/store/StoreFront';
import ProductDetail from './features/product/ProductDetail';
import Checkout from './features/cart/Checkout';
import VendorDashboard from './features/vendor/VendorDashboard';
import AdminDashboard from './features/admin/AdminDashboard';
import OrderHistory from './features/order/OrderHistory';

// Protected Route wrapper component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Loader2 className="spinner" size={48} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Main App Router context wrapper
const AppContent = () => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  // Store metadata context state loaded dynamically inside StoreFront
  const [activeStoreName, setActiveStoreName] = useState('');
  const [activeStoreSlug, setActiveStoreSlug] = useState('');
  const [activeStoreId, setActiveStoreId] = useState('');

  // Cart Drawer open/close state
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    // Attempt profile retrieval on page load if token is available
    if (localStorage.getItem('token')) {
      dispatch(getMe());
    }
  }, [dispatch]);

  const handleStoreLoad = (name, slug, id) => {
    setActiveStoreName(name);
    setActiveStoreSlug(slug);
    setActiveStoreId(id);
  };

  const handleCartToggle = () => {
    setIsCartOpen(!isCartOpen);
  };

  return (
    <div className="app-container">
      {/* Dynamic Header */}
      <Navbar
        onCartToggle={handleCartToggle}
        storeName={activeStoreName}
        storeSlug={activeStoreSlug}
      />

      {/* Cart Drawer overlay */}
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Primary Routes Mapping */}
      <main className="main-content container">
        <Routes>
          {/* Public Platform portal routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Tenant E-Commerce customer routes */}
          <Route
            path="/store/:storeSlug"
            element={<StoreFront onStoreLoad={handleStoreLoad} />}
          />
          <Route
            path="/store/:storeSlug/product/:productId"
            element={<ProductDetail />}
          />
          <Route
            path="/store/:storeSlug/checkout"
            element={<Checkout />}
          />

          {/* Secure role-based client areas */}
          <Route
            path="/vendor"
            element={
              <ProtectedRoute allowedRoles={['vendor']}>
                <VendorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/history"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <OrderHistory />
              </ProtectedRoute>
            }
          />

          {/* Catch-all 404 handler redirection */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Visual styling footer */}
      <footer className="footer-container">
        <div className="container">
          <p>© 2026 RED_x SaaS Ecosystem. Designed and engineered for scaling digital commerce.</p>
        </div>
      </footer>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
