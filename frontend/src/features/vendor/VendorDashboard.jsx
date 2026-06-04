import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Loader2, Plus, Edit2, Trash2, Package, ShoppingBag, BarChart3, TrendingUp, DollarSign, Upload, Eye, X } from 'lucide-react';
import api, { API_URL, backendUrl } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import StatCard from '../../components/StatCard';

const VendorDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('analytics');

  // Analytics states
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  // Inventory states
  const [products, setProducts] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    compareAtPrice: '',
    inventory: '',
    category: '',
    variantsInput: '', // Size: S, M, L | Color: Red, Blue
  });
  const [productImages, setProductImages] = useState(null);
  const [modalError, setModalError] = useState(null);
  const [savingProduct, setSavingProduct] = useState(false);

  // Orders states
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderStatusUpdating, setOrderStatusUpdating] = useState(null);

  // 1. Fetch Analytics Data
  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const response = await api('/analytics/vendor');
      setAnalyticsData(response.data);
    } catch (err) {
      console.error('Error fetching vendor analytics:', err.message);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // 2. Fetch Products Data
  const fetchInventory = async () => {
    if (!user?.store) return;
    setLoadingInventory(true);
    try {
      const response = await api(`/products/store/${user.store}?limit=100`);
      setProducts(response.data);
    } catch (err) {
      console.error('Error fetching inventory:', err.message);
    } finally {
      setLoadingInventory(false);
    }
  };

  // 3. Fetch Orders Data
  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const response = await api('/orders/vendor/my-store');
      setOrders(response.data);
    } catch (err) {
      console.error('Error fetching orders:', err.message);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalytics();
    } else if (activeTab === 'inventory') {
      fetchInventory();
    } else if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  // Handle Product Form changes
  const handleFormChange = (e) => {
    setProductForm({ ...productForm, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setProductImages(e.target.files);
  };

  // Parsing helper to convert variants text "Size: S, M | Color: Red" to DB model array
  const parseVariantsText = (text) => {
    if (!text.trim()) return [];
    try {
      // Split by pipe
      return text.split('|').map((group) => {
        const [name, vals] = group.split(':');
        return {
          name: name.trim(),
          values: vals.split(',').map((v) => v.trim()),
        };
      });
    } catch (err) {
      throw new Error("Invalid variants format. Use 'Size: S, M | Color: Red, Blue'");
    }
  };

  // Reverse helper to convert DB model variants array to text string
  const formatVariantsToText = (variantsArray) => {
    if (!variantsArray || variantsArray.length === 0) return '';
    return variantsArray
      .map((v) => `${v.name}: ${v.values.join(', ')}`)
      .join(' | ');
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      price: '',
      compareAtPrice: '',
      inventory: '10',
      category: '',
      variantsInput: '',
    });
    setProductImages(null);
    setModalError(null);
    setShowProductModal(true);
  };

  const handleOpenEditModal = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      description: prod.description,
      price: prod.price.toString(),
      compareAtPrice: prod.compareAtPrice ? prod.compareAtPrice.toString() : '',
      inventory: prod.inventory.toString(),
      category: prod.category,
      variantsInput: formatVariantsToText(prod.variants),
    });
    setProductImages(null);
    setModalError(null);
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setSavingProduct(true);
    setModalError(null);

    try {
      const parsedVariants = parseVariantsText(productForm.variantsInput);
      
      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('description', productForm.description);
      formData.append('price', productForm.price);
      formData.append('compareAtPrice', productForm.compareAtPrice || '0');
      formData.append('inventory', productForm.inventory);
      formData.append('category', productForm.category);
      formData.append('variants', JSON.stringify(parsedVariants));

      // Append image files
      if (productImages && productImages.length > 0) {
        for (let i = 0; i < productImages.length; i++) {
          formData.append('images', productImages[i]);
        }
      }

      if (editingProduct) {
        // Edit product
        await api(`/products/${editingProduct._id}`, {
          method: 'PUT',
          body: formData,
        });
      } else {
        // Create product
        await api('/products', {
          method: 'POST',
          body: formData,
        });
      }

      setShowProductModal(false);
      fetchInventory();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to remove this product listing?')) return;
    try {
      await api(`/products/${id}`, { method: 'DELETE' });
      fetchInventory();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setOrderStatusUpdating(orderId);
    try {
      await api(`/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      fetchOrders();
    } catch (err) {
      alert(`Status update failed: ${err.message}`);
    } finally {
      setOrderStatusUpdating(null);
    }
  };

  // Pie chart cell coloration
  const COLORS = ['#6366f1', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div style={{ display: 'flex', gap: 30, padding: '40px 0 80px 0' }} className="container">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} role="vendor" storeSlug={user?.storeInfo?.slug} />

      {/* Main Panel Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 30 }}>
        
        {/* SECTION 1: ANALYTICS OVERVIEW */}
        {activeTab === 'analytics' && (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
            {loadingAnalytics ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
                <Loader2 className="spinner" size={40} />
              </div>
            ) : !analyticsData ? (
              <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
                Failed to load analytics summaries.
              </div>
            ) : (
              <>
                {/* Stats row */}
                <div style={{ display: 'flex', gap: 20 }} className="grid-3">
                  <StatCard
                    title="Total Revenue"
                    value={`$${analyticsData.summary.revenue.toFixed(2)}`}
                    icon={DollarSign}
                    color="var(--primary)"
                  />
                  <StatCard
                    title="Orders Placed"
                    value={analyticsData.summary.ordersCount}
                    icon={ShoppingBag}
                    color="#ec4899"
                  />
                  <StatCard
                    title="Items Listed"
                    value={analyticsData.summary.totalProducts}
                    icon={Package}
                    color="#06b6d4"
                  />
                </div>

                {/* Sales Graph & Charts panels */}
                <div className="grid-2">
                  {/* Monthly Sales Area Chart */}
                  <div className="glass-card" style={{ height: '380px', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: 20, fontWeight: 600 }}>Sales Volume Trend (USD)</h3>
                    <div style={{ flex: 1, width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analyticsData.salesTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--divider)" />
                          <XAxis dataKey="month" stroke="var(--text-secondary)" fontSize={11} />
                          <YAxis stroke="var(--text-secondary)" fontSize={11} />
                          <Tooltip contentStyle={{ background: 'var(--bg-gradient-end)', borderColor: 'var(--panel-border)', borderRadius: '6px' }} />
                          <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Categories Distribution Pie Chart */}
                  <div className="glass-card" style={{ height: '380px', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: 20, fontWeight: 600 }}>Inventory Share by Category</h3>
                    {analyticsData.categoryStats.length === 0 ? (
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        No inventory categories configured.
                      </div>
                    ) : (
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: '50%', height: '100%' }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={analyticsData.categoryStats}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {analyticsData.categoryStats.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ background: 'var(--bg-gradient-end)', borderColor: 'var(--panel-border)', borderRadius: '6px' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        {/* Legends */}
                        <div style={{ width: '50%', display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {analyticsData.categoryStats.map((item, idx) => (
                            <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
                              <span style={{ width: 12, height: 12, borderRadius: '2px', background: COLORS[idx % COLORS.length] }} />
                              <span style={{ color: 'var(--text-secondary)' }}>{item.name}:</span>
                              <strong style={{ color: 'var(--text-primary)' }}>{item.value} Items</strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Top Selling Products Leaderboards */}
                <div className="glass-card">
                  <h3 style={{ fontSize: '1.1rem', marginBottom: 20, fontWeight: 600 }}>Top Performing Products</h3>
                  {analyticsData.topProducts.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 20 }}>No items sold yet.</p>
                  ) : (
                    <div className="table-container">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Product Name</th>
                            <th>Quantity Sold</th>
                            <th>Total Revenue</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analyticsData.topProducts.map((item) => (
                            <tr key={item._id}>
                              <td><strong>{item.name}</strong></td>
                              <td>{item.quantitySold} units</td>
                              <td style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                                ${item.totalRevenue.toFixed(2)}
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

        {/* SECTION 2: INVENTORY MANAGEMENT */}
        {activeTab === 'inventory' && (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-heading)' }}>Product Inventory</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Create, update, and manage your store listings</p>
              </div>
              
              <button onClick={handleOpenAddModal} className="btn btn-primary" style={{ padding: '10px 18px' }}>
                <Plus size={16} />
                <span>List Product</span>
              </button>
            </div>

            {loadingInventory ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                <Loader2 className="spinner" size={36} />
              </div>
            ) : products.length === 0 ? (
              <div className="glass-card" style={{ padding: '60px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                <Package size={48} style={{ color: 'var(--text-muted)' }} />
                <h3>No listed products</h3>
                <p style={{ color: 'var(--text-secondary)', maxWidth: 350 }}>
                  You haven't listed any items for sale in your storefront database yet. Click "List Product" to start.
                </p>
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((prod) => (
                      <tr key={prod._id}>
                        <td>
                          <div
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '4px',
                              background: `url(${backendUrl(prod.images?.[0] || '')}) center/cover no-repeat`,
                              border: '1px solid var(--panel-border)',
                            }}
                          />
                        </td>
                        <td>
                          <strong>{prod.name}</strong>
                          {prod.variants && prod.variants.length > 0 && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                              Variants: {formatVariantsToText(prod.variants)}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className="badge badge-info">{prod.category}</span>
                        </td>
                        <td style={{ fontWeight: 'bold' }}>${prod.price.toFixed(2)}</td>
                        <td>
                          <span className={`badge ${prod.inventory > 5 ? 'badge-success' : prod.inventory > 0 ? 'badge-warning' : 'badge-danger'}`}>
                            {prod.inventory > 0 ? `${prod.inventory} In Stock` : 'Out of Stock'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={() => handleOpenEditModal(prod)} style={{ cursor: 'pointer', color: 'var(--text-secondary)' }}>
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDeleteProduct(prod._id)} style={{ cursor: 'pointer', color: 'var(--danger)' }}>
                              <Trash2 size={16} />
                            </button>
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

        {/* SECTION 3: ORDERS QUEUE */}
        {activeTab === 'orders' && (
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-heading)' }}>Incoming Orders</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Fulfill client purchase orders and update shipping tags</p>
            </div>

            {loadingOrders ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                <Loader2 className="spinner" size={36} />
              </div>
            ) : orders.length === 0 ? (
              <div className="glass-card" style={{ padding: '60px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                <ShoppingBag size={48} style={{ color: 'var(--text-muted)' }} />
                <h3>No orders placed yet</h3>
                <p style={{ color: 'var(--text-secondary)', maxWidth: 350 }}>
                  Incoming consumer checkout orders for your store will show up in this panel queue.
                </p>
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Customer Details</th>
                      <th>Items Sold</th>
                      <th>Amount</th>
                      <th>Shipment Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((ord) => (
                      <tr key={ord._id}>
                        <td>
                          <strong style={{ color: 'var(--primary)', fontSize: '0.85rem' }}>{ord.orderNumber}</strong>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{ord.customerInfo.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ord.customerInfo.email}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {ord.customerInfo.shippingAddress}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {ord.items.map((it, i) => (
                              <div key={i} style={{ fontSize: '0.85rem' }}>
                                - {it.name} <small style={{ color: 'var(--text-muted)' }}>(x{it.quantity}) [{it.variant}]</small>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td style={{ fontWeight: 'bold' }}>${ord.total.toFixed(2)}</td>
                        <td>
                          <select
                            value={ord.status}
                            onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value)}
                            disabled={orderStatusUpdating === ord._id}
                            className="form-control"
                            style={{
                              padding: '6px 10px',
                              width: '130px',
                              fontSize: '0.8rem',
                              border: '1px solid var(--panel-border)',
                              background:
                                ord.status === 'delivered'
                                  ? 'rgba(16, 185, 129, 0.1)'
                                  : ord.status === 'shipped'
                                    ? 'rgba(6, 182, 212, 0.1)'
                                    : 'rgba(245, 158, 11, 0.1)',
                              color:
                                ord.status === 'delivered'
                                  ? 'var(--success)'
                                  : ord.status === 'shipped'
                                    ? 'var(--info)'
                                    : 'var(--warning)',
                            }}
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid (Unfulfilled)</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
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

      {/* POPUP MODAL: ADD / EDIT PRODUCT FORM */}
      {showProductModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.6)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            className="glass-card animate-fade"
            style={{
              width: '100%',
              maxWidth: '650px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 40,
              position: 'relative',
            }}
          >
            <button
              onClick={() => setShowProductModal(false)}
              style={{ position: 'absolute', top: 24, right: 24, cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.5rem', marginBottom: 24, fontFamily: 'var(--font-heading)' }}>
              {editingProduct ? 'Edit Product Listing' : 'List New Catalog Item'}
            </h3>

            {modalError && (
              <div style={{ padding: 12, background: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: 20, textAlign: 'center' }}>
                {modalError}
              </div>
            )}

            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={productForm.name}
                  onChange={handleFormChange}
                  placeholder="e.g. Cotton Summer Tee"
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  value={productForm.description}
                  onChange={handleFormChange}
                  placeholder="Provide technical specs, materials, details..."
                  className="form-control"
                  rows={3}
                  required
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Price ($)</label>
                  <input
                    type="number"
                    name="price"
                    value={productForm.price}
                    onChange={handleFormChange}
                    placeholder="19.99"
                    step="0.01"
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Compare At ($)</label>
                  <input
                    type="number"
                    name="compareAtPrice"
                    value={productForm.compareAtPrice}
                    onChange={handleFormChange}
                    placeholder="29.99 (Optional)"
                    step="0.01"
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Inventory Count</label>
                  <input
                    type="number"
                    name="inventory"
                    value={productForm.inventory}
                    onChange={handleFormChange}
                    placeholder="10"
                    className="form-control"
                    required
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input
                    type="text"
                    name="category"
                    value={productForm.category}
                    onChange={handleFormChange}
                    placeholder="e.g. Apparel, Electronics"
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Upload Product Images</label>
                  <input
                    type="file"
                    onChange={handleImageChange}
                    multiple
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="images-upload-input"
                  />
                  <label
                    htmlFor="images-upload-input"
                    className="form-control"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      cursor: 'pointer',
                      background: 'var(--input-bg)',
                      justifyContent: 'center',
                    }}
                  >
                    <Upload size={16} />
                    <span>
                      {productImages ? `${productImages.length} Files Selected` : 'Choose Image Files'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Product Attribute Variants</label>
                <input
                  type="text"
                  name="variantsInput"
                  value={productForm.variantsInput}
                  onChange={handleFormChange}
                  placeholder="Size: S, M, L | Color: White, Black"
                  className="form-control"
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Format matching pattern: **AttributeName: Val1, Val2 | AttributeName2: ValA, ValB**
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="btn btn-secondary"
                  disabled={savingProduct}
                >
                  Cancel
                </button>
                
                <button type="submit" className="btn btn-primary" disabled={savingProduct}>
                  {savingProduct ? (
                    <Loader2 className="spinner" size={16} />
                  ) : (
                    <span>Save Listing</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;
