const express = require('express');
const router = express.Router();

// Root API status endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'RED_x Multi-Tenant E-Commerce SaaS API root endpoint',
    availableRoutes: [
      '/api/health',
      '/api/auth/register',
      '/api/auth/login',
      '/api/stores',
      '/api/products/store/:storeIdOrSlug',
      '/api/orders',
    ],
  });
});

// Controllers
const authController = require('../controllers/authController');
const storeController = require('../controllers/storeController');
const productController = require('../controllers/productController');
const orderController = require('../controllers/orderController');
const analyticsController = require('../controllers/analyticsController');
const adminController = require('../controllers/adminController');

// Middlewares
const { protect } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', protect, authController.getMe);

// ==========================================
// STORE FRONT ENDPOINTS
// ==========================================
router.get('/stores', storeController.getStores);
router.get('/stores/slug/:slug', storeController.getStoreBySlug);
router.put('/stores/:id', protect, checkRole(['vendor', 'admin']), upload.single('logo'), storeController.updateStore);

// ==========================================
// PRODUCT CATALOG ENDPOINTS
// ==========================================
router.get('/products/store/:storeIdOrSlug', productController.getProducts);
router.get('/products/:id', productController.getProductById);
router.post('/products', protect, checkRole(['vendor']), upload.array('images', 5), productController.createProduct);
router.put('/products/:id', protect, checkRole(['vendor']), upload.array('images', 5), productController.updateProduct);
router.delete('/products/:id', protect, checkRole(['vendor', 'admin']), productController.deleteProduct);

// ==========================================
// E-COMMERCE CART & CHECKOUT ENDPOINTS
// ==========================================
router.post('/orders', (req, res, next) => {
  // Make auth optional for checkout (allows Guest checkouts)
  if (req.headers.authorization) {
    protect(req, res, next);
  } else {
    next();
  }
}, orderController.createOrder);

router.post('/orders/confirm', orderController.confirmPayment);
router.get('/orders/vendor/my-store', protect, checkRole(['vendor']), orderController.getVendorOrders);
router.get('/orders/customer/my-history', protect, checkRole(['customer']), orderController.getCustomerOrders);

router.get('/orders/:id', (req, res, next) => {
  // Optional auth to view details if guest vs logged-in user
  if (req.headers.authorization) {
    protect(req, res, next);
  } else {
    next();
  }
}, orderController.getOrderById);

router.put('/orders/:id/status', protect, checkRole(['vendor', 'admin']), orderController.updateOrderStatus);

// ==========================================
// ANALYTICS & VISUALIZATION DASHBOARDS
// ==========================================
router.get('/analytics/vendor', protect, checkRole(['vendor']), analyticsController.getVendorAnalytics);
router.get('/analytics/admin', protect, checkRole(['admin']), analyticsController.getAdminAnalytics);

// ==========================================
// SUPER ADMIN STORE ADMINISTRATION
// ==========================================
router.get('/admin/stores', protect, checkRole(['admin']), adminController.getAllStores);
router.put('/admin/stores/:id/approve', protect, checkRole(['admin']), adminController.approveStore);
router.put('/admin/stores/:id/suspend', protect, checkRole(['admin']), adminController.suspendStore);

module.exports = router;
