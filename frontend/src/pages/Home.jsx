import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Store, ArrowRight, ShieldCheck, DollarSign, BarChart3, Loader2 } from 'lucide-react';
import api from '../services/api';

const Home = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await api('/stores');
        setStores(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, []);

  return (
    <div className="animate-fade" style={{ padding: '60px 0' }}>
      {/* Hero Banner Area */}
      <section style={{ textAlign: 'center', marginBottom: 80 }}>
        <h1
          style={{
            fontSize: '3.5rem',
            fontWeight: 800,
            marginBottom: 20,
            lineHeight: 1.1,
            background: 'linear-gradient(to right, #ffffff, #fb7185, #ef4444)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontFamily: 'var(--font-heading)',
          }}
        >
          Launch the RED_x Commerce Network
        </h1>
        <p
          style={{
            fontSize: '1.25rem',
            color: 'var(--text-secondary)',
            maxWidth: '650px',
            margin: '0 auto 40px auto',
            lineHeight: 1.6,
          }}
        >
          A high-performance Multi-Tenant E-Commerce SaaS. Launch your independent RED_x storefront, manage inventory, process secure checkouts, and unlock data analytics.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
          <Link to="/register?role=vendor" className="btn btn-primary" style={{ padding: '14px 28px' }}>
            <span>Create Storefront</span>
            <ArrowRight size={18} />
          </Link>
          <a href="#storefronts" className="btn btn-secondary" style={{ padding: '14px 28px' }}>
            <span>Explore Stores</span>
          </a>
        </div>
      </section>

      {/* Feature Pillar Highlights */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 24,
          marginBottom: 80,
        }}
        className="grid-3"
      >
        <div className="glass-card" style={{ textAlign: 'center', padding: '40px 24px' }}>
          <div style={{ display: 'inline-flex', padding: 16, borderRadius: '50%', background: 'rgba(248, 113, 113, 0.15)', color: 'var(--primary)', marginBottom: 20 }}>
            <ShieldCheck size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: 10 }}>Multi-Tenant Isolation</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Each merchant operates in an isolated tenant environment with distinct products, assets, order queues, and customer data.
          </p>
        </div>

        <div className="glass-card" style={{ textAlign: 'center', padding: '40px 24px' }}>
          <div style={{ display: 'inline-flex', padding: 16, borderRadius: '50%', background: 'rgba(251, 146, 60, 0.15)', color: 'var(--secondary)', marginBottom: 20 }}>
            <DollarSign size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: 10 }}>Seamless Checkouts</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Stripe API integrations process checkout payments securely, with direct fallbacks to a localized payment sandbox.
          </p>
        </div>

        <div className="glass-card" style={{ textAlign: 'center', padding: '40px 24px' }}>
          <div style={{ display: 'inline-flex', padding: 16, borderRadius: '50%', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--info)', marginBottom: 20 }}>
            <BarChart3 size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: 10 }}>Deep Sales Insights</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Interactive charts visualize monthly sales, average ticket order amounts, categories breakdown, and leaderboards.
          </p>
        </div>
      </section>

      {/* Storefront Directories grid */}
      <section id="storefronts" style={{ borderTop: '1px solid var(--divider)', paddingTop: 60 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
              Active Merchant Storefronts
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>Click to visit and browse independent vendor portals</p>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Total active stores: {stores.length}
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <Loader2 className="spinner" style={{ animation: 'spin 1s infinite linear' }} size={40} />
          </div>
        ) : error ? (
          <div style={{ padding: '20px', background: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
            Error fetching storefront listings: {error}
          </div>
        ) : stores.length === 0 ? (
          <div
            className="glass-card"
            style={{
              padding: '60px 40px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <Store size={48} style={{ color: 'var(--text-muted)' }} />
            <h3 style={{ fontSize: '1.4rem' }}>No Active Stores Yet</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 450 }}>
              Be the first vendor on the platform! Sign up and launch your digital storefront in seconds.
            </p>
            <Link to="/register?role=vendor" className="btn btn-primary" style={{ marginTop: 8 }}>
              Create a Storefront
            </Link>
          </div>
        ) : (
          <div className="grid-3">
            {stores.map((store) => (
              <Link
                key={store._id}
                to={`/store/${store.slug}`}
                className="glass-card animate-fade"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  alignItems: 'flex-start',
                }}
              >
                {/* Logo or placeholder banner */}
                <div
                  style={{
                    width: '100%',
                    height: '140px',
                    borderRadius: 'var(--radius-sm)',
                    background: store.logo
                      ? `url(${store.logo}) center/cover no-repeat`
                      : 'linear-gradient(135deg, rgba(248, 113, 113, 0.15) 0%, rgba(239, 68, 68, 0.15) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--panel-border)',
                  }}
                >
                  {!store.logo && <Store size={36} style={{ color: 'var(--text-muted)' }} />}
                </div>

                <div style={{ width: '100%' }}>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: 6 }}>{store.name}</h3>
                  <p
                    style={{
                      color: 'var(--text-secondary)',
                      fontSize: '0.875rem',
                      lineHeight: 1.4,
                      minHeight: '40px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {store.description}
                  </p>
                </div>

                <div
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: 12,
                    borderTop: '1px solid var(--divider)',
                    fontSize: '0.85rem',
                    color: 'var(--primary)',
                    fontWeight: 600,
                  }}
                >
                  <span>Visit Shop</span>
                  <ArrowRight size={16} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
