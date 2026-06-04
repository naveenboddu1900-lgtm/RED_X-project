import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../cart/cartSlice';
import { Loader2, ArrowLeft, Plus, Minus, ShoppingCart, ShieldCheck } from 'lucide-react';
import api, { backendUrl } from '../../services/api';

const ProductDetail = () => {
  const { storeSlug, productId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  
  // Selection states
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState({}); // { Size: 'M', Color: 'Blue' }
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api(`/products/${productId}`);
        const prod = response.data;
        setProduct(prod);
        setSelectedImage(prod.images?.[0] || '');

        // Initialize default variants
        const defaults = {};
        if (prod.variants && prod.variants.length > 0) {
          prod.variants.forEach((v) => {
            if (v.values && v.values.length > 0) {
              defaults[v.name] = v.values[0];
            }
          });
        }
        setSelectedVariants(defaults);
      } catch (err) {
        setError(err.message || 'Product metadata not found');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleQtyChange = (val) => {
    const newQty = quantity + val;
    if (product && newQty >= 1 && newQty <= product.inventory) {
      setQuantity(newQty);
    }
  };

  const handleVariantSelect = (variantName, value) => {
    setSelectedVariants({
      ...selectedVariants,
      [variantName]: value,
    });
  };

  const handleAddToCart = () => {
    if (!product || product.inventory === 0) return;

    setAddingToCart(true);

    // Format variant string for cart display, e.g., "Size: M, Color: Black"
    const variantStr = Object.entries(selectedVariants)
      .map(([name, val]) => `${name}: ${val}`)
      .join(', ');

    // Dispatch
    dispatch(
      addToCart({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        variant: variantStr || 'Default',
        image: product.images?.[0] || '',
        maxInventory: product.inventory,
      })
    );

    setTimeout(() => {
      setAddingToCart(false);
      setCartSuccess(true);
      // Fade notification after 2 seconds
      setTimeout(() => setCartSuccess(false), 2000);
    }, 400);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Loader2 className="spinner" size={48} />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: 8 }}>Product Missing</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>{error || 'Unable to load product detail record.'}</p>
        <Link to={`/store/${storeSlug}`} className="btn btn-primary">
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade" style={{ padding: '40px 0 80px 0' }}>
      {/* Back button link */}
      <div className="container" style={{ marginBottom: 30 }}>
        <Link
          to={`/store/${storeSlug}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', color: 'var(--text-secondary)' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Catalog</span>
        </Link>
      </div>

      <div className="container grid-2" style={{ alignItems: 'start' }}>
        {/* Images Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Main Visual box */}
          <div
            className="glass-card"
            style={{
              width: '100%',
              height: '420px',
              background: `url(${backendUrl(selectedImage)}) center/contain no-repeat`,
              border: '1px solid var(--panel-border)',
              borderRadius: 'var(--radius-md)',
              padding: 16,
            }}
          />

          {/* Thumbnails list */}
          {product.images && product.images.length > 1 && (
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: 'var(--radius-sm)',
                    background: `url(${backendUrl(img)}) center/cover no-repeat`,
                    border: '2px solid',
                    borderColor: selectedImage === img ? 'var(--primary)' : 'var(--panel-border)',
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'var(--transition)',
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Text/Pricing Details Column */}
        <div className="glass-card" style={{ padding: '40px 30px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Header */}
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {product.category}
            </span>
            <h1 style={{ fontSize: '2.25rem', color: 'var(--text-primary)', marginTop: 8, marginBottom: 12, fontFamily: 'var(--font-heading)' }}>
              {product.name}
            </h1>
            
            {/* Pricing details */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                ${product.price.toFixed(2)}
              </span>
              {product.compareAtPrice > product.price && (
                <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                  ${product.compareAtPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <hr style={{ border: 0, borderTop: '1px solid var(--divider)' }} />

          {/* Description copy */}
          <div>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 8 }}>Product Overview</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              {product.description}
            </p>
          </div>

          <hr style={{ border: 0, borderTop: '1px solid var(--divider)' }} />

          {/* Variant Selectors panels */}
          {product.variants && product.variants.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {product.variants.map((v) => (
                <div key={v.name} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Select {v.name}
                  </span>
                  
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {v.values.map((val) => {
                      const isSelected = selectedVariants[v.name] === val;
                      return (
                        <button
                          key={val}
                          onClick={() => handleVariantSelect(v.name, val)}
                          style={{
                            padding: '8px 16px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            background: isSelected ? 'var(--primary-glow)' : 'var(--input-bg)',
                            color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                            border: '1px solid',
                            borderColor: isSelected ? 'var(--primary)' : 'var(--panel-border)',
                            transition: 'var(--transition)',
                          }}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Inventory Availability tags */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: product.inventory > 0 ? 'var(--success)' : 'var(--danger)',
              }}
            />
            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
              {product.inventory > 5
                ? 'In Stock & Ready to Ship'
                : product.inventory > 0
                  ? `Hurry! Only ${product.inventory} items remaining`
                  : 'Out of Stock'}
            </span>
          </div>

          {/* Quantity selector & Add to cart button */}
          {product.inventory > 0 && (
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 10 }}>
              {/* Quantity clickers */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--panel-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 4,
                }}
              >
                <button
                  onClick={() => handleQtyChange(-1)}
                  disabled={quantity <= 1}
                  style={{ padding: 8, cursor: 'pointer', opacity: quantity <= 1 ? 0.3 : 1 }}
                >
                  <Minus size={16} />
                </button>
                <span style={{ padding: '0 16px', fontWeight: 600, width: '45px', textAlign: 'center' }}>
                  {quantity}
                </span>
                <button
                  onClick={() => handleQtyChange(1)}
                  disabled={quantity >= product.inventory}
                  style={{ padding: 8, cursor: 'pointer', opacity: quantity >= product.inventory ? 0.3 : 1 }}
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Add trigger */}
              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="btn btn-primary"
                style={{ flex: 1, padding: 14 }}
              >
                {addingToCart ? (
                  <Loader2 className="spinner" size={18} />
                ) : (
                  <>
                    <ShoppingCart size={18} />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Success notifications */}
          {cartSuccess && (
            <div
              className="animate-fade"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '12px',
                background: 'var(--success-light)',
                color: 'var(--success)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.9rem',
                fontWeight: 600,
                textAlign: 'center',
              }}
            >
              <ShieldCheck size={18} />
              <span>Added to shopping cart successfully!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
