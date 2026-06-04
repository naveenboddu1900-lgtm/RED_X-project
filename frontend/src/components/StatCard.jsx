import React from 'react';

const StatCard = ({ title, value, icon: Icon, trend, color = 'var(--primary)' }) => {
  return (
    <div className="glass-card animate-fade" style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
      {/* Decorative colored glow on top */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: color,
        }}
      />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {title}
          </p>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: '8px 0 4px 0', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
            {value}
          </h2>
          {trend && (
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: trend.startsWith('+') ? 'var(--success)' : 'var(--danger)',
              }}
            >
              {trend} vs last month
            </span>
          )}
        </div>
        
        {Icon && (
          <div
            style={{
              padding: 12,
              borderRadius: 'var(--radius-sm)',
              background: `rgba(${color.includes('var') ? '99, 102, 241, 0.08' : '236, 72, 153, 0.08'})`,
              color: color,
            }}
          >
            <Icon size={24} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
