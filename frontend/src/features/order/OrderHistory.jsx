import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, ShoppingBag, ArrowRight } from 'lucide-react';
import api from '../../services/api';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api('/orders/customer/my-history');
        setOrders(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="container animate-fade" style={{ padding: '60px 24px 80px 24px', maxWidth: '900px' }}>
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
          My Purchase History
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Review and track your orders placed across storefronts</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <Loader2 className="spinner" size={36} />
        </div>
      ) : error ? (
        <div style={{ padding: 12, background: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <ShoppingBag size={48} style={{ color: 'var(--text-muted)' }} />
          <h3>No purchase history</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 320 }}>
            You haven't placed any checkout orders on the platform yet. Visit storefronts to browse items.
          </p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 8 }}>
            Browse Storefronts
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {orders.map((ord) => (
            <div
              key={ord._id}
              className="glass-card"
              style={{
                padding: '24px 30px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              {/* Card Title Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12,
                  borderBottom: '1px solid var(--divider)',
                  paddingBottom: 16,
                }}
              >
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Order Placed:</span>{' '}
                  <strong style={{ color: 'var(--text-primary)' }}>{new Date(ord.createdAt).toLocaleDateString()}</strong>
                  <span style={{ margin: '0 10px', color: 'var(--divider)' }}>|</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Order ID:</span>{' '}
                  <span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem' }}>{ord.orderNumber}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Merchant Store:</span>
                  <Link
                    to={`/store/${ord.store?.slug}`}
                    style={{ fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'underline' }}
                  >
                    {ord.store?.name}
                  </Link>
                </div>
              </div>

              {/* Items row */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {ord.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justify: 'space-between', alignItems: 'center', fontSize: '0.925rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{item.name}</span>
                      <small style={{ color: 'var(--text-muted)', marginLeft: 8 }}>({item.variant})</small>
                    </div>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {item.quantity} x ${item.price.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Status summary footer */}
              <div
                style={{
                  borderTop: '1px solid var(--divider)',
                  paddingTop: 16,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', gap: 16 }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Payment:</span>{' '}
                    <span className="badge badge-success">{ord.paymentStatus}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Shipping status:</span>{' '}
                    <span
                      className={`badge ${
                        ord.status === 'delivered'
                          ? 'badge-success'
                          : ord.status === 'shipped'
                            ? 'badge-info'
                            : 'badge-warning'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: '1.15rem' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Total Paid:</span>{' '}
                  <strong style={{ color: 'var(--text-primary)' }}>${ord.total.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
