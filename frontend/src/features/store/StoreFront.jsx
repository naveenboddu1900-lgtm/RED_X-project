import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { initializeCart } from '../cart/cartSlice';
import { Search, SlidersHorizontal, Loader2, Store, ShoppingBag, Grid, AlertCircle, ShoppingCart } from 'lucide-react';
import api, { API_URL, backendUrl } from '../../services/api';

const StoreFront = ({ onStoreLoad }) => {
  const { storeSlug } = useParams();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filter state variables
  const searchVal = searchParams.get('search') || '';
  const categoryVal = searchParams.get('category') || 'All';
  const sortVal = searchParams.get('sort') || 'newest';
  const pageVal = searchParams.get('page') || '1';

  // Component Data State
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loadingStore, setLoadingStore] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  // 1. Fetch Store details
  useEffect(() => {
    const fetchStore = async () => {
      setLoadingStore(true);
      setError(null);
      try {
        const response = await api(`/stores/slug/${storeSlug}`);
        const storeData = response.data;
        setStore(storeData);
        onStoreLoad(storeData.name, storeData.slug, storeData._id);
        
        // Initialize cart matching this merchant store
        dispatch(initializeCart({ storeSlug: storeData.slug, storeId: storeData._id }));
      } catch (err) {
        setError(err.message || 'Store storefront not found');
      } finally {
        setLoadingStore(false);
      }
    };
    fetchStore();
  }, [storeSlug, dispatch]);

  // 2. Fetch Store products based on filters
  useEffect(() => {
    if (!store) return;

    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const queryParams = new URLSearchParams({
          search: searchVal,
          category: categoryVal,
          sort: sortVal,
          page: pageVal,
          limit: '8',
        });
        
        const response = await api(`/products/store/${store._id}?${queryParams.toString()}`);
        setProducts(response.data);
        setCategories(response.categories || ['All']);
        setTotalPages(response.pages || 1);
      } catch (err) {
        console.error('Error listing store products:', err.message);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, [store, searchVal, categoryVal, sortVal, pageVal]);

  // Handler helpers
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = e.target.search.value;
    setSearchParams({ search: query, category: categoryVal, sort: sortVal, page: '1' });
  };

  const handleCategorySelect = (cat) => {
    setSearchParams({ search: searchVal, category: cat, sort: sortVal, page: '1' });
  };

  const handleSortSelect = (e) => {
    setSearchParams({ search: searchVal, category: categoryVal, sort: e.target.value, page: '1' });
  };

  const handlePageChange = (p) => {
    setSearchParams({ search: searchVal, category: categoryVal, sort: sortVal, page: p.toString() });
  };

  if (loadingStore) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Loader2 className="spinner" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <AlertCircle size={48} style={{ color: 'var(--danger)', marginBottom: 16 }} />
        <h2 style={{ fontSize: '1.75rem', marginBottom: 8 }}>Access Restriction</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>{error}</p>
        <Link to="/" className="btn btn-primary">
          Back to Hub
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade" style={{ paddingBottom: 80 }}>
      {/* Store Banner Hero */}
      <div
        style={{
          height: '240px',
          borderRadius: '0 0 var(--radius-md) var(--radius-md)',
          background: 'linear-gradient(135deg, rgba(248, 113, 113, 0.18) 0%, rgba(239, 68, 68, 0.18) 100%)',
          borderBottom: '1px solid var(--panel-border)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 40px',
          marginBottom: 40,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow blur background */}
        <div style={{ position: 'absolute', top: '-10%', right: '10%', width: 250, height: 250, borderRadius: '50%', background: 'var(--primary)', filter: 'blur(100px)', opacity: 0.2 }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '20%', width: 200, height: 200, borderRadius: '50%', background: 'var(--secondary)', filter: 'blur(100px)', opacity: 0.15 }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 24, position: 'relative', zIndex: 1 }}>
          <div
            style={{
              width: '90px',
              height: '90px',
              borderRadius: 'var(--radius-sm)',
              background: store.logo ? `url(${backendUrl(store.logo)}) center/cover no-repeat` : 'var(--input-bg)',
              border: '2px solid var(--panel-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow)',
            }}
          >
            {!store.logo && <Store size={36} style={{ color: 'var(--text-muted)' }} />}
          </div>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
              {store.name}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: 4, maxWidth: '600px' }}>
              {store.description}
            </p>
          </div>
        </div>
      </div>

      <div className="container" style={{ display: 'flex', gap: 30, flexWrap: 'wrap' }}>
        {/* Filters Sidebar */}
        <aside style={{ flex: '1 0 250px', maxWidth: '280px' }}>
          <div className="glass-card" style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <SlidersHorizontal size={16} style={{ color: 'var(--primary)' }} />
                <span>Categories</span>
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategorySelect(cat)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      textAlign: 'left',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      background: categoryVal === cat ? 'var(--primary-glow)' : 'transparent',
                      color: categoryVal === cat ? 'var(--primary)' : 'var(--text-secondary)',
                      transition: 'var(--transition)',
                      border: '1px solid transparent',
                      borderColor: categoryVal === cat ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Catalog Main Panel */}
        <main style={{ flex: '4 0 500px', display: 'flex', flexDirection: 'column', gap: 30 }}>
          {/* Controls Bar */}
          <div
            className="glass-card"
            style={{
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            {/* Search form */}
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', width: '100%', maxWidth: '350px', relative: 'true' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type="text"
                  name="search"
                  defaultValue={searchVal}
                  placeholder="Search catalog products..."
                  className="form-control"
                  style={{ paddingLeft: '40px', paddingRight: '16px' }}
                />
                <Search
                  size={16}
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                />
              </div>
            </form>

            {/* Sorter Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sort by:</span>
              <select
                value={sortVal}
                onChange={handleSortSelect}
                className="form-control"
                style={{ width: '160px', padding: '8px 12px' }}
              >
                <option value="newest">Newest Listed</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Alphabetical: A-Z</option>
                <option value="name-desc">Alphabetical: Z-A</option>
              </select>
            </div>
          </div>

          {/* Product Cards Grids */}
          {loadingProducts ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
              <Loader2 className="spinner" size={40} />
            </div>
          ) : products.length === 0 ? (
            <div className="glass-card" style={{ padding: '80px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <ShoppingBag size={48} style={{ color: 'var(--text-muted)' }} />
              <h3 style={{ fontSize: '1.25rem' }}>No Products Found</h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '350px' }}>
                Your search query or selected category filter returned empty results. Try modifying inputs.
              </p>
            </div>
          ) : (
            <>
              <div className="grid-3">
                {products.map((prod) => (
                  <div
                    key={prod._id}
                    className="glass-card animate-fade"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                      padding: 16,
                    }}
                  >
                    {/* Media Card header */}
                    <Link
                      to={`/store/${storeSlug}/product/${prod._id}`}
                      style={{
                        width: '100%',
                        height: '180px',
                        borderRadius: 'var(--radius-sm)',
                        background: `url(${backendUrl(prod.images?.[0] || '')}) center/cover no-repeat`,
                        border: '1px solid var(--panel-border)',
                        marginBottom: 16,
                        display: 'block',
                      }}
                    />

                    {/* Meta context info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexGrow: 1 }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase' }}>
                        {prod.category}
                      </span>
                      <Link to={`/store/${storeSlug}/product/${prod._id}`}>
                        <h4 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', minHeight: '44px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {prod.name}
                        </h4>
                      </Link>
                      
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 'auto' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          ${prod.price.toFixed(2)}
                        </span>
                        {prod.compareAtPrice > prod.price && (
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                            ${prod.compareAtPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Interactive Action footer */}
                    <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--divider)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: prod.inventory > 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                        {prod.inventory > 0 ? `${prod.inventory} Available` : 'Out of Stock'}
                      </span>
                      
                      <Link
                        to={`/store/${storeSlug}/product/${prod._id}`}
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <ShoppingCart size={14} />
                        <span>Configure</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    const isActive = pageNum === Number(pageVal);
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: 'var(--radius-sm)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          background: isActive ? 'var(--primary)' : 'var(--input-bg)',
                          border: '1px solid var(--panel-border)',
                          color: isActive ? 'white' : 'var(--text-primary)',
                          transition: 'var(--transition)',
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default StoreFront;
