import React from 'react';
import { BarChart3, Package, ShoppingBag, Settings, Store, CheckSquare, Users } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, role, storeSlug }) => {
  const vendorMenu = [
    { id: 'analytics', label: 'Overview & Charts', icon: BarChart3 },
    { id: 'inventory', label: 'Manage Inventory', icon: Package },
    { id: 'orders', label: 'Customer Orders', icon: ShoppingBag },
  ];

  const adminMenu = [
    { id: 'overview', label: 'Platform Summary', icon: BarChart3 },
    { id: 'stores', label: 'Approve Storefronts', icon: Store },
  ];

  const menu = role === 'admin' ? adminMenu : vendorMenu;

  return (
    <aside
      className="glass-card animate-fade"
      style={{
        width: '280px',
        height: 'calc(100vh - 120px)',
        position: 'sticky',
        top: '96px',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <div style={{ marginBottom: 20, paddingLeft: 12 }}>
        <h3 style={{ fontSize: '1.1rem', color: 'var(--primary)', fontWeight: 'bold' }}>
          {role === 'admin' ? 'Super Admin' : 'Vendor Portal'}
        </h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {role === 'admin' ? 'Platform Governance' : 'Store Management'}
        </p>
      </div>

      {menu.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '14px 16px',
              borderRadius: 'var(--radius-sm)',
              width: '100%',
              textAlign: 'left',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.95rem',
              color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
              background: isActive ? 'var(--primary-glow)' : 'transparent',
              border: '1px solid',
              borderColor: isActive ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              transition: 'var(--transition)',
            }}
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </button>
        );
      })}

      {/* Quick Access to Storefront */}
      {role === 'vendor' && storeSlug && (
        <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: '1px solid var(--divider)' }}>
          <a
            href={`/store/${storeSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px',
              fontSize: '0.85rem',
            }}
          >
            <Store size={16} />
            <span>View Storefront</span>
          </a>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
