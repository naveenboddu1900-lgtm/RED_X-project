import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { selectCartTotal, clearCart } from './cartSlice';
import { Loader2, ArrowLeft, CreditCard, ShieldCheck, ShoppingBag, CheckCircle } from 'lucide-react';
import api from '../../services/api';

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { storeSlug } = useParams();
  
  const { items, storeId } = useSelector((state) => state.cart);
  const cartTotal = useSelector(selectCartTotal);
  const { user } = useSelector((state) => state.auth);

  // Form states
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    shippingAddress: '',
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successOrder, setSuccessOrder] = useState(null); // Will store final order object

  const handleInfoChange = (e) => {
    setCustomerInfo({ ...customerInfo, [e.target.name]: e.target.value });
  };

  const handlePaymentChange = (e) => {
    let val = e.target.value;
    // Format card input splits
    if (e.target.name === 'cardNumber') {
      val = val.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim().substring(0, 19);
    } else if (e.target.name === 'cardExpiry') {
      val = val.replace(/\s?/g, '').replace(/(\d{2})/g, '$1/').trim().substring(0, 5);
      if (val.endsWith('/')) val = val.slice(0, -1);
    } else if (e.target.name === 'cardCvc') {
      val = val.replace(/\D/g, '').substring(0, 4);
    }
    setPaymentInfo({ ...paymentInfo, [e.target.name]: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0 || !storeId) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Submit order to Backend
      const orderPayload = {
        storeId,
        customerInfo,
        items: items.map((item) => ({
          product: item.product,
          quantity: item.quantity,
          variant: item.variant,
        })),
      };

      const orderResult = await api('/orders', {
        method: 'POST',
        body: JSON.stringify(orderPayload),
      });

      const { orderId, paymentIntentId } = orderResult;

      // 2. Process mock/stripe payment confirm hook
      const confirmResult = await api('/orders/confirm', {
        method: 'POST',
        body: JSON.stringify({
          orderId,
          paymentIntentId,
        }),
      });

      if (confirmResult.success) {
        setSuccessOrder(confirmResult.order);
        // Clear local Redux cart
        dispatch(clearCart());
      } else {
        throw new Error(confirmResult.message || 'Payment confirmation failed');
      }
    } catch (err) {
      setError(err.message || 'Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Success view block
  if (successOrder) {
    return (
      <div className="container" style={{ padding: '60px 24px', display: 'flex', justifyContent: 'center' }}>
        <div className="glass-card animate-fade" style={{ width: '100%', maxWidth: '600px', padding: 40, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', padding: 16, borderRadius: '50%', background: 'var(--success-light)', color: 'var(--success)', marginBottom: 24 }}>
            <CheckCircle size={48} />
          </div>
          
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8, fontFamily: 'var(--font-heading)' }}>
            Payment Successful!
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 30 }}>
            Thank you for your purchase. Your order has been registered and is being processed.
          </p>

          <div
            style={{
              background: 'var(--input-bg)',
              border: '1px solid var(--panel-border)',
              borderRadius: 'var(--radius-sm)',
              padding: 24,
              textAlign: 'left',
              marginBottom: 30,
              fontSize: '0.95rem',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Order Number:</span>{' '}
              <strong style={{ color: 'var(--text-primary)' }}>{successOrder.orderNumber}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Receipt Email:</span>{' '}
              <span style={{ color: 'var(--text-primary)' }}>{successOrder.customerInfo.email}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Shipping To:</span>{' '}
              <span style={{ color: 'var(--text-primary)' }}>{successOrder.customerInfo.shippingAddress}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Total Amount:</span>{' '}
              <strong style={{ color: 'var(--primary)' }}>${successOrder.total.toFixed(2)}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
            <Link to={`/store/${storeSlug}`} className="btn btn-primary">
              Continue Shopping
            </Link>
            <Link to="/" className="btn btn-secondary">
              Go to SaaS Hub
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart fallback
  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <ShoppingBag size={48} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
        <h2 style={{ fontSize: '1.75rem', marginBottom: 8 }}>Your cart is empty</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Please add products to your cart before checking out.</p>
        <Link to={`/store/${storeSlug}`} className="btn btn-primary">
          Back to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade" style={{ padding: '40px 0 80px 0' }}>
      <div className="container" style={{ marginBottom: 30 }}>
        <Link
          to={`/store/${storeSlug}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', color: 'var(--text-secondary)' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Catalog</span>
        </Link>
      </div>

      <div className="container" style={{ display: 'flex', gap: 30, flexWrap: 'wrap', alignItems: 'start' }}>
        {/* Forms Input Column */}
        <form onSubmit={handleSubmit} style={{ flex: '2 0 450px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Shipping Form Card */}
          <div className="glass-card" style={{ padding: 30 }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: 20, color: 'var(--text-primary)', borderBottom: '1px solid var(--divider)', paddingBottom: 12 }}>
              1. Delivery Information
            </h3>
            
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                value={customerInfo.name}
                onChange={handleInfoChange}
                placeholder="Jane Doe"
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
                value={customerInfo.email}
                onChange={handleInfoChange}
                placeholder="jane@example.com"
                className="form-control"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Full Shipping Address</label>
              <textarea
                name="shippingAddress"
                value={customerInfo.shippingAddress}
                onChange={handleInfoChange}
                placeholder="Street address, Apartment, City, State, ZIP code"
                className="form-control"
                rows={3}
                required
                disabled={loading}
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>

          {/* Payment Card Form */}
          <div className="glass-card" style={{ padding: 30 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid var(--divider)', paddingBottom: 12 }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                2. Credit Card Payments
              </h3>
              <div style={{ display: 'flex', gap: 6, color: 'var(--text-secondary)' }}>
                <ShieldCheck size={18} style={{ color: 'var(--success)' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Secured Checkout</span>
              </div>
            </div>

            <div
              style={{
                background: 'var(--primary-glow)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 16px',
                fontSize: '0.85rem',
                color: 'var(--primary)',
                fontWeight: 500,
                marginBottom: 20,
              }}
            >
              🔒 RED_x payment sandbox is active. Use any mock card credentials (e.g. 4242 4242 4242 4242) to finish checkout securely.
            </div>

            <div className="form-group">
              <label className="form-label">Card Number</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  name="cardNumber"
                  value={paymentInfo.cardNumber}
                  onChange={handlePaymentChange}
                  placeholder="4242 4242 4242 4242"
                  className="form-control"
                  style={{ paddingLeft: '44px' }}
                  required
                  disabled={loading}
                />
                <CreditCard size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Expiration Date</label>
                <input
                  type="text"
                  name="cardExpiry"
                  value={paymentInfo.cardExpiry}
                  onChange={handlePaymentChange}
                  placeholder="MM/YY"
                  className="form-control"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">CVC / CVV</label>
                <input
                  type="password"
                  name="cardCvc"
                  value={paymentInfo.cardCvc}
                  onChange={handlePaymentChange}
                  placeholder="123"
                  className="form-control"
                  required
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {error && (
            <div style={{ padding: 12, background: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ padding: '16px', fontSize: '1.05rem' }} disabled={loading}>
            {loading ? (
              <Loader2 className="spinner" size={20} />
            ) : (
              <span>Complete Payment (${cartTotal.toFixed(2)})</span>
            )}
          </button>
        </form>

        {/* Summary Side panel */}
        <aside style={{ flex: '1 0 320px', maxWidth: '420px', width: '100%' }}>
          <div className="glass-card" style={{ padding: 30 }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 20, color: 'var(--text-primary)' }}>Order Summary</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '280px', overflowY: 'auto', marginBottom: 20, paddingRight: 6 }}>
              {items.map((item) => (
                <div key={`${item.product}-${item.variant}`} style={{ display: 'flex', justify: 'space-between', fontSize: '0.9rem' }}>
                  <div style={{ maxWidth: '70%' }}>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name}
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      Qty: {item.quantity} | {item.variant}
                    </span>
                  </div>
                  <strong style={{ color: 'var(--text-primary)' }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </strong>
                </div>
              ))}
            </div>

            <hr style={{ border: 0, borderTop: '1px solid var(--divider)', marginBottom: 20 }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <span>Shipping</span>
                <span style={{ color: 'var(--success)', fontWeight: 600 }}>Free</span>
              </div>
              
              <hr style={{ border: 0, borderTop: '1px solid var(--divider)', margin: '8px 0' }} />
              
              <div style={{ display: 'flex', justify: 'space-between', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                <span>Total</span>
                <span style={{ color: 'var(--primary)' }}>${cartTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
