import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2, Store, DollarSign, Package, Users, Eye, CheckCircle2, AlertTriangle, Play, Pause } from 'lucide-react';
import api, { backendUrl } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import StatCard from '../../components/StatCard';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Platform metrics states
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  // Store management states
  const [stores, setStores] = useState([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [storeActionLoading, setStoreActionLoading] = useState(null);

  // 1. Fetch site-wide analytics
  const fetchPlatformStats = async () => {
    setLoadingAnalytics(true);
    try {
      const response = await api('/analytics/admin');
      setAnalytics(response.data);
    } catch (err) {
      console.error('Error fetching admin analytics:', err.message);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // 2. Fetch all registered stores
  const fetchRegisteredStores = async () => {
    setLoadingStores(true);
    try {
      const response = await api('/admin/stores');
      setStores(response.data);
    } catch (err) {
      console.error('Error listing stores:', err.message);
    } finally {
      setLoadingStores(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchPlatformStats();
    } else if (activeTab === 'stores') {
      fetchRegisteredStores();
    }
  }, [activeTab]);

  const handleApproveStore = async (id) => {
    setStoreActionLoading(id);
    try {
      await api(`/admin/stores/${id}/approve`, { method: 'PUT' });
      fetchRegisteredStores();
    } catch (err) {
      alert(`Approval error: ${err.message}`);
    } finally {
      setStoreActionLoading(null);
    }
  };

  const handleToggleSuspendStore = async (id) => {
    setStoreActionLoading(id);
    try {
      await api(`/admin/stores/${id}/suspend`, { method: 'PUT' });
      fetchRegisteredStores();
    } catch (err) {
      alert(`Suspend toggle error: ${err.message}`);
    } finally {
      setStoreActionLoading(null);
    }
  };

  return (
    <div style={{ display: 'flex', gap: 30, padding: '40px 0 80px 0' }} className="container">
      {/* Admin Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} role="admin" />

      {/* Main Panel Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 30 }}>
        
        {/* OVERVIEW PANEL */}
        {activeTab === 'overview' && (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
            {loadingAnalytics ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
                <Loader2 className="spinner" size={40} />
              </div>
            ) : !analytics ? (
              <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
                Failed to load site analytics summaries.
              </div>
            ) : (
              <>
                {/* Stats cards row */}
                <div style={{ display: 'flex', gap: 20 }} className="grid-3">
                  <StatCard
                    title="Platform Revenue"
                    value={`$${analytics.stats.totalRevenue.toFixed(2)}`}
                    icon={DollarSign}
                    color="var(--primary)"
                  />
                  <StatCard
                    title="Registered Storefronts"
                    value={analytics.stats.storesCount}
                    icon={Store}
                    color="#ec4899"
                  />
                  <StatCard
                    title="User Accounts"
                    value={analytics.stats.customersCount + analytics.stats.vendorsCount}
                    icon={Users}
                    color="#06b6d4"
                  />
                </div>

                <div style={{ display: 'flex', gap: 20 }} className="grid-3">
                  <StatCard
                    title="Consumer Accounts"
                    value={analytics.stats.customersCount}
                    icon={Users}
                    color="#10b981"
                  />
                  <StatCard
                    title="Merchant Accounts"
                    value={analytics.stats.vendorsCount}
                    icon={Users}
                    color="#f59e0b"
                  />
                  <StatCard
                    title="Pending Store approvals"
                    value={analytics.stats.pendingStoresCount}
                    icon={AlertTriangle}
                    color="#ef4444"
                  />
                </div>

                {/* Top Tenants Leaderboard Table */}
                <div className="glass-card">
                  <h3 style={{ fontSize: '1.1rem', marginBottom: 20, fontWeight: 600 }}>Top E-Commerce Storefronts by Sales</h3>
                  
                  {analytics.topStores.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 20 }}>
                      No active store transaction sales recorded.
                    </p>
                  ) : (
                    <div className="table-container">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Store Logo</th>
                            <th>Store Name</th>
                            <th>Transaction Volume</th>
                            <th>Total Gross Sales</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analytics.topStores.map((store) => (
                            <tr key={store._id}>
                              <td>
                                <div
                                  style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '4px',
                                    background: store.logo
                                      ? `url(${backendUrl(store.logo)}) center/cover no-repeat`
                                      : 'var(--input-bg)',
                                    border: '1px solid var(--panel-border)',
                                  }}
                                />
                              </td>
                              <td>
                                <strong>{store.name}</strong>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  slug: /store/{store.slug}
                                </div>
                              </td>
                              <td>{store.ordersCount} orders</td>
                              <td style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                                ${store.revenue.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* STORES MANAGEMENT PANEL */}
        {activeTab === 'stores' && (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-heading)' }}>Platform Stores Queue</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Approve, suspend, or reactivate platform merchant portals</p>
            </div>

            {loadingStores ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                <Loader2 className="spinner" size={36} />
              </div>
            ) : stores.length === 0 ? (
              <div className="glass-card" style={{ padding: '60px 40px', textAlign: 'center' }}>
                No registered stores found in the database.
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Metadata</th>
                      <th>Merchant Vendor</th>
                      <th>Live Link</th>
                      <th>Status Badge</th>
                      <th>Administrative Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stores.map((store) => (
                      <tr key={store._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '4px',
                                background: store.logo
                                  ? `url(${backendUrl(store.logo)}) center/cover no-repeat`
                                  : 'var(--input-bg)',
                                border: '1px solid var(--panel-border)',
                                flexShrink: 0,
                              }}
                            />
                            <div>
                              <strong>{store.name}</strong>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                ID: {store._id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{store.vendor?.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{store.vendor?.email}</div>
                        </td>
                        <td>
                          <a
                            href={`/store/${store.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem' }}
                          >
                            <Eye size={14} />
                            <span>/store/{store.slug}</span>
                          </a>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              store.status === 'approved'
                                ? 'badge-success'
                                : store.status === 'pending'
                                  ? 'badge-warning'
                                  : 'badge-danger'
                            }`}
                          >
                            {store.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 8 }}>
                            {/* Approve Button */}
                            {store.status === 'pending' && (
                              <button
                                onClick={() => handleApproveStore(store._id)}
                                disabled={storeActionLoading === store._id}
                                className="btn btn-primary animate-fade"
                                style={{
                                  padding: '6px 12px',
                                  fontSize: '0.8rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4,
                                }}
                              >
                                {storeActionLoading === store._id ? (
                                  <Loader2 className="spinner" size={12} />
                                ) : (
                                  <>
                                    <CheckCircle2 size={14} />
                                    <span>Approve</span>
                                  </>
                                )}
                              </button>
                            )}

                            {/* Suspend / Reactivate Button */}
                            {store.status !== 'pending' && (
                              <button
                                onClick={() => handleToggleSuspendStore(store._id)}
                                disabled={storeActionLoading === store._id}
                                className="btn"
                                style={{
                                  padding: '6px 12px',
                                  fontSize: '0.8rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  border: '1px solid var(--panel-border)',
                                  background: store.status === 'suspended' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                  color: store.status === 'suspended' ? 'var(--success)' : 'var(--danger)',
                                }}
                              >
                                {storeActionLoading === store._id ? (
                                  <Loader2 className="spinner" size={12} />
                                ) : store.status === 'suspended' ? (
                                  <>
                                    <Play size={14} />
                                    <span>Reactivate</span>
                                  </>
                                ) : (
                                  <>
                                    <Pause size={14} />
                                    <span>Suspend</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
