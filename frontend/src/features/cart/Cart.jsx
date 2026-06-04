import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, updateQuantity, selectCartTotal } from './cartSlice';
import { backendUrl } from '../../services/api';
import { X, Trash2, ShoppingBag, ArrowRight, Plus, Minus } from 'lucide-react';

const Cart = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { storeSlug } = useParams();
  
  const { items } = useSelector((state) => state.cart);
  const cartTotal = useSelector(selectCartTotal);

  if (!isOpen) return null;

  const handleQtyAdjust = (item, direction) => {
    const nextQty = item.quantity + direction;
    dispatch(
      updateQuantity({
        product: item.product,
        variant: item.variant,
        quantity: nextQty,
      })
    );
  };

  const handleCheckoutClick = () => {
    onClose();
    navigate(`/store/${storeSlug}/checkout`);
  };

  return (
    <div className="cart-overlay" onClick={onClose}>
      <div className="cart-panel" onClick={(e) => e.stopPropagation()}>
        {/* Panel Header */}
        <div
          style={{
            padding: '24px 20px',
            borderBottom: '1px solid var(--panel-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShoppingBag size={20} style={{ color: 'var(--primary)' }} />
            <span>Shopping Cart</span>
          </h2>
          <button onClick={onClose} style={{ cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <X size={22} />
          </button>
        </div>

        {/* Panel Scrollable Items List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <ShoppingBag size={48} style={{ color: 'var(--text-muted)' }} />
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Your cart is empty</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Add items to your cart from our catalog to get started.
              </p>
            </div>
          ) : (
            items.map((item, idx) => (
              <div
                key={`${item.product}-${item.variant}`}
                style={{
                  display: 'flex',
                  gap: 12,
                  background: 'var(--input-bg)',
                  border: '1px solid var(--panel-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 12,
                  position: 'relative',
                }}
              >
                {/* Thumb image */}
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '4px',
                    background: `url(${backendUrl(item.image)}) center/cover no-repeat`,
                    border: '1px solid var(--divider)',
                    flexShrink: 0,
                  }}
                />

                {/* Info and action options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', paddingRight: 24, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '240px' }}>
                    {item.name}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {item.variant}
                  </span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    {/* Qty incrementors */}
                    <div style={{ display: 'flex', alignItems: 'center', background: 'var(--panel-bg)', borderRadius: '4px', padding: 2 }}>
                      <button
                        onClick={() => handleQtyAdjust(item, -1)}
                        disabled={item.quantity <= 1}
                        style={{ padding: 4, cursor: 'pointer', opacity: item.quantity <= 1 ? 0.3 : 1 }}
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{ padding: '0 8px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQtyAdjust(item, 1)}
                        disabled={item.quantity >= item.maxInventory}
                        style={{ padding: 4, cursor: 'pointer', opacity: item.quantity >= item.maxInventory ? 0.3 : 1 }}
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Price total */}
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Remove button absolute anchor */}
                <button
                  onClick={() => dispatch(removeFromCart({ product: item.product, variant: item.variant }))}
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--danger)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Panel Footer Summary */}
        {items.length > 0 && (
          <div
            style={{
              padding: 24,
              borderTop: '1px solid var(--panel-border)',
              background: 'rgba(0,0,0,0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Subtotal</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                ${cartTotal.toFixed(2)}
              </span>
            </div>
            
            <button onClick={handleCheckoutClick} className="btn btn-primary" style={{ width: '100%', padding: 14 }}>
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
