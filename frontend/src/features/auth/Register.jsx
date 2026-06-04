import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from './authSlice';
import { Loader2, Store, User, ArrowRight } from 'lucide-react';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated, loading, error, user } = useSelector((state) => state.auth);

  // Read role from query param to preselect if available
  const queryParams = new URLSearchParams(location.search);
  const initialRole = queryParams.get('role') || 'customer';

  const [role, setRole] = useState(initialRole);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    storeName: '',
    storeDescription: '',
  });

  const { name, email, password, storeName, storeDescription } = formData;

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'vendor') navigate('/vendor');
      else navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    dispatch(clearError());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    
    const payload = {
      name,
      email,
      password,
      role,
      ...(role === 'vendor' && { storeName, storeDescription }),
    };

    dispatch(register(payload));
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 160px)',
        padding: '60px 0',
      }}
    >
      <div className="glass-card animate-fade" style={{ width: '100%', maxWidth: '520px', padding: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: 8, fontFamily: 'var(--font-heading)' }}>
            Create Account
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Choose your account role and fill in details
          </p>
        </div>

        {/* Role Toggle Selector */}
        <div
          style={{
            display: 'flex',
            background: 'var(--input-bg)',
            border: '1px solid var(--panel-border)',
            borderRadius: 'var(--radius-sm)',
            padding: 4,
            marginBottom: 24,
            gap: 4,
          }}
        >
          <button
            type="button"
            onClick={() => handleRoleSelect('customer')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '10px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              color: role === 'customer' ? 'var(--primary)' : 'var(--text-secondary)',
              background: role === 'customer' ? 'var(--panel-bg)' : 'transparent',
              boxShadow: role === 'customer' ? 'var(--shadow)' : 'none',
              transition: 'var(--transition)',
            }}
          >
            <User size={16} />
            <span>Buyer</span>
          </button>
          
          <button
            type="button"
            onClick={() => handleRoleSelect('vendor')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '10px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              color: role === 'vendor' ? 'var(--primary)' : 'var(--text-secondary)',
              background: role === 'vendor' ? 'var(--panel-bg)' : 'transparent',
              boxShadow: role === 'vendor' ? 'var(--shadow)' : 'none',
              transition: 'var(--transition)',
            }}
          >
            <Store size={16} />
            <span>Merchant (SaaS)</span>
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '12px',
              background: 'var(--danger-light)',
              color: 'var(--danger)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              marginBottom: 20,
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* User Fields */}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={handleChange}
              placeholder="John Doe"
              className="form-control"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder="john@example.com"
              className="form-control"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group" style={{ marginBottom: role === 'vendor' ? 20 : 28 }}>
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              className="form-control"
              required
              disabled={loading}
            />
          </div>

          {/* Vendor Specific Store Setup */}
          {role === 'vendor' && (
            <div
              className="animate-fade"
              style={{
                borderTop: '1px solid var(--divider)',
                paddingTop: 20,
                marginTop: 20,
                marginBottom: 28,
              }}
            >
              <h3 style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: 16, fontWeight: 600 }}>
                Storefront Setup
              </h3>
              
              <div className="form-group">
                <label className="form-label">Storefront Name</label>
                <input
                  type="text"
                  name="storeName"
                  value={storeName}
                  onChange={handleChange}
                  placeholder="e.g. Aura Electronics"
                  className="form-control"
                  required={role === 'vendor'}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Brief Description</label>
                <textarea
                  name="storeDescription"
                  value={storeDescription}
                  onChange={handleChange}
                  placeholder="Tell customers about your storefront catalog..."
                  className="form-control"
                  rows={3}
                  disabled={loading}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  background: 'var(--input-bg)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px dashed var(--panel-border)',
                }}
              >
                💡 After signing up, your store will enter a "Pending Approval" queue. A Super Admin will verify and activate your store.
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: 14 }} disabled={loading}>
            {loading ? (
              <Loader2 className="spinner" style={{ animation: 'spin 1s infinite linear' }} size={18} />
            ) : (
              <>
                <span>Sign Up & Launch</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
