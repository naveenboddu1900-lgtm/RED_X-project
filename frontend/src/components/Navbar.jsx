import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { ShoppingCart, LogOut, User, Store, LayoutDashboard, Sun, Moon, LogIn } from 'lucide-react';
import { selectCartItemsCount } from '../features/cart/cartSlice';

const Navbar = ({ onCartToggle, storeName, storeSlug }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const cartItemsCount = useSelector(selectCartItemsCount);
  
  // Theme state
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const isStoreFront = location.pathname.startsWith('/store/');

  return (
    <nav className="navbar-container">
      <div className="container navbar-content">
        {/* Brand Name */}
        <Link to="/" className="nav-brand">
          <Store size={24} style={{ color: 'var(--primary)' }} />
          <span>{isStoreFront && storeName ? storeName : 'RED_x SaaS'}</span>
        </Link>

        {/* Action Controls */}
        <div className="nav-links">
          {isStoreFront && (
            <Link to={`/store/${storeSlug}`} className={`nav-link ${location.pathname === `/store/${storeSlug}` ? 'active' : ''}`}>
              Products
            </Link>
          )}

          {/* Theme Switcher */}
          <button onClick={toggleTheme} className="nav-link" aria-label="Toggle Theme" style={{ display: 'flex', alignItems: 'center' }}>
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* User Specific Links */}
          {user ? (
            <>
              {/* Go to Dashboard based on Role */}
              {user.role === 'admin' && (
                <Link to="/admin" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <LayoutDashboard size={18} />
                  <span>Admin Panel</span>
                </Link>
              )}
              {user.role === 'vendor' && (
                <Link to="/vendor" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </Link>
              )}
              {user.role === 'customer' && (
                <Link to="/orders/history" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <User size={18} />
                  <span>My Orders</span>
                </Link>
              )}

              {/* Logged User Indicator */}
              <span className="nav-link" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Hi, {user.name} ({user.role})
              </span>

              {/* Log Out */}
              <button onClick={handleLogout} className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-secondary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <LogIn size={18} />
              <span>Login / Signup</span>
            </Link>
          )}

          {/* Shopping Cart Trigger */}
          {isStoreFront && (
            <button
              onClick={onCartToggle}
              className="btn btn-primary"
              style={{
                position: 'relative',
                padding: '10px 18px',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <ShoppingCart size={18} />
              <span>Cart</span>
              {cartItemsCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    background: 'var(--secondary)',
                    color: 'white',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                  }}
                >
                  {cartItemsCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
